import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, LogOut, BarChart2, Briefcase } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../ui/Button';
import ClockComponent from './Clock';

const Navbar: React.FC = () => {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };
  
  const navItems = [
    { name: 'Trabajos', path: '/', icon: <Briefcase className="h-5 w-5" /> },
    { name: 'Dashboard', path: '/dashboard', icon: <BarChart2 className="h-5 w-5" /> }
  ];
  
  return (
    <nav className="bg-white border-gray-200 px-4 py-2.5 shadow-md dark:bg-gray-800 dark:border-gray-700">
      <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
        <Link to="/" className="flex items-center">
          <Briefcase className="mr-3 h-8 w-8 text-blue-600 dark:text-blue-400" />
          <span className="self-center text-xl font-semibold whitespace-nowrap text-gray-900 dark:text-white">
            HEDSystem
          </span>
        </Link>
        
        <div className="flex items-center lg:order-2">
          <ClockComponent />
          
          <button
            onClick={toggleTheme}
            className="p-2 mr-2 ml-2 text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleLogout}
            className="hidden md:flex"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
          
          <button
            onClick={toggleMenu}
            type="button"
            className="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="mobile-menu-2"
            aria-expanded={isMenuOpen}
          >
            <span className="sr-only">Abrir menú principal</span>
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
        
        <div
          className={cn(
            "w-full lg:flex lg:w-auto lg:order-1",
            isMenuOpen ? "block" : "hidden"
          )}
          id="mobile-menu"
        >
          <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "block py-2 pr-4 pl-3 rounded lg:p-0 lg:hover:text-blue-600",
                    location.pathname === item.path
                      ? "text-white bg-blue-600 lg:bg-transparent lg:text-blue-600 dark:text-white"
                      : "text-gray-700 hover:bg-gray-100 lg:hover:bg-transparent dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent"
                  )}
                  aria-current={location.pathname === item.path ? "page" : undefined}
                >
                  <div className="flex items-center">
                    {item.icon}
                    <span className="ml-2">{item.name}</span>
                  </div>
                </Link>
              </li>
            ))}
            <li className="lg:hidden mt-4">
              <button
                onClick={handleLogout}
                className="flex w-full items-center py-2 px-3 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-red-400"
              >
                <LogOut className="mr-2 h-5 w-5" />
                Cerrar Sesión
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;