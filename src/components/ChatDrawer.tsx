import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, QuoteRequest } from '../types';
import { 
  X, 
  Send, 
  Paintbrush, 
  Paperclip, 
  CheckCheck, 
  User, 
  Sparkles,
  PhoneCall,
  Clock
} from 'lucide-react';
import { 
  getChatMessages, 
  addChatMessage, 
  markChatAsRead, 
  subscribeToStore 
} from '../services/storage';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  request: QuoteRequest | null;
  isAdminView?: boolean;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  request,
  isAdminView = false,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [activeSender, setActiveSender] = useState<'client' | 'admin'>(isAdminView ? 'admin' : 'client');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveSender(isAdminView ? 'admin' : 'client');
  }, [isAdminView]);

  useEffect(() => {
    if (!request) return;

    const load = () => {
      const all = getChatMessages();
      const filtered = all.filter((m) => m.requestId === request.id);
      setMessages(filtered);
    };

    load();
    markChatAsRead(request.id, activeSender);

    const unsubscribe = subscribeToStore(load);
    return () => unsubscribe();
  }, [request, activeSender]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen || !request) return null;

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      requestId: request.id,
      sender: activeSender,
      senderName: activeSender === 'admin' ? 'Carlos (Maestro Pintor Artelibreo)' : request.clientName,
      text,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    addChatMessage(newMsg);
    setInputText('');

    // If client writes, simulate painter fast response after 2.5s for lively experience
    if (activeSender === 'client') {
      setTimeout(() => {
        const autoResponses = [
          'Entendido. Para esa superficie de fachada recomendamos el blanco roto con imprimación siloxánica para repeler el agua y evitar verdín.',
          'El andamiaje homologado y la tramitación de permisos de ocupación pública van 100% incluidos en el presupuesto, sin sobrecostes.',
          'Podemos enviar a un técnico con el muestrario físico de cartas RAL y NCS para verificar el color in situ bajo la luz solar natural.',
          'Perfecto. Si aceptas la propuesta en el panel, reservamos la fecha en nuestro calendario para empezar la próxima semana.',
        ];
        const randomResp = autoResponses[Math.floor(Math.random() * autoResponses.length)];
        addChatMessage({
          id: `msg-${Date.now() + 1}`,
          requestId: request.id,
          sender: 'admin',
          senderName: 'Carlos (Maestro Pintor Artelibreo)',
          text: randomResp,
          timestamp: new Date().toISOString(),
          isRead: false,
        });
      }, 2200);
    }
  };

  const quickPrompts = [
    '¿Qué pintura recomiendan para esta fachada?',
    '¿El andamio está incluido en el precio?',
    '¿Podríamos ver muestras de color en persona?',
    '¿Cuándo podrían empezar los trabajos?',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-neutral-950/50 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl border-l border-neutral-200 animate-in slide-in-from-right duration-200">
        
        {/* Chat Top Header */}
        <div className="p-4 border-b border-neutral-200 bg-neutral-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-neutral-900 text-amber-400 flex items-center justify-center shrink-0">
              <Paintbrush className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-950 flex items-center gap-2">
                <span>Chat Artelibreo</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-mono px-1.5 py-0.5 rounded">
                  {request.trackingCode}
                </span>
              </h3>
              <p className="text-[11px] text-neutral-500 truncate max-w-[200px]">
                {request.clientName} · {request.city}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-200/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sender Persona Switcher (Convenient for testing both sides) */}
        <div className="px-4 py-2 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
          <span className="text-neutral-500 text-[11px]">Enviando como:</span>
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-md border border-neutral-200">
            <button
              onClick={() => setActiveSender('client')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                activeSender === 'client'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Cliente ({request.clientName.split(' ')[0]})
            </button>
            <button
              onClick={() => setActiveSender('admin')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                activeSender === 'admin'
                  ? 'bg-amber-600 text-white'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Artelibreo (Pintor)
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-neutral-50/40">
          {/* Welcome note */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70 text-xs text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Canal directo para acordar detalles</span>
            </div>
            <p className="text-[11px] text-amber-800">
              Utiliza este chat para negociar plazos, consultar sobre colores, pinturas técnicas de fachada o resolver dudas antes de firmar el presupuesto.
            </p>
          </div>

          {messages.map((msg) => {
            const isMe = msg.sender === activeSender;
            const isAdmin = msg.sender === 'admin';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-neutral-400 mb-1 px-1">
                  {msg.senderName}
                </span>

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs leading-relaxed ${
                    isMe
                      ? 'bg-neutral-900 text-white rounded-br-xs'
                      : isAdmin
                      ? 'bg-white border border-neutral-200 text-neutral-900 rounded-bl-xs'
                      : 'bg-amber-100/70 border border-amber-200 text-neutral-900 rounded-bl-xs'
                  }`}
                >
                  <p>{msg.text}</p>

                  <div className={`mt-1 flex items-center justify-end gap-1 text-[9px] ${isMe ? 'text-neutral-400' : 'text-neutral-400'}`}>
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && <CheckCheck className="w-3 h-3 text-amber-400" />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Chips */}
        <div className="p-2 border-t border-neutral-100 bg-white overflow-x-auto flex gap-1.5">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] rounded-full whitespace-nowrap transition-colors shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 bg-white border-t border-neutral-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escribe tu mensaje o consulta..."
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 bg-neutral-950 text-white rounded-xl hover:bg-neutral-800 disabled:opacity-40 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
