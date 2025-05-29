import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trabajo } from '../../types';

interface GraficoTipoPAProps {
  trabajos: Trabajo[];
}

const GraficoTipoPA: React.FC<GraficoTipoPAProps> = ({ trabajos }) => {
  const contarPorTipoPA = () => {
    const conteo: Record<string, number> = {};
    
    trabajos.forEach(trabajo => {
      if (!conteo[trabajo.tipoPA]) {
        conteo[trabajo.tipoPA] = 0;
      }
      conteo[trabajo.tipoPA]++;
    });
    
    return Object.keys(conteo).map(tipo => ({
      tipoPA: tipo,
      cantidad: conteo[tipo]
    }));
  };
  
  const data = contarPorTipoPA();
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-80">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Trabajos por Tipo de PA</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="tipoPA" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="cantidad" name="Cantidad" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoTipoPA;