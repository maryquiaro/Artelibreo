import React from 'react';
import { CompanySettings } from '../types';
import { Paintbrush, Phone, Mail, MapPin, Clock, ShieldCheck } from 'lucide-react';

interface FooterProps {
  settings: CompanySettings;
  onRequestQuote: () => void;
  onViewMyQuotes: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onRequestQuote,
  onViewMyQuotes,
}) => {
  return (
    <footer id="contacto-footer" className="bg-neutral-900 text-neutral-300 border-t border-neutral-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand & Bio */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.name}
                  className="w-7 h-7 rounded-lg object-contain bg-white p-0.5"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-white text-neutral-950 flex items-center justify-center font-bold">
                  <Paintbrush className="w-3.5 h-3.5 text-neutral-900" />
                </div>
              )}
              <span className="text-base font-bold text-white tracking-tight">
                {settings.name || 'Artelibreo'}
              </span>
            </div>

            <p className="text-neutral-400 text-xs leading-relaxed">
              {settings.tagline || 'Pintura Técnica y Rehabilitación de Fachadas'}
            </p>
          </div>

          {/* Col 2: Services & Coverage */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">
              Especialidades Técnicas
            </h4>
            <ul className="space-y-1.5 text-neutral-400">
              <li>Pinturas tipo Caucho, Esmalte y Acrílicas de la mejor calidad</li>
              <li>Montaje de Andamios Homologados</li>
              <li>Tratamiento de Grietas Estructurales</li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">
              Plataforma
            </h4>
            <ul className="space-y-1.5 text-neutral-400">
              <li>
                <button
                  onClick={onRequestQuote}
                  className="hover:text-white transition-colors"
                >
                  Solicitud de Presupuesto con Fotos
                </button>
              </li>
              <li>
                <button
                  onClick={onViewMyQuotes}
                  className="hover:text-white transition-colors"
                >
                  Seguimiento de Presupuestos
                </button>
              </li>
              <li>Garantía Decenal Certificada</li>
            </ul>
          </div>

          {/* Col 4: Contact & Office */}
          <div className="space-y-2.5">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">
              Contacto y Central
            </h4>
            <div className="space-y-2 text-neutral-400 text-[11px]">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <a href={`tel:${settings.phone}`} className="hover:text-white">
                  {settings.phone} / {settings.whatsapp}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-white">
                  {settings.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{settings.workingHours}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-neutral-500">
          <p>© {new Date().getFullYear()} {settings.name}. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4 text-neutral-400">
            <span>Aviso Legal</span>
            <span aria-hidden="true">·</span>
            <span>Política de Privacidad</span>
            <span aria-hidden="true">·</span>
            <span>Gestión Medioambiental de Residuos</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
