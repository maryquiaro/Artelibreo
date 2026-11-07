import React, { useState, useEffect } from 'react';
import { QuoteRequest, BudgetItem, IssuedBudget } from '../types';
import { X, Plus, Trash2, Calculator, Sparkles, Check, ShieldCheck } from 'lucide-react';
import { saveBudgetForRequest } from '../services/storage';

interface BudgetBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: QuoteRequest | null;
  onSaved: () => void;
}

export const BudgetBuilderModal: React.FC<BudgetBuilderModalProps> = ({
  isOpen,
  onClose,
  request,
  onSaved,
}) => {
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [materialsBrand, setMaterialsBrand] = useState('Valentine Fachadas Ultra / Pro-Color Siliconada');
  const [warrantyYears, setWarrantyYears] = useState(10);
  const [estimatedDays, setEstimatedDays] = useState('5 a 7 días laborables');
  const [technicianNotes, setTechnicianNotes] = useState(
    'Incluye lavado con agua a presión, tratamiento fungicida en zonas de sombra, sellado de fisuras dinámicas y dos manos de acabado de alta resistencia UV.'
  );
  const [taxRate, setTaxRate] = useState<number>(0.10); // 10% IVA reducido
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);

  // New item quick add state
  const [newConcept, setNewConcept] = useState('');
  const [newCategory, setNewCategory] = useState<BudgetItem['category']>('aplicacion');
  const [newQty, setNewQty] = useState<number>(1);
  const [newUnit, setNewUnit] = useState<BudgetItem['unit']>('m²');
  const [newPrice, setNewPrice] = useState<number>(12);

  useEffect(() => {
    if (!request) return;

    if (request.budget) {
      // Load existing budget for editing
      setItems(request.budget.items);
      setMaterialsBrand(request.budget.materialsBrand);
      setWarrantyYears(request.budget.warrantyYears);
      setEstimatedDays(request.budget.estimatedDays);
      setTechnicianNotes(request.budget.technicianNotes);
      setTaxRate(request.budget.taxRate);
      setDiscountPercentage(request.budget.discountPercentage);
    } else {
      // Auto-populate intelligent defaults based on client's request specs
      const m2 = request.surfaceAreaM2 || 200;
      const initialItems: BudgetItem[] = [
        {
          id: `item-${Date.now()}-1`,
          concept: 'Limpieza mecánica con hidrolavadora a presión (180 bar) y tratamiento biocida antimoho',
          category: 'preparacion',
          quantity: m2,
          unit: 'm²',
          unitPrice: 4.5,
          total: m2 * 4.5,
        },
        {
          id: `item-${Date.now()}-2`,
          concept: 'Saneamiento, raspado de zonas degradadas y masillado elástico de fisuras con malla de fibra',
          category: 'preparacion',
          quantity: Math.round(m2 * 0.15) || 30,
          unit: 'ml',
          unitPrice: 7.5,
          total: (Math.round(m2 * 0.15) || 30) * 7.5,
        },
        {
          id: `item-${Date.now()}-3`,
          concept: 'Fijador de imprimación hidrófuga penetrante reguladora de porosidad',
          category: 'materiales',
          quantity: m2,
          unit: 'm²',
          unitPrice: 3.2,
          total: m2 * 3.2,
        },
        {
          id: `item-${Date.now()}-4`,
          concept: `Aplicación de 2 manos de pintura técnica de fachada (${request.coatingPreference.replace('_', ' ')})`,
          category: 'aplicacion',
          quantity: m2,
          unit: 'm²',
          unitPrice: 10.8,
          total: m2 * 10.8,
        },
      ];

      if (request.needsScaffolding) {
        initialItems.push({
          id: `item-${Date.now()}-5`,
          concept: 'Montaje, desmontaje y alquiler de andamio europeo homologado con protecciones y red de seguridad',
          category: 'andamios',
          quantity: 1,
          unit: 'partida',
          unitPrice: 480,
          total: 480,
        });
      }

      setItems(initialItems);
    }
  }, [request]);

  if (!isOpen || !request) return null;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConcept.trim()) return;

    const qty = Number(newQty) || 1;
    const price = Number(newPrice) || 0;
    const item: BudgetItem = {
      id: `item-${Date.now()}`,
      concept: newConcept.trim(),
      category: newCategory,
      quantity: qty,
      unit: newUnit,
      unitPrice: price,
      total: qty * price,
    };

    setItems([...items, item]);
    setNewConcept('');
    setNewQty(1);
    setNewPrice(10);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const handleUpdateItem = (id: string, field: 'quantity' | 'unitPrice', val: number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const qty = field === 'quantity' ? val : item.quantity;
          const price = field === 'unitPrice' ? val : item.unitPrice;
          return {
            ...item,
            [field]: val,
            total: qty * price,
          };
        }
        return item;
      })
    );
  };

  // Calculations
  const subtotal = items.reduce((acc, cur) => acc + cur.total, 0);
  const discountAmount = subtotal * (discountPercentage / 100);
  const subtotalAfterDiscount = subtotal - discountAmount;
  const taxAmount = subtotalAfterDiscount * taxRate;
  const grandTotal = subtotalAfterDiscount + taxAmount;

  const handleSaveAndSend = () => {
    const budgetCode = request.budget?.code || `PRE-2026-${Math.floor(100 + Math.random() * 900)}`;
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);

    const issuedBudget: IssuedBudget = {
      id: request.budget?.id || `bud-${Date.now()}`,
      code: budgetCode,
      requestId: request.id,
      createdAt: new Date().toISOString(),
      validUntil: validUntil.toISOString(),
      warrantyYears,
      items,
      subtotal,
      discountPercentage,
      taxRate,
      taxAmount,
      total: grandTotal,
      estimatedDays,
      technicianNotes,
      materialsBrand,
      isAccepted: request.budget?.isAccepted || false,
      acceptedAt: request.budget?.acceptedAt,
      clientSignatureName: request.budget?.clientSignatureName,
    };

    saveBudgetForRequest(request.id, issuedBudget);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 bg-neutral-50/80 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-neutral-900 bg-neutral-200/80 px-2 py-0.5 rounded">
                {request.trackingCode}
              </span>
              <span className="text-xs text-neutral-500">
                {request.propertyType.replace('_', ' ')} · {request.surfaceAreaM2} m² · {request.city}
              </span>
            </div>
            <h3 className="text-base font-bold text-neutral-950 mt-1">
              Generador de Presupuesto Personalizado — {request.clientName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Quick Request Snapshot */}
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs flex flex-wrap items-center justify-between gap-3 text-neutral-600">
            <div>
              <span className="font-semibold text-neutral-800">Estado paredes: </span>
              {request.wallCondition.replace('_', ' ')}
            </div>
            <div>
              <span className="font-semibold text-neutral-800">Pintura solicitada: </span>
              {request.coatingPreference.replace('_', ' ')}
            </div>
            <div>
              <span className="font-semibold text-neutral-800">Andamio necesario: </span>
              {request.needsScaffolding ? 'Sí' : 'No'}
            </div>
            <div>
              <span className="font-semibold text-neutral-800">Fotos recibidas: </span>
              {request.photos.length}
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                Partidas y Conceptos Técnicos ({items.length})
              </h4>
              <span className="text-xs text-neutral-400">Edita las cantidades o precios directamente</span>
            </div>

            <div className="border border-neutral-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Concepto</th>
                    <th className="py-2.5 px-2 font-semibold text-right w-20">Cant.</th>
                    <th className="py-2.5 px-2 font-semibold text-center w-16">Ud.</th>
                    <th className="py-2.5 px-2 font-semibold text-right w-24">Precio (€)</th>
                    <th className="py-2.5 px-3 font-semibold text-right w-24">Total</th>
                    <th className="py-2.5 px-2 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50/50">
                      <td className="py-2 px-3 font-medium text-neutral-900">
                        {item.concept}
                      </td>
                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(item.id, 'quantity', Number(e.target.value))}
                          className="w-16 px-1.5 py-1 text-right text-xs rounded border border-neutral-200 focus:outline-hidden focus:border-amber-600"
                        />
                      </td>
                      <td className="py-2 px-2 text-center text-neutral-500 text-[11px]">
                        {item.unit}
                      </td>
                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          step="0.1"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateItem(item.id, 'unitPrice', Number(e.target.value))}
                          className="w-20 px-1.5 py-1 text-right text-xs rounded border border-neutral-200 focus:outline-hidden focus:border-amber-600"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-neutral-900 tabular-nums">
                        {item.total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-neutral-400 hover:text-red-600 p-1 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Quick Add Line Item Form */}
            <form onSubmit={handleAddItem} className="mt-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 flex flex-wrap items-center gap-2 text-xs">
              <input
                type="text"
                placeholder="Añadir nuevo concepto (ej. Sellado de juntas de dilatación...)"
                value={newConcept}
                onChange={(e) => setNewConcept(e.target.value)}
                className="flex-1 min-w-[200px] px-3 py-1.5 bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:border-amber-600"
              />
              <input
                type="number"
                placeholder="Cant."
                value={newQty}
                onChange={(e) => setNewQty(Number(e.target.value))}
                className="w-16 px-2 py-1.5 bg-white border border-neutral-300 rounded-lg text-right"
              />
              <select
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value as BudgetItem['unit'])}
                className="px-2 py-1.5 bg-white border border-neutral-300 rounded-lg"
              >
                <option value="m²">m²</option>
                <option value="ml">ml</option>
                <option value="partida">partida</option>
                <option value="ud">ud</option>
                <option value="día">día</option>
              </select>
              <input
                type="number"
                step="0.5"
                placeholder="Precio €"
                value={newPrice}
                onChange={(e) => setNewPrice(Number(e.target.value))}
                className="w-20 px-2 py-1.5 bg-white border border-neutral-300 rounded-lg text-right"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir</span>
              </button>
            </form>
          </div>

          {/* Budget Parameters: Warranty, Notes, Discounts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Marca y Gama de Materiales Técnicos
                </label>
                <input
                  type="text"
                  value={materialsBrand}
                  onChange={(e) => setMaterialsBrand(e.target.value)}
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg focus:outline-hidden focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Garantía por escrito
                  </label>
                  <select
                    value={warrantyYears}
                    onChange={(e) => setWarrantyYears(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg"
                  >
                    <option value={5}>5 Años</option>
                    <option value={8}>8 Años</option>
                    <option value={10}>10 Años (Estándar)</option>
                    <option value={12}>12 Años (Premium)</option>
                    <option value={15}>15 Años (Silicatos)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Plazo estimado obra
                  </label>
                  <input
                    type="text"
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(e.target.value)}
                    placeholder="Ej. 7 a 10 días laborables"
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Observaciones Técnicas para el Cliente
                </label>
                <textarea
                  rows={2}
                  value={technicianNotes}
                  onChange={(e) => setTechnicianNotes(e.target.value)}
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg"
                />
              </div>
            </div>

            {/* Price Summary Calculation Card */}
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 flex flex-col justify-between">
              <div>
                <h5 className="font-bold text-neutral-900 mb-3 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-amber-700" />
                  <span>Cálculo Económico del Presupuesto</span>
                </h5>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal Partidas:</span>
                    <span className="font-semibold tabular-nums text-neutral-900">
                      {subtotal.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-neutral-600">
                    <span className="flex items-center gap-1">
                      Descuento comercial:
                      <input
                        type="number"
                        min={0}
                        max={50}
                        value={discountPercentage}
                        onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                        className="w-12 px-1 py-0.5 text-right border border-neutral-300 rounded text-xs"
                      />
                      %
                    </span>
                    <span className="text-emerald-700 tabular-nums">
                      -{discountAmount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-neutral-600">
                    <span className="flex items-center gap-1">
                      Régimen de IVA:
                      <select
                        value={taxRate}
                        onChange={(e) => setTaxRate(Number(e.target.value))}
                        className="px-1 py-0.5 border border-neutral-300 rounded text-xs"
                      >
                        <option value={0.10}>10% (Rehabilitación vivienda)</option>
                        <option value={0.21}>21% (General / Comercial)</option>
                      </select>
                    </span>
                    <span className="tabular-nums text-neutral-800">
                      {taxAmount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-200 mt-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-500 block">Total Propuesta:</span>
                  <span className="text-2xl font-extrabold text-neutral-950 tabular-nums">
                    {grandTotal.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>

                <div className="text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60 font-medium">
                  {warrantyYears} Años Garantía Artelibreo
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-neutral-200 text-neutral-700 rounded-lg text-xs font-medium hover:bg-neutral-100"
          >
            Cancelar
          </button>

          <button
            onClick={handleSaveAndSend}
            disabled={items.length === 0}
            className="px-6 py-2.5 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Emitir y Enviar Presupuesto al Cliente</span>
          </button>
        </div>

      </div>
    </div>
  );
};
