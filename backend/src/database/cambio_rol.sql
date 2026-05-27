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
    INSERT INTO seguridad.solicitud_rol (id_usuario, rol_solicitado, justificacion, id_estado,cedula,nombre_completo)
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
    SET id_rol = v_solicitud.rol_solicitado,
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
    SET estado = 4, -- 'rechazada',
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