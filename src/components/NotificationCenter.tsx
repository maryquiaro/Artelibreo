import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, BellRing, Sparkles, Volume2, ShieldCheck, X } from 'lucide-react';
import { AppNotification } from '../types';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  requestPushPermission, 
  getPushPermissionStatus, 
  triggerPushNotification,
  subscribeToStore 
} from '../services/storage';

interface NotificationCenterProps {
  onSelectRequest?: (requestId: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onSelectRequest }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [showPermissionBanner, setShowPermissionBanner] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      setNotifications(getNotifications());
      setPermission(getPushPermissionStatus());
    };
    update();
    const unsubscribe = subscribeToStore(update);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (permission === 'default') {
      setShowPermissionBanner(true);
    }
  }, [permission]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleRequestPermission = async () => {
    const perm = await requestPushPermission();
    setPermission(perm);
    setShowPermissionBanner(false);
    if (perm === 'granted') {
      triggerPushNotification('¡Notificaciones Activadas!', 'Recibirás avisos instantáneos cuando tu presupuesto de fachada esté listo.');
    }
  };

  const handleTestNotification = () => {
    triggerPushNotification(
      'Notificación de Prueba Artelibreo',
      'El sistema de alertas push funciona correctamente en tu navegador.'
    );
  };

  const handleNotificationClick = (notif: AppNotification) => {
    markNotificationAsRead(notif.id);
    if (notif.relatedRequestId && onSelectRequest) {
      onSelectRequest(notif.relatedRequestId);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notificaciones"
        className="relative p-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors focus-visible:outline-2 focus-visible:outline-amber-600"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-amber-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-white rounded-xl shadow-xl border border-neutral-200 z-50 overflow-hidden text-neutral-800 animate-in fade-in zoom-in-95 duration-150">
          <div className="p-3.5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/80">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-neutral-900">Notificaciones Push</span>
              {unreadCount > 0 && (
                <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-medium">
                  {unreadCount} nuevas
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs">
              {unreadCount > 0 && (
                <button
                  onClick={markAllNotificationsAsRead}
                  className="text-neutral-500 hover:text-neutral-800 transition-colors flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  Leídas
                </button>
              )}
            </div>
          </div>

          {/* Browser push permission bar */}
          {permission !== 'granted' && (
            <div className="p-3 bg-amber-50/70 border-b border-amber-100 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-amber-900">
                <BellRing className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Activa notificaciones de navegador para avisos instantáneos</span>
              </div>
              <button
                onClick={handleRequestPermission}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-medium whitespace-nowrap transition-colors"
              >
                Activar
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-neutral-400 text-sm">
                No tienes notificaciones pendientes
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3 text-left hover:bg-neutral-50 transition-colors cursor-pointer flex gap-3 ${
                    !notif.isRead ? 'bg-amber-50/30' : ''
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {notif.type === 'budget_ready' && (
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                    )}
                    {notif.type === 'quote_request' && (
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                    )}
                    {notif.type === 'chat_message' && (
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                        <Bell className="w-3.5 h-3.5" />
                      </div>
                    )}
                    {notif.type === 'budget_accepted' && (
                      <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs font-semibold truncate ${!notif.isRead ? 'text-neutral-900' : 'text-neutral-700'}`}>
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-neutral-400 shrink-0">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 line-clamp-2 mt-0.5">
                      {notif.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick test footer */}
          <div className="p-2.5 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span className="flex items-center gap-1.5 text-[11px]">
              <Volume2 className="w-3.5 h-3.5 text-neutral-400" />
              Alerta sonora activa
            </span>
            <button
              onClick={handleTestNotification}
              className="text-amber-700 hover:text-amber-800 font-medium text-[11px] underline underline-offset-2"
            >
              Probar aviso
            </button>
          </div>
        </div>
      )}

      {/* Floating Permission Toast prompt when not decided */}
      {showPermissionBanner && permission === 'default' && !isOpen && (
        <div className="fixed bottom-4 right-4 max-w-sm bg-white p-4 rounded-xl shadow-2xl border border-neutral-200 z-50 flex items-start gap-3 animate-in slide-in-from-bottom duration-300">
          <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <BellRing className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-neutral-900">Activa avisos de tu presupuesto</h4>
            <p className="text-xs text-neutral-600 mt-1">
              Te avisaremos en cuanto el maestro pintor revise tus fotos de fachada y emita tu propuesta.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={handleRequestPermission}
                className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-medium transition-colors"
              >
                Permitir avisos
              </button>
              <button
                onClick={() => setShowPermissionBanner(false)}
                className="px-2.5 py-1.5 text-neutral-500 hover:text-neutral-700 text-xs font-medium"
              >
                Más tarde
              </button>
            </div>
          </div>
          <button 
            onClick={() => setShowPermissionBanner(false)}
            className="text-neutral-400 hover:text-neutral-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
