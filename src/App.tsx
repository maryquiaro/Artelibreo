import React, { useState, useEffect } from 'react';
import { 
  CompanySettings, 
  QuoteRequest, 
  PortfolioProject 
} from './types';
import { 
  getCompanySettings, 
  getQuoteRequests, 
  getPortfolioProjects, 
  subscribeToStore 
} from './services/storage';

import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { QuoteFormModal } from './components/QuoteFormModal';
import { ClientPortal } from './components/ClientPortal';
import { AdminInbox } from './components/AdminInbox';
import { AdminCRM } from './components/AdminCRM';
import { AdminDatabase } from './components/AdminDatabase';
import { AdminSettings } from './components/AdminSettings';
import { ChatDrawer } from './components/ChatDrawer';
import { BudgetBuilderModal } from './components/BudgetBuilderModal';
import { Footer } from './components/Footer';

import { 
  Paintbrush, 
  Camera, 
  FileCheck, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  Wrench,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function App() {
  const [settings, setSettings] = useState<CompanySettings>(getCompanySettings());
  const [requests, setRequests] = useState<QuoteRequest[]>(getQuoteRequests());

  // Navigation & Role states
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'home' | 'my-quotes' | 'admin-inbox' | 'admin-crm' | 'admin-database' | 'admin-settings'
  >('home');

  // Modals & Drawers
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [activeChatRequest, setActiveChatRequest] = useState<QuoteRequest | null>(null);
  const [activeBudgetBuilderRequest, setActiveBudgetBuilderRequest] = useState<QuoteRequest | null>(null);
  const [selectedRequestIdForPortal, setSelectedRequestIdForPortal] = useState<string | undefined>(undefined);

  // Subscribe to storage changes
  useEffect(() => {
    const update = () => {
      setSettings(getCompanySettings());
      setRequests(getQuoteRequests());
    };
    update();
    const unsubscribe = subscribeToStore(update);
    return () => unsubscribe();
  }, []);

  // Handlers
  const handleOpenChat = (requestId: string) => {
    const req = requests.find((r) => r.id === requestId);
    if (req) {
      setActiveChatRequest(req);
    }
  };

  const handleOpenBudgetBuilder = (req: QuoteRequest) => {
    setActiveBudgetBuilderRequest(req);
  };

  const handleSelectRequestFromNotification = (requestId: string) => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;

    if (isAdmin) {
      setActiveTab('admin-inbox');
    } else {
      setSelectedRequestIdForPortal(requestId);
      setActiveTab('my-quotes');
    }
  };

  const handleQuoteCreatedSuccess = (newRequest: QuoteRequest, openChatDirectly?: boolean) => {
    setSelectedRequestIdForPortal(newRequest.id);
    if (openChatDirectly) {
      setActiveChatRequest(newRequest);
    } else {
      setActiveTab('my-quotes');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 font-sans">
      
      {/* Universal Top Header */}
      <Header
        settings={settings}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        onRequestQuoteClick={() => setIsQuoteModalOpen(true)}
        onSelectRequest={handleSelectRequestFromNotification}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        
        {/* VIEW 1: HOME (CLIENT LANDING) */}
        {activeTab === 'home' && (
          <div>
            {/* Hero Section */}
            <Hero
              settings={settings}
              onRequestQuote={() => setIsQuoteModalOpen(true)}
              onViewMyQuotes={() => setActiveTab('my-quotes')}
            />

            {/* 3-Step Process Explanation Section */}
            <section className="py-16 bg-white border-b border-neutral-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <div className="text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1">
                    Método Artelibreo
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950">
                    Cómo Obtener tu Presupuesto de Fachada en 3 Pasos
                  </h2>
                  <p className="text-sm text-neutral-600 mt-2">
                    Sin visitas innecesarias de comerciales. Valorado por maestros pintores especializados con fotos reales de tus paredes.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200/80 relative">
                    <div className="w-10 h-10 rounded-xl bg-neutral-900 text-amber-400 flex items-center justify-center font-bold mb-4">
                      <Camera className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-amber-800 block mb-1">Paso 01</span>
                    <h3 className="text-base font-bold text-neutral-900 mb-2">
                      Sube las fotos de tu fachada
                    </h3>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      Envía fotos generales y de detalle de grietas o zonas con humedad desde tu móvil u ordenador indicando los m² aproximados.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200/80 relative">
                    <div className="w-10 h-10 rounded-xl bg-neutral-900 text-amber-400 flex items-center justify-center font-bold mb-4">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-amber-800 block mb-1">Paso 02</span>
                    <h3 className="text-base font-bold text-neutral-900 mb-2">
                      Recibe tu presupuesto desglosado
                    </h3>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      En menos de 48 horas te entregamos la propuesta por escrito con partidas claras de preparación, imprimación, pintura y andamiaje.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200/80 relative">
                    <div className="w-10 h-10 rounded-xl bg-neutral-900 text-amber-400 flex items-center justify-center font-bold mb-4">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-amber-800 block mb-1">Paso 03</span>
                    <h3 className="text-base font-bold text-neutral-900 mb-2">
                      Ajusta en el chat y firma la obra
                    </h3>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      Chatea directamente con el pintor para elegir colores RAL o coordinar fechas. Firma de forma digital con garantía certificada.
                    </p>
                  </div>
                </div>

                {/* Direct CTA */}
                <div className="mt-10 text-center">
                  <button
                    onClick={() => setIsQuoteModalOpen(true)}
                    className="px-6 py-3.5 bg-neutral-950 text-white font-bold text-xs rounded-xl hover:bg-neutral-800 transition-colors shadow-sm inline-flex items-center gap-2"
                  >
                    <span>Comenzar Solicitud con Fotos Ahora</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: CLIENT PORTAL (TRACKING & PROPOSALS) */}
        {activeTab === 'my-quotes' && (
          <ClientPortal
            requests={requests}
            activeRequestId={selectedRequestIdForPortal}
            onOpenChat={handleOpenChat}
            onRequestNewQuote={() => setIsQuoteModalOpen(true)}
          />
        )}

        {/* VIEW 4: ADMIN INBOX */}
        {activeTab === 'admin-inbox' && (
          <AdminInbox
            requests={requests}
            onOpenBudgetBuilder={handleOpenBudgetBuilder}
            onOpenChat={handleOpenChat}
          />
        )}

        {/* VIEW 5: ADMIN CRM CLIENTS & PRIVATE NOTES */}
        {activeTab === 'admin-crm' && (
          <AdminCRM
            requests={requests}
            onOpenChat={handleOpenChat}
            onOpenBudgetBuilder={handleOpenBudgetBuilder}
            onSelectRequestDetail={(id) => {
              setSelectedRequestIdForPortal(id);
              setActiveTab('admin-inbox');
            }}
          />
        )}

        {/* VIEW 6: ADMIN DATABASE OF ISSUED BUDGETS */}
        {activeTab === 'admin-database' && (
          <AdminDatabase
            requests={requests}
            onSelectRequest={(id) => {
              setSelectedRequestIdForPortal(id);
              if (isAdmin) {
                setActiveTab('admin-inbox');
              } else {
                setActiveTab('my-quotes');
              }
            }}
          />
        )}

        {/* VIEW 6: ADMIN SETTINGS PANEL */}
        {activeTab === 'admin-settings' && (
          <AdminSettings
            settings={settings}
            onSaved={() => {
              setSettings(getCompanySettings());
            }}
          />
        )}

      </main>

      {/* Quote Form Modal (Wizard) */}
      <QuoteFormModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        onSuccess={handleQuoteCreatedSuccess}
      />

      {/* Integrated Live Chat Drawer */}
      <ChatDrawer
        isOpen={activeChatRequest !== null}
        onClose={() => setActiveChatRequest(null)}
        request={activeChatRequest}
        isAdminView={isAdmin}
      />

      {/* Admin Budget Builder Modal */}
      <BudgetBuilderModal
        isOpen={activeBudgetBuilderRequest !== null}
        onClose={() => setActiveBudgetBuilderRequest(null)}
        request={activeBudgetBuilderRequest}
        onSaved={() => {
          setRequests(getQuoteRequests());
        }}
      />

      {/* Universal Quiet Professional Footer */}
      <Footer
        settings={settings}
        onRequestQuote={() => setIsQuoteModalOpen(true)}
        onViewMyQuotes={() => setActiveTab('my-quotes')}
      />

    </div>
  );
}
