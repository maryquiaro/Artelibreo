import React, { useState } from 'react';
import { PortfolioProject } from '../types';
import { Ruler, Clock, ShieldCheck, MapPin, Star, Eye, ChevronRight } from 'lucide-react';

interface PortfolioProps {
  projects: PortfolioProject[];
  onRequestQuote: () => void;
}

export const Portfolio: React.FC<PortfolioProps> = ({ projects, onRequestQuote }) => {
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);

  const categories = ['Todos', 'Residencial', 'Comercial', 'Histórico', 'Comunidades'];

  const filteredProjects = activeCategory === 'Todos'
    ? projects
    : projects.filter((p) => p.category === activeCategory);

  return (
    <section id="portafolio" className="py-16 sm:py-20 bg-neutral-50 border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1.5">
              Portafolio de Fachadas Ejecutadas
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950">
              Obras Realizadas y Rehabilitación Técnica
            </h2>
            <p className="text-sm text-neutral-600 mt-2 max-w-xl">
              Cada proyecto es tratado como una obra arquitectónica única. Analiza nuestras intervenciones con pinturas minerales, siloxánicas y elastómeros certificados.
            </p>
          </div>

          {/* Category Filter Tabs (functional segmented control) */}
          <div className="flex items-center gap-1 p-1 bg-neutral-200/60 rounded-xl overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  activeCategory === cat
                    ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-2xl overflow-hidden border border-neutral-200/80 shadow-sm hover:shadow-md transition-all flex flex-col group"
            >
              {/* Media with measured scrim */}
              <div className="relative aspect-16/10 bg-neutral-100 overflow-hidden cursor-pointer" onClick={() => setSelectedProject(project)}>
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                
                {/* Measured Scrim for legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent flex flex-col justify-end p-5 text-white">
                  <div className="flex items-center gap-2 text-xs text-amber-300 font-medium mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{project.location}</span>
                    <span aria-hidden="true">·</span>
                    <span>{project.completionYear}</span>
                  </div>
                  <h3 className="text-lg font-bold leading-snug text-white">
                    {project.title}
                  </h3>
                </div>

                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="p-2 bg-neutral-950/75 backdrop-blur-xs text-white rounded-lg flex items-center gap-1 text-xs font-medium">
                    <Eye className="w-3.5 h-3.5" />
                    Detalles
                  </span>
                </div>
              </div>

              {/* Technical Data & Highlights */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  {/* Clean unboxed metadata */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-600 pb-3 border-b border-neutral-100">
                    <span className="flex items-center gap-1 font-medium text-neutral-900">
                      <Ruler className="w-3.5 h-3.5 text-neutral-400" />
                      <span className="tabular-nums">{project.surfaceM2}</span> m²
                    </span>
                    <span aria-hidden="true" className="text-neutral-300">·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      {project.duration}
                    </span>
                    <span aria-hidden="true" className="text-neutral-300">·</span>
                    <span className="flex items-center gap-1 text-amber-800 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {project.warrantyYears} años garantía
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 mt-3 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.highlights.map((h, i) => (
                      <span
                        key={i}
                        className="text-[11px] text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-md"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Testimonial excerpt if available */}
                {project.clientReview && (
                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-start gap-2.5">
                    <div className="flex text-amber-500 shrink-0 mt-0.5">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-[11px] text-neutral-500 italic flex-1">
                      "{project.clientReview.text}" — <span className="font-semibold not-italic text-neutral-700">{project.clientReview.author}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="px-5 pb-4 pt-1 flex justify-end">
                <button
                  onClick={() => setSelectedProject(project)}
                  className="text-xs font-semibold text-neutral-900 hover:text-amber-800 flex items-center gap-1 group/btn"
                >
                  <span>Ver ficha técnica completa</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 p-6 sm:p-8 bg-neutral-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div>
            <h3 className="text-lg font-bold">¿Tienes una fachada similar para pintar o restaurar?</h3>
            <p className="text-xs text-neutral-300 mt-1 max-w-lg">
              Envía tus fotos hoy mismo. Te entregamos un presupuesto pormenorizado sin coste ni compromiso.
            </p>
          </div>
          <button
            onClick={onRequestQuote}
            className="px-5 py-3 bg-white text-neutral-950 font-bold text-xs rounded-xl hover:bg-neutral-100 transition-colors whitespace-nowrap shrink-0"
          >
            Pedir Presupuesto Para Mi Fachada
          </button>
        </div>

      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-6">
            <div className="relative aspect-16/9 bg-neutral-100">
              <img
                src={selectedProject.imageUrl}
                alt={selectedProject.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-3 right-3 p-1.5 bg-neutral-950/60 hover:bg-neutral-950 text-white rounded-full transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
                  <span>{selectedProject.category}</span>
                  <span>·</span>
                  <span>{selectedProject.location}</span>
                </div>
                <h3 className="text-xl font-bold text-neutral-950">
                  {selectedProject.title}
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 bg-neutral-50 rounded-xl text-center text-xs">
                <div>
                  <span className="text-neutral-400 block text-[10px]">Superficie</span>
                  <span className="font-bold text-neutral-900 tabular-nums">{selectedProject.surfaceM2} m²</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">Duración de Obra</span>
                  <span className="font-bold text-neutral-900">{selectedProject.duration}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">Garantía</span>
                  <span className="font-bold text-amber-800">{selectedProject.warrantyYears} Años</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-neutral-900 mb-1">Tratamiento y Materiales</h4>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {selectedProject.description}
                </p>
                <div className="mt-2 text-xs font-medium text-amber-900 bg-amber-50 p-2.5 rounded-lg border border-amber-200/60">
                  <strong>Revestimiento aplicado:</strong> {selectedProject.coatingType}
                </div>
              </div>

              {selectedProject.clientReview && (
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                  <div className="flex items-center gap-1 text-amber-500 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-xs font-semibold text-neutral-700 ml-1">Opinión de la propiedad</span>
                  </div>
                  <p className="text-xs text-neutral-600 italic">
                    "{selectedProject.clientReview.text}"
                  </p>
                  <span className="text-[11px] text-neutral-400 block mt-1">
                    — {selectedProject.clientReview.author}
                  </span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-2 border border-neutral-200 text-neutral-600 text-xs font-medium rounded-lg hover:bg-neutral-50"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    setSelectedProject(null);
                    onRequestQuote();
                  }}
                  className="px-5 py-2 bg-neutral-900 text-white text-xs font-bold rounded-lg hover:bg-neutral-800"
                >
                  Pedir Presupuesto Similar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
