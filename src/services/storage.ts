import { 
  CompanySettings, 
  PortfolioProject, 
  QuoteRequest, 
  ChatMessage, 
  AppNotification, 
  IssuedBudget,
  ClientNote,
  CRMLeadStatus
} from '../types';
import { 
  INITIAL_COMPANY_SETTINGS, 
  INITIAL_PORTFOLIO_PROJECTS, 
  INITIAL_QUOTE_REQUESTS, 
  INITIAL_CHAT_MESSAGES, 
  INITIAL_NOTIFICATIONS 
} from '../data/initialData';

const SETTINGS_KEY = 'artelibreo_settings_v1';
const REQUESTS_KEY = 'artelibreo_requests_v1';
const CHAT_KEY = 'artelibreo_chat_v1';
const NOTIFS_KEY = 'artelibreo_notifs_v1';
const PORTFOLIO_KEY = 'artelibreo_portfolio_v1';
const NOTES_KEY = 'artelibreo_crm_notes_v1';

export const INITIAL_CLIENT_NOTES: ClientNote[] = [
  {
    id: 'note-1',
    clientEmail: 'f.morales@gmail.com',
    requestId: 'req-101',
    text: 'El cliente confirmó que le parece adecuada la pintura siloxánica. Pendiente llevarle muestra física de color blanco marfil antes del inicio.',
    author: 'Carlos (Maestro Pintor)',
    createdAt: '2026-11-05T17:30:00.000Z',
  },
  {
    id: 'note-2',
    clientEmail: 'beatriz.lujan@empresa-inmo.com',
    requestId: 'req-102',
    text: 'Comunidad de Acacias: Urge presupuesto antes del jueves para junta de propietarios. Requieren andamio europeo con lona de protección.',
    author: 'Dirección Técnica',
    createdAt: '2026-11-06T08:50:00.000Z',
  },
  {
    id: 'note-3',
    clientEmail: 'm.santillana@retailgroup.es',
    requestId: 'req-103',
    text: 'Trato cerrado formalmente por 2.904 €. Obra nocturna acordada para semana próxima para no interrumpir el horario comercial del local.',
    author: 'Administrador Artelibreo',
    createdAt: '2026-11-05T12:00:00.000Z',
  },
];

type Listener = () => void;
const listeners: Set<Listener> = new Set();

export function subscribeToStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  listeners.forEach(fn => {
    try {
      fn();
    } catch (e) {
      console.error('Error in store listener:', e);
    }
  });
}

// ----------------- SETTINGS -----------------
export function getCompanySettings(): CompanySettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(INITIAL_COMPANY_SETTINGS));
      return INITIAL_COMPANY_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    let updated = false;
    if (parsed.description && parsed.description.includes('impermeabilización')) {
      parsed.description = parsed.description.replace(/impermeabilización/gi, 'restauración');
      updated = true;
    }
    if (!parsed.address || parsed.address.includes('San Fernando, Madrid') || parsed.address.includes('Calle de los Maestros Pintores')) {
      parsed.address = 'Calle los laboratorios, las Brisas de Petare. Municipio Sucre, Estado Miranda';
      updated = true;
    }
    if (!parsed.phone || parsed.phone.includes('+34')) {
      parsed.phone = '+584123100704';
      parsed.whatsapp = '+584248566768';
      updated = true;
    }
    if (updated) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return INITIAL_COMPANY_SETTINGS;
  }
}

export function saveCompanySettings(settings: CompanySettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  notifyListeners();
}

// ----------------- PORTFOLIO -----------------
export function getPortfolioProjects(): PortfolioProject[] {
  try {
    const raw = localStorage.getItem(PORTFOLIO_KEY);
    if (!raw) {
      localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(INITIAL_PORTFOLIO_PROJECTS));
      return INITIAL_PORTFOLIO_PROJECTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PORTFOLIO_PROJECTS;
  }
}

// ----------------- QUOTE REQUESTS -----------------
export function getQuoteRequests(): QuoteRequest[] {
  try {
    const raw = localStorage.getItem(REQUESTS_KEY);
    if (!raw) {
      localStorage.setItem(REQUESTS_KEY, JSON.stringify(INITIAL_QUOTE_REQUESTS));
      return INITIAL_QUOTE_REQUESTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_QUOTE_REQUESTS;
  }
}

export function saveQuoteRequests(requests: QuoteRequest[]): void {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  notifyListeners();
}

export function addQuoteRequest(request: QuoteRequest): void {
  const current = getQuoteRequests();
  const updated = [request, ...current];
  saveQuoteRequests(updated);

  // create notification for admin
  addNotification({
    id: `notif-${Date.now()}`,
    title: 'Nueva solicitud de presupuesto',
    message: `${request.clientName} ha solicitado presupuesto para ${request.surfaceAreaM2} m² (${request.city}).`,
    timestamp: new Date().toISOString(),
    type: 'quote_request',
    relatedRequestId: request.id,
    isRead: false,
  });
}

export function updateQuoteRequestStatus(requestId: string, status: QuoteRequest['status']): void {
  const current = getQuoteRequests();
  const updated = current.map(r => r.id === requestId ? { ...r, status } : r);
  saveQuoteRequests(updated);
}

export function saveBudgetForRequest(requestId: string, budget: IssuedBudget): void {
  const current = getQuoteRequests();
  const updated = current.map(r => {
    if (r.id === requestId) {
      return {
        ...r,
        status: 'presupuesto_enviado' as const,
        budget,
        unreadClientMessages: r.unreadClientMessages + 1,
      };
    }
    return r;
  });
  saveQuoteRequests(updated);

  addNotification({
    id: `notif-${Date.now()}`,
    title: 'Presupuesto personalizado emitido',
    message: `Se ha generado el presupuesto ${budget.code} por un total de ${budget.total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}.`,
    timestamp: new Date().toISOString(),
    type: 'budget_ready',
    relatedRequestId: requestId,
    isRead: false,
  });
}

export function acceptBudget(requestId: string, signatureName: string): void {
  const current = getQuoteRequests();
  let clientName = '';
  let budgetCode = '';
  const updated = current.map(r => {
    if (r.id === requestId && r.budget) {
      clientName = r.clientName;
      budgetCode = r.budget.code;
      return {
        ...r,
        status: 'aceptado' as const,
        budget: {
          ...r.budget,
          isAccepted: true,
          acceptedAt: new Date().toISOString(),
          clientSignatureName: signatureName,
        },
      };
    }
    return r;
  });
  saveQuoteRequests(updated);

  addNotification({
    id: `notif-${Date.now()}`,
    title: '¡Presupuesto Aceptado!',
    message: `${clientName} ha firmado y aceptado la propuesta ${budgetCode}. Se puede programar inicio de obra.`,
    timestamp: new Date().toISOString(),
    type: 'budget_accepted',
    relatedRequestId: requestId,
    isRead: false,
  });

  // also post confirmation in chat
  addChatMessage({
    id: `msg-${Date.now()}`,
    requestId,
    sender: 'client',
    senderName: signatureName || 'Cliente',
    text: `Acabo de firmar y aceptar formalmente el presupuesto ${budgetCode}. ¡Deseo coordinar el inicio de la obra!`,
    timestamp: new Date().toISOString(),
    isRead: false,
  });
}

// ----------------- CHAT -----------------
export function getChatMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    if (!raw) {
      localStorage.setItem(CHAT_KEY, JSON.stringify(INITIAL_CHAT_MESSAGES));
      return INITIAL_CHAT_MESSAGES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CHAT_MESSAGES;
  }
}

export function saveChatMessages(messages: ChatMessage[]): void {
  localStorage.setItem(CHAT_KEY, JSON.stringify(messages));
  notifyListeners();
}

export function addChatMessage(message: ChatMessage): void {
  const current = getChatMessages();
  const updated = [...current, message];
  saveChatMessages(updated);

  // If client sent it, notify admin; if admin sent it, notify client
  addNotification({
    id: `notif-${Date.now()}`,
    title: message.sender === 'client' ? `Mensaje de ${message.senderName}` : 'Mensaje de Artelibreo',
    message: message.text.length > 75 ? `${message.text.substring(0, 75)}...` : message.text,
    timestamp: new Date().toISOString(),
    type: 'chat_message',
    relatedRequestId: message.requestId,
    isRead: false,
  });
}

export function markChatAsRead(requestId: string, forSender: 'client' | 'admin'): void {
  const current = getChatMessages();
  let changed = false;
  const updated = current.map(m => {
    if (m.requestId === requestId && m.sender !== forSender && !m.isRead) {
      changed = true;
      return { ...m, isRead: true };
    }
    return m;
  });
  if (changed) {
    saveChatMessages(updated);
  }
}

// ----------------- NOTIFICATIONS -----------------
export function getNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFS_KEY);
    if (!raw) {
      localStorage.setItem(NOTIFS_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

export function saveNotifications(notifs: AppNotification[]): void {
  localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifs));
  notifyListeners();
}

export function addNotification(notification: AppNotification): void {
  const current = getNotifications();
  const updated = [notification, ...current];
  saveNotifications(updated);

  // Trigger browser push notification if permitted
  triggerPushNotification(notification.title, notification.message);
}

export function markNotificationAsRead(id: string): void {
  const current = getNotifications();
  const updated = current.map(n => n.id === id ? { ...n, isRead: true } : n);
  saveNotifications(updated);
}

export function markAllNotificationsAsRead(): void {
  const current = getNotifications();
  const updated = current.map(n => ({ ...n, isRead: true }));
  saveNotifications(updated);
}

// ----------------- BROWSER PUSH & AUDIO CHIME -----------------
export async function requestPushPermission(): Promise<NotificationPermission> {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch {
      return 'denied';
    }
  }
  return 'denied';
}

export function getPushPermissionStatus(): NotificationPermission {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    return Notification.permission;
  }
  return 'denied';
}

export function triggerPushNotification(title: string, body: string): void {
  // 1. Play subtle chime synthesis via Web Audio API
  playNotificationSound();

  // 2. Fire system push notification if permitted
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
      } catch (err) {
        console.warn('Could not launch system notification:', err);
      }
    }
  }
}

export function playNotificationSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.36);
  } catch {
    // Audio context may be blocked before user interaction; ignore silently
  }
}

// ----------------- CRM CLIENT NOTES & STATUS -----------------
export function getClientNotes(clientEmail?: string): ClientNote[] {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    let notes: ClientNote[] = [];
    if (!raw) {
      notes = INITIAL_CLIENT_NOTES;
      localStorage.setItem(NOTES_KEY, JSON.stringify(INITIAL_CLIENT_NOTES));
    } else {
      notes = JSON.parse(raw);
    }

    if (clientEmail) {
      return notes.filter(n => n.clientEmail.toLowerCase() === clientEmail.toLowerCase());
    }
    return notes;
  } catch {
    return INITIAL_CLIENT_NOTES;
  }
}

export function saveClientNotes(notes: ClientNote[]): void {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  notifyListeners();
}

export function addClientNote(note: ClientNote): void {
  const current = getClientNotes();
  const updated = [note, ...current];
  saveClientNotes(updated);
}

export function deleteClientNote(id: string): void {
  const current = getClientNotes();
  const updated = current.filter(n => n.id !== id);
  saveClientNotes(updated);
}

export function updateLeadStatus(requestId: string, leadStatus: CRMLeadStatus): void {
  const current = getQuoteRequests();
  const updated = current.map(r => {
    if (r.id === requestId) {
      // also synchronize request status if needed
      let newReqStatus = r.status;
      if (leadStatus === 'trato_cerrado') {
        newReqStatus = 'aceptado';
      } else if (leadStatus === 'presupuesto_enviado' && r.status === 'pendiente') {
        newReqStatus = 'presupuesto_enviado';
      }
      return {
        ...r,
        leadStatus,
        status: newReqStatus,
      };
    }
    return r;
  });
  saveQuoteRequests(updated);
}

// ----------------- RESET DATABASE -----------------
export function resetDatabaseToDefault(): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(INITIAL_COMPANY_SETTINGS));
  localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(INITIAL_PORTFOLIO_PROJECTS));
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(INITIAL_QUOTE_REQUESTS));
  localStorage.setItem(CHAT_KEY, JSON.stringify(INITIAL_CHAT_MESSAGES));
  localStorage.setItem(NOTIFS_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
  localStorage.setItem(NOTES_KEY, JSON.stringify(INITIAL_CLIENT_NOTES));
  notifyListeners();
}

export function exportDatabaseJson(): string {
  const data = {
    exportDate: new Date().toISOString(),
    settings: getCompanySettings(),
    requests: getQuoteRequests(),
    chat: getChatMessages(),
    notifications: getNotifications(),
    portfolio: getPortfolioProjects(),
    crmNotes: getClientNotes(),
  };
  return JSON.stringify(data, null, 2);
}

export function importDatabaseJson(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.settings) localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings));
    if (data.requests) localStorage.setItem(REQUESTS_KEY, JSON.stringify(data.requests));
    if (data.chat) localStorage.setItem(CHAT_KEY, JSON.stringify(data.chat));
    if (data.notifications) localStorage.setItem(NOTIFS_KEY, JSON.stringify(data.notifications));
    if (data.portfolio) localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(data.portfolio));
    if (data.crmNotes) localStorage.setItem(NOTES_KEY, JSON.stringify(data.crmNotes));
    notifyListeners();
    return true;
  } catch {
    return false;
  }
}
