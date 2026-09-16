
------- no tocar es para saber si tiene permiso un usuario a hacer una accion en especifico
CREATE OR REPLACE FUNCTION seguridad.get_permisos_usuario(
    p_id_usuario INT,
    p_modulo VARCHAR,
    p_accion VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
    v_tiene_permiso BOOLEAN := FALSE;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM seguridad.permiso p
        WHERE p.modulo = p_modulo AND p.accion = p_accion
		and p.fecha_eliminacion IS NULL
        AND (
            -- Permiso otorgado por su rol
            EXISTS (SELECT 1 FROM seguridad.rol_permiso rp 
                    JOIN seguridad.usuario u ON u.id_rol = rp.id_rol
                    WHERE u.id_usuario = p_id_usuario 
					AND rp.id_permiso = p.id_permiso
					AND rp.fecha_eliminacion IS NULL
					)
            OR 
            -- Permiso EXTRA otorgado por el admin
            EXISTS (SELECT 1 FROM seguridad.usuario_permiso up
                    WHERE up.id_usuario = p_id_usuario 
					AND up.id_permiso = p.id_permiso 
					AND up.activo is true
					AND up.fecha_eliminacion IS NULL
					)					
        )
        AND NOT (
            -- Permiso BLOQUEADO por el admin (aunque su rol lo tenga)
            EXISTS (SELECT 1 FROM seguridad.usuario_permiso up
                    WHERE up.id_usuario = p_id_usuario 
					AND up.id_permiso = p.id_permiso 
					AND up.activo is false
					AND up.fecha_eliminacion IS NULL
					)
        )
    ) INTO v_tiene_permiso;

    RETURN v_tiene_permiso;
END;
$$ LANGUAGE plpgsql;



---------------------- dar permisos



CREATE OR REPLACE FUNCTION seguridad.obtener_permisos_usuario(p_id_usuario INT)
RETURNS TABLE (
    id_permiso INT,
    modulo VARCHAR,
    accion VARCHAR,
	titulo TEXT,
    estado_permiso TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id_permiso,
        p.modulo,
        p.accion,
        p.titulo,
		CASE 
          	-- Si hay un registro específico para el usuario y está activo
            WHEN up.id_usuario IS NOT NULL AND up.fecha_eliminacion IS NULL THEN
                CASE 
                    WHEN up.activo IS FALSE THEN 'bloqueado'
                    WHEN up.activo IS TRUE THEN 'extra'
                END
            --  Si no hay registro específico, verificamos el rol
            WHEN EXISTS (
                SELECT 1 
                FROM seguridad.rol_permiso rp 
                JOIN seguridad.usuario u ON u.id_rol = rp.id_rol
                WHERE u.id_usuario = p_id_usuario
				AND rp.id_permiso = p.id_permiso
            ) THEN 'rol'
			
            ELSE 'sin_permiso'
        END AS estado_permiso
    FROM seguridad.permiso p
    LEFT JOIN seguridad.usuario_permiso up ON up.id_permiso = p.id_permiso
		AND up.id_usuario =  p_id_usuario 
		WHERE p.fecha_eliminacion IS NULL
    ORDER BY p.modulo, p.accion;
END;
$$ LANGUAGE plpgsql;


---------------------------- ver usuarios

CREATE OR REPLACE FUNCTION seguridad.obtener_usuarios_administrables(
    p_busqueda TEXT DEFAULT NULL,
    p_offset INT DEFAULT 0,
    p_limit INT DEFAULT 10
)
RETURNS TABLE (
    id_usuario INT,
    nombre_usuario VARCHAR,
    nombre_completo VARCHAR,
    email VARCHAR,
    id_rol INT,
    nombre_rol VARCHAR,
    total_usuarios BIGINT -- Nueva columna para saber cuántos hay en total
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id_usuario,
        u.nombre,
        u.nombre_completo,
        u.email,
        u.id_rol,
        r.nombre AS nombre_rol,
        COUNT(*) OVER() AS total_usuarios -- Cuenta el total sin limitar
    FROM seguridad.usuario u
    JOIN seguridad.rol r ON r.id_rol = u.id_rol
    WHERE u.fecha_eliminacion IS NULL
      AND r.nombre <> 'invitado'
      -- Filtrar por búsqueda si viene
      AND (p_busqueda IS NULL OR u.nombre ILIKE '%' || p_busqueda || '%' OR u.nombre_completo ILIKE '%' || p_busqueda || '%')
    ORDER BY u.id_usuario
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;






-- Función para DAR un permiso EXTRA (activarlo)



CREATE OR REPLACE FUNCTION seguridad.asignar_permiso_usuario(
    p_id_usuario INT,
    p_id_permiso INT
)
RETURNS JSONB AS $$
BEGIN
    INSERT INTO seguridad.usuario_permiso (id_usuario, id_permiso, activo, fecha_eliminacion) 
    VALUES (p_id_usuario, p_id_permiso, TRUE, NULL)
    ON CONFLICT (id_usuario, id_permiso) 
    DO UPDATE SET 
        activo = TRUE,
        fecha_eliminacion = NULL; -- Si ya existía, le quitamos la fecha de eliminación
     
    RETURN jsonb_build_object('success', TRUE, 'message', 'Permiso asignado correctamente');
END;
$$ LANGUAGE plpgsql;

-- Función para QUITAR un permiso (bloquearlo)
CREATE OR REPLACE FUNCTION seguridad.bloquear_permiso_usuario(
    p_id_usuario INT,
    p_id_permiso INT
)
RETURNS JSONB AS $$
BEGIN
    -- Si existe a registro (aunque sea del rol), lo bloqueamos
    IF EXISTS (SELECT 1 FROM seguridad.usuario_permiso 
               WHERE id_usuario = p_id_usuario AND id_permiso = p_id_permiso) THEN
        
        UPDATE seguridad.usuario_permiso 
        SET activo = FALSE,
            fecha_eliminacion = NULL -- Si lo bloqueamos, lo quitamos de la "eliminación" para que se vea como bloqueado
        WHERE id_usuario = p_id_usuario AND id_permiso = p_id_permiso;
        
    ELSE
        -- Si no existía, we create the bloqueo
        INSERT INTO seguridad.usuario_permiso (id_usuario, id_permiso, activo, fecha_eliminacion) 
        VALUES (p_id_usuario, p_id_permiso, FALSE, NULL);
    END IF;
    
    RETURN jsonb_build_object('success', TRUE, 'message', 'Permiso bloqueado correctamente');
END;
$$ LANGUAGE plpgsql;

-- Función para "Limpiar" (restablecer al rol base)
CREATE OR REPLACE FUNCTION seguridad.limpiar_permisos_usuario(p_id_usuario INT)
RETURNS JSONB AS $$
BEGIN
    -- En lugar de DELETE, ponemos la fecha de eliminación a todas las filas
    UPDATE seguridad.usuario_permiso 
    SET fecha_eliminacion = NOW(),
        activo = FALSE
    WHERE id_usuario = p_id_usuario;
    
    RETURN jsonb_build_object('success', TRUE, 'message', 'Permisos restablecidos al rol base');
END;
$$ LANGUAGE plpgsql;