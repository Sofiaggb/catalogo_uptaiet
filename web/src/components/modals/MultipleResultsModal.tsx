import { X, User, Check } from 'lucide-react';

interface MultipleResultsModalProps {
  visible: boolean;
  title: string;
  results: any[];
  onSelect: (item: any) => void;
  onCancel: () => void;
}

export function MultipleResultsModal({ visible, title, results, onSelect, onCancel }: MultipleResultsModalProps) {
  if (!visible || !results.length) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-2">
          {results.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(item)}
              className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{item.nombre_completo}</p>
                  <p className="text-sm text-gray-500">Cédula: {item.cedula}</p>
                </div>
              </div>
              <Check className="h-5 w-5 text-gray-400" />
            </button>
          ))}
        </div>

        <div className="p-4 border-t">
          <button
            onClick={onCancel}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}