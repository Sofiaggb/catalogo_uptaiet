-- backend/src/database/materias.sql
CREATE OR REPLACE FUNCTION catalogo.materia_crear(
    p_nombre VARCHAR(200),
    p_creado_por INTEGER DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
BEGIN

    -- Verificar si ya existe una materia con el mismo nombre en la misma materia
	IF EXISTS (SELECT 1 FROM catalogo.materia WHERE nombre = p_nombre AND fecha_eliminacion IS NULL) THEN
		RETURN jsonb_build_object(
			'success', FALSE,
			'status', 409,
			'message', 'Ya existe una materia con ese nombre'
		);
	END IF;
    
    -- Crear materia
    INSERT INTO catalogo.materia (  nombre, id_usuario_creacion ) 
    VALUES ( TRIM(p_nombre), p_creado_por );
    
    -- Resultado
    RETURN jsonb_build_object(
        'success', TRUE,
        'status', 201,
        'message', 'Materia creada exitosamente'
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


CREATE OR REPLACE FUNCTION catalogo.materia_editar(
	p_id_materia INTEGER,
    p_nombre VARCHAR,
    p_creado_por INTEGER DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
BEGIN
     --  Verificar materia existe 
    IF NOT EXISTS (
        SELECT 1 FROM catalogo.materia
        WHERE id_materia  = p_id_materia
    ) THEN
	 RETURN  jsonb_build_object(
            'success', FALSE,
            'status', 404,
           	'message', 'materia no encontrada '
        );
    END IF;

	   -- Verificar si ya existe una materia con el mismo nombre en la misma materia
	IF EXISTS (SELECT 1 FROM catalogo.materia WHERE nombre = p_nombre AND fecha_eliminacion IS NULL AND  id_materia != p_id_materia) THEN
		RETURN jsonb_build_object(
			'success', FALSE,
			'status', 409,
			'message', 'Ya existe una materia con ese nombre'
		);
	END IF;
	
    --  actualizar LA materia    
   UPDATE  catalogo.materia 
   SET nombre = p_nombre,
	   id_usuario_creacion = p_creado_por
   WHERE  id_materia  = p_id_materia ;
    
    --  RESULTADO    
    RETURN jsonb_build_object(
        'success', TRUE,
        'status', 201,
        'message', 'materia actualizada exitosamente'
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

