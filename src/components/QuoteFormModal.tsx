import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Camera, 
  Building2, 
  Home, 
  Store, 
  Warehouse, 
  Layers, 
  CheckCircle, 
  AlertCircle, 
  Trash2, 
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { PropertyType, WallCondition, CoatingType, QuoteRequest } from '../types';
import { addQuoteRequest } from '../services/storage';

interface QuoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newRequest: QuoteRequest, openChatDirectly?: boolean) => void;
}

export const QuoteFormModal: React.FC<QuoteFormModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('unifamiliar');

  const [surfaceAreaM2, setSurfaceAreaM2] = useState<number>(250);
  const [floorsCount, setFloorsCount] = useState<number>(2);
  const [wallCondition, setWallCondition] = useState<WallCondition>('fisuras_leves');
  const [coatingPreference, setCoatingPreference] = useState<CoatingType>('siloxanica_transpirable');
  const [needsScaffolding, setNeedsScaffolding] = useState<boolean>(true);
  const [notes, setNotes] = useState('');

  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdRequest, setCreatedRequest] = useState<QuoteRequest | null>(null);

  if (!isOpen) return null;

  // Photo handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Sample photo helpers for quick testing
  const addSamplePhoto = (sampleUrl: string) => {
    setPhotos((prev) => [...prev, sampleUrl]);
  };

  const validateStep1 = () => {
    return clientName.trim().length > 2 && clientPhone.trim().length > 6 && clientEmail.includes('@');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const generatedCode = `ART-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newRequest: QuoteRequest = {
      id: `req-${Date.now()}`,
      trackingCode: generatedCode,
      createdAt: new Date().toISOString(),
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      clientPhone: clientPhone.trim(),
      address: address.trim() || 'Dirección no especificada',
      city: city.trim() || 'Madrid',
      propertyType,
      surfaceAreaM2: Number(surfaceAreaM2) || 150,
      floorsCount: Number(floorsCount) || 1,
      wallCondition,
      coatingPreference,
      needsScaffolding,
      notes: notes.trim(),
      photos: photos.length > 0 ? photos : ['/src/assets/images/facade_residential_villa_1793990057327.jpg'],
      status: 'pendiente',
      unreadAdminMessages: 1,
      unreadClientMessages: 0,
    };

    setTimeout(() => {
      addQuoteRequest(newRequest);
      setCreatedRequest(newRequest);
      setIsSubmitting(false);
      setStep(4);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-6">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              {step === 4 ? '¡Solicitud Recibida!' : 'Solicitar Presupuesto de Fachada'}
            </h3>
            <p className="text-xs text-neutral-500">
              {step === 1 && 'Paso 1 de 3: Datos de Contacto'}
              {step === 2 && 'Paso 2 de 3: Características y Estado de las Paredes'}
              {step === 3 && 'Paso 3 de 3: Fotos de Fachada y Observaciones'}
              {step === 4 && 'Tu código de seguimiento ha sido generado'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        {step < 4 && (
          <div className="w-full bg-neutral-100 h-1">
            <div
              className="bg-amber-600 h-1 transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        )}

        <div className="p-6">
          {/* STEP 1: CONTACT DATA */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Tipo de inmueble
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'unifamiliar', label: 'Chalet / Unifamiliar', icon: Home },
                    { id: 'comunidad_propietarios', label: 'Comunidad Vecinos', icon: Building2 },
                    { id: 'edificio_residencial', label: 'Edificio Completo', icon: Layers },
                    { id: 'local_comercial', label: 'Local Comercial', icon: Store },
                    { id: 'nave_industrial', label: 'Nave / Industria', icon: Warehouse },
                  ].map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setPropertyType(t.id as PropertyType)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center gap-2 ${
                          propertyType === t.id
                            ? 'border-amber-600 bg-amber-50/50 text-neutral-900 font-semibold shadow-xs'
                            : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-amber-700 shrink-0" />
                        <span className="truncate">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Nombre y Apellidos *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ej. Roberto Sánchez Gómez"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Teléfono / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="Ej. +34 600 000 000"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Correo Electrónico (para recibir la propuesta formal) *
                </label>
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="tuemail@ejemplo.com"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Dirección de la obra
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Calle, número, urbanización"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Ciudad / Población
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ej. Madrid"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  disabled={!validateStep1()}
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente: Detalles de Fachada →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: WALL CONDITIONS & SPECS */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-neutral-700">
                      Superficie estimada (m²)
                    </label>
                    <span className="text-xs font-bold text-amber-800 tabular-nums">
                      {surfaceAreaM2} m²
                    </span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={2500}
                    step={10}
                    value={surfaceAreaM2}
                    onChange={(e) => setSurfaceAreaM2(Number(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-400 mt-0.5">
                    <span>40 m²</span>
                    <span>1.000 m²</span>
                    <span>2.500+ m²</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Número de alturas o plantas
                  </label>
                  <select
                    value={floorsCount}
                    onChange={(e) => setFloorsCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-hidden focus:border-amber-600"
                  >
                    <option value={1}>1 Planta (Baja)</option>
                    <option value={2}>2 Plantas (Chalet / Dúplex)</option>
                    <option value={3}>3 Plantas</option>
                    <option value={4}>4 a 6 Plantas (Bloque mediano)</option>
                    <option value={7}>Más de 7 Plantas (Torre)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Estado actual de las paredes exteriores
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'buen_estado', label: 'Buen estado (Solo cambio de color/refresco)' },
                    { id: 'fisuras_leves', label: 'Fisuras superficiales leves' },
                    { id: 'desprendimientos', label: 'Desconchados o huecos que caen' },
                    { id: 'humedad_moho', label: 'Manchas de humedad, verdín o salitre' },
                    { id: 'descascarillado_severo', label: 'Pintura antigua muy descascarillada' },
                  ].map((cond) => (
                    <button
                      key={cond.id}
                      type="button"
                      onClick={() => setWallCondition(cond.id as WallCondition)}
                      className={`p-2.5 rounded-lg border text-left transition-colors ${
                        wallCondition === cond.id
                          ? 'border-amber-600 bg-amber-50 text-neutral-900 font-semibold'
                          : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                      }`}
                    >
                      {cond.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Tipo de revestimiento o pintura deseada
                </label>
                <select
                  value={coatingPreference}
                  onChange={(e) => setCoatingPreference(e.target.value as CoatingType)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-hidden focus:border-amber-600"
                >
                  <option value="siloxanica_transpirable">Siloxánica de alta transpirabilidad (Recomendada clima templado/húmedo)</option>
                  <option value="acrilica_impermeable">Acrílica impermeable estándar (Excelente relación calidad-precio)</option>
                  <option value="mineral_silicato">Mineral al silicato (Ideal para fincas históricas y piedra)</option>
                  <option value="elastomero_antifisuras">Elastómero antifisuras (Puentea grietas activas hasta 1.5mm)</option>
                  <option value="por_asesorar">Prefiero que Artelibreo me asesore según las fotos</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-neutral-200 text-neutral-600 rounded-lg text-xs font-medium hover:bg-neutral-50"
                >
                  ← Volver a Contacto
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-colors"
                >
                  Siguiente: Adjuntar Fotos →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PHOTOS & NOTES */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Fotos de las fachadas o paredes *
                </label>
                <p className="text-xs text-neutral-500 mb-3">
                  Sube fotos generales y de detalle de grietas o manchas para calcular la partida exacta de materiales y andamiaje.
                </p>

                {/* Upload dropzone */}
                <label className="border-2 border-dashed border-neutral-300 hover:border-amber-600 bg-neutral-50 hover:bg-amber-50/20 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                  <Upload className="w-7 h-7 text-neutral-400 group-hover:text-amber-700 mb-2 transition-colors" />
                  <span className="text-xs font-semibold text-neutral-700">
                    Haz clic para seleccionar fotos o arrástralas aquí
                  </span>
                  <span className="text-[11px] text-neutral-400 mt-0.5">
                    JPG, PNG o WEBP (máx. 10 MB por foto)
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Quick sample photos buttons for convenience */}
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className="text-neutral-500 text-[11px]">¿Sin fotos ahora? Añade de muestra:</span>
                  <button
                    type="button"
                    onClick={() => addSamplePhoto('/src/assets/images/facade_residential_villa_1793990057327.jpg')}
                    className="text-amber-800 hover:underline text-[11px] font-medium"
                  >
                    + Chalet muestra
                  </button>
                  <span className="text-neutral-300">·</span>
                  <button
                    type="button"
                    onClick={() => addSamplePhoto('/src/assets/images/facade_commercial_building_1793990057926.jpg')}
                    className="text-amber-800 hover:underline text-[11px] font-medium"
                  >
                    + Edificio muestra
                  </button>
                </div>

                {/* Preview Grid */}
                {photos.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {photos.map((photo, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border border-neutral-200 aspect-square bg-neutral-100">
                        <img
                          src={photo}
                          alt={`Foto fachada ${idx + 1}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-1 right-1 p-1 bg-red-600/90 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Eliminar foto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Notas u observaciones para el maestro pintor (Opcional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej. Hay acceso estrecho para andamios, preferimos tonos claros en blanco roto y queremos pintar también los canalones de lluvia..."
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-hidden focus:border-amber-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 border border-neutral-200 text-neutral-600 rounded-lg text-xs font-medium hover:bg-neutral-50"
                >
                  ← Volver
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className="px-6 py-2.5 bg-neutral-900 text-white rounded-lg text-xs font-bold hover:bg-neutral-800 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Procesando solicitud...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Enviar y Solicitar Presupuesto</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION */}
          {step === 4 && createdRequest && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl mx-auto flex items-center justify-center">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-neutral-900">
                  ¡Solicitud Registrada con Éxito!
                </h4>
                <p className="text-xs text-neutral-600 mt-1 max-w-md mx-auto">
                  Hemos recibido tus datos y fotos. El equipo técnico de Artelibreo está analizando las superficies para emitir tu propuesta detallada.
                </p>
              </div>

              {/* Code card */}
              <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200/80 max-w-sm mx-auto text-left">
                <div className="flex items-center justify-between text-xs text-amber-900 mb-1">
                  <span className="font-semibold">Código de Seguimiento</span>
                  <span className="text-[11px] font-mono bg-white px-2 py-0.5 rounded border border-amber-200">
                    {createdRequest.trackingCode}
                  </span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Guarda este código para consultar el estado en cualquier momento o chatear directamente.
                </p>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <button
                  onClick={() => {
                    onClose();
                    onSuccess(createdRequest, true); // open chat
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-neutral-900 text-white text-xs font-bold rounded-lg hover:bg-neutral-800 flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Abrir Chat con Artelibreo</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onSuccess(createdRequest, false); // view portal
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-neutral-100 text-neutral-800 text-xs font-semibold rounded-lg hover:bg-neutral-200 transition-colors"
                >
                  Ver Estado en Mis Presupuestos
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
