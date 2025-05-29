import { create } from 'zustand';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from '../firebase/config';
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

const useTrabajoStore = create<TrabajoStore>((set, get) => ({
  trabajos: [],
  trabajosFiltrados: [],
  filtros: {},
  isLoading: false,

  fetchTrabajos: async () => {
    set({ isLoading: true });
    try {
      const querySnapshot = await getDocs(collection(db, 'trabajos'));
      const trabajosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Trabajo[];
      
      const sortedTrabajos = sortByStatus(trabajosData);
      
      set({ 
        trabajos: sortedTrabajos, 
        trabajosFiltrados: sortedTrabajos,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error al obtener trabajos:', error);
      set({ isLoading: false });
    }
  },

  addTrabajo: async (trabajo) => {
    set({ isLoading: true });
    try {
      await addDoc(collection(db, 'trabajos'), trabajo);
      await get().fetchTrabajos();
    } catch (error) {
      console.error('Error al añadir trabajo:', error);
      set({ isLoading: false });
    }
  },

  updateTrabajo: async (id, trabajo) => {
    set({ isLoading: true });
    try {
      const trabajoRef = doc(db, 'trabajos', id);
      await updateDoc(trabajoRef, trabajo);
      await get().fetchTrabajos();
    } catch (error) {
      console.error('Error al actualizar trabajo:', error);
      set({ isLoading: false });
    }
  },

  deleteTrabajo: async (id) => {
    set({ isLoading: true });
    try {
      const trabajoRef = doc(db, 'trabajos', id);
      await deleteDoc(trabajoRef);
      await get().fetchTrabajos();
    } catch (error) {
      console.error('Error al eliminar trabajo:', error);
      set({ isLoading: false });
    }
  },

  updateEstado: async (id, estado, fechaEntrega) => {
    set({ isLoading: true });
    try {
      const trabajoRef = doc(db, 'trabajos', id);
      const updateData: { estado: string; fechaEntrega?: string } = { estado };
      
      if (fechaEntrega) {
        updateData.fechaEntrega = fechaEntrega;
      }
      
      await updateDoc(trabajoRef, updateData);
      await get().fetchTrabajos();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      set({ isLoading: false });
    }
  },

  applyFilters: async (filtros) => {
    set({ isLoading: true, filtros });
    try {
      let filteredData = [...get().trabajos];
      
      if (filtros.tipoPA) {
        filteredData = filteredData.filter(trabajo => 
          trabajo.tipoPA === filtros.tipoPA
        );
      }
      
      if (filtros.periodo) {
        filteredData = filteredData.filter(trabajo => 
          trabajo.periodo === filtros.periodo
        );
      }
      
      if (filtros.proveedor) {
        filteredData = filteredData.filter(trabajo => 
          trabajo.proveedor === filtros.proveedor
        );
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
      
      set({ 
        trabajosFiltrados: sortByStatus(filteredData),
        isLoading: false 
      });
    } catch (error) {
      console.error('Error al aplicar filtros:', error);
      set({ isLoading: false });
    }
  }
}));

export default useTrabajoStore;