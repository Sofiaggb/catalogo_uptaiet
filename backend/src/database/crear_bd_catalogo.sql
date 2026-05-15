






-- 1. Esquema para catálogo académico (carreras, materias)
CREATE SCHEMA catalogo;

-- Tipos específicos para carreras
CREATE TABLE catalogo.tipo_carrera (
    id_tipo_carrera SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
	fecha_creacion timestamp DEFAULT NOW(),
	fecha_eliminacion timestamp
);

-- Insertar tipos de carreras
INSERT INTO catalogo.tipo_carrera (nombre, descripcion) VALUES
-- PREGRADO
('Técnico Superior', 'Carreras técnicas de nivel superior (2-3 años) enfocadas en práctica laboral'),
('Pregrado', 'Estudios universitarios previos al grado (ciclo básico común)'),

-- POSTGRADO
('Especializacion', 'Postgrado de actualización profesional (1 año) con enfoque práctico'),
('Maestria', 'Postgrado académico o profesional (2 años) que otorga título de magíster'),
('Doctorado', 'Máximo nivel académico (3-5 años) que otorga título de doctor'),


-- Tabla de tipos de trabajo de grado
CREATE TABLE catalogo.tipo_trabajo (
    id_tipo_trabajo SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_eliminacion TIMESTAMP
);

-- Insertar los tipos de trabajo
INSERT INTO catalogo.tipo_trabajo (nombre ) VALUES
-- PREGRADO
('Proyecto Socio Tecnológico'),
('Proyecto Socio Integrador'),
('Proyecto Productivo'),
-- POSTGRADO
('Trabajo Especial de Grado'),
('Tesis');

CREATE TABLE catalogo.carrera_tipo_trabajo (
    id_carrera_tipo_trabajo SERIAL PRIMARY KEY,
    id_tipo_carrera INT NOT NULL REFERENCES catalogo.tipo_carrera(id_tipo_carrera),
    id_tipo_trabajo INT NOT NULL REFERENCES catalogo.tipo_trabajo(id_tipo_trabajo),
    fecha_creacion TIMESTAMP DEFAULT NOW(),
	fecha_eliminacion TIMESTAMP,
    UNIQUE(id_tipo_carrera, id_tipo_trabajo)
);

INSERT INTO catalogo.carrera_tipo_trabajo ( id_tipo_carrera, id_tipo_trabajo) VALUES
/*tecnico superior
Proyecto socio tecnológico 
Proyecto socio integrador 
Proyecto productivo */
( 1, 1),
( 1, 2),
( 1, 3),
/* pregrado
Proyecto socio tecnológico 
Proyecto socio integrador 
Proyecto productivo */
( 2, 1),
( 2, 2),
( 2, 3),
-- Trabajo especial de grado es para posgrado especialización y maestrías 
( 3, 4),
( 4, 4),
--Doctorado - tesis
( 5, 5);




alter table catalogo.carrera
add column  id_tipo_trabajo INT REFERENCES catalogo.tipo_trabajo(id_tipo_trabajo);


CREATE TABLE catalogo.carrera (
    id_carrera SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    id_tipo_carrera INT REFERENCES catalogo.tipo_carrera(id_tipo_carrera),
    id_tipo_trabajo INT REFERENCES catalogo.tipo_trabajo(id_tipo_trabajo),
	fecha_creacion timestamp DEFAULT NOW(),
	id_usuario_creacion INTEGER REFERENCES seguridad.usuario(id_usuario),
	fecha_eliminacion timestamp,	
	id_usuario_eliminacion INTEGER REFERENCES seguridad.usuario(id_usuario)
);


/*
alter table catalogo.materia
drop column  id_carrera,
drop column  codigo
*/
CREATE TABLE catalogo.materia (
    id_materia SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
	fecha_creacion timestamp DEFAULT NOW(),	
	id_usuario_creacion INTEGER REFERENCES seguridad.usuario(id_usuario),
	fecha_eliminacion timestamp,	
	id_usuario_eliminacion INTEGER REFERENCES seguridad.usuario(id_usuario)
);


-- esquema para control estados
CREATE SCHEMA control;
-- Tabla genérica para estados
CREATE TABLE control.estado (
    id_estado SERIAL PRIMARY KEY,
    nombre_estado VARCHAR(50) NOT NULL,
	fecha_creacion timestamp DEFAULT NOW(),
	fecha_eliminacion timestamp
);


INSERT INTO control.estado ( nombre_estado) VALUES ('Publicada');

-- 3. Esquema para personas (estudiantes, jurados)
CREATE SCHEMA personas;

CREATE TABLE personas.estudiante (
    id_estudiante SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(200) NOT NULL,
    cedula VARCHAR(20) UNIQUE,
    email VARCHAR(150),
	fecha_creacion timestamp DEFAULT NOW(),
	id_usuario_creacion INTEGER REFERENCES seguridad.usuario(id_usuario),
	fecha_eliminacion timestamp,	
	id_usuario_eliminacion INTEGER REFERENCES seguridad.usuario(id_usuario)
);

CREATE TABLE personas.jurado (
    id_jurado SERIAL PRIMARY KEY,
	cedula VARCHAR(20) UNIQUE,
    nombre_completo VARCHAR(200) NOT NULL,
    titulo_profesional VARCHAR(150),
	fecha_creacion timestamp DEFAULT NOW(),
	id_usuario_creacion INTEGER REFERENCES seguridad.usuario(id_usuario),
	fecha_eliminacion timestamp,	
	id_usuario_eliminacion INTEGER REFERENCES seguridad.usuario(id_usuario)
);



-- 2. Esquema para tesis y proyectos
CREATE SCHEMA tesis;

CREATE TABLE tesis.tesis (
    id_tesis SERIAL PRIMARY KEY,
    titulo VARCHAR(300) NOT NULL,
    resumen TEXT,
    anio_elaboracion INTEGER,
    url_documento VARCHAR(500),  -- guardar PDF en un servidor
    id_carrera INT NOT NULL REFERENCES catalogo.carrera(id_carrera),
    id_estado int REFERENCES control.estado(id_estado),
	fecha_creacion timestamp DEFAULT NOW(),
	id_usuario_creacion INTEGER REFERENCES seguridad.usuario(id_usuario),
	fecha_eliminacion timestamp,	
	id_usuario_eliminacion INTEGER REFERENCES seguridad.usuario(id_usuario)
);

-- Agregar índice para búsquedas por año 
CREATE INDEX idx_tesis_anio_elaboracion ON tesis.tesis(anio_elaboracion);



-- Agregar columnas de modificación a la tabla tesis
ALTER TABLE tesis.tesis 
ADD COLUMN IF NOT EXISTS id_usuario_modificacion INTEGER,
ADD COLUMN IF NOT EXISTS fecha_modificacion TIMESTAMP DEFAULT NOW();

-- Agregar columna de modificación a evaluacion_tesis
ALTER TABLE tesis.evaluacion_tesis 
ADD COLUMN IF NOT EXISTS id_usuario_modificacion INTEGER,
ADD COLUMN IF NOT EXISTS fecha_modificacion TIMESTAMP DEFAULT NOW();


/*

alter table tesis.tesis 
add column id_usuario_creacion INTEGER REFERENCES seguridad.usuario(id_usuario),
ADD COLUMN id_usuario_eliminacion INTEGER REFERENCES seguridad.usuario(id_usuario);

alter table catalogo.carrera 
add column id_usuario_creacion INTEGER REFERENCES seguridad.usuario(id_usuario),
ADD COLUMN id_usuario_eliminacion INTEGER REFERENCES seguridad.usuario(id_usuario);

alter table catalogo.materia 
add column id_usuario_creacion INTEGER REFERENCES seguridad.usuario(id_usuario),
ADD COLUMN id_usuario_eliminacion INTEGER REFERENCES seguridad.usuario(id_usuario);

alter table personas.estudiante 
add column id_usuario_creacion INTEGER REFERENCES seguridad.usuario(id_usuario),
ADD COLUMN id_usuario_eliminacion INTEGER REFERENCES seguridad.usuario(id_usuario);

alter table  personas.jurado  
add column id_usuario_creacion INTEGER REFERENCES seguridad.usuario(id_usuario),
ADD COLUMN id_usuario_eliminacion INTEGER REFERENCES seguridad.usuario(id_usuario);

alter table  tesis.tesis_estudiante 
add column id_usuario_creacion INTEGER REFERENCES seguridad.usuario(id_usuario),
ADD COLUMN id_usuario_eliminacion INTEGER REFERENCES seguridad.usuario(id_usuario);

alter table  tesis.evaluacion_tesis  
add column id_usuario_creacion INTEGER REFERENCES seguridad.usuario(id_usuario),
ADD COLUMN id_usuario_eliminacion INTEGER REFERENCES seguridad.usuario(id_usuario);

alter table recursos.documento_soporte 
add column id_usuario_creacion INTEGER REFERENCES seguridad.usuario(id_usuario),
ADD COLUMN id_usuario_eliminacion INTEGER REFERENCES seguridad.usuario(id_usuario);

alter table seguridad.usuario  
ADD COLUMN id_usuario_eliminacion INTEGER REFERENCES seguridad.usuario(id_usuario);
*/

CREATE TABLE tesis.tesis_estudiante (
	id_tesis_estudiante SERIAL PRIMARY KEY,
    id_tesis INT NOT NULL REFERENCES tesis.tesis(id_tesis) ON DELETE CASCADE,
    id_estudiante INT NOT NULL REFERENCES personas.estudiante(id_estudiante) ON DELETE CASCADE,
	fecha_creacion timestamp DEFAULT NOW(),
	id_usuario_creacion INTEGER REFERENCES seguridad.usuario(id_usuario),
	fecha_eliminacion timestamp,	
	id_usuario_eliminacion INTEGER REFERENCES seguridad.usuario(id_usuario),
	UNIQUE(id_tesis, id_estudiante)
);

CREATE TABLE tesis.evaluacion_tesis (
    id_evaluacion SERIAL PRIMARY KEY,
    id_tesis INT NOT NULL REFERENCES tesis.tesis(id_tesis) ON DELETE CASCADE,
    id_jurado INT NOT NULL REFERENCES personas.jurado(id_jurado) ON DELETE CASCADE,
    nota DECIMAL(4,2) CHECK (nota >= 0 AND nota <= 20),  -- ejemplo escala 0-20
    fecha_evaluacion DATE NOT NULL,
    comentarios TEXT,
	fecha_creacion timestamp DEFAULT NOW(),
	id_usuario_creacion INTEGER REFERENCES seguridad.usuario(id_usuario),
	fecha_eliminacion timestamp,	
	id_usuario_eliminacion INTEGER REFERENCES seguridad.usuario(id_usuario),
    UNIQUE(id_tesis, id_jurado)  -- un jurado solo evalúa una vez la misma tesis
);



-- 4. Esquema para documentos y recursos
CREATE SCHEMA recursos;


-- Tipos específicos para documentos
/*
drop table if exists recursos.libros;
drop table if exists recursos.documento_soporte;
*/

CREATE TABLE recursos.libro (
    id_libro SERIAL PRIMARY KEY,
    titulo VARCHAR(300) NOT NULL,
    autor VARCHAR,
    editorial VARCHAR,
    year integer,
    url_recurso VARCHAR(500),
    descripcion TEXT,
    id_materia INT NOT NULL REFERENCES catalogo.materia(id_materia) ON DELETE CASCADE,
	fecha_creacion timestamp DEFAULT NOW(),
	id_usuario_creacion INTEGER REFERENCES seguridad.usuario(id_usuario),
	fecha_eliminacion timestamp,	
	id_usuario_eliminacion INTEGER REFERENCES seguridad.usuario(id_usuario)
);

-- 4. Esquema para usuario
CREATE SCHEMA seguridad;

CREATE TABLE seguridad.rol (
    id_rol SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_eliminacion TIMESTAMP
);

-- Insertar roles básicos
INSERT INTO seguridad.rol (nombre, descripcion) VALUES
('estudiante', 'Usuario normal que solo puede ver y consultar'),
('docente', 'Puede subir documentos y evaluar tesis'),
('bibliotecario', 'Administra documentos y catálogo'),
('administrador', 'Control total del sistema');

CREATE TABLE seguridad.usuario (
    id_usuario SERIAL PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,  -- Guardar hash, NO contraseña plana
    nombre VARCHAR(100) UNIQUE NOT NULL,
	id_rol INT NOT NULL REFERENCES seguridad.rol(id_rol) ON DELETE CASCADE,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
	fecha_eliminacion timestamp,	
	id_usuario_eliminacion INTEGER REFERENCES seguridad.usuario(id_usuario)
);
