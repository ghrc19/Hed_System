export interface User {
  uid: string;
  email: string | null;
}

export interface Trabajo {
  id?: string;
  nombreCliente: string;
  proveedor: string;
  curso: string;
  tipoPA: string;
  tipoTrabajo: string;
  fechaRegistro: string;
  fechaEntrega: string;
  periodo: string;
  precio: number;
  url: string;
  estado: 'Pendiente' | 'Cancelado' | 'Terminado';
}

export interface Curso {
  id?: string;
  nombre: string;
}

export interface Proveedor {
  id?: string;
  nombre: string;
  celular: string;
}

export interface Periodo {
  id?: string;
  nombre: string;
}

export interface NotificacionProps {
  mensaje: string;
  tipo: 'success' | 'error' | 'info';
}

export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export type TiposPAOptions = 'PA-01' | 'PA-02' | 'PA-03' | 'EF' | 'ES';

export type TiposTrabajoOptions = 'Trabajo Individual' | 'Trabajo Grupal';

export type EstadoOptions = 'Pendiente' | 'Cancelado' | 'Terminado';

export interface FilterOptions {
  tipoPA?: string;
  periodo?: string;
  proveedor?: string;
  busqueda?: string;
  fechaInicio?: string;
  fechaFin?: string;
  mes?: string;
}