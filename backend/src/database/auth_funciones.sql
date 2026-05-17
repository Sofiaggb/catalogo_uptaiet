-- ============================================
-- FUNCIÓN: Generar y guardar código de verificación
-- ============================================
CREATE OR REPLACE FUNCTION seguridad.generar_codigo(
    p_email VARCHAR(150),
	p_nombre VARCHAR(100) 
)
RETURNS JSONB AS $$
DECLARE
    v_codigo VARCHAR(6);
    v_tiempo_vigencia INTERVAL;
BEGIN

   -- Validar email
    IF p_email IS NULL OR TRIM(p_email) = '' THEN
        RETURN jsonb_build_object('success', FALSE, 'status', 400, 'message', 'El email es obligatorio');
    END IF;
    
    -- Validar nombre
    IF p_nombre IS NULL OR TRIM(p_nombre) = '' THEN
        RETURN jsonb_build_object('success', FALSE, 'status', 400, 'message', 'El nombre de usuario es obligatorio');
    END IF;
    
    -- Verificar si el email ya está registrado
    IF EXISTS (SELECT 1 FROM seguridad.usuario WHERE LOWER(email) =  LOWER(p_email) AND fecha_eliminacion IS NULL) THEN
        RETURN jsonb_build_object(
            'success', FALSE, 
            'status', 409, 
            'message', 'El email ya está registrado'
        );
    END IF;
    
    -- Verificar si el nombre de usuario ya está registrado
    IF EXISTS (SELECT 1 FROM seguridad.usuario WHERE LOWER(nombre) = LOWER(p_nombre) AND fecha_eliminacion IS NULL) THEN
        RETURN jsonb_build_object(
            'success', FALSE, 
            'status', 409, 
            'message', 'El nombre de usuario ya está en uso'
        );
    END IF;


	
    
    -- Configurar tiempo de vigencia (15 minutos)
    v_tiempo_vigencia := INTERVAL '15 minutes';

    -- Generar código de 6 dígitos
    v_codigo := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    
    -- Insertar nuevo código
    INSERT INTO seguridad.codigo_verificacion (email, codigo, expira_en)
    VALUES ( LOWER(p_email), v_codigo, NOW() + v_tiempo_vigencia);
    
    -- Marcar códigos anteriores como expirados
    UPDATE seguridad.codigo_verificacion 
    SET usado = TRUE 
    WHERE email = p_email 
    AND id_codigo != (SELECT MAX(id_codigo) FROM seguridad.codigo_verificacion WHERE email = p_email);
    
    RETURN jsonb_build_object(
        'success', TRUE,
        'status', 200,
        'message', 'Código enviado',
        'data', jsonb_build_object(
            'email', p_email,
            'codigo', v_codigo,
            'expira_en', NOW() + v_tiempo_vigencia
        )
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'status', 500,
            'message', SQLERRM,
            'codigo', SQLSTATE
        );
END;
$$ LANGUAGE plpgsql;


-- Función para marcar como usados los códigos anteriores
CREATE OR REPLACE FUNCTION seguridad.limpiar_codigos_viejos()
RETURNS INTEGER AS $$
BEGIN
    -- Marcar como usados los códigos expirados
    UPDATE seguridad.codigo_verificacion 
    SET usado = TRUE 
    WHERE expira_en < NOW() AND usado = FALSE;
    
    -- Eliminar códigos usados de más de 1 día (opcional)
    DELETE FROM seguridad.codigo_verificacion 
    WHERE usado = TRUE AND creado_en < NOW() - INTERVAL '1 day';
    
    RETURN FOUND;
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'status', 500,
            'message', SQLERRM,
            'codigo', SQLSTATE
        );
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- FUNCIÓN: Verificar código y crear usuario
-- ============================================
CREATE OR REPLACE FUNCTION seguridad.verificar_y_registrar(
    p_email VARCHAR(150),
    p_codigo VARCHAR(6),
    p_password VARCHAR(255),
    p_nombre VARCHAR(100),
    p_id_rol INT DEFAULT 1
)
RETURNS JSONB AS $$
DECLARE
    v_verificacion RECORD;
    v_id_usuario INT;
BEGIN
    -- Buscar código pendiente
    SELECT * INTO v_verificacion
    FROM seguridad.codigo_verificacion
    WHERE email =  LOWER(p_email)
    AND usado = FALSE
    AND expira_en > NOW();
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'status', 404,
            'message', 'Código no encontrado o expirado. Solicita un nuevo código.'
        );
    END IF;
    
    -- Verificar intentos (máximo 5)
    IF v_verificacion.intentos >= 5 THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'status', 429,
            'message', 'Demasiados intentos. Solicita un nuevo código.'
        );
    END IF;
    
    -- Verificar código
    IF v_verificacion.codigo != p_codigo THEN
        UPDATE seguridad.codigo_verificacion 
        SET intentos = intentos + 1 
        WHERE email =  LOWER(p_email);
        
        RETURN jsonb_build_object(
            'success', FALSE,
            'status', 401,
            'message', 'Código incorrecto. Te quedan ' || (5 - (v_verificacion.intentos + 1)) || ' intentos.'
        );
    END IF;
    
    -- Código correcto: crear usuario
    INSERT INTO seguridad.usuario (email, password, nombre, id_rol)
    VALUES ( LOWER(p_email), crypt(p_password, gen_salt('bf')),  LOWER(p_nombre), p_id_rol)
    RETURNING id_usuario INTO v_id_usuario;
    
    -- Marcar código como usado
    UPDATE seguridad.codigo_verificacion 
    SET usado = TRUE 
    WHERE email = LOWER(p_email);
    
    RETURN jsonb_build_object(
        'success', TRUE,
        'status', 200,
        'message', 'Usuario registrado exitosamente',
        'data', jsonb_build_object(
            'id_usuario', v_id_usuario,
            'email', p_email,
            'nombre', p_nombre,
            'rol', 'estudiante'
        )
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'status', 500,
            'message', SQLERRM,
            'codigo', SQLSTATE
        );
END;
$$ LANGUAGE plpgsql;



-- ============================================
-- FUNCIÓN: Reenviar código
-- ============================================
CREATE OR REPLACE FUNCTION seguridad.reenviar_codigo(
    p_email VARCHAR(150)
)
RETURNS JSONB AS $$
DECLARE
    v_nuevo_codigo VARCHAR(6);
BEGIN
    -- Generar nuevo código
    v_nuevo_codigo := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    
    -- Actualizar código
    UPDATE seguridad.codigo_verificacion 
    SET codigo = v_nuevo_codigo,
        intentos = 0,
        expira_en = NOW() + INTERVAL '15 minutes',
        usado = FALSE
    WHERE email = LOWER(p_email);
    
    IF NOT FOUND THEN
        -- Si no existe, crearlo
        INSERT INTO seguridad.codigo_verificacion (email, codigo)
        VALUES (LOWER(p_email), v_nuevo_codigo);
    END IF;
    
    RETURN jsonb_build_object(
        'success', TRUE,
        'status', 200,
        'message', 'Nuevo código enviado',
        'data', jsonb_build_object(
            'email', p_email,
            'codigo', v_nuevo_codigo  -- Solo para pruebas
        )
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'status', 500,
            'message', SQLERRM,
            'codigo', SQLSTATE
        );
END;
$$ LANGUAGE plpgsql;



-- ============================================
-- FUNCIÓN: Iniciar sesión (email o nombre de usuario)
-- ============================================\

CREATE OR REPLACE FUNCTION seguridad.usuario_login(
    p_identificador VARCHAR(150),  -- Puede ser email o nombre
    p_password VARCHAR(255)
)
RETURNS JSONB AS $$
DECLARE
    v_usuario RECORD;
BEGIN
    -- Validar campos
    IF p_identificador IS NULL OR p_password IS NULL THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'status', 400,
            'message', 'usuario y contraseña son obligatorios'
        );
    END IF;
    
    -- Buscar usuario por email O por nombre de usuario
    SELECT u.id_usuario, u.email, u.nombre, u.password, 
           r.id_rol, r.nombre as rol_nombre , u.fecha_creacion::date
    INTO v_usuario
    FROM seguridad.usuario u
    JOIN seguridad.rol r ON u.id_rol = r.id_rol
    WHERE (u.email = LOWER(p_identificador) OR u.nombre = LOWER(p_identificador))
    AND u.fecha_eliminacion IS NULL;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'status', 401,
            'message', 'usuario o contraseña incorrectos'
        );
    END IF;
    
    -- Verificar contraseña
    IF v_usuario.password = crypt(p_password, v_usuario.password) THEN
        
        RETURN jsonb_build_object(
            'success', TRUE,
            'status', 200,
            'message', 'Inicio de sesión exitoso',
            'data', jsonb_build_object(
                'id_usuario', v_usuario.id_usuario,
                'email', v_usuario.email,
                'nombre', v_usuario.nombre,
                'rol', v_usuario.rol_nombre,
                'id_rol', v_usuario.id_rol,
                'fecha_creacion', v_usuario.fecha_creacion
            )
        );
    ELSE
        RETURN jsonb_build_object(
            'success', FALSE,
            'status', 401,
            'message', 'usuario o contraseña incorrectos'
        );
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'status', 500,
            'message', SQLERRM,
            'codigo', SQLSTATE
        );
END;
$$ LANGUAGE plpgsql;



-------------------------------------------------------------------
-------------------------------------------------------------------
-------------------------------------------------------------------
-------------------------------------------------------------------
-------------------------------------------------------------------
-------------------------------------------------------------------


-- ============================================
-- FUNCIÓN: Generar código para recuperar contraseña
-- ============================================
CREATE OR REPLACE FUNCTION seguridad.generar_codigo_recuperacion(
    p_email VARCHAR(150)
)
RETURNS JSONB AS $$
DECLARE
    v_codigo VARCHAR(6);
    v_email_norm VARCHAR(150);
    v_usuario_id INT;
BEGIN
    -- Normalizar email
    v_email_norm := LOWER(TRIM(p_email));
    
    -- Validar email
    IF v_email_norm IS NULL OR v_email_norm = '' THEN
        RETURN jsonb_build_object('success', FALSE, 'status', 400, 'message', 'El email es obligatorio');
    END IF;
    
    -- Verificar si el email existe
    SELECT id_usuario INTO v_usuario_id
    FROM seguridad.usuario
    WHERE email = v_email_norm AND fecha_eliminacion IS NULL;
    
    IF NOT FOUND THEN
        -- Por seguridad, no revelamos si el email existe o no
        RETURN jsonb_build_object(
            'success', TRUE,
            'status', 200,
            'message', 'Si el email está registrado, recibirás un código de recuperación'
        );
    END IF;
    
    -- Generar código de 6 dígitos
    v_codigo := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    
    -- Guardar código de recuperación (expira en 15 minutos)
    INSERT INTO seguridad.codigo_recuperacion (email, codigo, id_usuario, expira_en)
    VALUES (v_email_norm, v_codigo, v_usuario_id, NOW() + INTERVAL '15 minutes');

	 --   Marcar códigos anteriores como expirados (para mantener solo el último activo)
    UPDATE seguridad.codigo_recuperacion 
    SET usado = TRUE 
    WHERE email = v_email_norm 
    AND id_recuperacion != (SELECT MAX(id_recuperacion) FROM seguridad.codigo_recuperacion WHERE email = v_email_norm);
    
    RETURN jsonb_build_object(
        'success', TRUE,
        'status', 200,
        'message', 'Código de recuperación generado',
        'data', jsonb_build_object(
            'email', v_email_norm,
            'codigo', v_codigo  -- Solo para pruebas
        )
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIÓN: Verificar código de recuperación
-- ============================================
-- ============================================
-- FUNCIÓN: Verificar código de recuperación
-- ============================================
CREATE OR REPLACE FUNCTION seguridad.verificar_codigo_recuperacion(
    p_email VARCHAR(150),
    p_codigo VARCHAR(6)
)
RETURNS JSONB AS $$
DECLARE
    v_recuperacion RECORD;
BEGIN
    -- Normalizar email
    p_email := LOWER(TRIM(p_email));
    
    -- Buscar código pendiente (el más reciente)
    SELECT * INTO v_recuperacion
    FROM seguridad.codigo_recuperacion
    WHERE email = p_email 
    AND usado = FALSE
    AND expira_en > NOW()
    ORDER BY id_recuperacion DESC
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'status', 404,
            'message', 'Código no encontrado o expirado. Solicita un nuevo código.'
        );
    END IF;
    
    -- Verificar intentos
    IF v_recuperacion.intentos >= 5 THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'status', 429,
            'message', 'Demasiados intentos. Solicita un nuevo código.'
        );
    END IF;
    
    -- Verificar código
    IF v_recuperacion.codigo != p_codigo THEN
        UPDATE seguridad.codigo_recuperacion 
        SET intentos = intentos + 1 
        WHERE id_recuperacion = v_recuperacion.id_recuperacion;
        
        RETURN jsonb_build_object(
            'success', FALSE,
            'status', 401,
            'message', 'Código incorrecto. Te quedan ' || (5 - (v_recuperacion.intentos + 1)) || ' intentos.'
        );
    END IF;
    
    -- Marcar como verificado
    UPDATE seguridad.codigo_recuperacion 
    SET verificado = TRUE 
    WHERE id_recuperacion = v_recuperacion.id_recuperacion;
    
    RETURN jsonb_build_object(
        'success', TRUE,
        'status', 200,
        'message', 'Código verificado correctamente',
        'data', jsonb_build_object(
            'id_usuario', v_recuperacion.id_usuario,
            'email', v_recuperacion.email
        )
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIÓN: Cambiar contraseña (después de verificar código)
-- ============================================
CREATE OR REPLACE FUNCTION seguridad.cambiar_contrasena(
    p_email VARCHAR(150),
    p_codigo VARCHAR(6),
    p_nueva_contrasena VARCHAR(255)
)
RETURNS JSONB AS $$
DECLARE
    v_recuperacion RECORD;
BEGIN
    -- Normalizar email
    p_email := LOWER(TRIM(p_email));
    
    -- Validar nueva contraseña
    IF p_nueva_contrasena IS NULL OR LENGTH(p_nueva_contrasena) < 6 THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'status', 400,
            'message', 'La nueva contraseña debe tener al menos 6 caracteres'
        );
    END IF;
    
    -- Buscar código verificado y no usado
    SELECT * INTO v_recuperacion
    FROM seguridad.codigo_recuperacion
    WHERE email = p_email 
    AND codigo = p_codigo
    AND verificado = TRUE
    AND usado = FALSE
    AND expira_en > NOW()
    ORDER BY id_recuperacion DESC
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'status', 404,
            'message', 'Código no válido o expirado. Solicita un nuevo código.'
        );
    END IF;
    
    -- Actualizar contraseña
    UPDATE seguridad.usuario 
    SET password = crypt(p_nueva_contrasena, gen_salt('bf')),
        fecha_modificacion = NOW()
    WHERE id_usuario = v_recuperacion.id_usuario;
    
    -- Marcar código como usado
    UPDATE seguridad.codigo_recuperacion 
    SET usado = TRUE 
    WHERE id_recuperacion = v_recuperacion.id_recuperacion;
    
    RETURN jsonb_build_object(
        'success', TRUE,
        'status', 200,
        'message', 'Contraseña actualizada correctamente'
    );
END;
$$ LANGUAGE plpgsql;