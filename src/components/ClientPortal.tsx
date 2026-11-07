import React, { useState } from 'react';
import { QuoteRequest, IssuedBudget } from '../types';
import { 
  Search, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  MessageSquare, 
  Printer, 
  Calendar,
  AlertCircle,
  Building,
  Check,
  ChevronDown,
  X
} from 'lucide-react';
import { acceptBudget } from '../services/storage';

interface ClientPortalProps {
  requests: QuoteRequest[];
  activeRequestId?: string;
  onOpenChat: (requestId: string) => void;
  onRequestNewQuote: () => void;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({
  requests,
  activeRequestId,
  onOpenChat,
  onRequestNewQuote,
}) => {
  const [searchCode, setSearchCode] = useState('');
  const [selectedId, setSelectedId] = useState<string>(activeRequestId || (requests[0]?.id || ''));
  const [signatureName, setSignatureName] = useState('');
  const [isSigningModalOpen, setIsSigningModalOpen] = useState(false);
  const [acceptSuccessMessage, setAcceptSuccessMessage] = useState(false);

  const selectedRequest = requests.find((r) => r.id === selectedId) || requests[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchCode.trim().toUpperCase();
    const found = requests.find(
      (r) => r.trackingCode.toUpperCase().includes(query) || r.clientEmail.toLowerCase().includes(query.toLowerCase())
    );
    if (found) {
      setSelectedId(found.id);
    }
  };

  const handleSignBudget = () => {
    if (!selectedRequest || !selectedRequest.budget || !signatureName.trim()) return;
    acceptBudget(selectedRequest.id, signatureName.trim());
    setIsSigningModalOpen(false);
    setAcceptSuccessMessage(true);
    setTimeout(() => setAcceptSuccessMessage(false), 5000);
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: QuoteRequest['status']) => {
    switch (status) {
      case 'pendiente':
        return { label: 'Solicitud Recibida', color: 'bg-neutral-100 text-neutral-700' };
      case 'en_analisis':
        return { label: 'En Análisis Técnico', color: 'bg-blue-50 text-blue-800' };
      case 'presupuesto_enviado':
        return { label: 'Presupuesto Listo', color: 'bg-amber-100 text-amber-900 font-bold' };
      case 'aceptado':
        return { label: 'Aceptado por Cliente', color: 'bg-emerald-100 text-emerald-800 font-bold' };
      case 'en_ejecucion':
        return { label: 'En Ejecución de Obra', color: 'bg-purple-100 text-purple-800' };
      case 'completado':
        return { label: 'Obra Finalizada', color: 'bg-emerald-50 text-emerald-700' };
      default:
        return { label: status, color: 'bg-neutral-100 text-neutral-600' };
    }
  };

  if (!selectedRequest) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h3 className="text-xl font-bold text-neutral-900">No hay solicitudes registradas</h3>
        <p className="text-xs text-neutral-500 mt-2 mb-6">
          Comienza solicitando un presupuesto personalizado para tu fachada.
        </p>
        <button
          onClick={onRequestNewQuote}
          className="px-5 py-2.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold"
        >
          Pedir Presupuesto Ahora
        </button>
      </div>
    );
  }

  const budget = selectedRequest.budget;

  return (
    <div className="py-10 bg-neutral-50 min-h-[calc(100vh-140px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Control Bar: Search & Select */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-neutral-950">
              Seguimiento de Presupuestos de Fachada
            </h2>
            <p className="text-xs text-neutral-500">
              Consulta en tiempo real la propuesta técnica emitida por Artelibreo, chatea con el pintor o formaliza la aceptación.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search input */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Buscar por código ART- o email..."
                className="w-full sm:w-64 pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-300 focus:outline-hidden focus:border-amber-600"
              />
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
            </form>

            {/* Quick request selector if multiple */}
            {requests.length > 1 && (
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-300 bg-neutral-50 focus:outline-hidden"
              >
                {requests.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.trackingCode} - {r.clientName} ({r.city})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Acceptance feedback toast */}
        {acceptSuccessMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-bold">¡Presupuesto Aceptado con Éxito!</p>
                <p className="text-xs text-emerald-700">
                  Hemos notificado al equipo técnico. Te contactaremos en breve por teléfono o chat para coordinar el andamiaje y la fecha exacta de inicio.
                </p>
              </div>
            </div>
            <button
              onClick={() => setAcceptSuccessMessage(false)}
              className="text-emerald-700 hover:text-emerald-900 p-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Request Overview Card */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden mb-8">
          
          <div className="p-6 border-b border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded">
                  {selectedRequest.trackingCode}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${getStatusBadge(selectedRequest.status).color}`}>
                  {getStatusBadge(selectedRequest.status).label}
                </span>
                <span className="text-xs text-neutral-400">
                  · Registrado el {new Date(selectedRequest.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <h3 className="text-lg font-bold text-neutral-900">
                {selectedRequest.clientName} — Fachada en {selectedRequest.city}
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                {selectedRequest.address} · {selectedRequest.surfaceAreaM2} m² · {selectedRequest.floorsCount} Plantas
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenChat(selectedRequest.id)}
                className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-colors flex items-center gap-2"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat con el Pintor</span>
                {selectedRequest.unreadClientMessages > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                )}
              </button>

              {budget && (
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-2 border border-neutral-200 text-neutral-700 rounded-lg text-xs font-medium hover:bg-neutral-50 transition-colors flex items-center gap-1.5"
                  title="Imprimir presupuesto formal"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Imprimir / PDF</span>
                </button>
              )}
            </div>
          </div>

          {/* Workflow Status Tracker */}
          <div className="px-6 py-4 bg-neutral-50/50 border-b border-neutral-100">
            <div className="flex items-center justify-between max-w-3xl mx-auto text-xs font-medium">
              {[
                { key: '1', label: '1. Solicitud', done: true },
                { key: '2', label: '2. Análisis Fotos', done: selectedRequest.status !== 'pendiente' },
                { key: '3', label: '3. Presupuesto Listo', done: ['presupuesto_enviado', 'aceptado', 'en_ejecucion', 'completado'].includes(selectedRequest.status) },
                { key: '4', label: '4. Aceptación', done: ['aceptado', 'en_ejecucion', 'completado'].includes(selectedRequest.status) },
                { key: '5', label: '5. Obra Terminada', done: selectedRequest.status === 'completado' },
              ].map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      step.done
                        ? 'bg-amber-600 text-white'
                        : 'bg-neutral-200 text-neutral-500'
                    }`}
                  >
                    {step.done ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  <span className={`hidden sm:inline ${step.done ? 'text-neutral-900 font-semibold' : 'text-neutral-400'}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Photos uploaded by client */}
          {selectedRequest.photos && selectedRequest.photos.length > 0 && (
            <div className="p-6 border-b border-neutral-100">
              <h4 className="text-xs font-semibold text-neutral-800 mb-2">
                Fotos de fachada enviadas para valoración técnica ({selectedRequest.photos.length})
              </h4>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {selectedRequest.photos.map((photo, i) => (
                  <div key={i} className="w-32 h-24 rounded-lg overflow-hidden border border-neutral-200 shrink-0 bg-neutral-100">
                    <img
                      src={photo}
                      alt={`Foto fachada ${i + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ISSUED BUDGET DETAILS (if ready) */}
          {budget ? (
            <div className="p-6 space-y-6">
              
              {/* Budget Top Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-amber-50/60 border border-amber-200/70">
                <div>
                  <span className="text-[11px] font-mono font-semibold text-amber-900">
                    PRESUPUESTO PERSONALIZADO: {budget.code}
                  </span>
                  <h4 className="text-base font-bold text-neutral-900 mt-0.5">
                    Propuesta Integral de Pintura y Restauración
                  </h4>
                  <p className="text-xs text-neutral-600">
                    Válido hasta: {new Date(budget.validUntil).toLocaleDateString('es-ES')} · Plazo estimado de ejecución: {budget.estimatedDays}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-neutral-500 block">Total Final (con IVA)</span>
                  <span className="text-2xl font-extrabold text-neutral-950 tabular-nums">
                    {budget.total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div className="overflow-x-auto border border-neutral-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Concepto / Partida Técnica</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Cant.</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Unidad</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Precio Ud.</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Importe</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {budget.items.map((item) => (
                      <tr key={item.id} className="hover:bg-neutral-50/50">
                        <td className="py-3 px-4 font-medium text-neutral-800">
                          {item.concept}
                        </td>
                        <td className="py-3 px-3 text-right tabular-nums text-neutral-600">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-3 text-center text-neutral-500 text-[11px]">
                          {item.unit}
                        </td>
                        <td className="py-3 px-3 text-right tabular-nums text-neutral-600">
                          {item.unitPrice.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums font-semibold text-neutral-900">
                          {item.total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-neutral-50/70 border-t border-neutral-200 text-xs">
                    <tr>
                      <td colSpan={4} className="py-2 px-4 text-right font-medium text-neutral-600">
                        Subtotal Neto:
                      </td>
                      <td className="py-2 px-4 text-right font-semibold tabular-nums text-neutral-900">
                        {budget.subtotal.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                      </td>
                    </tr>
                    {budget.discountPercentage > 0 && (
                      <tr>
                        <td colSpan={4} className="py-1 px-4 text-right text-emerald-700">
                          Descuento aplicado ({budget.discountPercentage}%):
                        </td>
                        <td className="py-1 px-4 text-right text-emerald-700 tabular-nums">
                          -{(budget.subtotal * (budget.discountPercentage / 100)).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan={4} className="py-1 px-4 text-right text-neutral-600">
                        IVA Aplicable ({budget.taxRate * 100}%):
                      </td>
                      <td className="py-1 px-4 text-right tabular-nums text-neutral-700">
                        {budget.taxAmount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                      </td>
                    </tr>
                    <tr className="border-t border-neutral-200 text-sm">
                      <td colSpan={4} className="py-3 px-4 text-right font-bold text-neutral-950">
                        TOTAL PRESUPUESTO:
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-neutral-950 tabular-nums">
                        {budget.total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Guarantees & Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                  <div className="flex items-center gap-2 font-semibold text-neutral-900 mb-1">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <span>Garantía y Calidad Artelibreo</span>
                  </div>
                  <p className="text-neutral-600 leading-relaxed">
                    Este presupuesto incluye <strong>{budget.warrantyYears} años de garantía por escrito</strong> contra desconchados, hongos y pérdida de adherencia.
                  </p>
                  <p className="text-neutral-500 mt-2 text-[11px]">
                    <strong>Gama de materiales:</strong> {budget.materialsBrand}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                  <div className="flex items-center gap-2 font-semibold text-neutral-900 mb-1">
                    <Calendar className="w-4 h-4 text-neutral-700" />
                    <span>Observaciones Técnicas del Maestro Pintor</span>
                  </div>
                  <p className="text-neutral-600 leading-relaxed">
                    {budget.technicianNotes}
                  </p>
                </div>
              </div>

              {/* Acceptance CTA Box */}
              {!budget.isAccepted ? (
                <div className="p-5 rounded-2xl bg-neutral-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h5 className="font-bold text-sm">¿Deseas confirmar este presupuesto?</h5>
                    <p className="text-xs text-neutral-300 mt-0.5">
                      Firma digitalmente para bloquear la fecha de inicio en el calendario de obras de Artelibreo.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onOpenChat(selectedRequest.id)}
                      className="px-4 py-2.5 bg-neutral-800 text-white text-xs font-semibold rounded-lg hover:bg-neutral-700 transition-colors"
                    >
                      Preguntar por Chat
                    </button>
                    <button
                      onClick={() => setIsSigningModalOpen(true)}
                      className="px-6 py-2.5 bg-amber-500 text-neutral-950 text-xs font-bold rounded-lg hover:bg-amber-400 transition-colors whitespace-nowrap shadow-sm"
                    >
                      Aceptar Presupuesto
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>
                      Presupuesto aceptado y firmado por <strong>{budget.clientSignatureName}</strong> el {new Date(budget.acceptedAt || '').toLocaleDateString('es-ES')}.
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-800 bg-white px-2.5 py-1 rounded-md border border-emerald-200">
                    Contrato Formalizado
                  </span>
                </div>
              )}

            </div>
          ) : (
            <div className="p-10 text-center space-y-3">
              <Clock className="w-10 h-10 text-amber-600 mx-auto animate-pulse" />
              <h4 className="text-base font-bold text-neutral-900">
                Presupuesto en Elaboración por el Maestro Pintor
              </h4>
              <p className="text-xs text-neutral-600 max-w-md mx-auto">
                Estamos calculando las partidas de imprimación, pintura técnica y andamiaje para tu fachada de {selectedRequest.surfaceAreaM2} m². Te enviaremos una notificación en cuanto esté listo.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onOpenChat(selectedRequest.id)}
                  className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800"
                >
                  Consultar Avance en el Chat
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Acceptance Modal */}
      {isSigningModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-neutral-200">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-base text-neutral-900">
                Formalizar Aceptación de Presupuesto
              </h4>
              <button
                onClick={() => setIsSigningModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 mb-4">
              Al aceptar el presupuesto <strong>{budget?.code}</strong> por importe de <strong>{budget?.total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</strong>, autorizas a Artelibreo a coordinar el inicio de obra y solicitar permisos.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Firma: Introduce tu nombre y apellidos o representación
              </label>
              <input
                type="text"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                placeholder="Ej. Roberto Sánchez Gómez"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-hidden focus:border-amber-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsSigningModalOpen(false)}
                className="px-4 py-2 border border-neutral-200 text-neutral-600 text-xs font-medium rounded-lg"
              >
                Cancelar
              </button>
              <button
                disabled={!signatureName.trim()}
                onClick={handleSignBudget}
                className="px-5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                Confirmar y Firmar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
