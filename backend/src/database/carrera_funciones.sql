
CREATE OR REPLACE FUNCTION catalogo.carrera_crear(
    p_nombre VARCHAR(100),
    p_descripcion TEXT,
    p_id_tipo_carrera INTEGER,	
	p_id_tipo_trabajo INTEGER ,
    p_creado_por INTEGER DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
BEGIN
    
    --  CREAR LA CRRERA    
   INSERT INTO catalogo.carrera ( nombre, descripcion, id_tipo_carrera, id_tipo_trabajo, id_usuario_creacion)
    VALUES( p_nombre, p_descripcion, p_id_tipo_carrera, p_id_tipo_trabajo, p_creado_por );
    
    --  RESULTADO    
    RETURN jsonb_build_object(
        'success', TRUE,
        'status', 201,
        'message', 'Carrera creada exitosamente'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'status', 400,
            'message', SQLERRM,
            'codigo', SQLSTATE
        );
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION catalogo.carrera_obtener(
    p_id_carrera  INTEGER
)
RETURNS JSONB AS $$
DECLARE
    v_resultado JSONB;
BEGIN

 --  Verificar carrera existe 
    IF NOT EXISTS (
        SELECT 1 FROM catalogo.carrera
        WHERE id_carrera  = p_id_carrera 
    ) THEN
	 RETURN  jsonb_build_object(
            'success', FALSE,
            'status', 404,
           	'message', 'carrera no encontrada '
        );
    END IF;

    SELECT row_to_json(carrera_data) INTO v_resultado
	FROM (
		SELECT
         c.id_carrera,
         c.nombre,
         c.descripcion,
         tc.id_tipo_carrera,
         tc.nombre as tipo_carrera,
         tt.id_tipo_trabajo,
         tt.nombre as tipo_trabajo
	    FROM catalogo.carrera c
	    JOIN catalogo.tipo_carrera tc ON tc.id_tipo_carrera = c.id_tipo_carrera
	    left JOIN catalogo.tipo_trabajo tt ON tt.id_tipo_trabajo = c.id_tipo_trabajo
	    WHERE c.id_carrera = p_id_carrera
	) AS carrera_data;

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
			'message', 'error al buscar la carrera',
            'error', SQLERRM,
            'codigo', SQLSTATE
        );
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION catalogo.carrera_editar(
	p_id_carrera INTEGER,
    p_nombre VARCHAR(100),
    p_descripcion TEXT,
    p_id_tipo_carrera INTEGER,	
	p_id_tipo_trabajo INTEGER ,
    p_creado_por INTEGER DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
BEGIN
     --  Verificar carrera existe 
    IF NOT EXISTS (
        SELECT 1 FROM catalogo.carrera
        WHERE id_carrera  = p_id_carrera 
    ) THEN
	 RETURN  jsonb_build_object(
            'success', FALSE,
            'status', 404,
           	'message', 'carrera no encontrada '
        );
    END IF;
	
    --  actualizar LA CRRERA    
   UPDATE  catalogo.carrera 
   SET nombre = p_nombre,
	   descripcion = p_descripcion, 
	   id_tipo_carrera = p_id_tipo_carrera, 
	   id_tipo_trabajo = p_id_tipo_trabajo, 
	   id_usuario_creacion = p_creado_por
   WHERE  id_carrera  = p_id_carrera ;
    
    --  RESULTADO    
    RETURN jsonb_build_object(
        'success', TRUE,
        'status', 201,
        'message', 'Carrera actualizada exitosamente'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'status', 400,
            'message', SQLERRM,
            'codigo', SQLSTATE
        );
END;
$$ LANGUAGE plpgsql;



-- Función para asociar carrera con tipo de trabajo
CREATE OR REPLACE FUNCTION catalogo.asociar_carrera_tipo_trabajo(
    p_id_tipo_carrera INTEGER,
    p_id_tipo_trabajo INTEGER
)
RETURNS JSONB AS $$
DECLARE
    v_carrera_existe BOOLEAN;
    v_trabajo_existe BOOLEAN;
    v_asociacion_existe BOOLEAN;
	v_asociacion_eliminada BOOLEAN;
    v_asociacion_id INTEGER;
    v_resultado JSONB;
    v_error_message TEXT;
BEGIN
    -- ============================================
    --  VALIDAR el tipo de carrera
    -- ============================================
    SELECT EXISTS (
        SELECT 1 
        FROM catalogo.tipo_carrera 
        WHERE id_tipo_carrera = p_id_tipo_carrera 
          AND fecha_eliminacion IS NULL
    ) INTO v_carrera_existe;

    IF NOT v_carrera_existe THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Tipo de carrera no encontrado o está eliminado',
            'code', 'CARRERA_NOT_FOUND'
        );
    END IF;

    -- ===========================================
    --  VALIDAR el tipo de trabajo
    -- ===========================================
    SELECT EXISTS (
        SELECT 1 
        FROM catalogo.tipo_trabajo 
        WHERE id_tipo_trabajo = p_id_tipo_trabajo 
          AND fecha_eliminacion IS NULL
    ) INTO v_trabajo_existe;

    IF NOT v_trabajo_existe THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Tipo de trabajo no encontrado o está eliminado',
            'code', 'TRABAJO_NOT_FOUND'
        );
    END IF;

    -- ============================================
    --  VALIDAR  la asociación
    -- ============================================
    SELECT EXISTS (
        SELECT 1 
        FROM catalogo.carrera_tipo_trabajo 
        WHERE id_tipo_carrera = p_id_tipo_carrera 
          AND id_tipo_trabajo = p_id_tipo_trabajo 
          AND fecha_eliminacion IS NULL
    ) INTO v_asociacion_existe;

    IF v_asociacion_existe THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Esta asociación ya existe',
            'code', 'ASSOCIATION_EXISTS'
        );
    END IF;


   -- ¿Existe asociación eliminada?
    SELECT EXISTS (
        SELECT 1 
        FROM catalogo.carrera_tipo_trabajo 
        WHERE id_tipo_carrera = p_id_tipo_carrera 
          AND id_tipo_trabajo = p_id_tipo_trabajo 
          AND fecha_eliminacion IS NOT NULL
    ) INTO v_asociacion_eliminada;

	 -- ============================================
    --  REACTIVAR ASOCIACIÓN ELIMINADA
    -- ============================================
    IF v_asociacion_eliminada THEN
        -- Actualizar la asociación existente (quitar fecha_eliminacion)
        UPDATE catalogo.carrera_tipo_trabajo
        SET fecha_eliminacion = NULL,
            fecha_creacion = NOW()  -- actualizar fecha de creación
        WHERE id_tipo_carrera = p_id_tipo_carrera 
          AND id_tipo_trabajo = p_id_tipo_trabajo
          AND fecha_eliminacion IS NOT NULL;

	ELSE
		-- ============================================
	    --  CREAR LA ASOCIACIÓN
	    -- ============================================
	    INSERT INTO catalogo.carrera_tipo_trabajo (
	        id_tipo_carrera,
	        id_tipo_trabajo,
	        fecha_creacion
	    ) VALUES (
	        p_id_tipo_carrera,
	        p_id_tipo_trabajo,
	        NOW()
	    );
    END IF;
    -- ============================================
    --  DEVOLVER RESULTADO CON ÉXITO
    -- ============================================
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Asociación creada correctamente',
        'code', 'ASSOCIATION_CREATED'
    );

EXCEPTION
    -- Capturar errores específicos
    WHEN unique_violation THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'La asociación ya existe (violación de unicidad)',
            'code', 'UNIQUE_VIOLATION',
            'detail', SQLERRM
        );
    WHEN foreign_key_violation THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Error de clave foránea: uno de los registros no existe',
            'code', 'FK_VIOLATION',
            'detail', SQLERRM
        );
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Error inesperado al crear la asociación',
            'code', 'UNEXPECTED_ERROR',
            'detail', SQLERRM
        );
END;
$$ LANGUAGE plpgsql;
