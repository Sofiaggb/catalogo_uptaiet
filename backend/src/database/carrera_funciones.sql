
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
