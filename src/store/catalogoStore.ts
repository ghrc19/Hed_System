import { create } from 'zustand';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Curso, Proveedor, Periodo } from '../types';

interface CatalogoState {
  cursos: Curso[];
  proveedores: Proveedor[];
  periodos: Periodo[];
  isLoading: boolean;
  
  // Cursos
  fetchCursos: () => Promise<void>;
  addCurso: (curso: Curso) => Promise<void>;
  updateCurso: (id: string, curso: Curso) => Promise<void>;
  deleteCurso: (id: string) => Promise<void>;
  
  // Proveedores
  fetchProveedores: () => Promise<void>;
  addProveedor: (proveedor: Proveedor) => Promise<void>;
  updateProveedor: (id: string, proveedor: Proveedor) => Promise<void>;
  deleteProveedor: (id: string) => Promise<void>;
  
  // Periodos
  fetchPeriodos: () => Promise<void>;
  addPeriodo: (periodo: Periodo) => Promise<void>;
  updatePeriodo: (id: string, periodo: Periodo) => Promise<void>;
  deletePeriodo: (id: string) => Promise<void>;
}

const useCatalogoStore = create<CatalogoState>((set, get) => ({
  cursos: [],
  proveedores: [],
  periodos: [],
  isLoading: false,
  
  // Cursos
  fetchCursos: async () => {
    set({ isLoading: true });
    try {
      const querySnapshot = await getDocs(collection(db, 'cursos'));
      const cursosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Curso[];
      set({ cursos: cursosData, isLoading: false });
    } catch (error) {
      console.error('Error al obtener cursos:', error);
      set({ isLoading: false });
    }
  },
  
  addCurso: async (curso) => {
    set({ isLoading: true });
    try {
      await addDoc(collection(db, 'cursos'), curso);
      await get().fetchCursos();
    } catch (error) {
      console.error('Error al añadir curso:', error);
      set({ isLoading: false });
    }
  },
  
  updateCurso: async (id, curso) => {
    set({ isLoading: true });
    try {
      const cursoRef = doc(db, 'cursos', id);
      await updateDoc(cursoRef, { nombre: curso.nombre });
      await get().fetchCursos();
    } catch (error) {
      console.error('Error al actualizar curso:', error);
      set({ isLoading: false });
    }
  },
  
  deleteCurso: async (id) => {
    set({ isLoading: true });
    try {
      const cursoRef = doc(db, 'cursos', id);
      await deleteDoc(cursoRef);
      await get().fetchCursos();
    } catch (error) {
      console.error('Error al eliminar curso:', error);
      set({ isLoading: false });
    }
  },
  
  // Proveedores
  fetchProveedores: async () => {
    set({ isLoading: true });
    try {
      const querySnapshot = await getDocs(collection(db, 'proveedores'));
      const proveedoresData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Proveedor[];
      set({ proveedores: proveedoresData, isLoading: false });
    } catch (error) {
      console.error('Error al obtener proveedores:', error);
      set({ isLoading: false });
    }
  },
  
  addProveedor: async (proveedor) => {
    set({ isLoading: true });
    try {
      await addDoc(collection(db, 'proveedores'), proveedor);
      await get().fetchProveedores();
    } catch (error) {
      console.error('Error al añadir proveedor:', error);
      set({ isLoading: false });
    }
  },
  
  updateProveedor: async (id, proveedor) => {
    set({ isLoading: true });
    try {
      const proveedorRef = doc(db, 'proveedores', id);
      await updateDoc(proveedorRef, { 
        nombre: proveedor.nombre,
        celular: proveedor.celular 
      });
      await get().fetchProveedores();
    } catch (error) {
      console.error('Error al actualizar proveedor:', error);
      set({ isLoading: false });
    }
  },
  
  deleteProveedor: async (id) => {
    set({ isLoading: true });
    try {
      const proveedorRef = doc(db, 'proveedores', id);
      await deleteDoc(proveedorRef);
      await get().fetchProveedores();
    } catch (error) {
      console.error('Error al eliminar proveedor:', error);
      set({ isLoading: false });
    }
  },
  
  // Periodos
  fetchPeriodos: async () => {
    set({ isLoading: true });
    try {
      const querySnapshot = await getDocs(collection(db, 'periodos'));
      const periodosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Periodo[];
      set({ periodos: periodosData, isLoading: false });
    } catch (error) {
      console.error('Error al obtener periodos:', error);
      set({ isLoading: false });
    }
  },
  
  addPeriodo: async (periodo) => {
    set({ isLoading: true });
    try {
      await addDoc(collection(db, 'periodos'), periodo);
      await get().fetchPeriodos();
    } catch (error) {
      console.error('Error al añadir periodo:', error);
      set({ isLoading: false });
    }
  },
  
  updatePeriodo: async (id, periodo) => {
    set({ isLoading: true });
    try {
      const periodoRef = doc(db, 'periodos', id);
      await updateDoc(periodoRef, { nombre: periodo.nombre });
      await get().fetchPeriodos();
    } catch (error) {
      console.error('Error al actualizar periodo:', error);
      set({ isLoading: false });
    }
  },
  
  deletePeriodo: async (id) => {
    set({ isLoading: true });
    try {
      const periodoRef = doc(db, 'periodos', id);
      await deleteDoc(periodoRef);
      await get().fetchPeriodos();
    } catch (error) {
      console.error('Error al eliminar periodo:', error);
      set({ isLoading: false });
    }
  }
}));

export default useCatalogoStore;