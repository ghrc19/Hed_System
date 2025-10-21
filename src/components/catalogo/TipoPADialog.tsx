import React from 'react';
import Dialog from '../ui/Dialog';
import Button from '../ui/Button';
import useCatalogoStore from '../../store/catalogoStore';
import { CheckCircle, FileText } from 'lucide-react';

interface TipoPADialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const tiposPAOptions = [
  { value: 'PA-01', label: 'PA-01' },
  { value: 'PA-02', label: 'PA-02' },
  { value: 'PA-03', label: 'PA-03' },
  { value: 'EF', label: 'EF' },
  { value: 'ES', label: 'ES' }
];

const TipoPADialog: React.FC<TipoPADialogProps> = ({ isOpen, onClose }) => {
  const { tipoPAActivo, setTipoPAActivo } = useCatalogoStore();

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Seleccionar Tipo de PA Activo"
    >
      <div className="space-y-4">
        {tipoPAActivo && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-700 dark:text-green-300">
                  Tipo PA Activo: {tipoPAActivo}
                </span>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setTipoPAActivo(null)}
                className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
              >
                Desactivar
              </Button>
            </div>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              Los nuevos trabajos se crearán automáticamente con este tipo de PA
            </p>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="font-semibold mb-3 text-gray-700 dark:text-gray-200">Tipos de PA disponibles</h3>
          <div className="grid grid-cols-1 gap-2">
            {tiposPAOptions.map(tipo => (
              <div 
                key={tipo.value} 
                className={`flex items-center justify-between rounded px-3 py-3 border transition-colors ${
                  tipoPAActivo === tipo.value 
                    ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700' 
                    : 'bg-gray-50 dark:bg-dark-300 border-gray-200 dark:border-dark-400 hover:bg-gray-100 dark:hover:bg-dark-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">{tipo.label}</span>
                  {tipoPAActivo === tipo.value && (
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  )}
                </span>
                <div className="flex items-center space-x-2">
                  {tipoPAActivo !== tipo.value ? (
                    <Button 
                      size="sm" 
                      variant="success" 
                      onClick={() => setTipoPAActivo(tipo.value)}
                      className="text-xs"
                    >
                      Activar
                    </Button>
                  ) : (
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                      Activo
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cerrar
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default TipoPADialog;