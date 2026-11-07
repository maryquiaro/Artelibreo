import React, { useState } from 'react';
import { QuoteRequest } from '../types';
import { 
  Database, 
  Download, 
  Upload, 
  Search, 
  FileSpreadsheet, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Euro, 
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { exportDatabaseJson, importDatabaseJson, resetDatabaseToDefault } from '../services/storage';

interface AdminDatabaseProps {
  requests: QuoteRequest[];
  onSelectRequest: (requestId: string) => void;
}

export const AdminDatabase: React.FC<AdminDatabaseProps> = ({ requests, onSelectRequest }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [importError, setImportError] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Filter requests that have budgets issued
  const requestsWithBudget = requests.filter((r) => r.budget !== undefined);

  const filtered = requestsWithBudget.filter((r) => {
    const b = r.budget!;
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'accepted' && b.isAccepted) ||
      (statusFilter === 'pending' && !b.isAccepted);

    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term ||
      b.code.toLowerCase().includes(term) ||
      r.trackingCode.toLowerCase().includes(term) ||
      r.clientName.toLowerCase().includes(term) ||
      r.city.toLowerCase().includes(term) ||
      r.clientEmail.toLowerCase().includes(term);

    return matchesStatus && matchesSearch;
  });

  // Database metrics
  const totalBudgetVolume = requestsWithBudget.reduce((acc, r) => acc + (r.budget?.total || 0), 0);
  const acceptedVolume = requestsWithBudget
    .filter((r) => r.budget?.isAccepted)
    .reduce((acc, r) => acc + (r.budget?.total || 0), 0);
  const totalM2 = requestsWithBudget.reduce((acc, r) => acc + (r.surfaceAreaM2 || 0), 0);
  const conversionRate = requestsWithBudget.length > 0
    ? Math.round((requestsWithBudget.filter((r) => r.budget?.isAccepted).length / requestsWithBudget.length) * 100)
    : 0;

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Codigo_Presupuesto',
      'Codigo_Solicitud',
      'Cliente',
      'Email',
      'Telefono',
      'Ciudad',
      'Superficie_m2',
      'Subtotal_EUR',
      'IVA_EUR',
      'Total_EUR',
      'Garantia_Anos',
      'Estado',
      'Fecha_Emision',
      'Valido_Hasta'
    ];

    const rows = requestsWithBudget.map((r) => {
      const b = r.budget!;
      return [
        `"${b.code}"`,
        `"${r.trackingCode}"`,
        `"${r.clientName}"`,
        `"${r.clientEmail}"`,
        `"${r.clientPhone}"`,
        `"${r.city}"`,
        r.surfaceAreaM2,
        b.subtotal.toFixed(2),
        b.taxAmount.toFixed(2),
        b.total.toFixed(2),
        b.warrantyYears,
        b.isAccepted ? '"Aceptado"' : '"Emitido"',
        `"${new Date(b.createdAt).toLocaleDateString('es-ES')}"`,
        `"${new Date(b.validUntil).toLocaleDateString('es-ES')}"`
      ].join(';');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Artelibreo_Presupuestos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setActionNotice('Base de datos exportada a CSV exitosamente');
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Export full JSON Backup
  const handleExportJSON = () => {
    const json = exportDatabaseJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Artelibreo_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setActionNotice('Copia de seguridad JSON descargada');
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Import JSON Backup
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDatabaseJson(content);
      if (success) {
        setImportError(false);
        setActionNotice('Base de datos restaurada correctamente');
        setTimeout(() => setActionNotice(null), 4000);
      } else {
        setImportError(true);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="py-8 bg-neutral-50 min-h-[calc(100vh-140px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800">
              <Database className="w-4 h-4 text-amber-700" />
              <span>Gestión de Presupuestos Emitidos</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 mt-1">
              Base de Datos y Control Económico de Fachadas
            </h2>
            <p className="text-xs text-neutral-500">
              Registro histórico centralizado de todos los presupuestos emitidos, importes, garantías y estados de contratación.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="px-3 py-2 border border-neutral-300 bg-white text-neutral-700 rounded-lg text-xs font-medium hover:bg-neutral-50 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Copia JSON</span>
            </button>

            <label className="px-3 py-2 border border-neutral-300 bg-white text-neutral-700 rounded-lg text-xs font-medium hover:bg-neutral-50 flex items-center gap-1.5 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Importar</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Action notice banner */}
        {actionNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionNotice}</span>
          </div>
        )}

        {importError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-900 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
            <span>El archivo seleccionado no tiene un formato JSON válido de Artelibreo.</span>
          </div>
        )}

        {/* 4 Financial KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-xl border border-neutral-200/80 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1">
              <Euro className="w-3.5 h-3.5" />
              <span>Volumen Total Presupuestado</span>
            </div>
            <p className="text-2xl font-bold tracking-tight text-neutral-900 tabular-nums">
              {totalBudgetVolume.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
            </p>
            <p className="text-[11px] text-neutral-400 mt-0.5">En {requestsWithBudget.length} presupuestos</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-neutral-200/80 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Presupuestos Aceptados</span>
            </div>
            <p className="text-2xl font-bold tracking-tight text-emerald-800 tabular-nums">
              {acceptedVolume.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
            </p>
            <p className="text-[11px] text-emerald-600 mt-0.5">Cartera de obra confirmada</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-neutral-200/80 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs text-amber-800 mb-1">
              <Layers className="w-3.5 h-3.5 text-amber-700" />
              <span>Superficie Total Cotizada</span>
            </div>
            <p className="text-2xl font-bold tracking-tight text-neutral-900 tabular-nums">
              {totalM2.toLocaleString('es-ES')} m²
            </p>
            <p className="text-[11px] text-neutral-400 mt-0.5">Fachadas tratadas</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-neutral-200/80 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Ratio de Conversión</span>
            </div>
            <p className="text-2xl font-bold tracking-tight text-neutral-900 tabular-nums">
              {conversionRate}%
            </p>
            <p className="text-[11px] text-neutral-400 mt-0.5">Aceptación tras chat</p>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white p-3.5 rounded-xl border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar por código PRE-, cliente o ciudad..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-300 focus:outline-hidden focus:border-amber-600"
            />
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-neutral-500 whitespace-nowrap">Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-300 bg-neutral-50"
            >
              <option value="all">Todos ({requestsWithBudget.length})</option>
              <option value="accepted">Aceptados</option>
              <option value="pending">Pendientes de Aceptación</option>
            </select>
          </div>
        </div>

        {/* Database Table */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Código Presupuesto</th>
                  <th className="py-3 px-4 font-semibold">Cliente & Ubicación</th>
                  <th className="py-3 px-3 font-semibold text-right">Superficie</th>
                  <th className="py-3 px-3 font-semibold text-right">Subtotal</th>
                  <th className="py-3 px-3 font-semibold text-right">IVA</th>
                  <th className="py-3 px-4 font-semibold text-right">Total (€)</th>
                  <th className="py-3 px-3 font-semibold text-center">Garantía</th>
                  <th className="py-3 px-3 font-semibold text-center">Estado</th>
                  <th className="py-3 px-4 font-semibold text-center">Fecha Emisión</th>
                  <th className="py-3 px-3 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-10 text-center text-neutral-400 text-xs">
                      No hay presupuestos que coincidan con la búsqueda
                    </td>
                  </tr>
                ) : (
                  filtered.map((req) => {
                    const b = req.budget!;
                    return (
                      <tr key={b.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">
                          {b.code}
                          <span className="block text-[10px] text-neutral-400 font-normal">
                            Ref: {req.trackingCode}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-neutral-900 block truncate max-w-[180px]">
                            {req.clientName}
                          </span>
                          <span className="text-[11px] text-neutral-500 block truncate max-w-[180px]">
                            {req.city} · {req.propertyType.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right tabular-nums font-medium text-neutral-700">
                          {req.surfaceAreaM2} m²
                        </td>
                        <td className="py-3.5 px-3 text-right tabular-nums text-neutral-600">
                          {b.subtotal.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                        </td>
                        <td className="py-3.5 px-3 text-right tabular-nums text-neutral-500 text-[11px]">
                          {b.taxAmount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                        </td>
                        <td className="py-3.5 px-4 text-right tabular-nums font-bold text-neutral-950">
                          {b.total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                        </td>
                        <td className="py-3.5 px-3 text-center text-[11px] text-amber-800 font-medium">
                          {b.warrantyYears} años
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          {b.isAccepted ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Aceptado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              <Clock className="w-3 h-3" />
                              Enviado
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center text-neutral-500 text-[11px]">
                          {new Date(b.createdAt).toLocaleDateString('es-ES')}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <button
                            onClick={() => onSelectRequest(req.id)}
                            className="text-neutral-500 hover:text-neutral-900 p-1 text-xs font-semibold underline underline-offset-2"
                          >
                            Ver
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Database Utilities */}
        <div className="p-4 bg-white rounded-xl border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <div>
            <span>Gestión del almacenamiento local del navegador (Indexed / Storage Engine)</span>
          </div>
          <button
            onClick={() => {
              if (confirm('¿Deseas restaurar la base de datos a los datos de demostración iniciales de Artelibreo?')) {
                resetDatabaseToDefault();
                setActionNotice('Base de datos restaurada a valores por defecto');
                setTimeout(() => setActionNotice(null), 3000);
              }
            }}
            className="text-neutral-500 hover:text-red-700 font-medium flex items-center gap-1 text-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restaurar datos de muestra</span>
          </button>
        </div>

      </div>
    </div>
  );
};
