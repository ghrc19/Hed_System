import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Dialog from '../ui/Dialog';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Periodo } from '../../types';
import useCatalogoStore from '../../store/catalogoStore';
import { showSuccess, showError } from '../layout/NotificationManager';
import { Trash2, Edit2, Calendar as CalendarIcon, CheckCircle } from 'lucide-react';

interface PeriodoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  periodoEditar?: Periodo;
}

const PeriodoDialog: React.FC<PeriodoDialogProps> = ({ isOpen, onClose, periodoEditar }) => {
  const { addPeriodo, updatePeriodo, deletePeriodo, periodos, periodoActivo, setPeriodoActivo, syncPeriodoActivo } = useCatalogoStore();
  const [loading, setLoading] = useState(false);
  const [periodoEdit, setPeriodoEdit] = useState<Periodo | undefined>(periodoEditar);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<Periodo>({
    defaultValues: periodoEditar || { nombre: '' }
  });

  useEffect(() => {
    if (periodoEditar) {
      setPeriodoEdit(periodoEditar);
      reset(periodoEditar);
    } else {
      setPeriodoEdit(undefined);
      reset({ nombre: '' });
    }
  }, [periodoEditar, reset]);

  // Sincronizar período activo cuando se abre el diálogo
  useEffect(() => {
    if (isOpen) {
      syncPeriodoActivo();
    }
  }, [isOpen, syncPeriodoActivo]);

  const onSubmit = async (data: Periodo) => {
    setLoading(true);
    try {
      if (periodoEdit?.id) {
        await updatePeriodo(periodoEdit.id, data);
        showSuccess('Periodo actualizado correctamente');
      } else {
        await addPeriodo(data);
        showSuccess('Periodo agregado correctamente');
      }
      setPeriodoEdit(undefined);
      reset({ nombre: '' });
      onClose();
    } catch (error) {
      showError(periodoEdit ? 'Error al actualizar periodo' : 'Error al agregar periodo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={periodoEditar ? 'Editar Periodo' : 'Nuevo Periodo'}
    >
      <div className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nombre del Periodo"
            placeholder="Ingrese el nombre del periodo (ej. 2023-I)"
            icon={<CalendarIcon className="w-5 h-5" />}
            {...register('nombre', { required: 'El nombre es requerido' })}
            error={errors.nombre?.message}
          />
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={loading}
            >
              {periodoEditar ? 'Actualizar' : 'Guardar'}
            </Button>
          </div>
        </form>
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2 text-gray-700 dark:text-gray-200">Periodos existentes</h3>
          {periodoActivo && (
            <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="font-medium text-green-700 dark:text-green-300">
                    Período Activo: {periodoActivo.nombre}
                  </span>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setPeriodoActivo(null)}
                  className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
                >
                  Desactivar
                </Button>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Los nuevos trabajos se crearán automáticamente con este período
              </p>
            </div>
          )}
          <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {periodos.map(periodo => (
              <li key={periodo.id} className={`flex items-center justify-between rounded px-3 py-2 ${
                periodoActivo?.id === periodo.id 
                  ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700' 
                  : 'bg-gray-50 dark:bg-dark-300'
              }`}>
                <span className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-blue-500" />
                  {periodo.nombre}
                  {periodoActivo?.id === periodo.id && (
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  )}
                </span>
                <div className="flex items-center space-x-2">
                  {periodoActivo?.id !== periodo.id && (
                    <Button 
                      size="sm" 
                      variant="success" 
                      onClick={() => setPeriodoActivo(periodo)}
                      aria-label="Seleccionar como período activo"
                      className="text-xs"
                    >
                      Activar
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => { setPeriodoEdit(periodo); reset(periodo); }} aria-label="Editar periodo">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="danger" onClick={async () => { if (window.confirm('¿Seguro que deseas eliminar este periodo?')) { await deletePeriodo(periodo.id!); if (periodoEdit?.id === periodo.id) { setPeriodoEdit(undefined); reset({ nombre: '' }); } if (periodoActivo?.id === periodo.id) { setPeriodoActivo(null); } } }} aria-label="Eliminar periodo">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Dialog>
  );
};

export default PeriodoDialog;