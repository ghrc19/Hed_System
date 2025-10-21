import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { Trabajo } from '../../types';
import { getTodayDate } from '../../lib/utils';
import useCatalogoStore from '../../store/catalogoStore';
import { Clipboard, Copy, User, DollarSign, Calendar, Link as LinkIcon, Plus } from 'lucide-react';
import CursoDialog from '../catalogo/CursoDialog';
import ProveedorDialog from '../catalogo/ProveedorDialog';
import PeriodoDialog from '../catalogo/PeriodoDialog';
import TipoPADialog from '../catalogo/TipoPADialog';

interface TrabajoFormProps {
  onSubmit: (data: Trabajo) => void;
  initialData?: Trabajo;
  isLoading?: boolean;
}

const tiposPAOptions = [
  { value: 'PA-01', label: 'PA-01' },
  { value: 'PA-02', label: 'PA-02' },
  { value: 'PA-03', label: 'PA-03' },
  { value: 'EF', label: 'EF' },
  { value: 'ES', label: 'ES' }
];

const tiposTrabajoOptions = [
  { value: 'Trabajo Individual', label: 'Trabajo Individual' },
  { value: 'Trabajo Grupal', label: 'Trabajo Grupal' }
];

const estadoOptions = [
  { value: 'Pendiente', label: 'Pendiente' },
  { value: 'Cancelado', label: 'Cancelado' },
  { value: 'Terminado', label: 'Terminado' }
];

const TrabajoForm: React.FC<TrabajoFormProps> = ({ 
  onSubmit, 
  initialData, 
  isLoading = false 
}) => {
  const { 
    cursos, 
    proveedores, 
    periodos, 
    periodoActivo,
    tipoPAActivo,
    fetchCursos, 
    fetchProveedores, 
    fetchPeriodos 
  } = useCatalogoStore();

  const defaultValues: Trabajo = {
    nombreCliente: 'Estudiante',
    proveedor: '',
    curso: '',
    tipoPA: initialData?.tipoPA || tipoPAActivo || '',
    tipoTrabajo: initialData?.tipoTrabajo || 'Trabajo Individual',
    fechaRegistro: getTodayDate(),
    fechaEntrega: '',
    periodo: initialData?.periodo || periodoActivo?.nombre || '',
    precio: 20,
    url: '',
    estado: 'Pendiente',
    ...initialData
  };

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<Trabajo>({
    defaultValues
  });

  const urlValue = watch('url');

  useEffect(() => {
    fetchCursos();
    fetchProveedores();
    fetchPeriodos();
  }, [fetchCursos, fetchProveedores, fetchPeriodos]);

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  // Efecto para autocompletar el período activo cuando no hay initialData
  useEffect(() => {
    if (!initialData && periodoActivo && periodoActivo.nombre) {
      setValue('periodo', periodoActivo.nombre);
    }
  }, [periodoActivo, initialData, setValue]);

  // Efecto para preseleccionar "Trabajo Individual" cuando no hay initialData
  useEffect(() => {
    if (!initialData) {
      setValue('tipoTrabajo', 'Trabajo Individual');
    }
  }, [initialData, setValue]);

  // Efecto para autocompletar el tipo PA activo cuando no hay initialData
  useEffect(() => {
    if (!initialData && tipoPAActivo) {
      setValue('tipoPA', tipoPAActivo);
    }
  }, [tipoPAActivo, initialData, setValue]);

  const cursosOptions = cursos
    .slice()
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }))
    .map(curso => ({
      value: curso.nombre,
      label: curso.nombre
    }));

  const proveedoresOptions = proveedores
    .slice()
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }))
    .map(proveedor => ({
      value: proveedor.nombre,
      label: proveedor.nombre
    }));

  const periodosOptions = periodos
    .slice()
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }))
    .map(periodo => ({
      value: periodo.nombre,
      label: periodo.nombre
    }));

  const handleFormSubmit = (data: Trabajo) => {
    onSubmit(data);
  };

  const handlePasteUrl = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setValue('url', text);
    } catch (error) {
      console.error('Error al pegar URL:', error);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(urlValue);
    } catch (error) {
      console.error('Error al copiar URL:', error);
    }
  };

  const [openCursoDialog, setOpenCursoDialog] = React.useState(false);
  const [openProveedorDialog, setOpenProveedorDialog] = React.useState(false);
  const [openPeriodoDialog, setOpenPeriodoDialog] = React.useState(false);
  const [openTipoPADialog, setOpenTipoPADialog] = React.useState(false);

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <Input
            label="Nombre del Cliente"
            placeholder="Estudiante"
            icon={<User className="w-5 h-5" />}
            {...register('nombreCliente', { required: 'Este campo es requerido' })}
            error={errors.nombreCliente?.message}
          />

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Select
                label="Proveedor"
                options={proveedoresOptions}
                {...register('proveedor', { required: 'Este campo es requerido' })}
                error={errors.proveedor?.message}
              />
            </div>
            <Button
              type="button"
              variant="success"
              size="sm"
              onClick={() => setOpenProveedorDialog(true)}
              aria-label="Agregar proveedor"
              className="rounded-full shadow-md p-0 w-9 h-9 flex items-center justify-center transition-transform hover:scale-110 hover:bg-green-700 focus:ring-2 focus:ring-green-400"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Select
                label="Curso"
                options={cursosOptions}
                {...register('curso', { required: 'Este campo es requerido' })}
                error={errors.curso?.message}
              />
            </div>
            <Button
              type="button"
              variant="success"
              size="sm"
              onClick={() => setOpenCursoDialog(true)}
              aria-label="Agregar curso"
              className="rounded-full shadow-md p-0 w-9 h-9 flex items-center justify-center transition-transform hover:scale-110 hover:bg-green-700 focus:ring-2 focus:ring-green-400"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Select
                label="Tipo de PA"
                options={tiposPAOptions}
                {...register('tipoPA', { required: 'Este campo es requerido' })}
                error={errors.tipoPA?.message}
              />
            </div>
            <Button
              type="button"
              variant="success"
              size="sm"
              onClick={() => setOpenTipoPADialog(true)}
              aria-label="Seleccionar tipo PA activo"
              className="rounded-full shadow-md p-0 w-9 h-9 flex items-center justify-center transition-transform hover:scale-110 hover:bg-green-700 focus:ring-2 focus:ring-green-400"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          <Select
            label="Tipo de Trabajo"
            options={tiposTrabajoOptions}
            {...register('tipoTrabajo', { required: 'Este campo es requerido' })}
            error={errors.tipoTrabajo?.message}
          />

          <Input
            label="Fecha de Registro"
            type="date"
            icon={<Calendar className="w-5 h-5" />}
            {...register('fechaRegistro', { required: 'Este campo es requerido' })}
            error={errors.fechaRegistro?.message}
          />

          <Input
            label="Fecha de Entrega"
            type="date"
            placeholder="Por definir"
            icon={<Calendar className="w-5 h-5" />}
            {...register('fechaEntrega')}
            error={errors.fechaEntrega?.message}
          />

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Select
                label="Periodo"
                options={periodosOptions}
                {...register('periodo', { required: 'Este campo es requerido' })}
                error={errors.periodo?.message}
              />
            </div>
            <Button
              type="button"
              variant="success"
              size="sm"
              onClick={() => setOpenPeriodoDialog(true)}
              aria-label="Agregar periodo"
              className="rounded-full shadow-md p-0 w-9 h-9 flex items-center justify-center transition-transform hover:scale-110 hover:bg-green-700 focus:ring-2 focus:ring-green-400"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          <Input
            label="Precio (Soles)"
            type="number"
            icon={<DollarSign className="w-5 h-5" />}
            {...register('precio', { 
              required: 'Este campo es requerido',
              min: { value: 0, message: 'El precio debe ser positivo' }
            })}
            error={errors.precio?.message}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              URL
            </label>
            <div className="flex space-x-2 w-full">
              <Input
                icon={<LinkIcon className="w-6 h-6" />}
                type="text"
                className="h-12 w-full min-w-0 rounded-md border border-gray-300 bg-white px-3 pl-12 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-400 dark:bg-dark-300 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-blue-500"
                {...register('url')}
                error={errors.url?.message}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handlePasteUrl}
                className="w-14 h-12 flex items-center justify-center"
                aria-label="Pegar URL"
              >
                <Clipboard className="w-8 h-8" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCopyUrl}
                disabled={!urlValue}
                className="w-14 h-12 flex items-center justify-center"
                aria-label="Copiar URL"
              >
                <Copy className="w-8 h-8" />
              </Button>
            </div>
            {errors.url && (
              <p className="text-sm text-red-500 mt-1">{errors.url.message}</p>
            )}
          </div>

          <Select
            label="Estado"
            options={estadoOptions}
            {...register('estado', { required: 'Este campo es requerido' })}
            error={errors.estado?.message}
          />
        </div>
        <div className="flex flex-col sm:flex-row justify-end mt-6 gap-2 w-full">
          <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto">
            {initialData ? 'Actualizar' : 'Guardar'}
          </Button>
        </div>
      </form>

      <CursoDialog isOpen={openCursoDialog} onClose={() => setOpenCursoDialog(false)} />
      <ProveedorDialog isOpen={openProveedorDialog} onClose={() => setOpenProveedorDialog(false)} />
      <PeriodoDialog isOpen={openPeriodoDialog} onClose={() => setOpenPeriodoDialog(false)} />
      <TipoPADialog isOpen={openTipoPADialog} onClose={() => setOpenTipoPADialog(false)} />
    </>
  );
};

export default TrabajoForm;