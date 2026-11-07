import React, { useState, useEffect } from 'react';
import { QuoteRequest, ClientNote, CRMLeadStatus } from '../types';
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Plus, 
  Trash2, 
  Calendar, 
  MapPin, 
  StickyNote, 
  Send, 
  UserCheck, 
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Building,
  Sparkles
} from 'lucide-react';
import { 
  getClientNotes, 
  addClientNote, 
  deleteClientNote, 
  updateLeadStatus, 
  subscribeToStore 
} from '../services/storage';

interface AdminCRMProps {
  requests: QuoteRequest[];
  onOpenChat: (requestId: string) => void;
  onOpenBudgetBuilder: (request: QuoteRequest) => void;
  onSelectRequestDetail: (requestId: string) => void;
}

export interface ClientProfile {
  clientEmail: string;
  clientName: string;
  clientPhone: string;
  city: string;
  address: string;
  requests: QuoteRequest[];
  latestRequest: QuoteRequest;
  leadStatus: CRMLeadStatus;
  totalBudgetValue: number;
}

export const AdminCRM: React.FC<AdminCRMProps> = ({
  requests,
  onOpenChat,
  onOpenBudgetBuilder,
  onSelectRequestDetail,
}) => {
  const [notes, setNotes] = useState<ClientNote[]>(getClientNotes());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | CRMLeadStatus>('all');
  const [selectedClientEmail, setSelectedClientEmail] = useState<string>('');
  
  // Note creation state
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteAuthor, setNewNoteAuthor] = useState('Administrador');
  const [noteSuccessToast, setNoteSuccessToast] = useState(false);

  useEffect(() => {
    const update = () => {
      setNotes(getClientNotes());
    };
    const unsubscribe = subscribeToStore(update);
    return () => unsubscribe();
  }, []);

  // Aggregate clients by email
  const clientMap = new Map<string, ClientProfile>();

  requests.forEach((req) => {
    const emailKey = req.clientEmail.toLowerCase().trim();
    const existing = clientMap.get(emailKey);

    // Determine lead status
    let currentLeadStatus: CRMLeadStatus = req.leadStatus || 'pendiente';
    if (!req.leadStatus) {
      if (req.status === 'aceptado' || req.status === 'en_ejecucion' || req.status === 'completado') {
        currentLeadStatus = 'trato_cerrado';
      } else if (req.status === 'presupuesto_enviado' || req.budget) {
        currentLeadStatus = 'presupuesto_enviado';
      } else {
        currentLeadStatus = 'pendiente';
      }
    }

    if (!existing) {
      clientMap.set(emailKey, {
        clientEmail: req.clientEmail,
        clientName: req.clientName,
        clientPhone: req.clientPhone,
        city: req.city,
        address: req.address,
        requests: [req],
        latestRequest: req,
        leadStatus: currentLeadStatus,
        totalBudgetValue: req.budget?.total || 0,
      });
    } else {
      existing.requests.push(req);
      existing.totalBudgetValue += (req.budget?.total || 0);
      // Keep priority for 'trato_cerrado' if any request is closed
      if (currentLeadStatus === 'trato_cerrado') {
        existing.leadStatus = 'trato_cerrado';
      } else if (currentLeadStatus === 'presupuesto_enviado' && existing.leadStatus !== 'trato_cerrado') {
        existing.leadStatus = 'presupuesto_enviado';
      }
    }
  });

  const clientsList = Array.from(clientMap.values());

  // Default selection
  useEffect(() => {
    if (!selectedClientEmail && clientsList.length > 0) {
      setSelectedClientEmail(clientsList[0].clientEmail);
    }
  }, [clientsList, selectedClientEmail]);

  // Filter clients
  const filteredClients = clientsList.filter((c) => {
    const matchesStatus = statusFilter === 'all' || c.leadStatus === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      c.clientName.toLowerCase().includes(q) ||
      c.clientEmail.toLowerCase().includes(q) ||
      c.clientPhone.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  const selectedClient = clientsList.find((c) => c.clientEmail.toLowerCase() === selectedClientEmail.toLowerCase()) || clientsList[0];
  const clientNotes = selectedClient ? notes.filter((n) => n.clientEmail.toLowerCase() === selectedClient.clientEmail.toLowerCase()) : [];

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedClient) return;

    const newNote: ClientNote = {
      id: `note-${Date.now()}`,
      clientEmail: selectedClient.clientEmail,
      requestId: selectedClient.latestRequest.id,
      text: newNoteText.trim(),
      author: newNoteAuthor.trim() || 'Administrador',
      createdAt: new Date().toISOString(),
    };

    addClientNote(newNote);
    setNewNoteText('');
    setNoteSuccessToast(true);
    setTimeout(() => setNoteSuccessToast(false), 3000);
  };

  const handleDeleteNote = (id: string) => {
    deleteClientNote(id);
  };

  const handleUpdateStatus = (newStatus: CRMLeadStatus) => {
    if (!selectedClient) return;
    // Update leadStatus across all requests of this client
    selectedClient.requests.forEach((r) => {
      updateLeadStatus(r.id, newStatus);
    });
  };

  // KPIs
  const totalClients = clientsList.length;
  const pendingLeads = clientsList.filter((c) => c.leadStatus === 'pendiente').length;
  const sentQuotes = clientsList.filter((c) => c.leadStatus === 'presupuesto_enviado').length;
  const closedDeals = clientsList.filter((c) => c.leadStatus === 'trato_cerrado').length;

  const getStatusBadge = (status: CRMLeadStatus) => {
    switch (status) {
      case 'pendiente':
        return {
          label: 'Pendiente',
          color: 'bg-amber-100 text-amber-900 border-amber-200',
          dot: 'bg-amber-500',
        };
      case 'presupuesto_enviado':
        return {
          label: 'Presupuesto Enviado',
          color: 'bg-blue-100 text-blue-900 border-blue-200',
          dot: 'bg-blue-500',
        };
      case 'trato_cerrado':
        return {
          label: 'Trato Cerrado',
          color: 'bg-emerald-100 text-emerald-900 border-emerald-200 font-bold',
          dot: 'bg-emerald-600',
        };
    }
  };

  return (
    <div className="py-8 bg-neutral-50 min-h-[calc(100vh-140px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800">
              <Users className="w-4 h-4 text-amber-700" />
              <span>Gestión de Clientes y Relaciones (CRM)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 mt-1">
              Cartera de Clientes y Seguimiento Comercial
            </h2>
            <p className="text-xs text-neutral-500">
              Control centralizado de clientes que han solicitado presupuestos de fachada, estados de negociación y notas privadas de seguimiento.
            </p>
          </div>
        </div>

        {/* 4 CRM Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-xl border border-neutral-200/80 shadow-xs">
            <span className="text-xs text-neutral-500 block">Total Clientes Registrados</span>
            <span className="text-2xl font-bold text-neutral-900 tabular-nums">{totalClients}</span>
            <span className="text-[11px] text-neutral-400 block mt-0.5">Contactos cualificados</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-neutral-200/80 shadow-xs">
            <span className="text-xs text-amber-700 block font-medium">Pendientes de Respuesta</span>
            <span className="text-2xl font-bold text-amber-800 tabular-nums">{pendingLeads}</span>
            <span className="text-[11px] text-amber-600 block mt-0.5">Contactar o analizar</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-neutral-200/80 shadow-xs">
            <span className="text-xs text-blue-700 block font-medium">Presupuesto Enviado</span>
            <span className="text-2xl font-bold text-blue-900 tabular-nums">{sentQuotes}</span>
            <span className="text-[11px] text-blue-500 block mt-0.5">En negociación activa</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-neutral-200/80 shadow-xs">
            <span className="text-xs text-emerald-700 block font-medium">Tratos Cerrados</span>
            <span className="text-2xl font-bold text-emerald-800 tabular-nums">{closedDeals}</span>
            <span className="text-[11px] text-emerald-600 block mt-0.5">Aceptados y contratados</span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-3.5 rounded-xl border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          {/* Segmented Filter Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: `Todos (${clientsList.length})` },
              { id: 'pendiente', label: `Pendientes (${pendingLeads})` },
              { id: 'presupuesto_enviado', label: `Presupuesto Enviado (${sentQuotes})` },
              { id: 'trato_cerrado', label: `Tratos Cerrados (${closedDeals})` },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id as typeof statusFilter)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  statusFilter === f.id
                    ? 'bg-neutral-900 text-white font-semibold'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por cliente, teléfono, email..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-300 focus:outline-hidden focus:border-amber-600"
            />
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Master-Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Client Cards List */}
          <div className="lg:col-span-5 space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
            {filteredClients.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-neutral-200 text-center text-xs text-neutral-500">
                No se encontraron clientes con el filtro aplicado
              </div>
            ) : (
              filteredClients.map((client) => {
                const isSelected = selectedClient?.clientEmail.toLowerCase() === client.clientEmail.toLowerCase();
                const badge = getStatusBadge(client.leadStatus);
                const clientNotesCount = notes.filter((n) => n.clientEmail.toLowerCase() === client.clientEmail.toLowerCase()).length;

                return (
                  <div
                    key={client.clientEmail}
                    onClick={() => setSelectedClientEmail(client.clientEmail)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer text-left bg-white ${
                      isSelected
                        ? 'border-amber-600 ring-2 ring-amber-500/20 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-sm font-bold text-neutral-900 truncate">
                        {client.clientName}
                      </span>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-500 space-y-0.5">
                      <p className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3 h-3 text-neutral-400 shrink-0" />
                        <span className="truncate">{client.clientEmail}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-neutral-400 shrink-0" />
                        <span>{client.clientPhone}</span>
                        <span className="text-neutral-300">·</span>
                        <span className="text-neutral-600">{client.city}</span>
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                      <span className="text-neutral-400">
                        {client.requests.length} {client.requests.length === 1 ? 'solicitud' : 'solicitudes'} ({client.latestRequest.surfaceAreaM2} m²)
                      </span>
                      <span className="flex items-center gap-1 font-medium text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">
                        <StickyNote className="w-3 h-3 text-amber-700" />
                        <span>{clientNotesCount} notas</span>
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Detailed Client Profile & Private Notes */}
          <div className="lg:col-span-7">
            {selectedClient ? (
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-6 space-y-6">
                
                {/* Client Header & Quick Status Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded">
                        {selectedClient.latestRequest.trackingCode}
                      </span>
                      <span className="text-xs text-neutral-400">
                        Cliente desde {new Date(selectedClient.latestRequest.createdAt).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-neutral-950">
                      {selectedClient.clientName}
                    </h3>
                  </div>

                  {/* Lead Status Segmented Controller */}
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
                      Estado del Trato Comercial:
                    </label>
                    <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg border border-neutral-200">
                      {(['pendiente', 'presupuesto_enviado', 'trato_cerrado'] as CRMLeadStatus[]).map((st) => (
                        <button
                          key={st}
                          onClick={() => handleUpdateStatus(st)}
                          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                            selectedClient.leadStatus === st
                              ? st === 'trato_cerrado'
                                ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                                : st === 'presupuesto_enviado'
                                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                                : 'bg-neutral-900 text-white shadow-xs font-semibold'
                              : 'text-neutral-600 hover:text-neutral-950'
                          }`}
                        >
                          {st === 'pendiente' && 'Pendiente'}
                          {st === 'presupuesto_enviado' && 'Presupuesto'}
                          {st === 'trato_cerrado' && 'Trato Cerrado'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Direct Action & Contact Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/80 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Teléfono / WhatsApp</span>
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${selectedClient.clientPhone}`}
                        className="font-bold text-neutral-900 hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5 text-amber-700" />
                        <span>{selectedClient.clientPhone}</span>
                      </a>
                    </div>
                    <a
                      href={`https://wa.me/${selectedClient.clientPhone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 pt-0.5"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Abrir WhatsApp directo</span>
                    </a>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Correo Electrónico</span>
                    <a
                      href={`mailto:${selectedClient.clientEmail}`}
                      className="font-bold text-neutral-900 hover:underline flex items-center gap-1 truncate block"
                    >
                      <Mail className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span className="truncate">{selectedClient.clientEmail}</span>
                    </a>
                    <span className="text-[11px] text-neutral-400 block truncate">
                      {selectedClient.address}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Acciones Comerciales</span>
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => onOpenChat(selectedClient.latestRequest.id)}
                        className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="w-3 h-3 text-amber-400" />
                        <span>Chatear con el cliente</span>
                      </button>
                      <button
                        onClick={() => onOpenBudgetBuilder(selectedClient.latestRequest)}
                        className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-700 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <FileText className="w-3 h-3 text-neutral-500" />
                        <span>Editar / Emitir Presupuesto</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Associated Proposals & Requests */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center justify-between">
                    <span>Presupuestos y Fachadas Solicitadas ({selectedClient.requests.length})</span>
                    <span className="text-[11px] font-normal text-neutral-400">
                      Importe acumulado: <strong className="text-neutral-900 font-semibold">{selectedClient.totalBudgetValue.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</strong>
                    </span>
                  </h4>

                  <div className="space-y-2">
                    {selectedClient.requests.map((r) => (
                      <div
                        key={r.id}
                        className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between gap-4 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-neutral-800">{r.trackingCode}</span>
                            <span className="text-neutral-400">·</span>
                            <span className="capitalize text-neutral-700">{r.propertyType.replace('_', ' ')}</span>
                            <span className="text-neutral-400">·</span>
                            <span className="font-semibold text-neutral-900">{r.surfaceAreaM2} m²</span>
                          </div>
                          <p className="text-[11px] text-neutral-500 mt-0.5">
                            {r.notes || `Revestimiento deseado: ${r.coatingPreference.replace('_', ' ')}`}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          {r.budget ? (
                            <div>
                              <span className="font-bold text-neutral-900 text-sm tabular-nums block">
                                {r.budget.total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                              </span>
                              <span className="text-[10px] text-neutral-500 block">
                                Ref: {r.budget.code}
                              </span>
                            </div>
                          ) : (
                            <span className="text-neutral-400 text-[11px] italic">Sin cotizar aún</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PRIVATE INTERNAL NOTES SECTION */}
                <div className="space-y-3 pt-2 border-t border-neutral-100">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                      <StickyNote className="w-4 h-4 text-amber-700" />
                      <span>Notas Internas del Administrador ({clientNotes.length})</span>
                    </h4>
                    <span className="text-[11px] text-neutral-400">
                      Privadas (no visibles para el cliente)
                    </span>
                  </div>

                  {/* Toast on note added */}
                  {noteSuccessToast && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Nota interna registrada en la ficha del cliente.</span>
                    </div>
                  )}

                  {/* Add Note Form */}
                  <form onSubmit={handleAddNote} className="space-y-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200/80">
                    <textarea
                      rows={2}
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Escribe una nota de seguimiento (ej. Llamar el viernes a las 11:00 para revisar carta de colores RAL, cliente pide 5% de descuento por pagar al contado...)"
                      className="w-full p-2.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:border-amber-600"
                    />

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                        <span className="text-[11px]">Autor:</span>
                        <input
                          type="text"
                          value={newNoteAuthor}
                          onChange={(e) => setNewNoteAuthor(e.target.value)}
                          placeholder="Tu nombre o cargo"
                          className="px-2 py-1 bg-white border border-neutral-300 rounded text-xs w-36"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={!newNoteText.trim()}
                        className="px-3.5 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 disabled:opacity-40 transition-colors flex items-center gap-1.5 shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Añadir Nota</span>
                      </button>
                    </div>
                  </form>

                  {/* Chronological Notes Timeline */}
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {clientNotes.length === 0 ? (
                      <div className="py-6 text-center text-xs text-neutral-400 bg-neutral-50/50 rounded-xl border border-dashed border-neutral-200">
                        No hay notas internas registradas para este cliente todavía.
                      </div>
                    ) : (
                      clientNotes.map((note) => (
                        <div
                          key={note.id}
                          className="p-3 bg-amber-50/40 rounded-xl border border-amber-200/60 text-xs space-y-1 relative group"
                        >
                          <div className="flex items-center justify-between text-[11px] text-neutral-500">
                            <span className="font-semibold text-neutral-900">
                              {note.author}
                            </span>
                            <div className="flex items-center gap-2">
                              <span>
                                {new Date(note.createdAt).toLocaleString('es-ES', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              <button
                                onClick={() => handleDeleteNote(note.id)}
                                className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-600 p-0.5 transition-opacity"
                                title="Eliminar nota"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <p className="text-neutral-800 leading-relaxed font-sans text-xs">
                            {note.text}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center text-neutral-400 text-xs">
                Selecciona un cliente para ver su ficha y notas
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
