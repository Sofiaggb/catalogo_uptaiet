

--------- crear tesis

CREATE OR REPLACE FUNCTION tesis.crear_tesis(
    -- Datos de la tesis
    p_titulo VARCHAR(300),
    p_resumen TEXT,
    p_id_carrera INT,
    p_url_documento VARCHAR(500) DEFAULT NULL,
    
    -- Estudiantes: array de objetos con id O nombre/cedula/email
    p_estudiantes JSONB DEFAULT '[]'::jsonb,
    
    -- Jurados/evaluaciones: array con datos del jurado + nota
    p_evaluaciones JSONB DEFAULT '[]'::jsonb,
    
    -- Auditoría
    p_creado_por INTEGER DEFAULT NULL
)
RETURNS JSONB AS $$
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
$$ LANGUAGE plpgsql;


---------- obtener tesis completa

CREATE OR REPLACE FUNCTION tesis.obtener_tesis_completa(
    p_id_tesis INTEGER
)
RETURNS JSONB AS $$
DECLARE
    v_resultado JSONB;
    v_tesis JSONB;
    v_estudiantes JSONB;
    v_evaluaciones JSONB;
    v_carrera_nombre VARCHAR;
    v_estado_nombre VARCHAR;
BEGIN
    --  Verificar tesis existe 
    IF NOT EXISTS (
        SELECT 1 FROM tesis.tesis 
        WHERE id_tesis = p_id_tesis 
        AND fecha_eliminacion IS NULL
    ) THEN
        RAISE EXCEPTION 'Tesis no encontrada o eliminada (ID: %)', p_id_tesis;
    END IF;

    --  obtener datos tesis
    SELECT 
        jsonb_build_object(
            'id_tesis', t.id_tesis,
            'titulo', t.titulo,
            'resumen', t.resumen,
            'fecha_publicacion', t.fecha_publicacion,
            'url_documento', t.url_documento,
            'fecha_creacion', t.fecha_creacion,
            'carrera', jsonb_build_object(
                'id_carrera', c.id_carrera,
                'nombre', c.nombre
            ),
            'estado', jsonb_build_object(
                'id_estado', e.id_estado,
                'nombre', e.nombre_estado
            )
        )
    INTO v_tesis
    FROM tesis.tesis t
    JOIN catalogo.carrera c ON t.id_carrera = c.id_carrera
    LEFT JOIN control.estado e ON t.id_estado = e.id_estado
    WHERE t.id_tesis = p_id_tesis
    AND t.fecha_eliminacion IS NULL;

    -- Obtener estudiantes autores
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id_estudiante', e.id_estudiante,
                'nombre_completo', e.nombre_completo,
                'cedula', e.cedula,
                'email', e.email,
                'carrera_estudiante', (
                    SELECT nombre FROM catalogo.carrera 
                    WHERE id_carrera = e.id_carrera
                )
            )
            ORDER BY te.id_tesis_estudiante
        ),
        '[]'::jsonb
    )
    INTO v_estudiantes
    FROM tesis.tesis_estudiante te
    JOIN personas.estudiante e ON te.id_estudiante = e.id_estudiante
    WHERE te.id_tesis = p_id_tesis;

    --  Obtener evaluaciones (jurados)
    SELECT COALESCE(
        jsonb_agg(
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
        ),
        '[]'::jsonb
    )
    INTO v_evaluaciones
    FROM tesis.evaluacion_tesis ev
    JOIN personas.jurado j ON ev.id_jurado = j.id_jurado
    WHERE ev.id_tesis = p_id_tesis
    AND ev.fecha_eliminacion IS NULL;

    -- respuesta
    v_resultado := v_tesis || jsonb_build_object(
        'estudiantes', v_estudiantes,
        'evaluaciones', v_evaluaciones,
        'total_estudiantes', jsonb_array_length(v_estudiantes),
        'total_evaluaciones', jsonb_array_length(v_evaluaciones),
        'promedio_nota', (
            SELECT ROUND(AVG(nota), 2)
            FROM tesis.evaluacion_tesis
            WHERE id_tesis = p_id_tesis
            AND fecha_eliminacion IS NULL
        )
    );

    RETURN v_resultado;
END;
$$ LANGUAGE plpgsql;




---------- devolver todas las tesis 

CREATE OR REPLACE FUNCTION tesis.listar_tesis(
    p_id_carrera INT DEFAULT NULL,
    p_id_estado INT DEFAULT NULL,
    p_anio INT DEFAULT NULL,
    p_buscar VARCHAR(200) DEFAULT NULL,
    p_limit INT DEFAULT 50,
    p_offset INT DEFAULT 0
)
RETURNS JSONB AS $$
DECLARE
    v_resultado JSONB;
    v_total INT;
BEGIN
    -- Contar total de registros (para paginación)
    SELECT COUNT(*) INTO v_total
    FROM tesis.tesis t
    WHERE t.fecha_eliminacion IS NULL
    AND (p_id_carrera IS NULL OR t.id_carrera = p_id_carrera)
    AND (p_id_estado IS NULL OR t.id_estado = p_id_estado)
    AND (p_anio IS NULL OR EXTRACT(YEAR FROM t.fecha_creacion) = p_anio)
    AND (p_buscar IS NULL OR 
         t.titulo ILIKE '%' || p_buscar || '%' OR 
         t.resumen ILIKE '%' || p_buscar || '%');
    
    -- Obtener tesis con sus relaciones básicas
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id_tesis', t.id_tesis,
                'titulo', t.titulo,
                'resumen', LEFT(t.resumen, 150),
                'fecha_publicacion', t.fecha_publicacion,
                'fecha_creacion', t.fecha_creacion,
                'url_documento', t.url_documento,
                'carrera', jsonb_build_object(
                    'id_carrera', c.id_carrera,
                    'nombre', c.nombre
                ),
                'estado', jsonb_build_object(
                    'id_estado', e.id_estado,
                    'nombre', e.nombre_estado
                ),
                'total_estudiantes', (
                    SELECT COUNT(*) 
                    FROM tesis.tesis_estudiante te 
                    WHERE te.id_tesis = t.id_tesis
                ),
                'promedio_nota', (
                    SELECT ROUND(AVG(ev.nota), 2)
                    FROM tesis.evaluacion_tesis ev
                    WHERE ev.id_tesis = t.id_tesis
                    AND ev.fecha_eliminacion IS NULL
                )
            )
            ORDER BY t.fecha_creacion DESC
        ),
        '[]'::jsonb
    )
    INTO v_resultado
    FROM tesis.tesis t
    JOIN catalogo.carrera c ON t.id_carrera = c.id_carrera
    LEFT JOIN control.estado e ON t.id_estado = e.id_estado
    WHERE t.fecha_eliminacion IS NULL
    AND (p_id_carrera IS NULL OR t.id_carrera = p_id_carrera)
    AND (p_id_estado IS NULL OR t.id_estado = p_id_estado)
    AND (p_anio IS NULL OR EXTRACT(YEAR FROM t.fecha_creacion) = p_anio)
    AND (p_buscar IS NULL OR 
         t.titulo ILIKE '%' || p_buscar || '%' OR 
         t.resumen ILIKE '%' || p_buscar || '%')
    LIMIT p_limit OFFSET p_offset;
    
    -- Retornar resultado con metadatos de paginación
    RETURN jsonb_build_object(
        'success', TRUE,
        'data', v_resultado,
        'pagination', jsonb_build_object(
            'total', v_total,
            'limit', p_limit,
            'offset', p_offset,
            'pages', CEIL(v_total::DECIMAL / p_limit)
        ),
        'filters', jsonb_build_object(
            'id_carrera', p_id_carrera,
            'id_estado', p_id_estado,
            'anio', p_anio,
            'buscar', p_buscar
        )
    );
END;
$$ LANGUAGE plpgsql;



---------------- editar tesis

CREATE OR REPLACE FUNCTION tesis.editar_tesis(
    -- Datos de la tesis
    p_id_tesis INT,
    p_titulo VARCHAR(300) DEFAULT NULL,
    p_resumen TEXT DEFAULT NULL,
    p_id_carrera INT DEFAULT NULL,
    
    -- Nuevo archivo PDF (si se reemplaza)
    p_nuevo_url_documento VARCHAR(500) DEFAULT NULL,
    
    -- Estudiantes: array de objetos con id O nombre/cedula/email
    p_estudiantes JSONB DEFAULT NULL,
    
    -- Jurados/evaluaciones: array con datos del jurado + nota
    p_evaluaciones JSONB DEFAULT NULL,
    
    -- Auditoría
    p_modificado_por INTEGER DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_titulo_actual VARCHAR(300);
    v_resumen_actual TEXT;
    v_id_carrera_actual INT;
    v_id_estado_actual INT;
    v_url_actual VARCHAR(500);
    v_estudiante JSONB;
    v_evaluacion JSONB;
    v_id_estudiante INT;
    v_id_jurado INT;
    v_estudiantes_creados INT := 0;
    v_estudiantes_existentes INT := 0;
    v_estudiantes_eliminados INT := 0;
    v_jurados_creados INT := 0;
    v_jurados_existentes INT := 0;
    v_evaluaciones_agregadas INT := 0;
    v_old_url VARCHAR(500);
BEGIN
    
    --  VALIDAR QUE LA TESIS EXISTE    
    SELECT titulo, resumen, id_carrera, id_estado, url_documento 
    INTO v_titulo_actual, v_resumen_actual, v_id_carrera_actual, v_id_estado_actual, v_old_url
    FROM tesis.tesis
    WHERE id_tesis = p_id_tesis AND fecha_eliminacion IS NULL;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'status', 404,
            'error', 'La tesis no existe o ya fue eliminada'
        );
    END IF;
    
    
    -- VALIDAR ESTUDIANTES NUEVOS 
    
    IF p_estudiantes IS NOT NULL AND jsonb_array_length(p_estudiantes) > 0 THEN
        FOR v_estudiante IN SELECT * FROM jsonb_array_elements(p_estudiantes)
        LOOP
            -- Caso 1: Viene con ID
            IF v_estudiante ? 'id_estudiante' AND (v_estudiante->>'id_estudiante') IS NOT NULL THEN
                v_id_estudiante := (v_estudiante->>'id_estudiante')::INT;
                
                IF NOT EXISTS (SELECT 1 FROM personas.estudiante WHERE id_estudiante = v_id_estudiante AND fecha_eliminacion IS NULL) THEN
                    RETURN jsonb_build_object(
                        'success', false,
                        'status', 400,
                        'error', 'El estudiante con ID ' || v_id_estudiante || ' no existe'
                    );
                END IF;
            
            -- Caso 2: Nuevo estudiante (validar campos)
            ELSIF v_estudiante ? 'nombre_completo' THEN
                
                IF (v_estudiante->>'nombre_completo') IS NULL OR TRIM(v_estudiante->>'nombre_completo') = '' THEN
                    RETURN jsonb_build_object(
                        'success', false,
                        'status', 400,
                        'error', 'El nombre completo del estudiante es obligatorio'
                    );
                END IF;
                
                IF (v_estudiante->>'cedula') IS NULL OR TRIM(v_estudiante->>'cedula') = '' THEN
                    RETURN jsonb_build_object(
                        'success', false,
                        'status', 400,
                        'error', 'La cédula del estudiante es obligatoria'
                    );
                END IF;
            ELSE
                RETURN jsonb_build_object(
                    'success', false,
                    'status', 400,
                    'error', 'Formato de estudiante inválido'
                );
            END IF;
        END LOOP;
    END IF;
    
    -- INICIO DE TRANSACCIÓN
    
    BEGIN
        --  ACTUALIZAR DATOS DE LA TESIS
        
        UPDATE tesis.tesis
        SET titulo = COALESCE(p_titulo, titulo),
            resumen = COALESCE(p_resumen, resumen),
            id_carrera = COALESCE(p_id_carrera, id_carrera),
            url_documento = COALESCE(p_nuevo_url_documento, url_documento)
           -- fecha_modificacion = NOW(),
           -- id_usuario_modificacion = p_modificado_por
        WHERE id_tesis = p_id_tesis;
        
        -- ACTUALIZAR ESTUDIANTES 
        
        IF p_estudiantes IS NOT NULL THEN
            -- Obtener estudiantes actuales para contar eliminados
            SELECT COUNT(*) INTO v_estudiantes_eliminados
            FROM tesis.tesis_estudiante
            WHERE id_tesis = p_id_tesis;
            
            -- Eliminar todos los estudiantes actuales
            DELETE FROM tesis.tesis_estudiante
            WHERE id_tesis = p_id_tesis;
            
            v_estudiantes_creados := 0;
            v_estudiantes_existentes := 0;
            v_estudiantes_eliminados := v_estudiantes_eliminados;
            
            -- Insertar los nuevos estudiantes
            FOR v_estudiante IN SELECT * FROM jsonb_array_elements(p_estudiantes)
            LOOP
                -- Obtener o crear estudiante
                IF v_estudiante ? 'id_estudiante' AND (v_estudiante->>'id_estudiante') IS NOT NULL THEN
                    v_id_estudiante := (v_estudiante->>'id_estudiante')::INT;
                    v_estudiantes_existentes := v_estudiantes_existentes + 1;
                ELSE
                    -- Buscar por cédula
                    SELECT id_estudiante INTO v_id_estudiante
                    FROM personas.estudiante
                    WHERE cedula = (v_estudiante->>'cedula')
                    AND fecha_eliminacion IS NULL;
                    
                    IF v_id_estudiante IS NULL THEN
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
                            COALESCE(p_id_carrera, v_id_carrera_actual),
                            p_modificado_por
                        )
                        RETURNING id_estudiante INTO v_id_estudiante;
                        
                        v_estudiantes_creados := v_estudiantes_creados + 1;
                    ELSE
                        v_estudiantes_existentes := v_estudiantes_existentes + 1;
                    END IF;
                END IF;
                
                -- Vincular estudiante a la tesis
                INSERT INTO tesis.tesis_estudiante (id_tesis, id_estudiante, id_usuario_creacion)
                VALUES (p_id_tesis, v_id_estudiante, p_modificado_por);
            END LOOP;
        END IF;
        
        --  ACTUALIZAR EVALUACIONES 
        
        IF p_evaluaciones IS NOT NULL AND jsonb_array_length(p_evaluaciones) > 0 THEN
            -- Eliminar evaluaciones anteriores (opcional - depende de tu lógica)
            DELETE FROM tesis.evaluacion_tesis
            WHERE id_tesis = p_id_tesis;
            
            v_evaluaciones_agregadas := 0;
            
            FOR v_evaluacion IN SELECT * FROM jsonb_array_elements(p_evaluaciones)
            LOOP
                -- Procesar jurado
                IF v_evaluacion->'jurado' ? 'id_jurado' AND (v_evaluacion->'jurado'->>'id_jurado') IS NOT NULL THEN
                    v_id_jurado := (v_evaluacion->'jurado'->>'id_jurado')::INT;
                    
                    IF NOT EXISTS (SELECT 1 FROM personas.jurado WHERE id_jurado = v_id_jurado AND fecha_eliminacion IS NULL) THEN
                        RAISE EXCEPTION 'Jurado con ID % no existe', v_id_jurado;
                    END IF;
                    
                    v_jurados_existentes := v_jurados_existentes + 1;
                    
                ELSIF v_evaluacion->'jurado' ? 'nombre_completo' THEN
                    
                    -- Buscar por cédula
                    SELECT id_jurado INTO v_id_jurado
                    FROM personas.jurado
                    WHERE cedula = (v_evaluacion->'jurado'->>'cedula')
                    AND fecha_eliminacion IS NULL;
                    
                    IF v_id_jurado IS NULL THEN
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
                            p_modificado_por
                        )
                        RETURNING id_jurado INTO v_id_jurado;
                        
                        v_jurados_creados := v_jurados_creados + 1;
                    ELSE
                        v_jurados_existentes := v_jurados_existentes + 1;
                    END IF;
                ELSE
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
                    p_id_tesis,
                    v_id_jurado,
                    COALESCE((v_evaluacion->>'nota')::DECIMAL(4,2), 0),
                    COALESCE((v_evaluacion->>'fecha_evaluacion')::DATE, CURRENT_DATE),
                    v_evaluacion->>'comentarios',
                    p_modificado_por
                );
                
                v_evaluaciones_agregadas := v_evaluaciones_agregadas + 1;
            END LOOP;
        END IF;
        
        --  RESULTADO 
        
        RETURN jsonb_build_object(
            'success', TRUE,
            'status', 200,
            'message', 'Tesis actualizada exitosamente',
            'data', jsonb_build_object(
                'id_tesis', p_id_tesis,
                'titulo', COALESCE(p_titulo, v_titulo_actual),
                'carrera_modificada', p_id_carrera IS NOT NULL,
                'archivo_reemplazado', p_nuevo_url_documento IS NOT NULL,
                'estudiantes_creados', v_estudiantes_creados,
                'estudiantes_existentes', v_estudiantes_existentes,
                'estudiantes_eliminados', v_estudiantes_eliminados,
                'jurados_creados', v_jurados_creados,
                'jurados_existentes', v_jurados_existentes,
                'evaluaciones_agregadas', v_evaluaciones_agregadas,
                'url_anterior', v_old_url,
                'url_nueva', COALESCE(p_nuevo_url_documento, v_old_url)
            )
        );
        
    EXCEPTION
        WHEN OTHERS THEN
            RETURN jsonb_build_object(
                'success', FALSE,
                'status', 400,
                'error', SQLERRM,
                'codigo', SQLSTATE,
                'message', 'No se pudo actualizar la tesis. Todos los cambios fueron revertidos.'
            );
    END;
    
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