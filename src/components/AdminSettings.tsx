import React, { useState } from 'react';
import { CompanySettings } from '../types';
import { 
  Settings, 
  Upload, 
  Check, 
  Paintbrush, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  FileText, 
  ShieldCheck, 
  Sparkles,
  RotateCcw,
  Image as ImageIcon
} from 'lucide-react';
import { saveCompanySettings } from '../services/storage';

interface AdminSettingsProps {
  settings: CompanySettings;
  onSaved: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ settings, onSaved }) => {
  const [formData, setFormData] = useState<CompanySettings>({ ...settings });
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Logo file upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormData({ ...formData, logoUrl: event.target.result as string });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveCompanySettings(formData);
    setShowSavedToast(true);
    onSaved();
    setTimeout(() => setShowSavedToast(false), 3500);
  };

  const handleResetLogo = () => {
    setFormData({ ...formData, logoUrl: '' });
  };

  return (
    <div className="py-8 bg-neutral-50 min-h-[calc(100vh-140px)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800">
            <Settings className="w-4 h-4 text-amber-700" />
            <span>Configuración de Marca y Empresa</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 mt-1">
            Panel de Identidad Corporativa y Parámetros
          </h2>
          <p className="text-xs text-neutral-500">
            Personaliza el nombre de la empresa, el logotipo, la descripción del servicio y las condiciones estándar de los presupuestos emitidos.
          </p>
        </div>

        {/* Saved confirmation toast */}
        {showSavedToast && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>¡Configuración de Artelibreo guardada y aplicada en toda la plataforma!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Card 1: Brand & Logo */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 pb-2 border-b border-neutral-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Identidad, Logotipo y Descripción</span>
            </h3>

            {/* Logo Editor */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-2">
                Logotipo de la Empresa
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                {/* Logo Preview */}
                <div className="w-20 h-20 rounded-xl border border-neutral-300 bg-white flex items-center justify-center p-2 shadow-xs shrink-0 overflow-hidden">
                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      alt="Logo Artelibreo"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-neutral-900 text-amber-400 flex items-center justify-center">
                      <Paintbrush className="w-6 h-6" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <p className="text-xs font-semibold text-neutral-800">
                    Sube el logo oficial de Artelibreo (PNG, JPG, SVG o WEBP)
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    Este logotipo aparecerá automáticamente en la barra de navegación, en el pie de página y en los presupuestos formalizados.
                  </p>

                  <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                    <label className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 shadow-2xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir Imagen</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>

                    {formData.logoUrl && (
                      <button
                        type="button"
                        onClick={handleResetLogo}
                        className="px-3 py-1.5 border border-neutral-200 text-neutral-600 hover:text-red-700 hover:bg-white rounded-lg text-xs font-medium transition-colors"
                      >
                        Restaurar icono estándar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Company Name & Tagline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Nombre Comercial de la Empresa *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Artelibreo"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-hidden focus:border-amber-600 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Eslogan o Subtítulo Profesional
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="Ej. Pintura Técnica y Rehabilitación de Fachadas"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-hidden focus:border-amber-600"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Descripción Corporativa del Negocio
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe la especialidad en fachadas, experiencia, garantías y materiales empleados..."
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-hidden focus:border-amber-600"
              />
              <p className="text-[11px] text-neutral-400 mt-1">
                Esta descripción se muestra en la portada de la web y en la carta de presentación técnica para clientes.
              </p>
            </div>
          </div>

          {/* Card 2: Contact Details */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 pb-2 border-b border-neutral-100 flex items-center gap-2">
              <Phone className="w-4 h-4 text-neutral-700" />
              <span>Canales de Contacto Directo</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Teléfono Fijo / Atención
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-hidden focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  WhatsApp Directo Clientes
                </label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-hidden focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Correo Electrónico de Presupuestos
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-hidden focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  CIF / NIF de la Empresa
                </label>
                <input
                  type="text"
                  value={formData.cif}
                  onChange={(e) => setFormData({ ...formData, cif: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-hidden focus:border-amber-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Dirección de la Sede / Almacén
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-hidden focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Horario de Atención
                </label>
                <input
                  type="text"
                  value={formData.workingHours}
                  onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-hidden focus:border-amber-600"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Default Quote Conditions & Legal */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 pb-2 border-b border-neutral-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Condiciones Predeterminadas de Presupuesto</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Años de Garantía por Defecto
                </label>
                <input
                  type="number"
                  min={1}
                  max={25}
                  value={formData.defaultWarrantyYears}
                  onChange={(e) => setFormData({ ...formData, defaultWarrantyYears: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-hidden focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  IVA Aplicable por Defecto
                </label>
                <select
                  value={formData.defaultTaxRate}
                  onChange={(e) => setFormData({ ...formData, defaultTaxRate: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-hidden focus:border-amber-600"
                >
                  <option value={0.10}>10% (Rehabilitación de viviendas)</option>
                  <option value={0.21}>21% (Comercial / Régimen general)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Términos y Condiciones Legales en Presupuestos
              </label>
              <textarea
                rows={3}
                value={formData.termsAndConditions}
                onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-hidden focus:border-amber-600"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-3 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors shadow-sm flex items-center gap-2"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Guardar Configuración de Artelibreo</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
