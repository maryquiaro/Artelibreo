import React from 'react';
import { CompanySettings } from '../types';
import { ArrowRight, ShieldCheck, CheckCircle2, Clock, Ruler } from 'lucide-react';

interface HeroProps {
  settings: CompanySettings;
  onRequestQuote: () => void;
  onViewMyQuotes: () => void;
}

export const Hero: React.FC<HeroProps> = ({ settings, onRequestQuote, onViewMyQuotes }) => {
  return (
    <section className="relative pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-neutral-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 2-Column Balanced Hero Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Column 1: Editorial Value Proposition */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800 bg-amber-50/80 px-3 py-1 rounded-md border border-amber-200/60">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Garantía Certificada en Fachadas</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-950 leading-[1.12]" style={{ textWrap: 'balance' }}>
              Especialistas en Pintura y Rehabilitación Técnica de Fachadas
            </h1>

            <p className="text-base sm:text-lg text-neutral-600 leading-relaxed max-w-xl">
              {settings.description || 'Tratamiento hidrófugo, reparación de grietas estructurales y revestimientos de máxima durabilidad para chalets, comunidades y edificios singulares.'}
            </p>

            {/* Micro-assurances with clean unboxed text */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-medium text-neutral-700">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Andamiaje propio homologado
              </span>
              <span className="text-neutral-300" aria-hidden="true">·</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Presupuesto con fotos en 48h
              </span>
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={onRequestQuote}
                className="px-6 py-3.5 bg-neutral-950 text-white font-semibold text-sm rounded-xl hover:bg-neutral-800 transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2 group whitespace-nowrap shrink-0"
              >
                <span>Solicitar Presupuesto Personalizado</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={onViewMyQuotes}
                className="px-5 py-3.5 bg-neutral-100 text-neutral-800 font-semibold text-sm rounded-xl hover:bg-neutral-200 transition-colors flex items-center justify-center whitespace-nowrap shrink-0"
              >
                Consultar Mis Presupuestos
              </button>
            </div>
          </div>

          {/* Column 2: Architectural Photography Focal Carrier */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden border border-neutral-200/80 shadow-xl bg-neutral-100 aspect-16/10">
              <img
                src="/src/assets/images/facade_residential_villa_1793990057327.jpg"
                alt="Proyecto técnico de pintura y restauración de fachada exterior por Artelibreo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {/* Subtle caption banner */}
              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-neutral-950/85 via-neutral-950/40 to-transparent text-white text-xs flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">Pintura Técnica de Fachadas</p>
                  <p className="text-neutral-300 text-[11px]">Revestimientos arquitectónicos de máxima durabilidad</p>
                </div>
                <span className="bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded text-[11px] font-medium">
                  {settings.name}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* 4-Column KPI strip below hero split */}
        <div className="mt-14 pt-10 border-t border-neutral-200/80 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/60">
            <div className="flex items-center gap-2 text-amber-800 text-xs font-semibold mb-1">
              <Ruler className="w-4 h-4" />
              <span>Superficie ejecutada</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 tabular-nums">
              +140.000 m²
            </p>
            <p className="text-xs text-neutral-500 mt-1">Fachadas restauradas con éxito</p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/60">
            <div className="flex items-center gap-2 text-amber-800 text-xs font-semibold mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Garantía certificada</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 tabular-nums">
              10 Años
            </p>
            <p className="text-xs text-neutral-500 mt-1">Cobertura directa por póliza</p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/60">
            <div className="flex items-center gap-2 text-amber-800 text-xs font-semibold mb-1">
              <Clock className="w-4 h-4" />
              <span>Respuesta técnica</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 tabular-nums">
              48 Horas
            </p>
            <p className="text-xs text-neutral-500 mt-1">Presupuesto formal desglosado</p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/60">
            <div className="flex items-center gap-2 text-amber-800 text-xs font-semibold mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Satisfacción cliente</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 tabular-nums">
              99.4%
            </p>
            <p className="text-xs text-neutral-500 mt-1">En más de 380 comunidades</p>
          </div>
        </div>

      </div>
    </section>
  );
};
