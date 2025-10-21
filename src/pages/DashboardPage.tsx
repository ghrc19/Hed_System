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

const ExcelJS = window.ExcelJS;

const DashboardPage: React.FC = () => {
  const { trabajos, fetchTrabajos } = useTrabajoStore();
  const { periodos, fetchPeriodos, periodoActivo, tipoPAActivo } = useCatalogoStore();
  const [proveedorFiltro, setProveedorFiltro] = useState<string>('Todos');
  const [tipoPAFiltro, setTipoPAFiltro] = useState<string[]>(['Todos']);
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

  // Efecto para establecer valores activos como predeterminados
  useEffect(() => {
    if (tipoPAActivo && tipoPAFiltro.includes('Todos')) {
      setTipoPAFiltro([tipoPAActivo]);
    }
  }, [tipoPAActivo]);

  useEffect(() => {
    if (periodoActivo && periodoFiltro === 'Todos') {
      setPeriodoFiltro(periodoActivo.nombre);
    }
  }, [periodoActivo]);

  const proveedores = ['Todos', ...Array.from(new Set(trabajos.map(t => t.proveedor).filter(Boolean)))];
  const periodosFiltro = ['Todos', ...periodos.map(p => p.nombre).sort((a, b) => a.localeCompare(b, 'es', { numeric: true }))];

  const trabajosFiltrados = trabajos
    .filter(trabajo => {
      const proveedorOk = proveedorFiltro === 'Todos' || trabajo.proveedor === proveedorFiltro;
      const tipoPAOk = tipoPAFiltro.includes('Todos') || tipoPAFiltro.includes(trabajo.tipoPA);
      const fecha = new Date(trabajo.fechaRegistro);
      const mesOk = mesFiltro === 'Todos' || fecha.getMonth().toString() === mesFiltro;
      const anioOk = fecha.getFullYear() === anioFiltro;
      const periodoOk = !periodoFiltro || periodoFiltro === 'Todos' || trabajo.periodo === periodoFiltro;
      return proveedorOk && tipoPAOk && mesOk && anioOk && periodoOk;
    })
    .sort((a, b) => new Date(a.fechaRegistro).getTime() - new Date(b.fechaRegistro).getTime());

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

    const encabezados = [
      "Nro", "Cliente", "Curso", "Fecha de Registro", "Fecha de Entrega", "Precio", "Proveedor", "TipoPA", "Periodo"
    ];

    const datos = trabajosFiltrados.map((trabajo, idx) => ([
      idx + 1,
      trabajo.nombreCliente,
      trabajo.curso,
      trabajo.fechaRegistro,
      trabajo.fechaEntrega || '',
      trabajo.precio ? `S/ ${Number(trabajo.precio).toLocaleString()}` : 'S/ 0',
      trabajo.proveedor,
      trabajo.tipoPA,
      trabajo.periodo
    ]));

    const subtotal = datos.reduce((acc, curr) => acc + (typeof curr[5] === 'number' ? curr[5] : Number(curr[5].toString().replace(/[^\d.]/g, ''))), 0);

    const subtotalRow = ["", "", "", "", "", `S/ ${subtotal.toLocaleString()}`, "", "", "SUBTOTAL"];


    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(44, 62, 80);
    doc.text('Reporte de Trabajos', 40, 40);


    doc.setDrawColor(54, 79, 107);
    doc.setLineWidth(1.2);
    doc.roundedRect(35, 55, 500, 80, 10, 10, 'S');
    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(54, 79, 107);
    let filtroProveedor = proveedorFiltro !== 'Todos' ? proveedorFiltro : 'Todos los proveedores';
    let filtroTipoPA = tipoPAFiltro.includes('Todos') ? 'Todos los tipos' : tipoPAFiltro.join(', ');
    let filtroPeriodo = periodoFiltro !== 'Todos' ? periodoFiltro : 'Todos los periodos';
    let filtroMes = 'Todos';
    if (mesFiltro !== 'Todos') {
      const idx = parseInt(mesFiltro, 10);
      if (!isNaN(idx)) {
        filtroMes = meses[idx].charAt(0).toUpperCase() + meses[idx].slice(1);
      }
    }
    let filtroAnio = anioFiltro;
    doc.text(`Proveedor: ${filtroProveedor}`, 45, 75);
    doc.text(`Tipo de PA: ${filtroTipoPA}`, 250, 75);
    doc.text(`Periodo: ${filtroPeriodo}`, 45, 95);
    doc.text(`Mes: ${filtroMes}`, 250, 95);
    doc.text(`Año: ${filtroAnio}`, 45, 115);


    autoTable(doc, {
      head: [encabezados],
      body: [...datos, subtotalRow],
      startY: 145,
      styles: { fontSize: 10, font: 'helvetica', textColor: [44, 62, 80], lineColor: [54, 79, 107], lineWidth: 0.5 },
      headStyles: { fillColor: [54, 79, 107], textColor: [255,255,255], fontStyle: 'bold', fontSize: 12 },
      bodyStyles: { fillColor: [245, 247, 250] },
      alternateRowStyles: { fillColor: [230, 236, 245] },
      margin: { left: 30, right: 30 },
      tableLineColor: [44, 62, 80],
      tableLineWidth: 0.5,
    });


    const proveedorNombre = proveedorFiltro !== 'Todos' ? proveedorFiltro.replace(/\s+/g, '_') : 'TodosLosProveedores';
    const fechaHoy = new Date();
    const fechaStr = `${fechaHoy.getFullYear()}-${(fechaHoy.getMonth()+1).toString().padStart(2,'0')}-${fechaHoy.getDate().toString().padStart(2,'0')}`;
    const nombreArchivo = `${proveedorNombre}_${fechaStr}.pdf`;
    doc.save(nombreArchivo);
  };

  const exportarExcel = () => {
    if (!ExcelJS || !ExcelJS.Workbook) {
      alert('ExcelJS no está disponible. Asegúrate de incluir el script CDN en tu index.html.');
      return;
    }

    const datos = trabajosFiltrados.map((trabajo, idx) => ([
      idx + 1,
      trabajo.nombreCliente,
      trabajo.curso,
      trabajo.fechaRegistro,
      trabajo.fechaEntrega || '',
      typeof trabajo.precio === 'number' ? trabajo.precio : Number(trabajo.precio || 0),
      trabajo.proveedor,
      trabajo.tipoPA,
      trabajo.periodo
    ]));

    const subtotal = datos.reduce((acc, curr) => acc + (typeof curr[5] === 'number' ? curr[5] : Number(curr[5])), 0);

    const proveedorNombre = proveedorFiltro !== 'Todos' ? proveedorFiltro.replace(/\s+/g, '_') : 'TodosLosProveedores';
    const fechaHoy = new Date();
    const fechaStr = `${fechaHoy.getFullYear()}-${(fechaHoy.getMonth()+1).toString().padStart(2,'0')}-${fechaHoy.getDate().toString().padStart(2,'0')}`;
    const nombreArchivo = `${proveedorNombre}_${fechaStr}.xlsx`;


    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Trabajos');


    worksheet.addRow(["Nro", "Cliente", "Curso", "Fecha de Registro", "Fecha de Entrega", "Precio", "Proveedor", "TipoPA", "Periodo"]);

    datos.forEach(row => worksheet.addRow(row));

    const subtotalRow = worksheet.addRow(["", "", "", "", "", subtotal, "", "", "SUBTOTAL"]);


    worksheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '25619B' }
      };
      cell.alignment = { horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: '25619B' } },
        bottom: { style: 'thin', color: { argb: '25619B' } },
        left: { style: 'thin', color: { argb: '25619B' } },
        right: { style: 'thin', color: { argb: '25619B' } }
      };
    });

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      row.eachCell(cell => {
        cell.alignment = { horizontal: 'center' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'B0B0B0' } },
          bottom: { style: 'thin', color: { argb: 'B0B0B0' } },
          left: { style: 'thin', color: { argb: 'B0B0B0' } },
          right: { style: 'thin', color: { argb: 'B0B0B0' } }
        };
      });
    });

    subtotalRow.eachCell(cell => {
      cell.font = { bold: true, color: { argb: '25619B' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FDE68A' }
      };
    });

    worksheet.columns = [
      { width: 5 },
      { width: 18 },
      { width: 18 },
      { width: 14 },
      { width: 14 },
      { width: 10 },
      { width: 18 },
      { width: 10 },
      { width: 12 }
    ];


    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nombreArchivo;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-2 sm:px-4 py-8 w-full max-w-7xl">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center md:text-left">Dashboard</h1>
        <div className="mb-8 w-full">
        
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-wrap gap-6 items-center justify-between">
            
            <div className="flex flex-col items-start min-w-[180px]">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <span className="inline-flex items-center gap-1">
                  <BarChart2 className="w-4 h-4 text-blue-500" /> Proveedor
                </span>
              </label>
              <select
                className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all shadow-sm hover:border-blue-400"
                value={proveedorFiltro}
                onChange={e => setProveedorFiltro(e.target.value)}
              >
                {proveedores.map(prov => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col items-start min-w-[220px] h-full justify-between">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-purple-500" /> Tipo de PA
                </span>
              </label>
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 w-full flex flex-row gap-3 flex-wrap items-center min-h-[44px]">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={tipoPAFiltro.includes('Todos')}
                    onChange={() => setTipoPAFiltro(['Todos'])}
                    className="form-checkbox h-5 w-5 text-purple-600 dark:bg-gray-700 dark:border-gray-500 focus:ring-2 focus:ring-purple-400"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">Todos</span>
                </label>
                {['PA-01', 'PA-02', 'PA-03', 'EF', 'ES'].map(tipo => (
                  <label key={tipo} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={tipoPAFiltro.includes(tipo)}
                      onChange={() => {
                        if (tipoPAFiltro.includes('Todos')) {
                          setTipoPAFiltro([tipo]);
                        } else if (tipoPAFiltro.includes(tipo)) {
                          const nuevos = tipoPAFiltro.filter(t => t !== tipo);
                          setTipoPAFiltro(nuevos.length === 0 ? ['Todos'] : nuevos);
                        } else {
                          setTipoPAFiltro([...tipoPAFiltro, tipo]);
                        }
                      }}
                      className="form-checkbox h-5 w-5 text-purple-600 dark:bg-gray-700 dark:border-gray-500 focus:ring-2 focus:ring-purple-400"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">{tipo}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col items-start min-w-[180px]">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-green-500" /> Periodo
                </span>
              </label>
              <select
                className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-400 transition-all shadow-sm hover:border-green-400"
                value={periodoFiltro}
                onChange={e => setPeriodoFiltro(e.target.value)}
              >
                {periodosFiltro.map(periodo => (
                  <option key={periodo} value={periodo}>{periodo}</option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col items-start min-w-[180px]">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-indigo-500" /> Mes
                </span>
              </label>
              <select
                className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all shadow-sm hover:border-indigo-400"
                value={mesFiltro}
                onChange={e => setMesFiltro(e.target.value)}
              >
                <option value="Todos">Todos</option>
                {meses.map((mes, idx) => (
                  <option key={mes} value={idx.toString()}>{mes.charAt(0).toUpperCase() + mes.slice(1)}</option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col items-start min-w-[120px]">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-amber-500" /> Año
                </span>
              </label>
              <select
                className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all shadow-sm hover:border-amber-400"
                value={anioFiltro}
                onChange={e => setAnioFiltro(Number(e.target.value))}
              >
                {anios.map(anio => (
                  <option key={anio} value={anio}>{anio}</option>
                ))}
              </select>
            </div>
            
            <div className="w-full flex justify-center items-center mt-4">
              <div className="flex gap-4">
                <button
                  onClick={exportarPDF}
                  className="px-6 py-2 rounded-lg bg-red-600 text-white shadow hover:bg-red-700 transition-colors flex items-center gap-2 h-12 text-base font-semibold"
                  title="Exportar a PDF"
                >
                  <FaFilePdf className="h-6 w-6" />
                  Exportar
                </button>
                <button
                  onClick={exportarExcel}
                  className="px-6 py-2 rounded-lg bg-green-600 text-white shadow hover:bg-green-700 transition-colors flex items-center gap-2 h-12 text-base font-semibold"
                  title="Exportar a Excel"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" fill="#fff"/><path stroke="#22c55e" strokeWidth="2" d="M8 8l8 8M16 8l-8 8"/></svg>
                  Exportar Excel
                </button>
              </div>
            </div>
          </div>
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