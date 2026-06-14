-- =====================================================
-- FUNCIÓN: actualizar_foto_perfil
-- DESCRIPCIÓN: Actualiza la foto de perfil del usuario
-- =====================================================
CREATE OR REPLACE FUNCTION seguridad.actualizar_foto_perfil(
    p_id_usuario INT,
    p_url_foto VARCHAR(500)
)
RETURNS JSONB AS $$
BEGIN
    -- Verificar que el usuario existe
    IF NOT EXISTS (SELECT 1 FROM seguridad.usuario WHERE id_usuario = p_id_usuario AND fecha_eliminacion IS NULL) THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'status', 404,
            'message', 'Usuario no encontrado'
        );
    END IF;
    
    -- Actualizar foto
    UPDATE seguridad.usuario 
    SET foto_perfil = p_url_foto,
        fecha_modificacion = NOW()
    WHERE id_usuario = p_id_usuario;
    
    RETURN jsonb_build_object(
        'success', TRUE,
        'status', 200,
        'message', 'Foto de perfil actualizada correctamente',
        'data', jsonb_build_object(
            'foto_perfil', p_url_foto
        )
    );
END;
$$ LANGUAGE plpgsql;