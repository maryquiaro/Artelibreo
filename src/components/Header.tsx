import React from 'react';
import { CompanySettings } from '../types';
import { NotificationCenter } from './NotificationCenter';
import { Paintbrush, LayoutDashboard, UserCheck } from 'lucide-react';

interface HeaderProps {
  settings: CompanySettings;
  activeTab: 'home' | 'my-quotes' | 'admin-inbox' | 'admin-crm' | 'admin-database' | 'admin-settings';
  setActiveTab: (tab: 'home' | 'my-quotes' | 'admin-inbox' | 'admin-crm' | 'admin-database' | 'admin-settings') => void;
  isAdmin: boolean;
  setIsAdmin: (admin: boolean) => void;
  onRequestQuoteClick: () => void;
  onSelectRequest?: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  activeTab,
  setActiveTab,
  isAdmin,
  setIsAdmin,
  onRequestQuoteClick,
  onSelectRequest,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single clean text element wordmark / brand mark */}
        <div 
          onClick={() => setActiveTab(isAdmin ? 'admin-inbox' : 'home')}
          className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0 group select-none"
        >
          {settings.logoUrl ? (
            <img 
              src={settings.logoUrl} 
              alt={settings.name} 
              className="w-8 h-8 rounded-lg object-contain"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-amber-400 flex items-center justify-center font-bold shadow-sm group-hover:bg-neutral-800 transition-colors">
              <Paintbrush className="w-4 h-4" />
            </div>
          )}
          <span className="text-xl font-bold tracking-tight text-neutral-950 font-sans">
            {settings.name || 'Artelibreo'}
          </span>
        </div>

        {/* Zone 2: 4-5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-600">
          {!isAdmin ? (
            <>
              <button
                onClick={() => setActiveTab('home')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-neutral-950 ${
                  activeTab === 'home' ? 'text-neutral-950 font-semibold' : ''
                }`}
              >
                Inicio
              </button>
              <button
                onClick={() => setActiveTab('my-quotes')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-neutral-950 ${
                  activeTab === 'my-quotes' ? 'text-neutral-950 font-semibold' : ''
                }`}
              >
                Mis Presupuestos
              </button>
              <a
                href="#contacto-footer"
                className="transition-colors whitespace-nowrap shrink-0 hover:text-neutral-950 text-neutral-600"
              >
                Contacto
              </a>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('admin-inbox')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-neutral-950 ${
                  activeTab === 'admin-inbox' ? 'text-neutral-950 font-semibold' : ''
                }`}
              >
                Bandeja Solicitudes
              </button>
              <button
                onClick={() => setActiveTab('admin-crm')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-neutral-950 ${
                  activeTab === 'admin-crm' ? 'text-neutral-950 font-semibold' : ''
                }`}
              >
                Clientes CRM
              </button>
              <button
                onClick={() => setActiveTab('admin-database')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-neutral-950 ${
                  activeTab === 'admin-database' ? 'text-neutral-950 font-semibold' : ''
                }`}
              >
                Base de Datos
              </button>
              <button
                onClick={() => setActiveTab('admin-settings')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-neutral-950 ${
                  activeTab === 'admin-settings' ? 'text-neutral-950 font-semibold' : ''
                }`}
              >
                Configuración Empresa
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: 1 primary action or role switch with notification bell */}
        <div className="flex items-center gap-3 shrink-0">
          <NotificationCenter onSelectRequest={onSelectRequest} />

          {/* Mode Switcher: Client View / Admin Panel */}
          <div className="flex items-center p-0.5 bg-neutral-100 rounded-lg border border-neutral-200">
            <button
              onClick={() => {
                setIsAdmin(false);
                setActiveTab('home');
              }}
              title="Cambiar a Vista Cliente"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
                !isAdmin
                  ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cliente</span>
            </button>
            <button
              onClick={() => {
                setIsAdmin(true);
                setActiveTab('admin-inbox');
              }}
              title="Cambiar a Panel Administrador"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
                isAdmin
                  ? 'bg-neutral-900 text-white shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          </div>

          {!isAdmin && (
            <button
              onClick={onRequestQuoteClick}
              className="px-4 py-2 text-xs font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              Pedir Presupuesto
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
