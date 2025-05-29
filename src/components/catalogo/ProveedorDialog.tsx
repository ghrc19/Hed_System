import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Dialog from '../ui/Dialog';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Proveedor } from '../../types';
import useCatalogoStore from '../../store/catalogoStore';
import { showSuccess, showError } from '../layout/NotificationManager';
import { Trash2, Edit2, Users, Phone } from 'lucide-react';

interface ProveedorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  proveedorEditar?: Proveedor;
}

const ProveedorDialog: React.FC<ProveedorDialogProps> = ({ isOpen, onClose, proveedorEditar }) => {
  const [proveedorEdit, setProveedorEdit] = useState<Proveedor | undefined>(proveedorEditar);
  const { addProveedor, updateProveedor, deleteProveedor, proveedores } = useCatalogoStore();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<Proveedor>({
    defaultValues: proveedorEditar || { nombre: '', celular: '' }
  });

  useEffect(() => {
    if (proveedorEditar) {
      setProveedorEdit(proveedorEditar);
      reset(proveedorEditar);
    } else {
      setProveedorEdit(undefined);
      reset({ nombre: '', celular: '' });
    }
  }, [proveedorEditar, reset]);

  const onSubmit = async (data: Proveedor) => {
    setLoading(true);
    try {
      if (proveedorEdit?.id) {
        await updateProveedor(proveedorEdit.id, data);
        showSuccess('Proveedor actualizado correctamente');
      } else {
        await addProveedor(data);
        showSuccess('Proveedor agregado correctamente');
      }
      setProveedorEdit(undefined);
      reset({ nombre: '', celular: '' });
      onClose();
    } catch (error) {
      showError(proveedorEdit ? 'Error al actualizar proveedor' : 'Error al agregar proveedor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={proveedorEditar ? 'Editar Proveedor' : 'Nuevo Proveedor'}
    >
      <div className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nombre del Proveedor"
            placeholder="Ingrese el nombre del proveedor"
            icon={<Users className="w-5 h-5" />}
            {...register('nombre', { required: 'El nombre es requerido' })}
            error={errors.nombre?.message}
          />

          <Input
            label="Celular"
            placeholder="Ingrese el número de celular"
            icon={<Phone className="w-5 h-5" />}
            {...register('celular', { 
              required: 'El celular es requerido',
              pattern: {
                value: /^[0-9]{9}$/,
                message: 'Ingrese un número de celular válido (9 dígitos)'
              }
            })}
            error={errors.celular?.message}
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
              {proveedorEditar ? 'Actualizar' : 'Guardar'}
            </Button>
          </div>
        </form>
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2 text-gray-700 dark:text-gray-200">Proveedores existentes</h3>
          <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {proveedores.map(proveedor => (
              <li key={proveedor.id} className="flex items-center justify-between bg-gray-50 dark:bg-dark-300 rounded px-3 py-2">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  {proveedor.nombre} 
                  <span className="text-xs text-gray-400 ml-2 flex items-center">
                    <Phone className="w-3 h-3 mr-1" />
                    {proveedor.celular}
                  </span>
                </span>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" onClick={() => { setProveedorEdit(proveedor); reset(proveedor); }} aria-label="Editar proveedor">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="danger" onClick={async () => { if (window.confirm('¿Seguro que deseas eliminar este proveedor?')) { await deleteProveedor(proveedor.id!); if (proveedorEdit?.id === proveedor.id) { setProveedorEdit(undefined); reset({ nombre: '', celular: '' }); } } }} aria-label="Eliminar proveedor">
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

export default ProveedorDialog;