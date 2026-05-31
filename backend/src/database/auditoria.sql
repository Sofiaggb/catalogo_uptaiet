-- Esquema para auditoría
CREATE SCHEMA IF NOT EXISTS auditoria;

/*
ALTER TABLE auditoria.log_actividad 
RENAME COLUMN tabla_nombre to tabla;
*/
-- Tabla principal de auditoría
CREATE TABLE auditoria.log_actividad (
    id_log BIGSERIAL PRIMARY KEY,
	esquema  VARCHAR(50),
    tabla  VARCHAR(100) NOT NULL,
    registro_id INTEGER ,
    accion VARCHAR(20) NOT NULL CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE', 'SOFT_DELETE')),
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    id_usuario INTEGER REFERENCES seguridad.usuario(id_usuario),
    ip_address INET,
    user_agent TEXT,
    fecha TIMESTAMP DEFAULT NOW(),
    CONSTRAINT check_campos CHECK (
        (accion = 'INSERT' AND datos_anteriores IS NULL AND datos_nuevos IS NOT NULL) OR
        (accion = 'UPDATE' AND datos_anteriores IS NOT NULL AND datos_nuevos IS NOT NULL) OR
        (accion = 'DELETE' AND datos_anteriores IS NOT NULL AND datos_nuevos IS NULL) OR
        (accion = 'SOFT_DELETE' AND datos_anteriores IS NOT NULL AND datos_nuevos IS NULL)
    )
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_log_tabla_registro ON auditoria.log_actividad(tabla_nombre);
CREATE INDEX idx_log_fecha ON auditoria.log_actividad(fecha);
CREATE INDEX idx_log_usuario ON auditoria.log_actividad(id_usuario);
CREATE INDEX idx_log_accion ON auditoria.log_actividad(accion);



-- Función genérica para auditoríaCREATE OR REPLACE FUNCTION auditoria.funcion_auditoria()

CREATE OR REPLACE FUNCTION auditoria.funcion_auditoria()
RETURNS TRIGGER AS $$
DECLARE
    v_datos_anteriores JSONB;
    v_datos_nuevos JSONB;
    v_id_usuario INTEGER;
    v_ip INET;
    v_user_agent TEXT;
BEGIN
    -- Obtener información de sesión
    BEGIN
        v_id_usuario := current_setting('app.current_user_id', TRUE)::INTEGER;
    EXCEPTION WHEN OTHERS THEN
        v_id_usuario := NULL;
    END;
    
    BEGIN
        v_ip := current_setting('app.current_ip', TRUE)::INET;
    EXCEPTION WHEN OTHERS THEN
        v_ip := NULL;
    END;
    
    BEGIN
        v_user_agent := current_setting('app.current_user_agent', TRUE);
    EXCEPTION WHEN OTHERS THEN
        v_user_agent := NULL;
    END;
    
    -- Convertir registros a JSONB
    IF TG_OP = 'DELETE' THEN
        v_datos_anteriores := to_jsonb(OLD);
        v_datos_nuevos := NULL;
    ELSIF TG_OP = 'UPDATE' THEN
        v_datos_anteriores := to_jsonb(OLD);
        v_datos_nuevos := to_jsonb(NEW);
    ELSE -- INSERT
        v_datos_anteriores := NULL;
        v_datos_nuevos := to_jsonb(NEW);
    END IF;
    
    -- Insertar en log (registro_id = NULL)
    INSERT INTO auditoria.log_actividad (
		esquema,
        tabla,
        accion,
        datos_anteriores,
        datos_nuevos,
        id_usuario,
        ip_address,
        user_agent
    ) VALUES (
		TG_TABLE_SCHEMA,
        TG_TABLE_NAME,
        TG_OP,
        v_datos_anteriores,
        v_datos_nuevos,
        v_id_usuario,
        v_ip,
        v_user_agent
    );
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- TRIGGERS PARA TESIS
-- ============================================
CREATE TRIGGER trigger_auditoria_tesis_insert
    AFTER INSERT ON tesis.tesis
    FOR EACH ROW EXECUTE FUNCTION auditoria.funcion_auditoria();

CREATE TRIGGER trigger_auditoria_tesis_update
    AFTER UPDATE ON tesis.tesis
    FOR EACH ROW EXECUTE FUNCTION auditoria.funcion_auditoria();

CREATE TRIGGER trigger_auditoria_tesis_delete
    AFTER DELETE ON tesis.tesis
    FOR EACH ROW EXECUTE FUNCTION auditoria.funcion_auditoria();

-- ============================================
-- TRIGGERS PARA CARRERAS
-- ============================================
CREATE TRIGGER trigger_auditoria_carreras_insert
    AFTER INSERT ON catalogo.carrera
    FOR EACH ROW EXECUTE FUNCTION auditoria.funcion_auditoria();

CREATE TRIGGER trigger_auditoria_carreras_update
    AFTER UPDATE ON catalogo.carrera
    FOR EACH ROW EXECUTE FUNCTION auditoria.funcion_auditoria();

CREATE TRIGGER trigger_auditoria_carreras_delete
    AFTER DELETE ON catalogo.carrera
    FOR EACH ROW EXECUTE FUNCTION auditoria.funcion_auditoria();

-- ============================================
-- TRIGGERS PARA MATERIAS
-- ============================================
CREATE TRIGGER trigger_auditoria_materias_insert
    AFTER INSERT ON catalogo.materia
    FOR EACH ROW EXECUTE FUNCTION auditoria.funcion_auditoria();

CREATE TRIGGER trigger_auditoria_materias_update
    AFTER UPDATE ON catalogo.materia
    FOR EACH ROW EXECUTE FUNCTION auditoria.funcion_auditoria();

CREATE TRIGGER trigger_auditoria_materias_delete
    AFTER DELETE ON catalogo.materia
    FOR EACH ROW EXECUTE FUNCTION auditoria.funcion_auditoria();

-- ============================================
-- TRIGGERS PARA LIBROS
-- ============================================
CREATE TRIGGER trigger_auditoria_libros_insert
    AFTER INSERT ON recursos.libro
    FOR EACH ROW EXECUTE FUNCTION auditoria.funcion_auditoria();

CREATE TRIGGER trigger_auditoria_libros_update
    AFTER UPDATE ON recursos.libro
    FOR EACH ROW EXECUTE FUNCTION auditoria.funcion_auditoria();

CREATE TRIGGER trigger_auditoria_libros_delete
    AFTER DELETE ON recursos.libro
    FOR EACH ROW EXECUTE FUNCTION auditoria.funcion_auditoria();

-- ============================================
-- TRIGGERS PARA USUARIOS
-- ============================================
CREATE TRIGGER trigger_auditoria_usuarios_insert
    AFTER INSERT ON seguridad.usuario
    FOR EACH ROW EXECUTE FUNCTION auditoria.funcion_auditoria();

CREATE TRIGGER trigger_auditoria_usuarios_update
    AFTER UPDATE ON seguridad.usuario
    FOR EACH ROW EXECUTE FUNCTION auditoria.funcion_auditoria();

CREATE TRIGGER trigger_auditoria_usuarios_delete
    AFTER DELETE ON seguridad.usuario
    FOR EACH ROW EXECUTE FUNCTION auditoria.funcion_auditoria();

-- ============================================
-- TRIGGERS PARA SOLICITUDES DE ROL
-- ============================================
CREATE TRIGGER trigger_auditoria_solicitudes_insert
    AFTER INSERT ON seguridad.solicitud_rol
    FOR EACH ROW EXECUTE FUNCTION auditoria.funcion_auditoria();

CREATE TRIGGER trigger_auditoria_solicitudes_update
    AFTER UPDATE ON seguridad.solicitud_rol
    FOR EACH ROW EXECUTE FUNCTION auditoria.funcion_auditoria();

CREATE TRIGGER trigger_auditoria_solicitudes_delete
    AFTER DELETE ON seguridad.solicitud_rol
    FOR EACH ROW EXECUTE FUNCTION auditoria.funcion_auditoria();



	-- ============================================
-- TRIGGERS PARA ESTUDIANTES
-- ============================================
CREATE TRIGGER trigger_auditoria_estudiante_insert
    AFTER INSERT ON personas.estudiante
    FOR EACH ROW EXECUTE FUNCTION auditoria.funcion_auditoria();

CREATE TRIGGER trigger_auditoria_estudiante_update
    AFTER UPDATE ON personas.estudiante
    FOR EACH ROW EXECUTE FUNCTION auditoria.funcion_auditoria();

CREATE TRIGGER trigger_auditoria_estudiante_delete
    AFTER DELETE ON personas.estudiante
    FOR EACH ROW EXECUTE FUNCTION auditoria.funcion_auditoria();

-- ============================================
-- TRIGGERS PARA JURADOS
-- ============================================
CREATE TRIGGER trigger_auditoria_jurado_insert
    AFTER INSERT ON personas.jurado
    FOR EACH ROW EXECUTE FUNCTION auditoria.funcion_auditoria();

CREATE TRIGGER trigger_auditoria_jurado_update
    AFTER UPDATE ON personas.jurado
    FOR EACH ROW EXECUTE FUNCTION auditoria.funcion_auditoria();

CREATE TRIGGER trigger_auditoria_jurado_delete
    AFTER DELETE ON personas.jurado
    FOR EACH ROW EXECUTE FUNCTION auditoria.funcion_auditoria();

-- ============================================
-- TRIGGERS PARA EVALUACIONES DE TESIS
-- ============================================
CREATE TRIGGER trigger_auditoria_evaluacion_insert
    AFTER INSERT ON tesis.evaluacion_tesis
    FOR EACH ROW EXECUTE FUNCTION auditoria.funcion_auditoria();

CREATE TRIGGER trigger_auditoria_evaluacion_update
    AFTER UPDATE ON tesis.evaluacion_tesis
    FOR EACH ROW EXECUTE FUNCTION auditoria.funcion_auditoria();

CREATE TRIGGER trigger_auditoria_evaluacion_delete
    AFTER DELETE ON tesis.evaluacion_tesis
    FOR EACH ROW EXECUTE FUNCTION auditoria.funcion_auditoria();

-- ============================================
-- TRIGGERS PARA TESIS_ESTUDIANTE (relación)
-- ============================================
CREATE TRIGGER trigger_auditoria_tesis_estudiante_insert
    AFTER INSERT ON tesis.tesis_estudiante
    FOR EACH ROW EXECUTE FUNCTION auditoria.funcion_auditoria();

CREATE TRIGGER trigger_auditoria_tesis_estudiante_update
    AFTER UPDATE ON tesis.tesis_estudiante
    FOR EACH ROW EXECUTE FUNCTION auditoria.funcion_auditoria();

CREATE TRIGGER trigger_auditoria_tesis_estudiante_delete
    AFTER DELETE ON tesis.tesis_estudiante
    FOR EACH ROW EXECUTE FUNCTION auditoria.funcion_auditoria();



-- ============================================
-- TRIGGERS PARA TIPOS DE CARRERA
-- ============================================
CREATE TRIGGER trigger_auditoria_tipo_carrera_insert
    AFTER INSERT ON catalogo.tipo_carrera
    FOR EACH ROW EXECUTE FUNCTION auditoria.funcion_auditoria();

CREATE TRIGGER trigger_auditoria_tipo_carrera_update
    AFTER UPDATE ON catalogo.tipo_carrera
    FOR EACH ROW EXECUTE FUNCTION auditoria.funcion_auditoria();

CREATE TRIGGER trigger_auditoria_tipo_carrera_delete
    AFTER DELETE ON catalogo.tipo_carrera
    FOR EACH ROW EXECUTE FUNCTION auditoria.funcion_auditoria();




-- =====================================================
-- FUNCIÓN: listar_logs_auditoria
-- DESCRIPCIÓN: Lista los logs de auditoría con filtros y paginación
-- =====================================================

select auditoria.listar_logs_auditoria(null, null , 's')


				
CREATE OR REPLACE FUNCTION auditoria.listar_logs_auditoria(
    p_tabla VARCHAR DEFAULT NULL,
    p_accion VARCHAR DEFAULT NULL,
    p_usuario character varying DEFAULT NULL,
    p_fecha_desde TIMESTAMP DEFAULT NULL,
    p_fecha_hasta TIMESTAMP DEFAULT NULL,
    p_limit INT DEFAULT 50,
    p_offset INT DEFAULT 0
)
RETURNS JSONB AS $$
DECLARE
    v_resultado JSONB;
    v_total INT;
BEGIN
    -- Contar total de registros
    SELECT COUNT(*) INTO v_total
    FROM auditoria.log_actividad l
	LEFT JOIN seguridad.usuario u on u.id_usuario = l.id_usuario
    WHERE (p_tabla IS NULL OR l.tabla  = p_tabla)
    AND (p_accion IS NULL OR l.accion = p_accion)
    AND (p_usuario IS NULL OR u.nombre ILIKE  '%' || p_usuario || '%' )
    AND (p_fecha_desde IS NULL OR l.fecha::date >= p_fecha_desde)
    AND (p_fecha_hasta IS NULL OR l.fecha::date <= p_fecha_hasta);

    -- Obtener datos paginados
    SELECT COALESCE(jsonb_agg(row_to_json(data_logs)), '[]'::jsonb) INTO v_resultado
    FROM (
        SELECT 
            l.id_log,
            l.esquema,
            l.tabla,
            l.accion,
            l.datos_anteriores,
            l.datos_nuevos,
            l.fecha,
            l.id_usuario,
            u.nombre as usuario_nombre,
            u.email as usuario_email,
            l.ip_address,
            l.user_agent
        FROM auditoria.log_actividad l
        LEFT JOIN seguridad.usuario u ON l.id_usuario = u.id_usuario
        WHERE (p_tabla IS NULL OR l.tabla = p_tabla)
        AND (p_accion IS NULL OR l.accion = p_accion)
        AND (p_usuario IS NULL OR u.nombre ILIKE  '%' || p_usuario || '%' )
        AND (p_fecha_desde IS NULL OR l.fecha::date >= p_fecha_desde)
        AND (p_fecha_hasta IS NULL OR l.fecha::date <= p_fecha_hasta)
        ORDER BY l.fecha DESC
        LIMIT p_limit OFFSET p_offset
    ) AS data_logs;

    -- Retornar resultado
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
            'message', 'Error al listar logs de auditoría',
            'error', SQLERRM,
            'codigo', SQLSTATE
        );
END;
$$ LANGUAGE plpgsql;

