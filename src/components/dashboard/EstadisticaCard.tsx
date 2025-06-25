import React from 'react';
import { cn } from '../../lib/utils';

interface EstadisticaCardProps {
  titulo: string;
  valor: number | string;
  icono: React.ReactNode;
  colorClase?: string;
}

const EstadisticaCard: React.FC<EstadisticaCardProps> = ({
  titulo,
  valor,
  icono,
  colorClase = 'bg-blue-500'
}) => {
  const valorMostrado = typeof valor === 'string' && !isNaN(Number(valor))
    ? Number(valor).toLocaleString()
    : valor;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center">
      <div className={cn(
        'flex items-center justify-center rounded-full p-3 mr-4',
        colorClase.includes('bg-') ? colorClase : `bg-${colorClase}-500` 
      )}>
        {icono}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{titulo}</p>
        <p className="text-2xl font-semibold text-gray-900 dark:text-white">{valorMostrado}</p>
      </div>
    </div>
  );
};

export default EstadisticaCard;