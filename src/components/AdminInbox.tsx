import React, { useState } from 'react';
import { QuoteRequest } from '../types';
import { 
  Search, 
  Filter, 
  MessageSquare, 
  FileEdit, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  X,
  ExternalLink,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { updateQuoteRequestStatus } from '../services/storage';

interface AdminInboxProps {
  requests: QuoteRequest[];
  onOpenBudgetBuilder: (request: QuoteRequest) => void;
  onOpenChat: (requestId: string) => void;
}

export const AdminInbox: React.FC<AdminInboxProps> = ({
  requests,
  onOpenBudgetBuilder,
  onOpenChat,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState<string>(requests[0]?.id || '');
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null);

  const selectedRequest = requests.find((r) => r.id === selectedRequestId) || requests[0];

  const filteredRequests = requests.filter((r) => {
    const matchesFilter = filterStatus === 'all' || r.status === filterStatus;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      r.clientName.toLowerCase().includes(q) ||
      r.clientEmail.toLowerCase().includes(q) ||
      r.city.toLowerCase().includes(q) ||
      r.trackingCode.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const handleStatusChange = (newStatus: QuoteRequest['status']) => {
    if (!selectedRequest) return;
    updateQuoteRequestStatus(selectedRequest.id, newStatus);
  };

  const getStatusBadge = (status: QuoteRequest['status']) => {
    switch (status) {
      case 'pendiente':
        return { label: 'Pendiente Revisión', color: 'bg-amber-100 text-amber-900 border-amber-200' };
      case 'en_analisis':
        return { label: 'En Análisis Técnico', color: 'bg-blue-100 text-blue-900 border-blue-200' };
      case 'presupuesto_enviado':
        return { label: 'Presupuesto Enviado', color: 'bg-indigo-100 text-indigo-900 border-indigo-200' };
      case 'aceptado':
        return { label: 'Aceptado por Cliente', color: 'bg-emerald-100 text-emerald-900 border-emerald-200 font-bold' };
      case 'en_ejecucion':
        return { label: 'En Obra', color: 'bg-purple-100 text-purple-900 border-purple-200' };
      case 'completado':
        return { label: 'Finalizado', color: 'bg-neutral-100 text-neutral-800 border-neutral-200' };
      default:
        return { label: status, color: 'bg-neutral-100 text-neutral-600 border-neutral-200' };
    }
  };

  return (
    <div className="py-8 bg-neutral-50 min-h-[calc(100vh-140px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Admin Dashboard Metric Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-xl border border-neutral-200/80 shadow-xs">
            <span className="text-xs text-neutral-500 block">Total Solicitudes</span>
            <span className="text-2xl font-bold text-neutral-900 tabular-nums">{requests.length}</span>
            <span className="text-[11px] text-neutral-400 block mt-0.5">Inbound histórico</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-neutral-200/80 shadow-xs">
            <span className="text-xs text-amber-700 block font-medium">Pendientes de Presupuesto</span>
            <span className="text-2xl font-bold text-amber-800 tabular-nums">
              {requests.filter((r) => r.status === 'pendiente' || r.status === 'en_analisis').length}
            </span>
            <span className="text-[11px] text-amber-600 block mt-0.5">Requieren cotización</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-neutral-200/80 shadow-xs">
            <span className="text-xs text-indigo-700 block font-medium">Presupuestos Emitidos</span>
            <span className="text-2xl font-bold text-indigo-900 tabular-nums">
              {requests.filter((r) => r.budget).length}
            </span>
            <span className="text-[11px] text-indigo-500 block mt-0.5">Propuestas activas</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-neutral-200/80 shadow-xs">
            <span className="text-xs text-emerald-700 block font-medium">Presupuestos Aceptados</span>
            <span className="text-2xl font-bold text-emerald-800 tabular-nums">
              {requests.filter((r) => r.status === 'aceptado' || r.status === 'en_ejecucion').length}
            </span>
            <span className="text-[11px] text-emerald-600 block mt-0.5">Obras en marcha</span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          {/* Segmented Filter Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'Todas' },
              { id: 'pendiente', label: 'Pendientes' },
              { id: 'en_analisis', label: 'En Análisis' },
              { id: 'presupuesto_enviado', label: 'Con Presupuesto' },
              { id: 'aceptado', label: 'Aceptadas' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterStatus(f.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  filterStatus === f.id
                    ? 'bg-neutral-900 text-white font-semibold'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por cliente, ciudad o código..."
              className="w-full sm:w-72 pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-300 focus:outline-hidden focus:border-amber-600"
            />
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Master-Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Requests List */}
          <div className="lg:col-span-5 space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
            {filteredRequests.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-neutral-200 text-center text-xs text-neutral-500">
                No se encontraron solicitudes con este criterio
              </div>
            ) : (
              filteredRequests.map((req) => {
                const isSelected = selectedRequest?.id === req.id;
                const badge = getStatusBadge(req.status);

                return (
                  <div
                    key={req.id}
                    onClick={() => setSelectedRequestId(req.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer text-left bg-white ${
                      isSelected
                        ? 'border-amber-600 ring-2 ring-amber-500/20 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[11px] font-mono font-bold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded">
                        {req.trackingCode}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-neutral-900 truncate">
                      {req.clientName}
                    </h4>

                    <div className="text-xs text-neutral-500 mt-0.5 flex items-center gap-2">
                      <span className="truncate">{req.city}</span>
                      <span>·</span>
                      <span className="tabular-nums font-medium text-neutral-700">{req.surfaceAreaM2} m²</span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
                      <span>{new Date(req.createdAt).toLocaleDateString('es-ES')}</span>
                      <span className="flex items-center gap-1 font-medium text-neutral-600">
                        {req.photos.length} fotos adjuntas
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Selected Request Inspection & Action Center */}
          <div className="lg:col-span-7">
            {selectedRequest ? (
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-6 space-y-6">
                
                {/* Header with quick status updater */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded">
                        {selectedRequest.trackingCode}
                      </span>
                      <span className="text-xs text-neutral-400">
                        Recibida: {new Date(selectedRequest.createdAt).toLocaleString('es-ES')}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-neutral-950">
                      {selectedRequest.clientName}
                    </h3>
                  </div>

                  {/* Status Change Selector */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-neutral-500 font-medium whitespace-nowrap">Estado:</label>
                    <select
                      value={selectedRequest.status}
                      onChange={(e) => handleStatusChange(e.target.value as QuoteRequest['status'])}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-300 bg-neutral-50 focus:outline-hidden focus:border-amber-600"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en_analisis">En Análisis Técnico</option>
                      <option value="presupuesto_enviado">Presupuesto Enviado</option>
                      <option value="aceptado">Aceptado</option>
                      <option value="en_ejecucion">En Obra</option>
                      <option value="completado">Completado</option>
                      <option value="rechazado">Rechazado</option>
                    </select>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => onOpenBudgetBuilder(selectedRequest)}
                    className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-xs"
                  >
                    <FileEdit className="w-4 h-4 text-amber-400" />
                    <span>
                      {selectedRequest.budget ? 'Editar Presupuesto Emitido' : 'Crear Presupuesto Personalizado'}
                    </span>
                  </button>

                  <button
                    onClick={() => onOpenChat(selectedRequest.id)}
                    className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4 text-neutral-600" />
                    <span>Abrir Chat con Cliente</span>
                  </button>
                </div>

                {/* Client Contact Info Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/80 text-xs">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-amber-700 shrink-0" />
                    <div>
                      <span className="text-[10px] text-neutral-400 block">Teléfono / WhatsApp</span>
                      <a href={`tel:${selectedRequest.clientPhone}`} className="font-semibold text-neutral-900 hover:underline">
                        {selectedRequest.clientPhone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-amber-700 shrink-0" />
                    <div className="truncate">
                      <span className="text-[10px] text-neutral-400 block">Correo</span>
                      <a href={`mailto:${selectedRequest.clientEmail}`} className="font-semibold text-neutral-900 hover:underline truncate block">
                        {selectedRequest.clientEmail}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-700 shrink-0" />
                    <div className="truncate">
                      <span className="text-[10px] text-neutral-400 block">Ubicación Obra</span>
                      <span className="font-semibold text-neutral-900 truncate block">
                        {selectedRequest.address}, {selectedRequest.city}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Technical Specifications */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Datos Técnicos de la Fachada
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-neutral-50 rounded-lg">
                      <span className="text-neutral-400 text-[10px] block">Superficie</span>
                      <span className="font-bold text-neutral-900 text-sm tabular-nums">
                        {selectedRequest.surfaceAreaM2} m²
                      </span>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-lg">
                      <span className="text-neutral-400 text-[10px] block">Plantas</span>
                      <span className="font-bold text-neutral-900 text-sm">
                        {selectedRequest.floorsCount}
                      </span>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-lg">
                      <span className="text-neutral-400 text-[10px] block">Andamiaje</span>
                      <span className="font-bold text-neutral-900 text-sm">
                        {selectedRequest.needsScaffolding ? 'Requerido' : 'No necesario'}
                      </span>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-lg">
                      <span className="text-neutral-400 text-[10px] block">Tipo Inmueble</span>
                      <span className="font-bold text-neutral-900 text-sm capitalize truncate block">
                        {selectedRequest.propertyType.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-neutral-50 rounded-lg text-xs space-y-1">
                    <div>
                      <strong className="text-neutral-800">Estado de las paredes: </strong>
                      <span className="text-neutral-600 capitalize">{selectedRequest.wallCondition.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <strong className="text-neutral-800">Preferencia de pintura: </strong>
                      <span className="text-neutral-600 capitalize">{selectedRequest.coatingPreference.replace('_', ' ')}</span>
                    </div>
                    {selectedRequest.notes && (
                      <div className="pt-1">
                        <strong className="text-neutral-800">Observaciones del cliente: </strong>
                        <p className="text-neutral-600 italic mt-0.5">"{selectedRequest.notes}"</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Uploaded Facade Photos Gallery */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                      Fotografías Enviadas por el Cliente ({selectedRequest.photos.length})
                    </h4>
                    <span className="text-[11px] text-neutral-400">Haz clic para ampliar y examinar grietas</span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {selectedRequest.photos.map((photo, i) => (
                      <div
                        key={i}
                        onClick={() => setActivePhotoModal(photo)}
                        className="relative group rounded-xl overflow-hidden border border-neutral-200 aspect-square bg-neutral-100 cursor-pointer shadow-2xs hover:shadow-md transition-all"
                      >
                        <img
                          src={photo}
                          alt={`Foto fachada cliente ${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-neutral-950/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                          <Maximize2 className="w-5 h-5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Issued Budget Summary if present */}
                {selectedRequest.budget && (
                  <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-950">
                        Presupuesto Emitido: {selectedRequest.budget.code}
                      </span>
                      <span className="text-base font-extrabold text-neutral-950 tabular-nums">
                        {selectedRequest.budget.total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600">
                      {selectedRequest.budget.items.length} partidas técnicas · Garantía: {selectedRequest.budget.warrantyYears} años · {selectedRequest.budget.isAccepted ? 'Aceptado por el cliente' : 'Pendiente de aceptación'}
                    </p>
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center text-neutral-400 text-xs">
                Selecciona una solicitud para examinarla
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Lightbox Photo Zoom Modal */}
      {activePhotoModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setActivePhotoModal(null)}
              className="absolute -top-10 right-0 text-white hover:text-neutral-300 p-2 text-sm font-semibold flex items-center gap-1"
            >
              <X className="w-6 h-6" />
              <span>Cerrar</span>
            </button>
            <img
              src={activePhotoModal}
              alt="Foto ampliada fachada"
              className="max-h-[82vh] w-auto max-w-full rounded-xl object-contain shadow-2xl border border-neutral-700"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}

    </div>
  );
};
