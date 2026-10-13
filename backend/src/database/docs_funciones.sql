

--------- crear libro

CREATE OR REPLACE FUNCTION recursos.libro_crear(
	p_id_materia INTEGER,
    p_titulo VARCHAR(300),
    p_autor VARCHAR,
    p_editorial VARCHAR,	
	p_year INT ,
    p_url_documento VARCHAR(500) ,    
    p_creado_por INTEGER,
	p_id_tipo_recurso INTEGER
)
RETURNS JSONB AS $$
DECLARE
BEGIN

	-- cargar ruta arc
  IF  p_url_documento IS NULL THEN
        RETURN jsonb_build_object(
        'success', false,
        'status', 400,
        'message', 'no se ha cargado el archivo'
        );
    END IF;
	
    -- Validar materia  
    IF NOT EXISTS (SELECT 1 FROM catalogo.materia WHERE id_materia = p_id_materia AND fecha_eliminacion IS NULL) THEN
        RETURN jsonb_build_object(
        'success', false,
        'status', 400,
        'message', 'materia seleccionada no existe'
        );
    END IF;

    
    --  CREAR LA libro    
    INSERT INTO recursos.libro (
		id_materia ,
		id_tipo_recurso ,
	    titulo,
	    autor ,
	    editorial ,
	    year ,
	    url_documento ,   
		id_estado, 
        id_usuario_creacion
    ) VALUES (
		p_id_materia,
		p_id_tipo_recurso ,
        TRIM(p_titulo),
        p_autor,
		p_editorial,
		p_year,
        p_url_documento,
		2, -- pendiente
        p_creado_por
    );
    
    
    --  RESULTADO    
    RETURN jsonb_build_object(
        'success', TRUE,
        'status', 201,
        'message', 'Libro creado exitosamente'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'status', 400,
            'error', SQLERRM,
            'codigo', SQLSTATE
        );
END;
$$ LANGUAGE plpgsql;


---------- obtener libro completa

---select recursos.libro_obtener(9)


CREATE OR REPLACE FUNCTION recursos.libro_obtener(
    p_id_libro INTEGER
)
RETURNS JSONB AS $$
DECLARE
    v_resultado JSONB;
BEGIN

 --  Verificar libro existe 
    IF NOT EXISTS (
        SELECT 1 FROM recursos.libro
        WHERE id_libro = p_id_libro 
        AND fecha_eliminacion IS NULL
    ) THEN
	 RETURN  jsonb_build_object(
            'success', FALSE,
            'status', 404,
           	'message', 'libro no encontrada o eliminada '
        );
    END IF;

    SELECT row_to_json(libro_data) INTO v_resultado
	FROM (
        SELECT 
            l.id_libro,
            l.titulo,
            l.editorial,
            l.year,
            l.autor,
            l.url_documento,
			l.id_tipo_recurso,
			tr.nombre as tipo_recurso,
            m.id_materia,
            m.nombre AS materia,
			TO_CHAR(l.fecha_creacion, 'DD/MM/YYYY') as fecha_creacion
        FROM recursos.libro l
        JOIN catalogo.materia m ON m.id_materia = l.id_materia
		JOIN recursos.tipo_recurso tr ON tr.id_tipo_recurso = l.id_tipo_recurso
		WHERE l.id_libro = p_id_libro
	) AS libro_data;

	RETURN  jsonb_build_object(
		'success', TRUE,
		'status', 200,
		'data', v_resultado
	);
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'status', 400,
			'message', 'error al buscar el libro',
            'error', SQLERRM,
            'codigo', SQLSTATE
        );
END;
$$ LANGUAGE plpgsql;







---------- devolver todas las docs

CREATE OR REPLACE FUNCTION recursos.libros_listar(
    p_id_materia character varying DEFAULT NULL,
    p_id_tipo_recurso character varying DEFAULT NULL,  
    p_anio character varying DEFAULT NULL,              
    p_buscar character varying DEFAULT NULL,
    p_limit INT DEFAULT 50,
    p_offset INT DEFAULT 0
)
RETURNS JSONB AS $$
DECLARE
    v_resultado JSONB;
    v_total INT;
BEGIN

    -- Contar total con todos los filtros
    SELECT COUNT(*) INTO v_total
    FROM recursos.libro l
    WHERE l.id_estado = 1
      AND l.fecha_eliminacion IS NULL
      AND (p_id_materia IS NULL OR p_id_materia = '' 
           OR l.id_materia = ANY(string_to_array(p_id_materia, ',')::int[]))
      AND (p_id_tipo_recurso IS NULL OR p_id_tipo_recurso = '' 
           OR l.id_tipo_recurso = ANY(string_to_array(p_id_tipo_recurso, ',')::int[]))
      AND (p_anio IS NULL OR p_anio = '' 
           OR l.year = ANY(string_to_array(p_anio, ',')::int[]))
      AND (p_buscar IS NULL OR 
           l.titulo ILIKE '%' || p_buscar || '%' OR 
           l.editorial ILIKE '%' || p_buscar || '%' OR
           l.autor ILIKE '%' || p_buscar || '%');

    -- Obtener los datos
    SELECT jsonb_agg(data_docs) INTO v_resultado
    FROM(
        SELECT 
            l.id_libro,
            l.titulo,
            l.autor,
            l.editorial,
            l.year,                    -- 👈 AGREGADO
            l.id_tipo_recurso,
            tr.nombre as tipo_recurso,
            m.id_materia,
            m.nombre AS materia
        FROM recursos.libro l
        JOIN catalogo.materia m ON m.id_materia = l.id_materia
        JOIN recursos.tipo_recurso tr ON tr.id_tipo_recurso = l.id_tipo_recurso
        WHERE l.id_estado = 1
          AND l.fecha_eliminacion IS NULL
          AND (p_id_materia IS NULL OR p_id_materia = '' 
               OR l.id_materia = ANY(string_to_array(p_id_materia, ',')::int[]))
          AND (p_id_tipo_recurso IS NULL OR p_id_tipo_recurso = '' 
               OR l.id_tipo_recurso = ANY(string_to_array(p_id_tipo_recurso, ',')::int[]))
          AND (p_anio IS NULL OR p_anio = '' 
               OR l.year = ANY(string_to_array(p_anio, ',')::int[]))
          AND (p_buscar IS NULL OR 
               l.titulo ILIKE '%' || p_buscar || '%' OR 
               l.editorial ILIKE '%' || p_buscar || '%' OR
               l.autor ILIKE '%' || p_buscar || '%')
        ORDER BY l.fecha_creacion DESC
        LIMIT p_limit OFFSET p_offset
    ) AS data_docs;

    RETURN jsonb_build_object(
        'success', TRUE,
        'data', COALESCE(v_resultado, '[]'::jsonb),
        'pagination', jsonb_build_object(
            'total', v_total,
            'limit', p_limit,
            'offset', p_offset,
            'pages', CEIL(v_total::DECIMAL / p_limit)
        )
    );

END;
$$ LANGUAGE plpgsql;




---------------- editar libro ----------------------------------------------------------------


CREATE OR REPLACE FUNCTION recursos.libro_edit(
    p_id_libro INT,
   	p_id_materia INTEGER,
    p_titulo VARCHAR(300),
    p_autor VARCHAR,
    p_editorial VARCHAR,	
	p_year INT ,
    p_url_documento VARCHAR(500) ,    
    p_editado_por INTEGER ,
	p_id_tipo_recurso INTEGER
)
RETURNS JSONB AS $$
DECLARE
BEGIN
    -- Verificar que la libro existe y no está eliminada
    IF NOT EXISTS (SELECT 1 FROM recursos.libro WHERE id_libro = p_id_libro AND fecha_eliminacion IS NULL) THEN
        RETURN jsonb_build_object(
            'success', false,
            'status', 404,
            'message', 'El libro no existe o ya fue eliminado'
        );
    END IF;
            
    --  DATOS BÁSICOS    
    UPDATE recursos.libro
    SET id_materia =p_id_materia ,
		id_tipo_recurso=p_id_tipo_recurso,
	    titulo =p_titulo,
	    autor =p_autor,
	    editorial =p_editorial ,
	    year = p_year,
	    url_documento =  COALESCE(p_url_documento, url_documento),   
        id_usuario_modificacion = p_editado_por,
        fecha_modificacion = NOW()
    WHERE id_libro = p_id_libro;
   
    
    --  RESULTADO    
    RETURN jsonb_build_object(
        'success', TRUE,
        'status', 200,
        'message', 'Libro actualizado exitosamente'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'status', 400,
            'error', SQLERRM,
            'codigo', SQLSTATE
        );
END;
$$ LANGUAGE plpgsql;


------------------------------------------------------------- aprobar libro


CREATE OR REPLACE FUNCTION recursos.revisar_libro(
    p_id_libro INT,
    p_id_revisor INT,
    p_aprobar BOOLEAN,
    p_comentario TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_id_estado INT;
    v_mensaje TEXT;
BEGIN
    -- Verificar que existe
    IF NOT EXISTS (
        SELECT 1 FROM recursos.libro 
        WHERE id_libro = p_id_libro 
        AND fecha_eliminacion IS NULL
    ) THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'status', 404,
            'message', 'Recurso no encontrado'
        );
    END IF;

    -- 2. Validar comentario si es rechazo
    IF p_aprobar = FALSE AND (p_comentario IS NULL OR TRIM(p_comentario) = '') THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'status', 400,
            'message', 'Debes indicar el motivo del rechazo'
        );
    END IF;

    --  Determinar estado
    IF p_aprobar THEN
        v_id_estado := 1;
        v_mensaje := 'Recurso aprobado correctamente';
    ELSE
        v_id_estado := 4;
        v_mensaje := 'Recurso rechazado';
    END IF;

    --  Actualizar
    UPDATE recursos.libro
    SET id_estado = v_id_estado,
        id_revisor = p_id_revisor,
        fecha_revision = NOW(),
        comentario_revision = p_comentario
    WHERE id_libro = p_id_libro;

    RETURN jsonb_build_object(
        'success', TRUE,
        'status', 200,
        'message', v_mensaje,
        'data', jsonb_build_object(
            'id_libro', p_id_libro,
            'id_estado', v_id_estado,
            'aprobada', p_aprobar
        )
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'status', 500,
            'message', SQLERRM
        );
END;
$$ LANGUAGE plpgsql;





CREATE OR REPLACE FUNCTION recursos.listar_libros_gestion(
    p_busqueda TEXT DEFAULT NULL,
    p_id_materia character varying  DEFAULT NULL,
    p_id_tipo_recurso character varying  DEFAULT NULL,
    p_anio character varying  DEFAULT NULL,
    p_estado INT DEFAULT 2,
    p_orden VARCHAR DEFAULT 'reciente',
    p_offset INT DEFAULT 0,
    p_limit INT DEFAULT 20
)
RETURNS JSONB AS $$
DECLARE
    v_resultado JSONB;
    v_total BIGINT;
BEGIN
    -- Contar total
    SELECT COUNT(*) INTO v_total
    FROM recursos.libro l
    WHERE l.id_estado = p_estado
      AND l.fecha_eliminacion IS NULL
      AND (p_busqueda IS NULL OR l.titulo ILIKE '%' || p_busqueda || '%')
      AND (p_id_materia IS NULL OR p_id_materia = '' 
           OR l.id_materia = ANY(string_to_array(p_id_materia, ',')::int[]))
      AND (p_id_tipo_recurso IS NULL OR p_id_tipo_recurso = '' 
           OR l.id_tipo_recurso = ANY(string_to_array(p_id_tipo_recurso, ',')::int[]))
      AND (p_anio IS NULL OR p_anio = '' 
           OR l.year = ANY(string_to_array(p_anio, ',')::int[]));

    -- Obtener los libros
    SELECT jsonb_agg(l.*) INTO v_resultado
    FROM (
        SELECT 
            l.id_libro,
            l.titulo,
            l.autor,
            l.editorial,
            l.year,
            l.url_documento,
            l.fecha_creacion,
            l.id_estado,
            l.comentario_revision,
            l.fecha_revision,
            m.nombre AS nombre_materia,
            tr.nombre AS tipo_recurso,
            u.nombre AS nombre_creador,
            r.nombre AS nombre_revisor
        FROM recursos.libro l
        LEFT JOIN catalogo.materia m ON m.id_materia = l.id_materia
        LEFT JOIN recursos.tipo_recurso tr ON tr.id_tipo_recurso = l.id_tipo_recurso
        LEFT JOIN seguridad.usuario u ON u.id_usuario = l.id_usuario_creacion
        LEFT JOIN seguridad.usuario r ON r.id_usuario = l.id_revisor
        WHERE l.id_estado = p_estado
          AND l.fecha_eliminacion IS NULL
          AND (p_busqueda IS NULL OR l.titulo ILIKE '%' || p_busqueda || '%')
          AND (p_id_materia IS NULL OR p_id_materia = '' 
               OR l.id_materia = ANY(string_to_array(p_id_materia, ',')::int[]))
          AND (p_id_tipo_recurso IS NULL OR p_id_tipo_recurso = '' 
               OR l.id_tipo_recurso = ANY(string_to_array(p_id_tipo_recurso, ',')::int[]))
          AND (p_anio IS NULL OR p_anio = '' 
               OR l.year = ANY(string_to_array(p_anio, ',')::int[]))
        ORDER BY
            CASE WHEN p_orden = 'reciente' THEN l.fecha_creacion END DESC,
            CASE WHEN p_orden = 'antiguo' THEN l.fecha_creacion END ASC,
            CASE WHEN p_orden = 'titulo' THEN l.titulo END ASC
        LIMIT p_limit OFFSET p_offset
    ) l;

    RETURN jsonb_build_object(
        'success', TRUE,
        'status', 200,
        'data', COALESCE(v_resultado, '[]'::jsonb),
        'pagination', jsonb_build_object(
            'total', v_total,
            'page', (p_offset / p_limit) + 1,
            'pages', CEIL(v_total::numeric / p_limit)
        )
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'status', 500,
            'message', SQLERRM
        );
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION recursos.get_anios_libros()
RETURNS JSONB AS $$
DECLARE
    v_anios JSONB;
BEGIN
    SELECT jsonb_agg(DISTINCT year ORDER BY year DESC)
    INTO v_anios
    FROM recursos.libro
    WHERE year IS NOT NULL
      AND fecha_eliminacion IS NULL;
    
    RETURN jsonb_build_object(
        'success', TRUE,
        'data', COALESCE(v_anios, '[]'::jsonb)
    );
END;
$$ LANGUAGE plpgsql;