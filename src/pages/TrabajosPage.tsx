import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import TrabajoForm from '../components/trabajo/TrabajoForm';
import TrabajoList from '../components/trabajo/TrabajoList';
import Dialog from '../components/ui/Dialog';
import Button from '../components/ui/Button';
import CursoDialog from '../components/catalogo/CursoDialog';
import ProveedorDialog from '../components/catalogo/ProveedorDialog';
import PeriodoDialog from '../components/catalogo/PeriodoDialog';
import { Trabajo } from '../types';
import useTrabajoStore from '../store/trabajosStore';
import { showSuccess, showError } from '../components/layout/NotificationManager';
import { Plus, BookOpen, Users, Calendar } from 'lucide-react';

const TrabajosPage: React.FC = () => {
  const { addTrabajo, updateTrabajo, isLoading } = useTrabajoStore();
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [trabajoEditar, setTrabajoEditar] = useState<Trabajo | undefined>(undefined);

  const [cursoDialogOpen, setCursoDialogOpen] = useState(false);
  const [proveedorDialogOpen, setProveedorDialogOpen] = useState(false);
  const [periodoDialogOpen, setPeriodoDialogOpen] = useState(false);
  
  const abrirDialogo = () => {
    setTrabajoEditar(undefined);
    setDialogoAbierto(true);
  };
  
  const cerrarDialogo = () => {
    setDialogoAbierto(false);
    setTrabajoEditar(undefined);
  };
  
  const handleEdit = (trabajo: Trabajo) => {
    setTrabajoEditar(trabajo);
    setDialogoAbierto(true);
  };
  
  const handleSubmit = async (trabajo: Trabajo) => {
    try {
      if (trabajoEditar?.id) {
        await updateTrabajo(trabajoEditar.id, trabajo);
        showSuccess('Trabajo actualizado correctamente');
      } else {
        await addTrabajo(trabajo);
        showSuccess('Trabajo agregado correctamente');
      }
      cerrarDialogo();
    } catch (error) {
      showError(trabajoEditar ? 'Error al actualizar trabajo' : 'Error al agregar trabajo');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      
      <main className="container mx-auto px-2 sm:px-4 py-8 w-full max-w-7xl">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center md:text-left">Gestión de Trabajos</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto justify-center md:justify-end">
            <Button onClick={abrirDialogo} className="w-full sm:w-auto">
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Trabajo
            </Button>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={() => setCursoDialogOpen(true)} className="w-full sm:w-auto">
                <BookOpen className="w-5 h-5 mr-2" />
                Cursos
              </Button>
              <Button variant="outline" onClick={() => setProveedorDialogOpen(true)} className="w-full sm:w-auto">
                <Users className="w-5 h-5 mr-2" />
                Proveedores
              </Button>
              <Button variant="outline" onClick={() => setPeriodoDialogOpen(true)} className="w-full sm:w-auto">
                <Calendar className="w-5 h-5 mr-2" />
                Periodos
              </Button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg shadow bg-white dark:bg-gray-800">
          <TrabajoList onEdit={handleEdit} />
        </div>
        <Dialog
          isOpen={dialogoAbierto}
          onClose={cerrarDialogo}
          title={trabajoEditar ? 'Editar Trabajo' : 'Nuevo Trabajo'}
          className="max-w-4xl w-full"
        >
          <TrabajoForm 
            onSubmit={handleSubmit} 
            initialData={trabajoEditar}
            isLoading={isLoading}
          />
        </Dialog>
        <CursoDialog 
          isOpen={cursoDialogOpen}
          onClose={() => setCursoDialogOpen(false)}
        />
        <ProveedorDialog 
          isOpen={proveedorDialogOpen}
          onClose={() => setProveedorDialogOpen(false)}
        />
        <PeriodoDialog 
          isOpen={periodoDialogOpen}
          onClose={() => setPeriodoDialogOpen(false)}
        />
      </main>
    </div>
  );
};

export default TrabajosPage;