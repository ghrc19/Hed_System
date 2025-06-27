import { create } from 'zustand';
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

// Datos de prueba
let mockCursos: Curso[] = [
  { id: '1', nombre: 'Matemática' },
  { id: '2', nombre: 'Comunicación' },
  { id: '3', nombre: 'Ciencias' }
];
let mockProveedores: Proveedor[] = [
  { id: '1', nombre: 'Proveedor A', celular: '999888777' },
  { id: '2', nombre: 'Proveedor B', celular: '988877766' }
];
let mockPeriodos: Periodo[] = [
  { id: '1', nombre: '2025-I' },
  { id: '2', nombre: '2025-II' }
];

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const useCatalogoStore = create<CatalogoState>((set, get) => ({
  cursos: [],
  proveedores: [],
  periodos: [],
  isLoading: false,
  
  // Cursos
  fetchCursos: async () => {
    set({ isLoading: true });
    await delay(200);
    set({ cursos: [...mockCursos], isLoading: false });
  },
  
  addCurso: async (curso) => {
    set({ isLoading: true });
    await delay(200);
    const newCurso = { ...curso, id: Date.now().toString() };
    mockCursos.push(newCurso);
    set({ cursos: [...mockCursos], isLoading: false });
  },
  
  updateCurso: async (id, curso) => {
    set({ isLoading: true });
    await delay(200);
    mockCursos = mockCursos.map(c => c.id === id ? { ...c, ...curso } : c);
    set({ cursos: [...mockCursos], isLoading: false });
  },
  
  deleteCurso: async (id) => {
    set({ isLoading: true });
    await delay(200);
    mockCursos = mockCursos.filter(c => c.id !== id);
    set({ cursos: [...mockCursos], isLoading: false });
  },
  
  // Proveedores
  fetchProveedores: async () => {
    set({ isLoading: true });
    await delay(200);
    set({ proveedores: [...mockProveedores], isLoading: false });
  },
  
  addProveedor: async (proveedor) => {
    set({ isLoading: true });
    await delay(200);
    const newProveedor = { ...proveedor, id: Date.now().toString() };
    mockProveedores.push(newProveedor);
    set({ proveedores: [...mockProveedores], isLoading: false });
  },
  
  updateProveedor: async (id, proveedor) => {
    set({ isLoading: true });
    await delay(200);
    mockProveedores = mockProveedores.map(p => p.id === id ? { ...p, ...proveedor } : p);
    set({ proveedores: [...mockProveedores], isLoading: false });
  },
  
  deleteProveedor: async (id) => {
    set({ isLoading: true });
    await delay(200);
    mockProveedores = mockProveedores.filter(p => p.id !== id);
    set({ proveedores: [...mockProveedores], isLoading: false });
  },
  
  // Periodos
  fetchPeriodos: async () => {
    set({ isLoading: true });
    await delay(200);
    set({ periodos: [...mockPeriodos], isLoading: false });
  },
  
  addPeriodo: async (periodo) => {
    set({ isLoading: true });
    await delay(200);
    const newPeriodo = { ...periodo, id: Date.now().toString() };
    mockPeriodos.push(newPeriodo);
    set({ periodos: [...mockPeriodos], isLoading: false });
  },
  
  updatePeriodo: async (id, periodo) => {
    set({ isLoading: true });
    await delay(200);
    mockPeriodos = mockPeriodos.map(p => p.id === id ? { ...p, ...periodo } : p);
    set({ periodos: [...mockPeriodos], isLoading: false });
  },
  
  deletePeriodo: async (id) => {
    set({ isLoading: true });
    await delay(200);
    mockPeriodos = mockPeriodos.filter(p => p.id !== id);
    set({ periodos: [...mockPeriodos], isLoading: false });
  }
}));

export default useCatalogoStore;