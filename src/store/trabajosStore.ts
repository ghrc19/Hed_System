import { create } from 'zustand';
import { Trabajo, FilterOptions } from '../types';
import { sortByStatus } from '../lib/utils';

interface TrabajoStore {
  trabajos: Trabajo[];
  trabajosFiltrados: Trabajo[];
  filtros: FilterOptions;
  isLoading: boolean;
  fetchTrabajos: () => Promise<void>;
  addTrabajo: (trabajo: Trabajo) => Promise<void>;
  updateTrabajo: (id: string, trabajo: Partial<Trabajo>) => Promise<void>;
  deleteTrabajo: (id: string) => Promise<void>;
  updateEstado: (id: string, estado: 'Pendiente' | 'Cancelado' | 'Terminado', fechaEntrega?: string) => Promise<void>;
  applyFilters: (filtros: FilterOptions) => Promise<void>;
}

// Datos de prueba
let mockTrabajos: Trabajo[] = [
  {
    id: '1',
    nombreCliente: 'Juan Pérez',
    proveedor: 'Proveedor A',
    curso: 'Matemática',
    tipoPA: 'PA-01',
    tipoTrabajo: 'Trabajo Individual',
    fechaRegistro: '2025-06-01',
    fechaEntrega: '',
    periodo: '2025-I',
    precio: 50,
    url: '',
    estado: 'Pendiente'
  },
  {
    id: '2',
    nombreCliente: 'Ana López',
    proveedor: 'Proveedor B',
    curso: 'Comunicación',
    tipoPA: 'PA-02',
    tipoTrabajo: 'Trabajo Grupal',
    fechaRegistro: '2025-06-10',
    fechaEntrega: '2025-06-20',
    periodo: '2025-II',
    precio: 80,
    url: '',
    estado: 'Terminado'
  }
];

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const useTrabajoStore = create<TrabajoStore>((set, get) => ({
  trabajos: [],
  trabajosFiltrados: [],
  filtros: {},
  isLoading: false,

  fetchTrabajos: async () => {
    set({ isLoading: true });
    await delay(200);
    const sortedTrabajos = sortByStatus([...mockTrabajos]);
    set({ trabajos: sortedTrabajos, trabajosFiltrados: sortedTrabajos, isLoading: false });
  },

  addTrabajo: async (trabajo) => {
    set({ isLoading: true });
    await delay(200);
    const newTrabajo = { ...trabajo, id: Date.now().toString() };
    mockTrabajos.push(newTrabajo);
    const sortedTrabajos = sortByStatus([...mockTrabajos]);
    set({ trabajos: sortedTrabajos, trabajosFiltrados: sortedTrabajos, isLoading: false });
  },

  updateTrabajo: async (id, trabajo) => {
    set({ isLoading: true });
    await delay(200);
    mockTrabajos = mockTrabajos.map(t => t.id === id ? { ...t, ...trabajo } : t);
    const sortedTrabajos = sortByStatus([...mockTrabajos]);
    set({ trabajos: sortedTrabajos, trabajosFiltrados: sortedTrabajos, isLoading: false });
  },

  deleteTrabajo: async (id) => {
    set({ isLoading: true });
    await delay(200);
    mockTrabajos = mockTrabajos.filter(t => t.id !== id);
    const sortedTrabajos = sortByStatus([...mockTrabajos]);
    set({ trabajos: sortedTrabajos, trabajosFiltrados: sortedTrabajos, isLoading: false });
  },

  updateEstado: async (id, estado, fechaEntrega) => {
    set({ isLoading: true });
    await delay(200);
    mockTrabajos = mockTrabajos.map(t => t.id === id ? { ...t, estado, fechaEntrega: estado === 'Terminado' ? (fechaEntrega || new Date().toISOString().split('T')[0]) : '' } : t);
    const sortedTrabajos = sortByStatus([...mockTrabajos]);
    set({ trabajos: sortedTrabajos, trabajosFiltrados: sortedTrabajos, isLoading: false });
  },

  applyFilters: async (filtros) => {
    set({ isLoading: true, filtros });
    await delay(100);
    let filteredData = [...mockTrabajos];
    if (filtros.tipoPA) {
      filteredData = filteredData.filter(trabajo => trabajo.tipoPA === filtros.tipoPA);
    }
    if (filtros.periodo) {
      filteredData = filteredData.filter(trabajo => trabajo.periodo === filtros.periodo);
    }
    if (filtros.proveedor) {
      filteredData = filteredData.filter(trabajo => trabajo.proveedor === filtros.proveedor);
    }
    if (filtros.fechaInicio && filtros.fechaFin) {
      filteredData = filteredData.filter(trabajo => {
        const fechaRegistro = new Date(trabajo.fechaRegistro);
        const fechaInicio = new Date(filtros.fechaInicio as string);
        const fechaFin = new Date(filtros.fechaFin as string);
        return fechaRegistro >= fechaInicio && fechaRegistro <= fechaFin;
      });
    }
    if (filtros.busqueda) {
      const searchTerm = (filtros.busqueda as string).toLowerCase();
      filteredData = filteredData.filter(trabajo =>
        trabajo.nombreCliente.toLowerCase().includes(searchTerm) ||
        trabajo.curso.toLowerCase().includes(searchTerm) ||
        trabajo.proveedor.toLowerCase().includes(searchTerm)
      );
    }
    set({ trabajosFiltrados: sortByStatus(filteredData), isLoading: false });
  }
}));

export default useTrabajoStore;