

--------- crear tesis

CREATE OR REPLACE FUNCTION recursos.libro_crear(
	p_id_materia INTEGER,
    p_titulo VARCHAR(300),
    p_autor VARCHAR,
    p_editorial VARCHAR,	
	p_year INT ,
    p_url_documento VARCHAR(500) DEFAULT NULL,    
    p_creado_por INTEGER DEFAULT NULL
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

    
    --  CREAR LA TESIS    
    INSERT INTO recursos.libro (
		id_materia ,
	    titulo,
	    autor ,
	    editorial ,
	    year ,
	    url_documento ,   
        id_usuario_creacion
    ) VALUES (
		p_id_materia,
        TRIM(p_titulo),
        p_autor,
		p_editorial,
		p_year,
        p_url_documento,
        p_creado_por
    );
    
    
    --  RESULTADO    
    RETURN jsonb_build_object(
        'success', TRUE,
        'status', 201,
        'message', 'Liobro creado exitosamente'
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
select recursos.libro_obtener(1)
CREATE OR REPLACE FUNCTION recursos.libro_obtener(
    p_id_libro INTEGER
)
RETURNS JSONB AS $$
DECLARE
    v_resultado JSONB;
BEGIN

 --  Verificar tesis existe 
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
            d.id_libro,
            d.titulo,
            d.editorial,
            d.year,
            d.autor,
            d.url_documento,
            m.id_materia,
            m.nombre AS materia
        FROM recursos.libro d
        JOIN catalogo.materia m ON m.id_materia = d.id_materia
		WHERE d.id_libro = p_id_libro
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
    p_buscar character varying DEFAULT NULL,
    p_limit INT DEFAULT 50,
    p_offset INT DEFAULT 0
)
RETURNS JSONB AS $$
DECLARE
    v_resultado JSONB;
    v_total INT;
BEGIN

  SELECT COUNT(*) INTO v_total
    FROM recursos.libro d
    WHERE d.fecha_eliminacion IS NULL
    AND (p_id_materia IS NULL OR d.id_materia = ANY(string_to_array(p_id_materia, ',')::int[]))
    AND (p_buscar IS NULL OR 
        d.titulo ILIKE '%' || p_buscar || '%' OR 
        d.editorial ILIKE '%' || p_buscar || '%' OR
        d.autor ILIKE '%' || p_buscar || '%');

    SELECT jsonb_agg(data_docs) INTO v_resultado
    FROM(
        SELECT 
            d.id_libro,
            d.titulo,
            d.autor,
            d.editorial,
            m.id_materia,
            m.nombre AS materia
        FROM recursos.libro d
        JOIN catalogo.materia m ON m.id_materia = d.id_materia
        WHERE d.fecha_eliminacion IS NULL
        AND (p_id_materia IS NULL OR d.id_materia = ANY(string_to_array(p_id_materia, ',')::int[]))
        AND (p_buscar IS NULL OR 
            d.titulo ILIKE '%' || p_buscar || '%' OR 
            d.editorial ILIKE '%' || p_buscar || '%' OR
            d.autor ILIKE '%' || p_buscar || '%' )
        ORDER BY d.fecha_creacion DESC
        LIMIT p_limit OFFSET p_offset
    ) AS data_docs;


    RETURN jsonb_build_object(
        'success', TRUE,
        'data', v_resultado,
        'pagination', jsonb_build_object(
            'total', v_total,
            'limit', p_limit,
            'offset', p_offset,
            'pages', CEIL(v_total::DECIMAL / p_limit)
        )
    );

END;
$$ LANGUAGE plpgsql;





---------------- editar tesis ----------------------------------------------------------------


CREATE OR REPLACE FUNCTION recursos.libro_edit(
    p_id_libro INT,
   	p_id_materia INTEGER,
    p_titulo VARCHAR(300),
    p_autor VARCHAR,
    p_editorial VARCHAR,	
	p_year INT ,
    p_url_documento VARCHAR(500) DEFAULT NULL,    
    p_editado_por INTEGER DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
BEGIN
    -- Verificar que la libro existe y no está eliminada
    IF NOT EXISTS (SELECT 1 FROM recursos.libro WHERE id_libro = p_id_libro AND fecha_eliminacion IS NULL) THEN
        RETURN jsonb_build_object(
            'success', false,
            'status', 404,
            'message', 'La tesis no existe o ya fue eliminada'
        );
    END IF;
            
    --  DATOS BÁSICOS    
    UPDATE recursos.libro
    SET id_materia =p_id_materia ,
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
