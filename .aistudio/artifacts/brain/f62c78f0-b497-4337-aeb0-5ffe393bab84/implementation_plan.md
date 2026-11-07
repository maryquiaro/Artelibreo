# Sistema de Gestión de Clientes (CRM) para Artelibreo

Módulo integral de CRM diseñado para el panel de administración de Artelibreo que permite centralizar a todos los clientes que han solicitado presupuestos, visualizar sus datos de contacto, filtrar por estado de negociación (Pendiente, Presupuesto enviado, Trato cerrado) y registrar notas internas privadas de seguimiento.

## Decisiones Confirmadas y Respuestas del Usuario

> [!IMPORTANT]
> **Estructura elegida**: Se implementará una **pestaña dedicada de "Clientes CRM"** en la navegación superior del panel de administración, separando la gestión comercial y de relaciones con clientes del flujo operativo de la bandeja de entrada.
> **Cómo editar la app**: El usuario puede tanto editar datos desde la propia aplicación (logo, nombre, teléfonos, descripciones y notas en el CRM) como pedir nuevas funcionalidades y personalizaciones de código en este chat.

- **Confirmación 1**: Módulo CRM accesible como pestaña independiente en el modo administrador.
- **Confirmación 2**: Ficha completa por cliente con historial de solicitudes, presupuestos emitidos, chat directo y notas privadas.
- **Confirmación 3**: Estados unificados de gestión comercial: *Pendiente*, *Presupuesto enviado* y *Trato cerrado* (junto a los estados técnicos de obra).

---

## 1. Visión General y Concepto Central

- **Qué hace**: Agrupa todas las solicitudes por cliente (nombre, email, teléfono, ciudad), permitiendo al administrador dar seguimiento comercial continuo, cambiar el estado del trato con un solo clic y añadir notas internas fechadas (ej. "Llamar el martes para acordar color", "Cliente pide descuento por pronto pago", "Prefiere inicio en primavera").
- **Público objetivo**: El administrador y equipo técnico de Artelibreo para maximizar la tasa de cierre de presupuestos de pintura de fachadas.
- **Valor aportado**: Evita la pérdida de contactos potenciales, unifica el historial de conversaciones y presupuestos en una sola vista y profesionaliza el seguimiento comercial.

---

## 2. Experiencia de Usuario y Diseño Visual

### Flujo del Administrador en el CRM
1. **Acceso directo**: Al activar el "Panel Admin", aparece la nueva pestaña **"Clientes CRM"** en el encabezado.
2. **Dashboard de Clientes**:
   - Tarjetas de resumen métrico: *Total Clientes*, *Pendientes de Contacto*, *Presupuestos en Negociación*, *Tratos Cerrados / Clientes Ganados*.
   - Buscador en tiempo real por nombre, teléfono, email o población.
   - Filtro por estado del trato: *Todos*, *Pendiente*, *Presupuesto enviado*, *Trato cerrado*.
3. **Ficha de Cliente (Panel Lateral o Modal Detallado)**:
   - Cabecera con avatar, nombre, teléfono (con enlace directo a llamada y WhatsApp) y email.
   - Selector rápido de estado del trato comercial.
   - Historial de solicitudes y presupuestos asociados con importes en euros.
   - **Muro de Notas Internas**:
     - Formulario rápido para redactar una nueva nota.
     - Lista cronológica de notas con fecha, hora y contenido.
     - Botón para eliminar o archivar notas resueltas.
   - Botón directo para abrir el chat con el cliente o editar su presupuesto.

### Identidad Visual y Estilo
- **Línea estética**: Consistente con el diseño arquitectónico de Artelibreo (fondos neutros limpios, bordes sutiles en `border-neutral-200`, acentos cálidos en ámbar/dorado y tipografía geométrica legible `Plus Jakarta Sans`).
- **Estados visuales**:
  - *Pendiente*: Distintivo sutil ámbar suave.
  - *Presupuesto enviado*: Distintivo azul/índigo sobrio.
  - *Trato cerrado*: Distintivo verde esmeralda con icono de verificación.
- **Micro-interacciones**: Transiciones fluidas al cambiar de estado, guardado automático de notas con feedback visual inmediato y persistencia reactiva.

---

## 3. Decisiones Técnicas y de Producto

- **Persistencia Reactiva en Almacenamiento Local**:
  - *Enfoque*: Se extenderán los modelos de datos en `src/types/index.ts` y el motor de almacenamiento reactivo en `src/services/storage.ts` para soportar `ClientNote` y el estado comercial de cliente sin alterar los datos existentes.
  - *Motivo*: Los cambios se reflejan inmediatamente en toda la app sin recargar la página, garantizando compatibilidad con el sistema de exportación/importación existente.
- **Separación entre Bandeja de Entrada y CRM**:
  - *Bandeja de Entrada*: Orientada a la tarea operativa inmediata (revisar fotos de fachadas, generar presupuestos técnicos).
  - *Pestaña Clientes CRM*: Orientada a la relación a medio/largo plazo con el cliente, notas de seguimiento, historial comercial y cierre del trato.

---

## 4. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    Navegación / Header                      │
│  [Logo Artelibreo]  ─  [Bandeja] [Clientes CRM] [Base Datos] │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌─────────────────────────┐           ┌─────────────────────────┐
│     Lista de Clientes   │           │    Ficha del Cliente    │
│ ─────────────────────── │           │ ─────────────────────── │
│ • Buscador & Filtros    │  ───────► │ • Datos de contacto     │
│ • Estado: Pendiente /   │  Select   │ • Estado del trato      │
│   Presupuesto / Cerrado │           │ • Solicitudes asociadas │
│ • Contador de notas     │           │ • Sistema de Notas CRM  │
└─────────────────────────┘           └───────────┬─────────────┘
                                                  │
                                                  ▼
                                      ┌─────────────────────────┐
                                      │   Almacenamiento Local  │
                                      │   (storage.ts reactivo) │
                                      │  • saveClientNote()     │
                                      │  • updateClientStatus() │
                                      └─────────────────────────┘
```

### Componentes y Archivos a Crear o Modificar
1. `src/types/index.ts`: Añadir tipos para `ClientNote`, `CRMClient` y estados de trato comercial (`lead_status`).
2. `src/services/storage.ts`: Añadir funciones para agregar notas, eliminar notas y actualizar el estado comercial del cliente.
3. `src/components/AdminCRM.tsx`: Nuevo componente con listado de clientes, métricas, búsqueda, filtros y panel de notas privadas.
4. `src/components/Header.tsx`: Incorporar el acceso a la pestaña "Clientes CRM" en el menú de navegación del administrador.
5. `src/App.tsx`: Conectar la vista del CRM y el enrutamiento de estados.
