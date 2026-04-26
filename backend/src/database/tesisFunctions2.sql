-- FUNCTION: tesis.crear_tesis(character varying, text, integer, character varying, jsonb, jsonb, integer)

-- DROP FUNCTION IF EXISTS tesis.crear_tesis(character varying, text, integer, character varying, jsonb, jsonb, integer);

CREATE OR REPLACE FUNCTION tesis.crear_tesis(
	p_titulo character varying,
	p_resumen text,
	p_id_carrera integer,	
	p_anio_elaboracion INT ,
	p_url_documento character varying,
	p_estudiantes jsonb DEFAULT '[]'::jsonb,
	p_evaluaciones jsonb DEFAULT '[]'::jsonb,
	p_creado_por integer DEFAULT NULL::integer)
    RETURNS jsonb
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
    v_id_tesis INT;
    v_estudiante JSONB;
    v_evaluacion JSONB;
    v_id_estudiante INT;
    v_id_jurado INT;
    v_estudiantes_creados INT := 0;
    v_estudiantes_existentes INT := 0;
    v_jurados_creados INT := 0;
    v_jurados_existentes INT := 0;
    v_error TEXT;
BEGIN

    -- VALIDACIONES BÁSICAS
	-- cargar ruta archivo
   IF p_url_documento IS NULL THEN 
        RETURN jsonb_build_object(
        'success', false,
        'status', 400,
        'message', 'no de a cargado el archivo'
        );
    END IF;
    -- Validar carrera
  
    IF NOT EXISTS (SELECT 1 FROM catalogo.carrera WHERE id_carrera = p_id_carrera AND fecha_eliminacion IS NULL) THEN
        RETURN jsonb_build_object(
        'success', false,
        'status', 400,
        'message', 'carrera seleccionada no existe'
        );
    END IF;

	IF jsonb_array_length(p_estudiantes) = 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'status', 400,
            'error', 'Debe especificar al menos un estudiante como autor de la tesis'
        );
    END IF;
    
    --  CREAR LA TESIS
    
    INSERT INTO tesis.tesis (
        titulo,
        resumen,
        url_documento,
        id_carrera,
        id_estado,
        id_usuario_creacion
    ) VALUES (
        TRIM(p_titulo),
        p_resumen,
        p_url_documento,
        p_id_carrera,
        1, -- publicada
        p_creado_por
    )
    RETURNING id_tesis INTO v_id_tesis;
    
    
    --  ESTUDIANTES
    
    FOR v_estudiante IN SELECT * FROM jsonb_array_elements(p_estudiantes)
    LOOP
        -- Caso 1: Ya viene con ID
        IF v_estudiante ? 'id_estudiante' AND (v_estudiante->>'id_estudiante') IS NOT NULL THEN
            v_id_estudiante := (v_estudiante->>'id_estudiante')::INT;
            
            -- Verificar que existe
            IF EXISTS (SELECT 1 FROM personas.estudiante WHERE id_estudiante = v_id_estudiante AND fecha_eliminacion IS NULL) THEN
                v_estudiantes_existentes := v_estudiantes_existentes + 1;
            ELSE
                RAISE EXCEPTION 'Estudiante con ID % no existe', v_id_estudiante;
            END IF;
        
        -- Caso 2: No tiene ID, crear por nombre/cedula/email
        ELSIF v_estudiante ? 'nombre_completo' AND (v_estudiante->>'nombre_completo') IS NOT NULL THEN
		 	            
            -- Verificar si ya existe por cédula o email
            SELECT id_estudiante INTO v_id_estudiante
            FROM personas.estudiante
            WHERE (cedula = (v_estudiante->>'cedula') OR email = (v_estudiante->>'email'))
            AND fecha_eliminacion IS NULL
            LIMIT 1;
            
            IF v_id_estudiante IS NOT NULL THEN
                -- Ya existe, solo se vincula
                v_estudiantes_existentes := v_estudiantes_existentes + 1;
            ELSE
                -- Crear nuevo estudiante
                INSERT INTO personas.estudiante (
                    nombre_completo,
                    cedula,
                    email,
                    id_carrera,
					id_usuario_creacion
                ) VALUES (
                    v_estudiante->>'nombre_completo',
                    v_estudiante->>'cedula',
                    v_estudiante->>'email',
                    p_id_carrera,
                    p_creado_por
                )
                RETURNING id_estudiante INTO v_id_estudiante;
                
                v_estudiantes_creados := v_estudiantes_creados + 1;
            END IF;
        ELSE
            RAISE WARNING 'Estudiante inválido, se omite: %', v_estudiante;
            CONTINUE;
        END IF;
        
        -- Vincular estudiante a la tesis
        INSERT INTO tesis.tesis_estudiante (id_tesis, id_estudiante, id_usuario_creacion)
        VALUES (v_id_tesis, v_id_estudiante, p_creado_por )
        ON CONFLICT (id_tesis, id_estudiante) DO NOTHING;
        
    END LOOP;
    
    
    -- PROCESAR EVALUACIONES y JURADOS
    
    FOR v_evaluacion IN SELECT * FROM jsonb_array_elements(p_evaluaciones)
    LOOP
        -- Procesar jurado
        IF v_evaluacion ? 'jurado' THEN
            
            -- Caso 1: Jurado con ID existente
            IF v_evaluacion->'jurado' ? 'id_jurado' AND (v_evaluacion->'jurado'->>'id_jurado') IS NOT NULL THEN
                v_id_jurado := (v_evaluacion->'jurado'->>'id_jurado')::INT;
                
                IF EXISTS (SELECT 1 FROM personas.jurado WHERE id_jurado = v_id_jurado AND fecha_eliminacion IS NULL) THEN
                    v_jurados_existentes := v_jurados_existentes + 1;
                ELSE
                    RAISE EXCEPTION 'Jurado con ID % no existe', v_id_jurado;
                END IF;
            
            -- Caso 2: Crear jurado por nombre/cedula
            ELSIF v_evaluacion->'jurado' ? 'nombre_completo' THEN
                
                -- Verificar si ya existe por cedula
                SELECT id_jurado INTO v_id_jurado
                FROM personas.jurado
                WHERE cedula = (v_evaluacion->'jurado'->>'cedula')
                AND fecha_eliminacion IS NULL
                LIMIT 1;
                
                IF v_id_jurado IS NOT NULL THEN
                    v_jurados_existentes := v_jurados_existentes + 1;
                ELSE
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
                        p_creado_por
                    )
                    RETURNING id_jurado INTO v_id_jurado;
                    
                    v_jurados_creados := v_jurados_creados + 1;
                END IF;
            ELSE
                RAISE WARNING 'Jurado inválido, se omite: %', v_evaluacion;
                CONTINUE;
            END IF;
            
            -- Crear evaluación
            INSERT INTO tesis.evaluacion_tesis (
                id_tesis,
                id_jurado,
                nota,
                fecha_evaluacion,
                comentarios,
				id_usuario_creacion
            ) VALUES (
                v_id_tesis,
                v_id_jurado,
                COALESCE((v_evaluacion->>'nota')::DECIMAL(4,2), 0),
                COALESCE((v_evaluacion->>'fecha_evaluacion')::DATE, NOW()),
                v_evaluacion->>'comentarios',
                p_creado_por
            );
        END IF;
    END LOOP;
    
    
    --  RESULTADO    
    RETURN jsonb_build_object(
        'success', TRUE,
        'status', 201,
        'message', 'Tesis creada exitosamente',
        'data', jsonb_build_object(
            'id_tesis', v_id_tesis,
            'titulo', LEFT(p_titulo, 100),
            'estudiantes_creados', v_estudiantes_creados,
            'estudiantes_existentes', v_estudiantes_existentes,
            'jurados_creados', v_jurados_creados,
            'jurados_existentes', v_jurados_existentes
        )
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
$BODY$;

ALTER FUNCTION tesis.crear_tesis(character varying, text, integer, character varying, jsonb, jsonb, integer)
    OWNER TO postgres;

