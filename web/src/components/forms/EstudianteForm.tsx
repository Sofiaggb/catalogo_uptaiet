import { User, Mail, IdCard, Trash2, CheckCircle } from 'lucide-react';
import { useEnterKey } from '../../hooks/useEnterKey';

interface Estudiante {
  id_estudiante?: number;
  nombre_completo: string;
  cedula: string;
  email: string;
  esExistente: boolean;
}


interface EstudianteFormProps {
  index: number;
  estudiante: Estudiante;
  onUpdate: (index: number, campo: keyof Estudiante, valor: string) => void;
  onDelete: (index: number) => void;
  onBuscar: (index: number, cedula: string) => void;
}

export function EstudianteForm({ index, estudiante, onUpdate, onDelete, onBuscar }: EstudianteFormProps) {
  return (
    <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200 shadow-sm">
      {/* Cabecera */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-700">Estudiante {index + 1}</span>
          {estudiante.esExistente && (
            <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
              <CheckCircle className="h-3 w-3" />
              Existente
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

      {/* Campo Cédula */}
      <div className="mb-3">
        <label className="block text-sm font-semibold text-gray-600 mb-1">
          Cédula *
        </label>
        <div className="relative">
          <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={estudiante.cedula}
            onChange={(e) => onUpdate(index, 'cedula', e.target.value)}
            onBlur={() => onBuscar(index, estudiante.cedula)}
            onKeyDown={(e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Evita que el Enter envíe el formulario
      onBuscar(index, estudiante.cedula);
    }
  }}
            placeholder="Cédula"
          />
        </div>
      </div>

      {/* Campo Nombre */}
      <div className="mb-3">
        <label className="block text-sm font-semibold text-gray-600 mb-1">
          Nombre Completo *
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={estudiante.nombre_completo}
            onChange={(e) => onUpdate(index, 'nombre_completo', e.target.value)}
             onKeyDown={() => useEnterKey()}
            placeholder="Nombre completo"
          />
        </div>
      </div>

      {/* Campo Email */}
      <div className="mb-3">
        <label className="block text-sm font-semibold text-gray-600 mb-1">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="email"
            className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={estudiante.email}
            onChange={(e) => onUpdate(index, 'email', e.target.value)}
             onKeyDown={() => useEnterKey()}
            placeholder="email@universidad.edu"
          />
        </div>
      </div>
    </div>
  );
}