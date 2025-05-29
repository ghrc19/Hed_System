import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Trabajo } from '../../types';

interface GraficoEstadosProps {
  trabajos: Trabajo[];
}

const COLORS = ['#3b82f6', '#22c55e', '#eab308'];

const GraficoEstados: React.FC<GraficoEstadosProps> = ({ trabajos }) => {
  const contarPorEstado = () => {
    const conteo = {
      Pendiente: 0,
      Terminado: 0,
      Cancelado: 0
    };
    
    trabajos.forEach(trabajo => {
      conteo[trabajo.estado]++;
    });
    
    return [
      { name: 'Pendientes', value: conteo.Pendiente },
      { name: 'Terminados', value: conteo.Terminado },
      { name: 'Cancelados', value: conteo.Cancelado }
    ];
  };
  
  const data = contarPorEstado();
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-80">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Distribución por Estado</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoEstados;