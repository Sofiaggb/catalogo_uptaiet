-- Función para crear solicitud de cambio de rol
CREATE OR REPLACE FUNCTION seguridad.crear_solicitud_rol(
    p_id_usuario INT,
    p_rol_solicitado INT,
	p_cedula  character varying, 
	p_nombre_completo  character varying,
    p_justificacion TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_solicitud_existente RECORD;
BEGIN
    -- Verificar si ya hay una solicitud pendiente
    SELECT * INTO v_solicitud_existente
    FROM seguridad.solicitud_rol
    WHERE id_usuario = p_id_usuario 
    AND id_estado = 2 --'pendiente'
    AND fecha_eliminacion IS NULL;
    
    IF FOUND THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'Ya tienes una solicitud pendiente'
        );
    END IF;
    
    -- Verificar que el rol solicitado existe
    IF NOT EXISTS (SELECT 1 FROM seguridad.rol WHERE id_rol = p_rol_solicitado) THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'El rol solicitado no existe'
        );
    END IF;
    
    -- Crear solicitud
    INSERT INTO seguridad.solicitud_rol (id_usuario, id_rol_solicitado, justificacion, id_estado,cedula,nombre_completo)
    VALUES (p_id_usuario, p_rol_solicitado, p_justificacion,2, p_cedula, p_nombre_completo);
    
    RETURN jsonb_build_object(
        'success', TRUE,
        'message', 'Solicitud enviada correctamente'
    );
END;
$$ LANGUAGE plpgsql;

-- Función para aprobar solicitud (solo admin)
CREATE OR REPLACE FUNCTION seguridad.aprobar_solicitud_rol(
    p_id_solicitud INT,
    p_id_administrador INT,
    p_comentario TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_solicitud RECORD;
BEGIN
    -- Verificar que el usuario es administrador
    IF NOT EXISTS (
        SELECT 1 FROM seguridad.usuario u
        JOIN seguridad.rol r ON u.id_rol = r.id_rol
        WHERE u.id_usuario = p_id_administrador 
        AND r.id_rol = 3
    ) THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'No autorizado'
        );
    END IF;
    
    -- Obtener solicitud
    SELECT * INTO v_solicitud
    FROM seguridad.solicitud_rol
    WHERE id_solicitud = p_id_solicitud 
    AND id_estado = 2 --'pendiente'
    AND fecha_eliminacion IS NULL;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'Solicitud no encontrada'
        );
    END IF;
    
    -- Actualizar rol del usuario
    UPDATE seguridad.usuario 
    SET id_rol = v_solicitud.id_rol_solicitado,
		cedula = v_solicitud.cedula,
		nombre_completo = v_solicitud.nombre_completo
    WHERE id_usuario = v_solicitud.id_usuario;
    
    -- Actualizar solicitud
    UPDATE seguridad.solicitud_rol 
    SET id_estado = 3, --'aprobada',
        id_administrador = p_id_administrador,
        fecha_respuesta = NOW(),
        comentario_admin = p_comentario
    WHERE id_solicitud = p_id_solicitud;
    
    RETURN jsonb_build_object(
        'success', TRUE,
        'message', 'Solicitud aprobada'
    );
END;
$$ LANGUAGE plpgsql;

-- Función para rechazar solicitud
CREATE OR REPLACE FUNCTION seguridad.rechazar_solicitud_rol(
    p_id_solicitud INT,
    p_id_administrador INT,
    p_comentario TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
BEGIN
    -- Verificar administrador
    IF NOT EXISTS (
        SELECT 1 FROM seguridad.usuario u
        JOIN seguridad.rol r ON u.id_rol = r.id_rol
        WHERE u.id_usuario = p_id_administrador 
        AND r.id_rol = 3 --'administrador'
    ) THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'No autorizado'
        );
    END IF;
    
    UPDATE seguridad.solicitud_rol 
    SET id_estado = 4, -- 'rechazada',
        id_administrador = p_id_administrador,
        fecha_respuesta = NOW(),
        comentario_admin = p_comentario
    WHERE id_solicitud = p_id_solicitud;
    
    RETURN jsonb_build_object(
        'success', TRUE,
        'message', 'Solicitud rechazada'
    );
END;
$$ LANGUAGE plpgsql;










-- =====================================================
-- FUNCIÓN: listar_solicitudes_rol
-- DESCRIPCIÓN: Lista las solicitudes de cambio de rol con paginación y filtros
-- =====================================================
--select seguridad.listar_solicitudes_rol()

 
 CREATE OR REPLACE FUNCTION seguridad.listar_solicitudes_rol(
    p_id_estado VARCHAR DEFAULT NULL,
    p_limit INT DEFAULT 20,
    p_offset INT DEFAULT 0
)
RETURNS JSONB AS $$
DECLARE
    v_resultado JSONB;
    v_total INT;
BEGIN
    -- Contar total de registros
    SELECT COUNT(*) INTO v_total
    FROM seguridad.solicitud_rol s
    WHERE s.fecha_eliminacion IS NULL
    AND  (p_id_estado IS NULL OR s.id_estado = ANY(string_to_array(p_id_estado, ',')::int[]));

    -- Obtener datos paginados
    SELECT COALESCE(jsonb_agg(row_to_json(data_solicitudes)), '[]'::jsonb) INTO v_resultado
    FROM (
        SELECT 
            s.id_solicitud,
            s.justificacion,
			s.cedula,
			s.nombre_completo,
            s.id_estado,
			e.nombre_estado as estado,
            s.fecha_solicitud,
            s.fecha_respuesta,
            s.comentario_admin,
            u.id_usuario,
            u.nombre as usuario_nombre,
            u.email as usuario_email,
            r_actual.nombre as rol_actual,
            r_solicitado.nombre as rol_solicitado
        FROM seguridad.solicitud_rol s
        JOIN control.estado e ON e.id_estado = s.id_estado
        JOIN seguridad.usuario u ON s.id_usuario = u.id_usuario
        JOIN seguridad.rol r_actual ON u.id_rol = r_actual.id_rol
        JOIN seguridad.rol r_solicitado ON s.id_rol_solicitado = r_solicitado.id_rol
        WHERE s.fecha_eliminacion IS NULL
        AND (p_id_estado IS NULL OR s.id_estado = ANY(string_to_array(p_id_estado, ',')::int[]))
        ORDER BY s.fecha_solicitud DESC
        LIMIT p_limit OFFSET p_offset
    ) AS data_solicitudes;

    -- Retornar resultado con paginación
    RETURN jsonb_build_object(
        'success', TRUE,
        'data', COALESCE(v_resultado, '[]'::jsonb),
        'pagination', jsonb_build_object(
            'total', COALESCE(v_total, 0),
            'limit', p_limit,
            'offset', p_offset,
            'pages', CASE 
                WHEN COALESCE(v_total, 0) = 0 THEN 0
                ELSE CEIL(v_total::DECIMAL / p_limit)
            END
        )
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'status', 500,
            'message', 'Error al listar las solicitudes',
            'error', SQLERRM,
            'codigo', SQLSTATE
        );
END;
$$ LANGUAGE plpgsql;



-- =====================================================
-- FUNCIÓN: obtener_estadisticas_solicitudes
-- DESCRIPCIÓN: Obtiene estadísticas de las solicitudes
-- =====================================================

--   select seguridad.obtener_estadisticas_solicitudes()


CREATE OR REPLACE FUNCTION seguridad.obtener_estadisticas_solicitudes()
RETURNS JSONB AS $$
DECLARE
    v_pendientes INT;
    v_aprobadas INT;
    v_rechazadas INT;
    v_total INT;
BEGIN
    SELECT COUNT(*) INTO v_pendientes
    FROM seguridad.solicitud_rol
    WHERE id_estado = 2--'pendiente' 
	AND fecha_eliminacion IS NULL;
    
    SELECT COUNT(*) INTO v_aprobadas
    FROM seguridad.solicitud_rol
    WHERE id_estado = 3 --'aprobada' 
	AND fecha_eliminacion IS NULL;
    
    SELECT COUNT(*) INTO v_rechazadas
    FROM seguridad.solicitud_rol
    WHERE id_estado = 4 --'rechazada' 
	AND fecha_eliminacion IS NULL;
    
    SELECT COUNT(*) INTO v_total
    FROM seguridad.solicitud_rol
    WHERE fecha_eliminacion IS NULL;
    
    RETURN jsonb_build_object(
        'success', TRUE,
        'data', jsonb_build_object(
            'pendientes', COALESCE(v_pendientes, 0),
            'aprobadas', COALESCE(v_aprobadas, 0),
            'rechazadas', COALESCE(v_rechazadas, 0),
            'total', COALESCE(v_total, 0)
        )
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'status', 500,
            'message', 'Error al obtener estadísticas',
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql;

