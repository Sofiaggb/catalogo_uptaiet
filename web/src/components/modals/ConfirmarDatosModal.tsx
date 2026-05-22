import { X, Check, User, Briefcase } from 'lucide-react';

interface ConfirmarDatosModalProps {
  visible: boolean;
  titulo: string;
  datos: any;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export function ConfirmarDatosModal({ visible, titulo, datos, onConfirmar, onCancelar }: ConfirmarDatosModalProps) {
  if (!visible || !datos) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">{titulo}</h3>
          <button onClick={onCancelar} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-cyan-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">{datos.nombre_completo}</p>
              <p className="text-sm text-gray-500">Cédula: {datos.cedula}</p>
              {datos.email && <p className="text-sm text-gray-500">Email: {datos.email}</p>}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancelar}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition flex items-center justify-center gap-2"
          >
            <Check className="h-4 w-4" />
            Usar existente
          </button>
        </div>
      </div>
    </div>
  );
}