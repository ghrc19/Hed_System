import React, { useEffect, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import EstadisticaCard from '../components/dashboard/EstadisticaCard';
import GraficoEstados from '../components/dashboard/GraficoEstados';
import GraficoTipoPA from '../components/dashboard/GraficoTipoPA';
import { BarChart2, DollarSign, FileText, CheckCircle, Clock, Calendar } from 'lucide-react';
import { FaFilePdf } from 'react-icons/fa';
import useTrabajoStore from '../store/trabajosStore';
import useCatalogoStore from '../store/catalogoStore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const DashboardPage: React.FC = () => {
  const { trabajos, fetchTrabajos } = useTrabajoStore();
  const { periodos, fetchPeriodos } = useCatalogoStore();
  const [proveedorFiltro, setProveedorFiltro] = useState<string>('Todos');
  const [tipoPAFiltro, setTipoPAFiltro] = useState<string>('Todos');
  const [periodoFiltro, setPeriodoFiltro] = useState<string>('Todos');
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  const anioActual = new Date().getFullYear();
  const anios = Array.from(new Set(trabajos.map(t => new Date(t.fechaRegistro).getFullYear())));
  if (!anios.includes(anioActual)) anios.push(anioActual);
  anios.sort((a, b) => b - a);
  const [mesFiltro, setMesFiltro] = useState<string>('Todos');
  const [anioFiltro, setAnioFiltro] = useState<number>(anioActual);

  useEffect(() => {
    fetchTrabajos();
    fetchPeriodos();
  }, [fetchTrabajos, fetchPeriodos]);

  const proveedores = ['Todos', ...Array.from(new Set(trabajos.map(t => t.proveedor).filter(Boolean)))];
  const tiposPA = ['Todos', ...Array.from(new Set(trabajos.map(t => t.tipoPA).filter(Boolean)))];
  const periodosFiltro = ['Todos', ...periodos.map(p => p.nombre).sort((a, b) => a.localeCompare(b, 'es', { numeric: true }))];

  const trabajosFiltrados = trabajos.filter(trabajo => {
    const proveedorOk = proveedorFiltro === 'Todos' || trabajo.proveedor === proveedorFiltro;
    const tipoPAOk = tipoPAFiltro === 'Todos' || trabajo.tipoPA === tipoPAFiltro;
    const fecha = new Date(trabajo.fechaRegistro);
    const mesOk = mesFiltro === 'Todos' || fecha.getMonth().toString() === mesFiltro;
    const anioOk = fecha.getFullYear() === anioFiltro;
    const periodoOk = !periodoFiltro || periodoFiltro === 'Todos' || trabajo.periodo === periodoFiltro;
    return proveedorOk && tipoPAOk && mesOk && anioOk && periodoOk;
  });

  const contarTrabajosCompletados = () => {
    return trabajosFiltrados.filter(trabajo => trabajo.estado === 'Terminado').length;
  };

  const contarTrabajosPendientes = () => {
    return trabajosFiltrados.filter(trabajo => trabajo.estado === 'Pendiente').length;
  };

  const calcularIngresoTotal = () => {
    return trabajosFiltrados
      .filter(trabajo => trabajo.estado === 'Terminado')
      .reduce((total, trabajo) => total + Number(trabajo.precio || 0), 0);
  };

  const obtenerMesActual = () => {
    if (mesFiltro === 'Todos') return 'Todos';
    const idx = parseInt(mesFiltro, 10);
    return isNaN(idx) ? 'Todos' : meses[idx];
  };

  const exportarPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    let filtroProveedor = proveedorFiltro !== 'Todos' ? proveedorFiltro : 'Todos los proveedores';
    let filtroTipoPA = tipoPAFiltro !== 'Todos' ? tipoPAFiltro : 'Todos los tipos';
    let filtroMes = 'Todos';
    if (mesFiltro !== 'Todos') {
      const idx = parseInt(mesFiltro, 10);
      if (!isNaN(idx)) {
        filtroMes = meses[idx].charAt(0).toUpperCase() + meses[idx].slice(1);
      }
    }
    let filtroAnio = anioFiltro;
    const total = trabajosFiltrados
      .filter(trabajo => trabajo.estado === 'Terminado')
      .reduce((sum, trabajo) => sum + Number(trabajo.precio || 0), 0);

    // Eliminados iconos y variables no usadas
    let isFirstPage = true;
    const header = () => {
      doc.setDrawColor(44, 62, 80);
      doc.setLineWidth(2);
      doc.roundedRect(30, 30, doc.internal.pageSize.getWidth() - 60, doc.internal.pageSize.getHeight() - 60, 18, 18, 'S');
      if (isFirstPage) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(44, 62, 80);
        doc.setFontSize(22);
        doc.text(`Reporte de Trabajos`, 40, 48, { baseline: 'top' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(13);
        doc.setTextColor(54, 79, 107);
        doc.text(`Proveedor: ${filtroProveedor}`, 40, 72, { baseline: 'top' });
        doc.text(`Tipo de PA: ${filtroTipoPA}`, 300, 72, { baseline: 'top' });
        doc.text(`Mes: ${filtroMes}`, 40, 92, { baseline: 'top' });
        doc.text(`Año: ${filtroAnio}`, 300, 92, { baseline: 'top' });
        isFirstPage = false;
      }
    };

    autoTable(doc, {
      head: [["Cliente", "Curso", "Fecha", "Estado", "Precio"]],
      body: trabajosFiltrados.map(trabajo => [
        trabajo.nombreCliente,
        trabajo.curso,
        trabajo.fechaRegistro,
        trabajo.estado,
        trabajo.precio ? `S/ ${Number(trabajo.precio).toLocaleString()}` : 'S/ 0'
      ]),
      startY: 110,
      styles: { fontSize: 11, font: 'helvetica', textColor: [44, 62, 80], lineColor: [54, 79, 107], lineWidth: 0.5 },
      headStyles: { fillColor: [54, 79, 107], textColor: [255,255,255], fontStyle: 'bold', fontSize: 12 },
      bodyStyles: { fillColor: [245, 247, 250] },
      alternateRowStyles: { fillColor: [230, 236, 245] },
      margin: { left: 50, right: 50 },
      tableLineColor: [44, 62, 80],
      tableLineWidth: 0.5,
      didDrawPage: () => {
        header();
      }
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 110;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(44, 62, 80);
    const totalText = `Total: S/ ${total.toLocaleString()}`;
    const pageWidth = doc.internal.pageSize.getWidth();
    const textWidth = doc.getTextWidth(totalText);
    doc.text(totalText, pageWidth - textWidth - 80, finalY + 40, { baseline: 'top' });

    const proveedorNombre = proveedorFiltro !== 'Todos' ? proveedorFiltro.replace(/\s+/g, '_') : 'TodosLosProveedores';
    const fechaHoy = new Date();
    const fechaStr = `${fechaHoy.getFullYear()}-${(fechaHoy.getMonth()+1).toString().padStart(2,'0')}-${fechaHoy.getDate().toString().padStart(2,'0')}`;
    const nombreArchivo = `${proveedorNombre}_${fechaStr}.pdf`;
    doc.save(nombreArchivo);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-2 sm:px-4 py-8 w-full max-w-7xl">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center md:text-left">Dashboard</h1>
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-end w-full">
          {/* Filtros */}
          <div className="flex flex-col">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">
              <span className="inline-flex items-center gap-1">
                <BarChart2 className="w-4 h-4 text-blue-500" /> Proveedor
              </span>
            </label>
            <select
              className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all shadow-sm hover:border-blue-400"
              value={proveedorFiltro}
              onChange={e => setProveedorFiltro(e.target.value)}
            >
              {proveedores.map(prov => (
                <option key={prov} value={prov}>{prov}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-4 h-4 text-purple-500" /> Tipo de PA
              </span>
            </label>
            <select
              className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all shadow-sm hover:border-purple-400"
              value={tipoPAFiltro}
              onChange={e => setTipoPAFiltro(e.target.value)}
            >
              {tiposPA.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>
          {/* Filtro de Periodo */}
          <div className="flex flex-col">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-4 h-4 text-green-500" /> Periodo
              </span>
            </label>
            <select
              className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all shadow-sm hover:border-green-400"
              value={periodoFiltro}
              onChange={e => setPeriodoFiltro(e.target.value)}
            >
              {periodosFiltro.map(periodo => (
                <option key={periodo} value={periodo}>{periodo}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-4 h-4 text-indigo-500" /> Mes
              </span>
            </label>
            <select
              className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all shadow-sm hover:border-indigo-400"
              value={mesFiltro}
              onChange={e => setMesFiltro(e.target.value)}
            >
              <option value="Todos">Todos</option>
              {meses.map((mes, idx) => (
                <option key={mes} value={idx.toString()}>{mes.charAt(0).toUpperCase() + mes.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-4 h-4 text-amber-500" /> Año
              </span>
            </label>
            <select
              className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all shadow-sm hover:border-amber-400"
              value={anioFiltro}
              onChange={e => setAnioFiltro(Number(e.target.value))}
            >
              {anios.map(anio => (
                <option key={anio} value={anio}>{anio}</option>
              ))}
            </select>
          </div>
          {/* Botón de exportar PDF al lado de los filtros */}
          <button
            onClick={exportarPDF}
            className="p-2 rounded-lg bg-red-600 text-white shadow hover:bg-red-700 transition-colors flex items-center h-10 mt-6"
            title="Exportar a PDF"
          >
            <FaFilePdf className="h-6 w-6" />
          </button>
        </div>
        <div id="dashboard-export">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 w-full">
            <EstadisticaCard
              titulo="Total de Trabajos"
              valor={trabajosFiltrados.length}
              icono={<FileText className="h-6 w-6 text-white" />}
              colorClase="bg-blue-500"
            />
            <EstadisticaCard
              titulo="Trabajos Completados"
              valor={contarTrabajosCompletados()}
              icono={<CheckCircle className="h-6 w-6 text-white" />}
              colorClase="bg-green-500"
            />
            <EstadisticaCard
              titulo="Trabajos Pendientes"
              valor={contarTrabajosPendientes()}
              icono={<Clock className="h-6 w-6 text-white" />}
              colorClase="bg-yellow-500"
            />
            <EstadisticaCard
              titulo={`Ingresos (${obtenerMesActual()})`}
              valor={`S/ ${calcularIngresoTotal()}`}
              icono={<DollarSign className="h-6 w-6 text-white" />}
              colorClase="bg-purple-500"
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 w-full">
            <GraficoEstados trabajos={trabajosFiltrados} />
            <GraficoTipoPA trabajos={trabajosFiltrados} />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 w-full overflow-x-auto">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Resumen de Actividad Reciente
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Cliente
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Curso
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Fecha
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {trabajosFiltrados.length > 0 ? (
                    trabajosFiltrados.slice(0, 5).map((trabajo) => (
                      <tr key={trabajo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {trabajo.nombreCliente}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {trabajo.curso}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {trabajo.fechaRegistro}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${trabajo.estado === 'Pendiente' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 
                              trabajo.estado === 'Terminado' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}
                          >
                            {trabajo.estado}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        No hay trabajos disponibles
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;