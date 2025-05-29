import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Mail, Lock } from 'lucide-react';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });
  
  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setLoading(true);
    
    try {
      await login(data.email, data.password, data.rememberMe);
    } catch (err) {
      console.error(err);
      setError('Credenciales inválidas. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed right-0 top-0 min-h-screen h-full flex items-center justify-end bg-transparent z-10">
      {/* Fondo de programación oscuro SOLO detrás del formulario */}
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-l-lg shadow-md my-16 mr-8 ml-auto relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full -z-10 bg-cover bg-center bg-no-repeat opacity-90 dark:opacity-95 dark:brightness-40 rounded-l-lg" style={{backgroundImage: "url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80')"}}></div>
        <div className="text-center relative z-10">
          <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">Iniciar Sesión</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Ingresa tus credenciales para acceder al sistema
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6 relative z-10">
          {error && (
            <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-200" role="alert">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <Input
              id="email"
              type="email"
              label="Correo electrónico"
              icon={<Mail className="w-5 h-5" />}
              {...register('email', { 
                required: 'El correo es requerido',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Correo inválido'
                }
              })}
              error={errors.email?.message}
              placeholder="admin@gmail.com"
            />
            <Input
              id="password"
              type="password"
              label="Contraseña"
              icon={<Lock className="w-5 h-5" />}
              {...register('password', { 
                required: 'La contraseña es requerida',
                minLength: {
                  value: 6,
                  message: 'La contraseña debe tener al menos 6 caracteres'
                }
              })}
              error={errors.password?.message}
              placeholder="••••••••"
            />
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                {...register('rememberMe')}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-offset-gray-800"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Mantener sesión iniciada
              </label>
            </div>
          </div>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={loading}
          >
            Iniciar Sesión
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;