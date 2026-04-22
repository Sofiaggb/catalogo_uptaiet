# Carreras

## crear una carrera 
json ejemplo
{
  "nombre": "Ingeniería Informática",
  "descripcion": "Formación en desarrollo de software, bases de datos, inteligencia artificial y redes",
  "id_tipo_carrera": 1
}


# Tesis 

## crear una tesis 

json ejemplo

{
  "titulo": "Aplicación de Machine Learning para la Predicción de Deserción Estudiantil",
  "resumen": "Esta investigación desarrolla un modelo predictivo utilizando algoritmos de machine learning para identificar estudiantes en riesgo de deserción académica en universidades latinoamericanas. Se utilizaron datos de 5,000 estudiantes durante 4 años académicos.",
  "id_carrera": 1,
  "url_documento": "/uploads/tesis_ml_desercion.pdf",
  "estudiantes": [
    {
      "id_estudiante": 5
    },
    {
      "nombre_completo": "María Fernanda Rojas",
      "cedula": "12345678",
      "email": "maria.rojas@universidad.edu"
    },
    {
      "nombre_completo": "Carlos Andrés Méndez",
      "cedula": "87654321",
      "email": "carlos.mendez@universidad.edu"
    }
  ],
  "evaluaciones": [
    {
      "nota": 18.5,
      "fecha_evaluacion": "2025-04-10",
      "comentarios": "Excelente trabajo de investigación, metodología sólida y resultados relevantes",
      "jurado": {
        "id_jurado": 2
      }
    },
    {
      "nota": 17.0,
      "fecha_evaluacion": "2025-04-12",
      "comentarios": "Buen enfoque, sugerencia: mejorar la discusión de resultados",
      "jurado": {
        "nombre_completo": "Dra. Patricia Ríos",
        "titulo_profesional": "Doctora en Ciencias de la Educación",
        "email": "patricia.rios@universidad.edu"
      }
    }
  ]
}