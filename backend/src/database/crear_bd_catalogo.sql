
-- Verificar si está instalada
CREATE EXTENSION IF NOT EXISTS pgcrypto;


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


INSERT INTO control.estado ( nombre_estado) 
VALUES ('Publicada'),
('Pendiente'),
('Aprobada'),
('Rechazada');

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
	vistas INT DEFAULT 0,
	fecha_revision TIMESTAMP,
	 id_revisor INT REFERENCES seguridad.usuario(id_usuario),
	  comentario_revision TEXT,
	fecha_creacion timestamp DEFAULT NOW(),
	id_usuario_creacion INTEGER REFERENCES seguridad.usuario(id_usuario),
	fecha_modificacion TIMESTAMP,
	id_usuario_modificacion INTEGER REFERENCES seguridad.usuario(id_usuario),
	fecha_eliminacion timestamp,	
	id_usuario_eliminacion INTEGER REFERENCES seguridad.usuario(id_usuario)
);


-- Agregar campos de revisión a la tabla de tesis
ALTER TABLE tesis.tesis 
ADD COLUMN IF NOT EXISTS fecha_revision TIMESTAMP,
ADD COLUMN IF NOT EXISTS id_revisor INT REFERENCES seguridad.usuario(id_usuario),
ADD COLUMN IF NOT EXISTS comentario_revision TEXT;

-- Agregar índice para búsquedas por año 
CREATE INDEX idx_tesis_anio_elaboracion ON tesis.tesis(anio_elaboracion);

-- Crear índice para ordenar por vistas
CREATE INDEX IF NOT EXISTS idx_tesis_vistas ON tesis.tesis(vistas DESC);

-- Agregar columnas de modificación a la tabla tesis
ALTER TABLE tesis.tesis 
ADD COLUMN IF NOT EXISTS id_usuario_modificacion INTEGER,
ADD COLUMN IF NOT EXISTS fecha_modificacion TIMESTAMP DEFAULT NOW();

-- Agregar columna de modificación a evaluacion_tesis
ALTER TABLE tesis.evaluacion_tesis 
ADD COLUMN IF NOT EXISTS id_usuario_modificacion INTEGER,
ADD COLUMN IF NOT EXISTS fecha_modificacion TIMESTAMP DEFAULT NOW();




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


-- 4. Esquema para documentos y recursos
CREATE SCHEMA recursos;


-- Tipos específicos para documentos
/*
drop table if exists recursos.libros;
drop table if exists recursos.documento_soporte;


ALTER TABLE recursos.libro 
RENAME COLUMN url_recurso TO url_documento;


*/

CREATE TABLE recursos.tipo_recurso (
  id_tipo_recurso SERIAL  PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  fecha_eliminacion timestamp 
);

INSERT INTO recursos.tipo_recurso ( nombre) 
VALUES ('Libro'),
('Guia');



CREATE TABLE recursos.libro (
    id_libro SERIAL PRIMARY KEY,
	id_estado int REFERENCES control.estado(id_estado),
	id_tipo_recurso INTEGER REFERENCES  recursos.tipo_recurso (id_tipo_recurso),
 	id_materia INT NOT NULL REFERENCES catalogo.materia(id_materia) ON DELETE CASCADE,
    titulo VARCHAR(300) NOT NULL,
    autor VARCHAR,
    editorial VARCHAR,
    year integer,
    url_documento VARCHAR(500),   
	fecha_revision TIMESTAMP,
	id_revisor INT REFERENCES seguridad.usuario(id_usuario),
	comentario_revision TEXT,
	fecha_creacion timestamp DEFAULT NOW(),
	id_usuario_creacion INTEGER REFERENCES seguridad.usuario(id_usuario),
	fecha_modificacion TIMESTAMP,
	id_usuario_modificacion INTEGER REFERENCES seguridad.usuario(id_usuario),
	fecha_eliminacion timestamp,	
	id_usuario_eliminacion INTEGER REFERENCES seguridad.usuario(id_usuario)
);


ALTER TABLE recursos.libro 
ADD COLUMN IF NOT EXISTS  fecha_revision TIMESTAMP,
ADD COLUMN IF NOT EXISTS id_revisor INT REFERENCES seguridad.usuario(id_usuario),
ADD COLUMN IF NOT EXISTS comentario_revision TEXT;


ALTER TABLE recursos.libro 
ADD COLUMN id_tipo_recurso INTEGER REFERENCES  recursos.tipo_recurso (id_tipo_recurso);
-- Los valores serán: 'libro' o 'guia';

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
('invitado', 'Usuario normal que solo puede ver y consultar'),
('docente', 'Puede subir documentos y evaluar tesis'),
('administrador', 'Control total del sistema'),
('bibliotecario', 'Administra documentos y catálogo');



CREATE TABLE seguridad.usuario (
    id_usuario SERIAL PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,  -- Guardar hash, NO contraseña plana
    nombre VARCHAR(100) UNIQUE NOT NULL,
	id_rol INT NOT NULL REFERENCES seguridad.rol(id_rol) ON DELETE CASCADE,
	cedula character varying,
	nombre_completo character varying, 
	foto_perfil VARCHAR(500),
    fecha_creacion TIMESTAMP DEFAULT NOW(),
	fecha_modificacion timestamp,
	fecha_eliminacion timestamp,	
	id_usuario_eliminacion INTEGER REFERENCES seguridad.usuario(id_usuario)
);


-- Índice para búsquedas (opcional)
CREATE INDEX IF NOT EXISTS idx_usuario_foto ON seguridad.usuario(foto_perfil);

------------ nuevo

-- Solo necesitamos una tabla para códigos, sin datos de usuario
CREATE TABLE seguridad.codigo_verificacion (
    id_codigo SERIAL PRIMARY KEY,
    email VARCHAR(150) NOT NULL,
    codigo VARCHAR(6) NOT NULL,
    intentos INT DEFAULT 0,
    creado_en TIMESTAMP DEFAULT NOW(),
    expira_en TIMESTAMP DEFAULT NOW() + INTERVAL '15 minutes',
    usado BOOLEAN DEFAULT FALSE
);

-- Índices
CREATE INDEX idx_codigo_email ON seguridad.codigo_verificacion(email);
CREATE INDEX idx_codigo_expiracion ON seguridad.codigo_verificacion(expira_en);



-- Tabla para códigos de recuperación de contraseña
CREATE TABLE IF NOT EXISTS seguridad.codigo_recuperacion (
    id_recuperacion SERIAL PRIMARY KEY,
    email VARCHAR(150) NOT NULL,
    codigo VARCHAR(6) NOT NULL,
    id_usuario INTEGER NOT NULL REFERENCES seguridad.usuario(id_usuario),
    intentos INT DEFAULT 0,
    verificado BOOLEAN DEFAULT FALSE,
    usado BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP DEFAULT NOW(),
    expira_en TIMESTAMP DEFAULT NOW() + INTERVAL '15 minutes'
);

-- Índices
CREATE INDEX idx_recuperacion_email ON seguridad.codigo_recuperacion(email);
CREATE INDEX idx_recuperacion_codigo ON seguridad.codigo_recuperacion(codigo);
CREATE INDEX idx_recuperacion_expiracion ON seguridad.codigo_recuperacion(expira_en);



-- Tabla para solicitudes de cambio de rol
/*
ALTER TABLE seguridad.solicitud_rol 
RENAME COLUMN rol_solicitado TO id_rol_solicitado;
*/

CREATE TABLE seguridad.solicitud_rol (
    id_solicitud SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES seguridad.usuario(id_usuario),
	id_rol_actual  INTEGER NOT NULL REFERENCES seguridad.rol(id_rol),
    id_rol_solicitado INTEGER NOT NULL REFERENCES seguridad.rol(id_rol),
    id_estado INTEGER REFERENCES control.estado(id_estado),
    justificacion TEXT,
    cedula character varying,
	nombre_completo character varying, 
    id_administrador INTEGER REFERENCES seguridad.usuario(id_usuario),
    fecha_solicitud TIMESTAMP DEFAULT NOW(),
    fecha_respuesta TIMESTAMP,
    comentario_admin TEXT,
    fecha_eliminacion TIMESTAMP
);

-- Índices
CREATE INDEX idx_solicitud_usuario ON seguridad.solicitud_rol(id_usuario);
CREATE INDEX idx_solicitud_estado ON seguridad.solicitud_rol(id_estado);


----------------------- nueva para agregar editar encabezado

CREATE TABLE configuracion (
    id_configuracion SERIAL PRIMARY KEY,
    clave VARCHAR(50) UNIQUE NOT NULL,
    valor TEXT,
    tipo VARCHAR(20) DEFAULT 'texto', -- 'texto', 'imagen', 'json'
    fecha_creacion timestamp DEFAULT NOW(),
	id_usuario_creacion INTEGER REFERENCES seguridad.usuario(id_usuario),
	fecha_modificacion TIMESTAMP,
	id_usuario_modificacion INTEGER REFERENCES seguridad.usuario(id_usuario)
);

-- Insertar registro para el encabezado
INSERT INTO configuracion (clave, valor, tipo) 
VALUES ('encabezado_imagen', NULL, 'imagen');






--  Tabla de permisos 

CREATE TABLE IF NOT EXISTS seguridad.permiso (
    id_permiso SERIAL PRIMARY KEY,
    modulo VARCHAR(50) NOT NULL,  -- Ej: 'proyecto', 'libro', 'usuario', 'roles'
    accion VARCHAR(50) NOT NULL,  -- Ej: 'crear', 'editar', 'aprobar', 'eliminar', 'ver'
    titulo TEXT,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
	  fecha_eliminacion TIMESTAMP,
    UNIQUE (modulo, accion)       -- Evita duplicados
);

--  Insertar la matriz de permisos inicial
INSERT INTO seguridad.permiso (modulo, accion, titulo) VALUES
-- Módulo Libros / Recursos
('recursos', 'crear', 'Registrar recursos'),
('recursos', 'editar', 'Editar recursos'),
('recursos', 'aprobar', 'Aprobar o rechazar recursos'),

-- Módulo Proyectos / Tesis
('proyecto', 'crear', 'Registrar proyectos'),
('proyecto', 'editar', 'Permite editar proyectos'),
('proyecto', 'aprobar', 'Aprobar o rechazar proyectos'),

-- Módulo carreras / especialidades
('especialidad', 'crear', 'Registrar especialidades'),
('especialidad', 'editar', 'Editar especialidad'),
('especialidad', 'ver', 'Vizualizar  especialidades'),
('especialidad', 'eliminar', 'Eliminar  especialidades'),

-- Módulo materia
('materia', 'crear', 'Registrar materias'),
('materia', 'editar', 'Editar materias'),
('materia', 'ver', 'Vizualizar  materias'),
('materia', 'eliminar', 'Eliminar  materias'),

-- auditoria
('auditoria', 'ver', 'Vizualizar auditoria'),

-- Módulo Usuario
('usuario', 'aprobar_cambio', 'Administrar solicitud cambio de rol'),
('usuario', 'dar_permisos', 'Administrar permisos de usuarios'),




--  Tabla de roles y permisos (La matriz que define qué rol puede hacer qué)
CREATE TABLE IF NOT EXISTS seguridad.rol_permiso (
    id_rol_permiso SERIAL PRIMARY KEY,
    id_rol INT NOT NULL REFERENCES seguridad.rol(id_rol) ON DELETE CASCADE,
    id_permiso INT NOT NULL REFERENCES seguridad.permiso(id_permiso) ON DELETE CASCADE,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_eliminacion TIMESTAMP,
	
    UNIQUE (id_rol, id_permiso)
);

-- Ejemplo de asignaciones iniciales (Solo algunas)
-- Administrador tiene TODO
INSERT INTO seguridad.rol_permiso (id_rol, id_permiso)
SELECT r.id_rol, p.id_permiso FROM seguridad.rol r, seguridad.permiso p 
WHERE r.nombre = 'administrador'
on conflict do nothing;

-- Docente SOLO puede crear y ver libros
INSERT INTO seguridad.rol_permiso (id_rol, id_permiso)
SELECT r.id_rol, p.id_permiso 
FROM seguridad.rol r, seguridad.permiso p 
WHERE r.nombre = 'docente' AND p.modulo = 'recursos' AND p.accion IN ('crear', 'ver');

-- Bibliotecario puede TODO en libros y proyectos
INSERT INTO seguridad.rol_permiso (id_rol, id_permiso)
SELECT r.id_rol, p.id_permiso 
FROM seguridad.rol r, seguridad.permiso p 
WHERE r.nombre = 'bibliotecario' AND p.modulo IN ('recursos', 'proyecto');

-- Tabla de permisos EXTRA por usuario (para dar o quitar a individuos)
CREATE TABLE IF NOT EXISTS seguridad.usuario_permiso (
    id_usuario_permiso SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL REFERENCES seguridad.usuario(id_usuario) ON DELETE CASCADE,
    id_permiso INT NOT NULL REFERENCES seguridad.permiso(id_permiso) ON DELETE CASCADE,
    activo BOOLEAN DEFAULT TRUE, 
    fecha_asignacion TIMESTAMP DEFAULT NOW(),
	  fecha_eliminacion TIMESTAMP,
    UNIQUE(id_usuario, id_permiso)
);