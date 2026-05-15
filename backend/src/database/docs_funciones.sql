

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
	    url_recurso ,   
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
        'message', 'Tesis creada exitosamente'
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




---------- obtener tesis completa
select tesis.obtener_tesis_completa(19)

CREATE OR REPLACE FUNCTION tesis.obtener_tesis_completa(
    p_id_tesis INTEGER
)
RETURNS JSONB AS $$
DECLARE
    v_resultado JSONB;
BEGIN

 --  Verificar tesis existe 
    IF NOT EXISTS (
        SELECT 1 FROM tesis.tesis 
        WHERE id_tesis = p_id_tesis 
        AND fecha_eliminacion IS NULL
    ) THEN
	 RETURN  jsonb_build_object(
            'success', FALSE,
            'status', 404,
           	'message', 'Tesis no encontrada o eliminada '
        );
    END IF;

    SELECT row_to_json(tesis_data) INTO v_resultado
	FROM (
		SELECT
         t.id_tesis,
         t.titulo,
         t.resumen,
         t.anio_elaboracion,
         t.url_documento,
         t.fecha_creacion,
         c.id_carrera,
         c.nombre as nombre_carrera,
         e.id_estado,
         e.nombre_estado,

        -- Estudiantes
        COALESCE((
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id_estudiante', est.id_estudiante,
                    'nombre_completo', est.nombre_completo,
                    'cedula', est.cedula,
                    'email', est.email
                )
                ORDER BY te.id_tesis_estudiante
            )
            FROM tesis.tesis_estudiante te
            JOIN personas.estudiante est ON te.id_estudiante = est.id_estudiante
            WHERE te.id_tesis = t.id_tesis
			AND te.fecha_eliminacion IS NULL
        ), '[]'::jsonb) AS estudiantes,

        -- Evaluaciones
        COALESCE((
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id_evaluacion', ev.id_evaluacion,
                    'nota', ev.nota,
                    'fecha_evaluacion', ev.fecha_evaluacion,
                    'comentarios', ev.comentarios,
                    'jurado', jsonb_build_object(
                        'id_jurado', j.id_jurado,
                        'nombre_completo', j.nombre_completo,
                        'titulo_profesional', j.titulo_profesional,
                        'cedula', j.cedula
                    )
                )
                ORDER BY ev.fecha_evaluacion DESC
            )
            FROM tesis.evaluacion_tesis ev
            JOIN personas.jurado j ON ev.id_jurado = j.id_jurado
            WHERE ev.id_tesis = t.id_tesis
            AND ev.fecha_eliminacion IS NULL
        ), '[]'::jsonb) as evaluaciones,

        -- Promedio
        (
            SELECT ROUND(AVG(ev.nota), 2)
            FROM tesis.evaluacion_tesis ev
            WHERE ev.id_tesis = t.id_tesis
            AND ev.fecha_eliminacion IS NULL
        ) as promedio_nota    
    FROM tesis.tesis t
    JOIN catalogo.carrera c ON t.id_carrera = c.id_carrera
    LEFT JOIN control.estado e ON t.id_estado = e.id_estado
    WHERE t.id_tesis = p_id_tesis
   -- AND t.fecha_eliminacion IS NULL
	) AS tesis_data;

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
			'message', 'error al buscar la tesis',
            'error', SQLERRM,
            'codigo', SQLSTATE
        );
END;
$$ LANGUAGE plpgsql;







---------- devolver todas las docs

CREATE OR REPLACE FUNCTION recursos.libros_listar(
    p_id_materia INT DEFAULT NULL,
    p_buscar VARCHAR(200) DEFAULT NULL,
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
    AND (p_id_materia IS NULL OR d.id_materia = p_id_materia)
    AND (p_buscar IS NULL OR 
        d.titulo ILIKE '%' || p_buscar || '%' OR 
        d.descripcion ILIKE '%' || p_buscar || '%' OR
        d.autor ILIKE '%' || p_buscar || '%');

    SELECT jsonb_agg(data_docs) INTO v_resultado
    FROM(
        SELECT 
            d.id_libro,
            d.titulo,
            d.autor,
            d.url_recurso,
            d.descripcion,
            m.id_materia,
            m.nombre AS nombre_materia
        FROM recursos.libro d
        JOIN catalogo.materia m ON m.id_materia = d.id_materia
        WHERE d.fecha_eliminacion IS NULL
        AND (p_id_materia IS NULL OR d.id_materia = p_id_materia)
        AND (p_buscar IS NULL OR 
            d.titulo ILIKE '%' || p_buscar || '%' OR 
            d.descripcion ILIKE '%' || p_buscar || '%' OR
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




---------- eliminar tesis 

CREATE OR REPLACE FUNCTION tesis.eliminar_tesis(
    p_id_tesis INT,
    p_eliminado_por INTEGER,
    p_forzar_fisico BOOLEAN DEFAULT FALSE
)
RETURNS JSONB AS $$
DECLARE
    v_titulo VARCHAR(300);
    v_id_estado INT;
BEGIN
    -- Verificar que la tesis existe
    SELECT titulo, id_estado INTO v_titulo, v_id_estado
    FROM tesis.tesis
    WHERE id_tesis = p_id_tesis
    AND fecha_eliminacion IS NULL;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'status', 404,
            'error', 'Tesis no encontrada o ya eliminada',
            'codigo', 'NOT_FOUND'
        );
    END IF;

    -- Seliminar
    UPDATE tesis.tesis
    SET 
        fecha_eliminacion = NOW(),
        id_usuario_eliminacion = p_eliminado_por
    WHERE id_tesis = p_id_tesis;
    

    RETURN jsonb_build_object(
        'success', TRUE,
        'status', 200,
        'message', 'Tesis eliminada exitosamente (soft delete)',
        'data', jsonb_build_object(
            'id_tesis', p_id_tesis,
            'titulo', v_titulo,
            'tipo_eliminacion', 'logica',
            'fecha_eliminacion', NOW()
        )
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'status', 500,
            'error', SQLERRM,
            'codigo', SQLSTATE
        );
END;
$$ LANGUAGE plpgsql;







---------------- editar tesis ----------------------------------------------------------------


CREATE OR REPLACE FUNCTION tesis.editar_tesis(
    p_id_tesis INT,
    p_titulo VARCHAR(300),
    p_resumen TEXT,
    p_id_carrera INT,
    p_anio_elaboracion INT,
    p_url_documento VARCHAR(500) DEFAULT NULL,
    p_estudiantes JSONB DEFAULT '[]'::jsonb,
    p_evaluaciones JSONB DEFAULT '[]'::jsonb,
    p_editado_por INTEGER DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_estudiante JSONB;
    v_evaluacion JSONB;
    v_id_estudiante INT;
    v_id_jurado INT;
BEGIN
    -- Verificar que la tesis existe y no está eliminada
    IF NOT EXISTS (SELECT 1 FROM tesis.tesis WHERE id_tesis = p_id_tesis AND fecha_eliminacion IS NULL) THEN
        RETURN jsonb_build_object(
            'success', false,
            'status', 404,
            'message', 'La tesis no existe o ya fue eliminada'
        );
    END IF;
            
    --  DATOS BÁSICOS    
    UPDATE tesis.tesis
    SET titulo = TRIM(p_titulo),
        resumen = p_resumen,
        url_documento = COALESCE(p_url_documento, url_documento),
        id_carrera = p_id_carrera,
        anio_elaboracion = p_anio_elaboracion,
        id_usuario_modificacion = p_editado_por,
        fecha_modificacion = NOW()
    WHERE id_tesis = p_id_tesis;
    
    -- ==========================================
    -- ESTUDIANTES
    -- ==========================================
    
    -- Eliminar estudiantes que ya no están en la tesis
    UPDATE tesis.tesis_estudiante
	SET fecha_eliminacion = now(),
		id_usuario_eliminacion = p_editado_por
    WHERE id_tesis = p_id_tesis
    AND id_estudiante NOT IN (
        SELECT (elem->>'id_estudiante')::INT
        FROM jsonb_array_elements(p_estudiantes) elem
        WHERE elem ? 'id_estudiante' AND (elem->>'id_estudiante') IS NOT NULL
    );
    
    -- AGREGAR O ACTUALIZAR     
    FOR v_estudiante IN SELECT * FROM jsonb_array_elements(p_estudiantes)  LOOP
        -- Caso 1: Ya viene con ID
        IF v_estudiante ? 'id_estudiante' AND (v_estudiante->>'id_estudiante') IS NOT NULL THEN
            v_id_estudiante := (v_estudiante->>'id_estudiante')::INT;
            
            IF EXISTS (SELECT 1 FROM personas.estudiante WHERE id_estudiante = v_id_estudiante AND fecha_eliminacion IS NULL) THEN
			    UPDATE personas.estudiante
			    SET nombre_completo = v_estudiante->>'nombre_completo',
                    email = v_estudiante->>'email'
			    WHERE id_estudiante = v_id_estudiante;
			END IF;
        
        -- Caso 2: No tiene ID, crear por nombre/cedula/email
        ELSIF v_estudiante ? 'nombre_completo' AND (v_estudiante->>'nombre_completo') IS NOT NULL THEN
            
            -- Verificar si ya existe por cédula
            SELECT id_estudiante INTO v_id_estudiante
            FROM personas.estudiante
            WHERE cedula = (v_estudiante->>'cedula')
            LIMIT 1;
            
            IF v_id_estudiante IS  NULL THEN
                			 	
                -- Crear nuevo estudiante
                INSERT INTO personas.estudiante (
                    nombre_completo,
                    cedula,
                    email,
                    id_usuario_creacion
                ) VALUES (
                    v_estudiante->>'nombre_completo',
                    v_estudiante->>'cedula',
                    v_estudiante->>'email',
                    p_editado_por
                )
                RETURNING id_estudiante INTO v_id_estudiante;
                                          
            END IF;			
        ELSE
            RAISE WARNING 'Estudiante inválido, se omite: %', v_estudiante;
            CONTINUE;
        END IF;
		-- Vincular estudiante a la tesis
		INSERT INTO tesis.tesis_estudiante (id_tesis, id_estudiante, id_usuario_creacion)
		VALUES (p_id_tesis, v_id_estudiante, p_editado_por)
		ON CONFLICT (id_tesis, id_estudiante) DO NOTHING;
    END LOOP;
    
    -- ==========================================
    -- EVALUACIONES Y JURADOS
    -- ==========================================    
    -- Eliminar evaluaciones que ya no están

    UPDATE tesis.evaluacion_tesis
	SET fecha_eliminacion = now(),
		id_usuario_eliminacion = p_editado_por
    WHERE id_tesis = p_id_tesis
    AND id_evaluacion NOT IN (
        SELECT (elem->>'id_evaluacion')::INT
        FROM jsonb_array_elements(p_evaluaciones) elem
        WHERE elem ? 'id_evaluacion' AND (elem->>'id_evaluacion') IS NOT NULL
    );
    
    --  AGREGAR O ACTUALIZAR EVALUACIONES    
    FOR v_evaluacion IN SELECT * FROM jsonb_array_elements(p_evaluaciones) LOOP
        IF v_evaluacion ? 'jurado' THEN
            
            -- Caso 1: Jurado con ID existente
            IF v_evaluacion->'jurado' ? 'id_jurado' AND (v_evaluacion->'jurado'->>'id_jurado') IS NOT NULL THEN
                v_id_jurado := (v_evaluacion->'jurado'->>'id_jurado')::INT;
                
                IF EXISTS (SELECT 1 FROM personas.jurado WHERE id_jurado = v_id_jurado AND fecha_eliminacion IS NULL) THEN
				 	UPDATE personas.jurado
					SET nombre_completo = v_evaluacion->'jurado'->>'nombre_completo',
						titulo_profesional = v_evaluacion->'jurado'->>'titulo_profesional'
					WHERE id_jurado = v_id_jurado;
               END IF;
            
            -- Caso 2: Crear jurado por nombre/cedula
            ELSIF v_evaluacion->'jurado' ? 'nombre_completo' THEN
                
                -- Verificar si ya existe por cedula
                SELECT id_jurado INTO v_id_jurado
                FROM personas.jurado
                WHERE cedula = (v_evaluacion->'jurado'->>'cedula')
                AND fecha_eliminacion IS NULL
                LIMIT 1;
                
                IF v_id_jurado IS  NULL THEN
                    -- Crear nuevo jurado
                    INSERT INTO personas.jurado (
                        nombre_completo,
                        titulo_profesional,
                        cedula,
                        id_usuario_creacion
                    ) VALUES (
                        v_evaluacion->'jurado'->>'nombre_completo',
                        v_evaluacion->'jurado'->>'titulo_profesional',
                        v_evaluacion->'jurado'->>'cedula',
                        p_editado_por
                    )
                    RETURNING id_jurado INTO v_id_jurado;
                    
                END IF;
            ELSE
                RAISE WARNING 'Jurado inválido, se omite: %', v_evaluacion;
                CONTINUE;
            END IF;
            
            -- Verificar si la evaluación ya existe (por ID)
            IF v_evaluacion ? 'id_evaluacion' AND (v_evaluacion->>'id_evaluacion') IS NOT NULL THEN
                -- Actualizar evaluación existente
                UPDATE tesis.evaluacion_tesis
                SET 
                    id_jurado = v_id_jurado,
                    nota = COALESCE((v_evaluacion->>'nota')::DECIMAL(4,2), 0),
                    fecha_evaluacion = COALESCE((v_evaluacion->>'fecha_evaluacion')::DATE, NOW()),
                    comentarios = v_evaluacion->>'comentarios',
                    id_usuario_modificacion = p_editado_por,
                    fecha_modificacion = NOW()
                WHERE id_evaluacion = (v_evaluacion->>'id_evaluacion')::INT
                AND id_tesis = p_id_tesis;
            ELSE
                -- Crear nueva evaluación
                INSERT INTO tesis.evaluacion_tesis (
                    id_tesis,
                    id_jurado,
                    nota,
                    fecha_evaluacion,
                    comentarios,
                    id_usuario_creacion
                ) VALUES (
                    p_id_tesis,
                    v_id_jurado,
                    COALESCE((v_evaluacion->>'nota')::DECIMAL(4,2), 0),
                    COALESCE((v_evaluacion->>'fecha_evaluacion')::DATE, NOW()),
                    v_evaluacion->>'comentarios',
                    p_editado_por
                );
            END IF;
        END IF;
    END LOOP;
    
    --  RESULTADO    
    RETURN jsonb_build_object(
        'success', TRUE,
        'status', 200,
        'message', 'Tesis actualizada exitosamente'
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
