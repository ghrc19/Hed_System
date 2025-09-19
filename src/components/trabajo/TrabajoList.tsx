import React, { useState, useEffect } from 'react';
import { Edit, Trash2, CheckCircle, RefreshCw, XCircle, Search, FilterX } from 'lucide-react';
import Button from '../ui/Button';
import { Trabajo, FilterOptions } from '../../types';
import useTrabajoStore from '../../store/trabajosStore';
import { getStatusColor, getRowClassName } from '../../lib/utils';
import useCatalogoStore from '../../store/catalogoStore';
import { showSuccess, showError } from '../layout/NotificationManager';
import ConfirmDialog from '../ui/ConfirmDialog';

interface TrabajoListProps {
  onEdit: (trabajo: Trabajo) => void;
}

const TrabajoList: React.FC<TrabajoListProps> = ({ onEdit }) => {
  const { trabajosFiltrados, fetchTrabajos, updateEstado, deleteTrabajo, applyFilters } = useTrabajoStore();
  const { cursos, proveedores, periodos, fetchCursos, fetchProveedores, fetchPeriodos } = useCatalogoStore();
  
  const [filtros, setFiltros] = useState<FilterOptions>({
    tipoPA: '',
    periodo: '',
    proveedor: '',
    busqueda: '',
    fechaInicio: '',
    fechaFin: '',
    mes: ''
  });

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    id: '',
    title: '',
    message: ''
  });
  
  const [sortField, setSortField] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  useEffect(() => {
    fetchTrabajos();
    fetchCursos();
    fetchProveedores();
    fetchPeriodos();
  }, [fetchTrabajos, fetchCursos, fetchProveedores, fetchPeriodos]);

  useEffect(() => {
    applyFilters(filtros);
  }, [filtros, applyFilters]);

  // Filtrado por mes
  const trabajosFiltradosPorMes = trabajosFiltrados.filter(trabajo => {
    if (!filtros.mes || filtros.mes === '') return true;
    const mesTrabajo = new Date(trabajo.fechaRegistro).getMonth().toString();
    return mesTrabajo === filtros.mes;
  });
  
  const handleChangeEstado = async (id: string | undefined, estadoActual: string) => {
    if (!id) return;
    
    try {
      let nuevoEstado: 'Pendiente' | 'Terminado';
      const fechaEntrega = new Date().toISOString().split('T')[0];
      
      if (estadoActual === 'Terminado') {
        nuevoEstado = 'Pendiente';
      } else {
        nuevoEstado = 'Terminado';
      }
      
      await updateEstado(id, nuevoEstado, nuevoEstado === 'Terminado' ? fechaEntrega : '');
      showSuccess(`Estado actualizado a: ${nuevoEstado}`);
    } catch (error) {
      showError('Error al actualizar el estado');
    }
  };
  
  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    
    setConfirmDialog({
      isOpen: true,
      id,
      title: 'Eliminar Trabajo',
      message: '¿Estás seguro que deseas eliminar este trabajo? Esta acción no se puede deshacer.'
    });
  };

  const confirmDelete = async () => {
    try {
      await deleteTrabajo(confirmDialog.id);
      showSuccess('Trabajo eliminado correctamente');
    } catch (error) {
      showError('Error al eliminar el trabajo');
    } finally {
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    }
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };
  
  const handleResetFilters = () => {
    setFiltros({
      tipoPA: '',
      periodo: '',
      proveedor: '',
      busqueda: '',
      fechaInicio: '',
      fechaFin: '',
      mes: ''
    });
  };
  
  const getStatusButtonText = (estado: string) => {
    switch (estado) {
      case 'Pendiente':
        return 'Enviar';
      case 'Cancelado':
        return 'Enviar';
      case 'Terminado':
        return 'Devolver';
      default:
        return 'Acción';
    }
  };
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };
  
  const trabajosOrdenados = [...trabajosFiltradosPorMes].sort((a, b) => {
    if (!sortField) return 0;
    // Ordenar por campos conocidos de Trabajo
    switch (sortField) {
      case 'nombreCliente':
        return sortOrder === 'asc'
          ? a.nombreCliente.localeCompare(b.nombreCliente, 'es', { numeric: true })
          : b.nombreCliente.localeCompare(a.nombreCliente, 'es', { numeric: true });
      case 'curso':
        return sortOrder === 'asc'
          ? a.curso.localeCompare(b.curso, 'es', { numeric: true })
          : b.curso.localeCompare(a.curso, 'es', { numeric: true });
      case 'proveedor':
        return sortOrder === 'asc'
          ? a.proveedor.localeCompare(b.proveedor, 'es', { numeric: true })
          : b.proveedor.localeCompare(a.proveedor, 'es', { numeric: true });
      case 'tipoPA':
        return sortOrder === 'asc'
          ? a.tipoPA.localeCompare(b.tipoPA, 'es', { numeric: true })
          : b.tipoPA.localeCompare(a.tipoPA, 'es', { numeric: true });
      case 'fechaRegistro':
        return sortOrder === 'asc'
          ? a.fechaRegistro.localeCompare(b.fechaRegistro)
          : b.fechaRegistro.localeCompare(a.fechaRegistro);
      case 'fechaEntrega':
        return sortOrder === 'asc'
          ? (a.fechaEntrega || '').localeCompare(b.fechaEntrega || '')
          : (b.fechaEntrega || '').localeCompare(a.fechaEntrega || '');
      case 'precio':
        return sortOrder === 'asc'
          ? Number(a.precio) - Number(b.precio)
          : Number(b.precio) - Number(a.precio);
      case 'estado':
        return sortOrder === 'asc'
          ? a.estado.localeCompare(b.estado, 'es', { numeric: true })
          : b.estado.localeCompare(a.estado, 'es', { numeric: true });
      default:
        return 0;
    }
  });
  
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(trabajosOrdenados.length / itemsPerPage);

  const paginatedTrabajos = trabajosOrdenados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-dark-200 p-4 rounded-lg shadow">
      {/* Selector de cantidad por página */}
      <div className="flex items-center gap-2 mb-2">
        <label htmlFor="itemsPerPage" className="text-sm text-gray-700 dark:text-gray-300">Trabajos por página:</label>
        <select
          id="itemsPerPage"
          value={itemsPerPage}
          onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
          className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-300 text-gray-900 dark:text-white px-2 py-1"
        >
          <option value={10}>10</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de PA
            </label>
            <select
              name="tipoPA"
              value={filtros.tipoPA}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md dark:border-dark-400 dark:bg-dark-300 dark:text-white"
            >
              <option value="">Todos</option>
              <option value="PA-01">PA-01</option>
              <option value="PA-02">PA-02</option>
              <option value="PA-03">PA-03</option>
              <option value="EF">EF</option>
              <option value="ES">ES</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Periodo
            </label>
            <select
              name="periodo"
              value={filtros.periodo}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md dark:border-dark-400 dark:bg-dark-300 dark:text-white"
            >
              <option value="">Todos</option>
              {periodos.map(periodo => (
                <option key={periodo.id} value={periodo.nombre}>
                  {periodo.nombre}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Proveedor
            </label>
            <select
              name="proveedor"
              value={filtros.proveedor}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md dark:border-dark-400 dark:bg-dark-300 dark:text-white"
            >
              <option value="">Todos</option>
              {proveedores.map(proveedor => (
                <option key={proveedor.id} value={proveedor.nombre}>
                  {proveedor.nombre}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mes
            </label>
            <select
              name="mes"
              value={filtros.mes || ''}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md dark:border-dark-400 dark:bg-dark-300 dark:text-white"
            >
              <option value="">Todos</option>
              <option value="0">Enero</option>
              <option value="1">Febrero</option>
              <option value="2">Marzo</option>
              <option value="3">Abril</option>
              <option value="4">Mayo</option>
              <option value="5">Junio</option>
              <option value="6">Julio</option>
              <option value="7">Agosto</option>
              <option value="8">Septiembre</option>
              <option value="9">Octubre</option>
              <option value="10">Noviembre</option>
              <option value="11">Diciembre</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
              <input
                name="busqueda"
                value={filtros.busqueda}
                onChange={handleFilterChange}
                type="text"
                className="w-full p-2 pl-10 border border-gray-300 rounded-md dark:border-dark-400 dark:bg-dark-300 dark:text-white"
                placeholder="Buscar..."
              />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha Inicio
            </label>
            <input
              name="fechaInicio"
              value={filtros.fechaInicio}
              onChange={handleFilterChange}
              type="date"
              className="w-full p-2 border border-gray-300 rounded-md dark:border-dark-400 dark:bg-dark-300 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha Fin
            </label>
            <input
              name="fechaFin"
              value={filtros.fechaFin}
              onChange={handleFilterChange}
              type="date"
              className="w-full p-2 border border-gray-300 rounded-md dark:border-dark-400 dark:bg-dark-300 dark:text-white"
            />
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <Button 
            variant="outline" 
            onClick={handleResetFilters}
          >
            <FilterX className="w-4 h-4 mr-2" />
            Limpiar
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-400">
          <thead className="bg-black">
            <tr>
              <th scope="col" className="px-3 py-1 text-left text-[10px] font-medium text-white uppercase tracking-wider cursor-pointer" onClick={() => handleSort('nombreCliente')}>
                Cliente {sortField === 'nombreCliente' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th scope="col" className="px-1 py-1 text-left text-[10px] font-medium text-white uppercase tracking-wider cursor-pointer" onClick={() => handleSort('curso')}>
                Curso {sortField === 'curso' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th scope="col" className="px-1 py-1 text-left text-[10px] font-medium text-white uppercase tracking-wider cursor-pointer" onClick={() => handleSort('proveedor')}>
                Proveedor {sortField === 'proveedor' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th scope="col" className="px-1 py-1 text-left text-[10px] font-medium text-white uppercase tracking-wider cursor-pointer" onClick={() => handleSort('tipoPA')}>
                Tipo PA {sortField === 'tipoPA' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th scope="col" className="px-1 py-1 text-left text-[10px] font-medium text-white uppercase tracking-wider cursor-pointer" onClick={() => handleSort('fechaRegistro')}>
                Fecha Reg. {sortField === 'fechaRegistro' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th scope="col" className="px-1 py-1 text-left text-[10px] font-medium text-white uppercase tracking-wider cursor-pointer" onClick={() => handleSort('fechaEntrega')}>
                Fecha Entrega {sortField === 'fechaEntrega' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th scope="col" className="px-1 py-1 text-left text-[10px] font-medium text-white uppercase tracking-wider cursor-pointer" onClick={() => handleSort('precio')}>
                Precio {sortField === 'precio' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th scope="col" className="px-1 py-1 text-left text-[10px] font-medium text-white uppercase tracking-wider cursor-pointer" onClick={() => handleSort('estado')}>
                Estado {sortField === 'estado' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th scope="col" className="px-3 py-1 text-left text-[10px] font-medium text-white uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedTrabajos.length > 0 ? (
              paginatedTrabajos.map((trabajo) => (
                <tr 
                  key={trabajo.id} 
                  className={getRowClassName(trabajo.estado)}
                >
                  <td className="px-3 py-1 whitespace-nowrap text-[11px] text-gray-900 dark:text-white">
                    {trabajo.nombreCliente}
                  </td>
                  <td className="px-1 py-1 whitespace-nowrap text-[11px] text-gray-900 dark:text-white">
                    {trabajo.curso}
                  </td>
                  <td className="px-1 py-1 whitespace-nowrap text-[11px] text-gray-900 dark:text-white">
                    {trabajo.proveedor}
                  </td>
                  <td className="px-1 py-1 whitespace-nowrap text-[11px] text-gray-900 dark:text-white">
                    {trabajo.tipoPA}
                  </td>
                  <td className="px-1 py-1 whitespace-nowrap text-[11px] text-gray-900 dark:text-white">
                    {trabajo.fechaRegistro}
                  </td>
                  <td className="px-1 py-1 whitespace-nowrap text-[11px] text-gray-900 dark:text-white">
                    {trabajo.fechaEntrega || 'Por definir'}
                  </td>
                  <td className="px-1 py-1 whitespace-nowrap text-[11px] text-gray-900 dark:text-white">
                    S/ {trabajo.precio}
                  </td>
                  <td className="px-1 py-1 whitespace-nowrap">
                    <span className={`px-1 inline-flex text-[10px] leading-5 font-semibold rounded-full ${getStatusColor(trabajo.estado)}`}>{trabajo.estado}</span>
                  </td>
                  <td className="px-3 py-1 whitespace-nowrap text-[11px] font-medium">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant={trabajo.estado === 'Terminado' ? 'secondary' : 'primary'}
                        onClick={() => handleChangeEstado(trabajo.id, trabajo.estado)}
                        className="w-24"
                      >
                        {trabajo.estado === 'Terminado' ? (
                          <RefreshCw className="w-4 h-4 mr-1" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-1" />
                        )}
                        {getStatusButtonText(trabajo.estado)}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onEdit(trabajo)}
                        className="w-10"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(trabajo.id)}
                        className="w-10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="px-3 py-1 text-center text-[11px] text-gray-500 dark:text-gray-400">
                  No hay trabajos disponibles
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 pb-6">
          <button
            className="px-2 py-1 rounded bg-gray-200 dark:bg-dark-400 text-xs font-medium text-gray-900 dark:text-white disabled:opacity-50"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          {(() => {
            const pages: (number | string)[] = [];
            if (totalPages <= 7) {
              for (let i = 1; i <= totalPages; i++) pages.push(i);
            } else {
              pages.push(1);
              if (currentPage > 4) pages.push('...');
              for (let i = Math.max(2, currentPage - 2); i <= Math.min(totalPages - 1, currentPage + 2); i++) {
                if (i === 2 && currentPage > 5) pages.push('...');
                pages.push(i);
                if (i === totalPages - 1 && currentPage < totalPages - 4) pages.push('...');
              }
              if (currentPage < totalPages - 3) pages.push('...');
              pages.push(totalPages);
            }
            return pages.map((page, idx) =>
              typeof page === 'number' ? (
                <button
                  key={page}
                  className={`px-2 py-1 rounded text-xs font-medium ${page === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-400 dark:bg-dark-300 text-gray-900 dark:text-white'}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ) : (
                <span key={"dots-" + idx} className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">...</span>
              )
            );
          })()}
          <button
            className="px-2 py-1 rounded bg-gray-200 dark:bg-dark-400 text-xs font-medium text-gray-900 dark:text-white disabled:opacity-50"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </button>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};

export default TrabajoList;