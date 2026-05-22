import { Trash2, Star, Calendar, MessageSquare, User, IdCard, GraduationCap, CheckCircle } from 'lucide-react';
import { useEnterKey } from '../../hooks/useEnterKey';

interface Jurado {
  id_jurado?: number;
  nombre_completo: string;
  cedula: string;
  titulo_profesional: string;
  esExistente: boolean;
}

interface Evaluacion {
  id_evaluacion?: number;
  nota: string;
  fecha_evaluacion: string;
  comentarios: string;
  jurado: Jurado;
}

interface EvaluacionFormProps {
  index: number;
  evaluacion: Evaluacion;
  onUpdateEvaluacion: (index: number, campo: keyof Evaluacion, valor: string) => void;
  onUpdateJurado: (evalIndex: number, campo: keyof Jurado, valor: string) => void;
  onBuscarJurado: (evalIndex: number, cedula: string) => void;
  onDelete: (index: number) => void;
}

export function EvaluacionForm({
  index,
  evaluacion,
  onUpdateEvaluacion,
  onUpdateJurado,
  onBuscarJurado,
  onDelete
}: EvaluacionFormProps) {
  return (
    <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200 shadow-sm">
      {/* Cabecera */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-700">Evaluación {index + 1}</span>
          {evaluacion.jurado.esExistente && (
            <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
              <CheckCircle className="h-3 w-3" />
              Jurado existente
            </span>
          )}
        </div>
        <button  type="button" 
          onClick={() => onDelete(index)}
          className="text-red-500 hover:text-red-600 transition"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Nota */}
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            Nota *
          </label>
          <div className="relative">
            <Star className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-yellow-500" />
            <input
              type="number"
              step="0.1"
              min="0"
              max="20"
              className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={evaluacion.nota}
              onChange={(e) => onUpdateEvaluacion(index, 'nota', e.target.value)}
              onKeyDown={() => useEnterKey()}
              placeholder="0 - 20"
            />
          </div>
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            Fecha Evaluación
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={evaluacion.fecha_evaluacion}
              onChange={(e) => onUpdateEvaluacion(index, 'fecha_evaluacion', e.target.value)}
             onKeyDown={() => useEnterKey()}
            />
          </div>
        </div>
      </div>

      {/* Comentarios */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-600 mb-1">
          Comentarios
        </label>
        <div className="relative">
          <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <textarea
            rows={3}
            className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={evaluacion.comentarios}
            onChange={(e) => onUpdateEvaluacion(index, 'comentarios', e.target.value)}
            placeholder="Observaciones del jurado"
             onKeyDown={() => useEnterKey()}
          />
        </div>
      </div>

      {/* Separador */}
      <div className="border-t border-gray-200 my-4"></div>

      {/* Datos del Jurado */}
      <div className="mb-3">
        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <User className="h-4 w-4" />
          Datos del Jurado
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cédula del Jurado */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Cédula *
          </label>
          <div className="relative">
            <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={evaluacion.jurado.cedula}
              onChange={(e) => onUpdateJurado(index, 'cedula', e.target.value)}
              onBlur={() => onBuscarJurado(index, evaluacion.jurado.cedula)}
                onKeyDown={(e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Evita que el Enter envíe el formulario
      onBuscarJurado(index, evaluacion.jurado.cedula);
    }
  }}
              placeholder="Cédula del jurado"
            />
          </div>
        </div>

        {/* Nombre del Jurado */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Nombre Completo *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={evaluacion.jurado.nombre_completo}
              onChange={(e) => onUpdateJurado(index, 'nombre_completo', e.target.value)}
               onKeyDown={() => useEnterKey()}
              placeholder="Nombre completo"
            />
          </div>
        </div>
      </div>

      {/* Título Profesional */}
      <div className="mt-3">
        <label className="block text-xs font-semibold text-gray-500 mb-1">
          Título Profesional
        </label>
        <div className="relative">
          <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={evaluacion.jurado.titulo_profesional}
            onChange={(e) => onUpdateJurado(index, 'titulo_profesional', e.target.value)}
             onKeyDown={() => useEnterKey()}
            placeholder="Dr., Mg., Ing., etc."
          />
        </div>
      </div>
    </div>
  );
}