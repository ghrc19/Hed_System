import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Dialog from '../ui/Dialog';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Curso } from '../../types';
import useCatalogoStore from '../../store/catalogoStore';
import { showSuccess, showError } from '../layout/NotificationManager';
import { Trash2, Edit2, BookOpen } from 'lucide-react';
import ConfirmDialog from '../ui/ConfirmDialog';

interface CursoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cursoEditar?: Curso;
}

const CursoDialog: React.FC<CursoDialogProps> = ({ isOpen, onClose, cursoEditar }) => {
  const [cursoEdit, setCursoEdit] = useState<Curso | undefined>(cursoEditar);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cursoToDelete, setCursoToDelete] = useState<Curso | null>(null);
  const { addCurso, updateCurso, deleteCurso, cursos } = useCatalogoStore();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<Curso>({
    defaultValues: cursoEditar || { nombre: '' }
  });

  useEffect(() => {
    if (cursoEditar) {
      setCursoEdit(cursoEditar);
      reset(cursoEditar);
    } else {
      setCursoEdit(undefined);
      reset({ nombre: '' });
    }
  }, [cursoEditar, reset]);

  const onSubmit = async (data: Curso) => {
    setLoading(true);
    try {
      if (cursoEdit?.id) {
        await updateCurso(cursoEdit.id, data);
        showSuccess('Curso actualizado correctamente');
      } else {
        await addCurso(data);
        showSuccess('Curso agregado correctamente');
      }
      setCursoEdit(undefined);
      reset({ nombre: '' });
      onClose();
    } catch (error) {
      showError(cursoEdit ? 'Error al actualizar curso' : 'Error al agregar curso');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (curso: Curso) => {
    setCursoToDelete(curso);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (cursoToDelete) {
      await deleteCurso(cursoToDelete.id!);
      if (cursoEdit?.id === cursoToDelete.id) {
        setCursoEdit(undefined);
        reset({ nombre: '' });
      }
      setCursoToDelete(null);
      setConfirmOpen(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={cursoEditar ? 'Editar Curso' : 'Nuevo Curso'}
    >
      <div className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nombre del Curso"
            placeholder="Ingrese el nombre del curso"
            icon={<BookOpen className="w-5 h-5" />}
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
              {cursoEditar ? 'Actualizar' : 'Guardar'}
            </Button>
          </div>
        </form>
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2 text-gray-700 dark:text-gray-200">Cursos existentes</h3>
          <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {cursos.map(curso => (
              <li key={curso.id} className="flex items-center justify-between bg-gray-50 dark:bg-dark-300 rounded px-3 py-2">
                <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-blue-500" />{curso.nombre}</span>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" onClick={() => { setCursoEdit(curso); reset(curso); }} aria-label="Editar curso">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(curso)} aria-label="Eliminar curso">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Eliminar curso"
        message={`¿Seguro que deseas eliminar el curso "${cursoToDelete?.nombre}"?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </Dialog>
  );
};

export default CursoDialog;