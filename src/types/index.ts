export type PropertyType = 
  | 'unifamiliar' 
  | 'edificio_residencial' 
  | 'local_comercial' 
  | 'nave_industrial' 
  | 'comunidad_propietarios';

export type WallCondition = 
  | 'buen_estado' 
  | 'fisuras_leves' 
  | 'desprendimientos' 
  | 'humedad_moho' 
  | 'descascarillado_severo';

export type CoatingType = 
  | 'acrilica_impermeable' 
  | 'siloxanica_transpirable' 
  | 'mineral_silicato' 
  | 'elastomero_antifisuras' 
  | 'por_asesorar';

export type RequestStatus = 
  | 'pendiente' 
  | 'en_analisis' 
  | 'presupuesto_enviado' 
  | 'aceptado' 
  | 'en_ejecucion' 
  | 'completado' 
  | 'rechazado';

export type CRMLeadStatus = 'pendiente' | 'presupuesto_enviado' | 'trato_cerrado';

export interface ClientNote {
  id: string;
  clientEmail: string;
  requestId?: string;
  text: string;
  author: string;
  createdAt: string;
}

export interface BudgetItem {
  id: string;
  concept: string;
  category: 'preparacion' | 'materiales' | 'aplicacion' | 'andamios' | 'otros';
  quantity: number;
  unit: 'm²' | 'ud' | 'ml' | 'partida' | 'día';
  unitPrice: number;
  total: number;
}

export interface IssuedBudget {
  id: string;
  code: string; // e.g. "PRE-2026-042"
  requestId: string;
  createdAt: string;
  validUntil: string;
  warrantyYears: number;
  items: BudgetItem[];
  subtotal: number;
  taxRate: number; // 0.10 or 0.21
  taxAmount: number;
  discountPercentage: number;
  total: number;
  estimatedDays: string;
  technicianNotes: string;
  materialsBrand: string;
  isAccepted: boolean;
  acceptedAt?: string;
  clientSignatureName?: string;
}

export interface QuoteRequest {
  id: string;
  trackingCode: string; // e.g. "ART-8921"
  createdAt: string;
  // Contact info
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  address: string;
  city: string;
  postalCode?: string;
  
  // Project specifications
  propertyType: PropertyType;
  surfaceAreaM2: number;
  floorsCount: number;
  wallCondition: WallCondition;
  coatingPreference: CoatingType;
  needsScaffolding: boolean;
  notes: string;
  
  // Photos of the facades
  photos: string[]; // base64 or sample photo URLs
  
  // Status & Budget
  status: RequestStatus;
  leadStatus?: CRMLeadStatus;
  budget?: IssuedBudget;
  unreadAdminMessages: number;
  unreadClientMessages: number;
}

export interface ChatMessage {
  id: string;
  requestId: string;
  sender: 'client' | 'admin';
  senderName: string;
  text: string;
  imageUrl?: string;
  timestamp: string;
  isRead: boolean;
}

export interface PortfolioProject {
  id: string;
  title: string;
  category: 'Residencial' | 'Comercial' | 'Comunidades' | 'Histórico';
  location: string;
  surfaceM2: number;
  completionYear: number;
  duration: string;
  coatingType: string;
  warrantyYears: number;
  imageUrl: string;
  beforeImageUrl?: string;
  description: string;
  highlights: string[];
  clientReview?: {
    author: string;
    rating: number;
    text: string;
  };
}

export interface CompanySettings {
  name: string;
  tagline: string;
  description: string;
  logoUrl: string; // base64 or SVG
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  workingHours: string;
  cif: string;
  defaultWarrantyYears: number;
  defaultTaxRate: number;
  termsAndConditions: string;
  brandColorTheme: 'terracotta' | 'amber' | 'slate' | 'cobalt' | 'forest';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'quote_request' | 'budget_ready' | 'chat_message' | 'budget_accepted' | 'info';
  relatedRequestId?: string;
  isRead: boolean;
}
