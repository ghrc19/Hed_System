import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center bg-gray-100 dark:bg-gray-900">
      <div className="flex flex-col md:flex-row w-full max-w-5xl min-h-screen">
        <div className="hidden md:block flex-1 relative">
          <img
            src="https://images.unsplash.com/photo-1453928582365-b6ad33cbcf64?auto=format&fit=crop&w=1500&q=80"
            alt="Fondo programación oscuro"
            className="fixed inset-0 w-full h-full object-cover z-0 brightness-50 dark:brightness-40"
            style={{ pointerEvents: 'none' }}
          />
        </div>
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-white dark:bg-gray-800 rounded-l-lg shadow-md my-8 md:my-16 mx-auto w-full max-w-md">
          <button
            type="button"
            onClick={toggleTheme}
            className="fixed top-4 right-4 z-50 p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-200"
            aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            tabIndex={0}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-blue-600" />
            )}
          </button>
          <div className="max-w-md w-full z-10">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;