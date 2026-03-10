# Libra Seguros — Design System

> Guía de estilos, componentes y principios de diseño para el frontend de la plataforma de gestión de litigación.

---

## Principios de diseño

**Referencia visual:** Raycast, Linear.

El diseño de Libra sigue tres principios:

1. **Tipografía como protagonista.** La jerarquía visual se construye con peso, tamaño y color del texto — no con bordes de colores, íconos decorativos ni fondos saturados.
2. **Información, no decoración.** Cada elemento visual tiene una función. Si un ícono, color o borde no comunica estado o jerarquía, se elimina.
3. **Restringido con intención.** Paleta monocromática con un solo color de acento. Colores adicionales solo para comunicar estado (urgente, atención, ok).

Lo que **nunca** hacemos: gradientes, sombras dramáticas, bordes gruesos de color arriba de cards, íconos dentro de círculos de colores, fondos saturados, animaciones exageradas. Nada que parezca template de dashboard genérico.

---

## Paleta de colores

### Base

| Token | Hex | Uso |
|---|---|---|
| `--bg-primary` | `#FFFFFF` | Fondo de cards, modales, sidebar |
| `--bg-page` | `#F9FAFB` | Fondo general de la página |
| `--bg-hover` | `#F3F4F6` | Hover en items, cards, botones secundarios |
| `--bg-subtle` | `#FAFAFA` | Hover sutil en listas |

### Bordes y separadores

| Token | Hex | Uso |
|---|---|---|
| `--border-default` | `#E5E7EB` | Bordes de cards, dividers, inputs |
| `--border-hover` | `#D1D5DB` | Bordes en hover |

### Texto

| Token | Hex | Uso |
|---|---|---|
| `--text-primary` | `#111827` | Títulos, números grandes, texto principal |
| `--text-secondary` | `#6B7280` | Labels, sub-texto, descripciones |
| `--text-tertiary` | `#9CA3AF` | Timestamps, hints, texto deshabilitado |
| `--text-disabled` | `#D1D5DB` | Items con valor 0, estados inactivos |

### Acento (brand)

| Token | Hex | Uso |
|---|---|---|
| `--accent` | `#EA580C` | Color principal de la marca (naranja Libra). Item activo del sidebar, links de acción, barra indicadora |
| `--accent-bg` | `#FFF7ED` | Fondo sutil del item activo en sidebar |

### Estado

| Token | Hex | Uso |
|---|---|---|
| `--status-success` | `#10B981` | Dot de activo, completado |
| `--status-warning` | `#F59E0B` | Dot de atención, en espera |
| `--status-error` | `#EF4444` | Dot de urgente, bloqueado, vencido |
| `--status-error-bg` | `#FEF2F2` | Fondo de barra de alerta urgente |

Los colores de estado se usan **exclusivamente** para dots de 6-8px, texto de alerta y bordes de alerta. Nunca como fondo de cards completas ni como color de texto principal.

---

## Tipografía

### Font family

Usar la font-family que ya tiene la app (heredada del framework). No agregar fonts externas a menos que sea una decisión deliberada de rediseño.

### Escala tipográfica

| Nivel | Tamaño | Peso | Uso |
|---|---|---|---|
| Display | 2.5rem (40px) | 700 | Números hero en modales (ej: "4.2 min") |
| Heading 1 | 1.5rem (24px) | 600 | Títulos de página ("Panel Principal", "Inbox — Rachel") |
| Heading 2 | 1.125rem (18px) | 600 | Títulos de sección dentro de la página ("Pipeline", "Acciones pendientes") |
| Metric large | 2rem (32px) | 700 | Números grandes en cards de métricas |
| Metric medium | 1.25rem (20px) | 600 | Números en grid de métricas secundarias, pipeline nodes |
| Body | 0.875rem (14px) | 400 | Texto general, descripciones, contenido de listas |
| Body semibold | 0.875rem (14px) | 600 | Nombres de agentes, carátulas de casos, items clickeables |
| Label | 0.75rem (12px) | 500 | Labels de cards de métricas, labels de pipeline |
| Label uppercase | 0.7rem (11.2px) | 500 | Labels de sección ("PANEL DE CONTROL"), categorías. `text-transform: uppercase; letter-spacing: 0.5px` |
| Caption | 0.7rem (11.2px) | 400 | Timestamps, disclaimers, sub-texto terciario |

### Reglas tipográficas

- **Nunca** usar uppercase para texto que no sea labels de categoría o sección.
- **Nunca** usar bold (700) para texto corrido — solo para números y títulos.
- **Nunca** usar más de 3 niveles de jerarquía tipográfica en un mismo componente.
- Letter-spacing: `0px` para texto normal, `0.5px` para labels uppercase, `-0.2px` para títulos grandes.

---

## Espaciado

### Sistema de spacing

Base unit: `4px`. Todos los espacios son múltiplos de 4.

| Token | Valor | Uso |
|---|---|---|
| `--space-xs` | 4px | Separación entre dot y texto de estado |
| `--space-sm` | 8px | Gap entre items de lista, separación entre pills |
| `--space-md` | 12px | Padding vertical de items de navegación |
| `--space-lg` | 16px | Gap entre cards, margin de secciones |
| `--space-xl` | 20px | Padding interno de cards |
| `--space-2xl` | 24px | Padding interno de contenedores principales |
| `--space-3xl` | 32px | Padding interno de modales, separación entre secciones |

### Reglas de espaciado

- Padding interno de cards: `20px` o `24px`, consistente dentro de la misma vista.
- Gap entre cards en una fila: `16px`.
- Margin entre secciones verticales (ej: entre fila de métricas y pipeline): `16px` o `24px`.
- Nunca menos de `8px` de separación entre elementos interactivos.

---

## Bordes y radios

| Elemento | Border | Border-radius |
|---|---|---|
| Cards | `1px solid var(--border-default)` | `12px` |
| Modales | ninguno (sombra en su lugar) | `16px` |
| Pills/chips | ninguno | `6px` |
| Inputs | `1px solid var(--border-default)` | `8px` |
| Botones | `1px solid var(--border-default)` (secundarios) | `8px` |
| Items de sidebar | ninguno | `8px` |
| Dots de estado | ninguno | `50%` (circular) |

### Reglas

- **Nunca** usar bordes de color (top-border naranja, left-border rojo, etc.) como decoración. Solo para la barra de alerta urgente (left-border rojo) y el indicador activo del sidebar (left-bar naranja de 3px).
- **Nunca** usar `border-radius` mayor a `16px` excepto en dots circulares.

---

## Sombras

| Nivel | Valor | Uso |
|---|---|---|
| Ninguna | — | Cards regulares (usan borde en su lugar) |
| Sutil | `0 1px 3px rgba(0,0,0,0.04)` | Cards en hover (opcional) |
| Modal | `0 8px 32px rgba(0,0,0,0.08)` | Modales, paneles slide-in |
| Overlay | `rgba(0,0,0,0.3)` | Backdrop de modales |

### Reglas

- Las cards **no** tienen sombra por defecto. Usan borde.
- Sombra solo en modales y dropdowns.
- **Nunca** sombras con blur mayor a `32px` ni colores de sombra que no sean negro.

---

## Componentes

### Cards de métricas

```
┌─────────────────────────┐
│ Label uppercase          │  ← 0.7rem, gris, uppercase, tracking wide
│ Número grande            │  ← 2rem, bold, negro
│ Sub-texto                │  ← 0.8rem, gris claro
└─────────────────────────┘
```

- Fondo: blanco
- Borde: `1px solid var(--border-default)`
- Radius: `12px`
- Padding: `20px` o `24px`
- Sin ícono. Sin borde de color arriba.
- Hover: `background: var(--bg-subtle)` o `border-color: var(--border-hover)`. Cursor pointer. Transición `150ms`.
- El número es el protagonista visual. Label y sub-texto son secundarios.

### Pipeline (step tracker)

```
  Donna       Mike        Edu        Jess      Rev.humana   Presentada
   (1)  ——→   (1)  ——→   (1)  ——→   (1)  ——→    (1)   ——→    (0)
```

- Nodos: círculos de `28px`.
  - Con casos: relleno `var(--text-primary)`, número en blanco.
  - Sin casos: solo borde `var(--border-default)`, número en `var(--text-disabled)`.
  - Bloqueado: borde `var(--status-error)`, número en rojo.
- Línea entre nodos: `1px solid var(--border-default)`. Sólida entre nodos activos, punteada entre inactivos.
- Chevron (→) entre nodos: `var(--text-disabled)`.
- Labels: arriba del nodo (nombre del agente), debajo del nodo (función). Ambos caption size.

### Items de lista (acciones pendientes, actividad)

```
┌─────────────────────────────────────────┐
│ Jess · Borrador                  Hace 2h│  ← semi-bold + gris
│ García, María c/ Libra Seguros S.A.     │  ← body
│ ⚠ Revisar borrador de contestación      │  ← caption, gris
└─────────────────────────────────────────┘
```

- Sin borde izquierdo de color.
- Separador entre items: `1px solid #F3F4F6` o gap de `8px`.
- Hover: `background: var(--bg-subtle)`. Cursor pointer.
- Dot de estado (si aplica): `8px`, a la izquierda del nombre del agente.

### Barra de alerta urgente

```
┃ 1 contestación vence en 3 días — García c/ Libra Seguros S.A.    Ver →
```

- Solo aparece si hay vencimientos en los próximos 5 días hábiles.
- Fondo: `var(--status-error-bg)`.
- Borde izquierdo: `3px solid var(--status-error)`.
- Texto: body size, `var(--text-primary)`.
- Link "Ver →" a la derecha en `var(--accent)`.
- Si no hay alertas: no se renderiza, no ocupa espacio.

### Sidebar

- Ancho: `240px` (fijo en desktop).
- Fondo: `var(--bg-primary)`.
- Borde derecho: `1px solid var(--border-default)`.
- Item activo: fondo `var(--accent-bg)`, texto `var(--accent)`, barra vertical izquierda de `3px` en `var(--accent)`, radius `8px`.
- Items inactivos: texto `var(--text-secondary)`, íconos opacity `0.5`.
- Hover inactivos: fondo `var(--bg-hover)`, transición `150ms`.
- Label de sección ("PANEL DE CONTROL"): label uppercase style, color `var(--text-tertiary)`.

### Modal / Panel

- Ancho máximo: `480px`.
- Fondo: `var(--bg-primary)`.
- Radius: `16px`.
- Sombra: `0 8px 32px rgba(0,0,0,0.08)`.
- Overlay: `rgba(0,0,0,0.3)`.
- Padding: `32px`.
- Animación de entrada: fade in + translateY(8px → 0), `200ms ease-out`.
- Botón cerrar: X minimal, sin fondo, arriba a la derecha.

---

## Dots de estado

Los dots son el sistema principal para comunicar estado en toda la app.

| Tamaño | Uso |
|---|---|
| 6px | Inline con texto (ej: "● 1 esta semana" en pills de vencimientos) |
| 8px | Status de agentes, status en listas de actividad |
| Dot de notificación 6px | Sobre la campana en el header si hay notificaciones |

Colores: siempre de la paleta de estado (`--status-success`, `--status-warning`, `--status-error`). Gris (`var(--text-disabled)`) para estado neutro/inactivo.

El dot de "Actividad en vivo" en el título puede tener animación pulse: `opacity 0.5 → 1`, loop, `2s`.

---

## Animaciones y transiciones

### Transiciones (en interacciones de usuario)

| Propiedad | Duración | Easing |
|---|---|---|
| `background-color` | `150ms` | `ease` |
| `border-color` | `150ms` | `ease` |
| `opacity` | `150ms` | `ease` |
| `transform` | `150ms` | `ease` |
| `color` | `150ms` | `ease` |

### Animaciones de carga (solo al primer render)

| Elemento | Animación | Duración | Delay |
|---|---|---|---|
| Sidebar items | fade in + translateX(-8px → 0) | `150ms` | `30ms` stagger |
| Header | fade in | `200ms` | — |
| Contenido de página | fade in + translateY(4px → 0) | `150ms` | — |
| Cards de métricas | fade in + translateY(8px → 0) | `200ms` | `50ms` stagger |
| Pipeline nodes | fade in | `150ms` | `50ms` stagger left to right |
| Modal | fade in + translateY(8px → 0) | `200ms` | — |

### Reglas

- **Nunca** animaciones de más de `300ms`.
- **Nunca** bounce, elastic, o cualquier easing que llame la atención.
- Las animaciones de carga ocurren **una sola vez** al primer render, no al navegar entre vistas.
- Transiciones de navegación entre páginas: fade in `150ms` del contenido principal. Solo si es un cambio CSS simple, no si requiere cambios en el router.

---

## Íconos

Usar la librería de íconos que ya tiene la app (Lucide, Heroicons, o la que esté instalada). No agregar otra.

### Reglas

- Tamaño estándar: `20px` en el sidebar, `16px` inline con texto.
- Color: hereda del texto. No usar colores propios en íconos.
- Íconos inactivos: `opacity: 0.5`.
- **Nunca** poner íconos dentro de círculos de color como decoración.
- **Nunca** usar íconos cuando el texto es suficiente.
- Íconos en el header (campana, tema): `20px`, hover con fondo circular `var(--bg-hover)`, radius `50%`, padding `8px`.

---

## Responsive

### Breakpoints

| Nombre | Ancho | Comportamiento |
|---|---|---|
| Desktop | ≥1024px | Layout completo, sidebar visible |
| Tablet | 768px–1023px | Sidebar colapsada a íconos, contenido full width |
| Mobile | <768px | Sidebar oculta (toggle), cards en stack vertical |

### Reglas por componente

- **Cards de métricas:** desktop 3 en fila → mobile stack vertical.
- **Pipeline:** desktop horizontal → mobile scrolleable horizontal con fade hint.
- **Acciones + Actividad:** desktop 2 columnas → mobile stack vertical (acciones primero).
- **Modales:** desktop centrado max-width `480px` → mobile full width con padding `20px`.
- **Sidebar:** desktop fija → mobile overlay con toggle. Animación slide-in desde la izquierda.

---

## Convenciones de código

### CSS

- Usar CSS variables para todos los colores (definidas en `:root`).
- Naming: kebab-case para variables (`--text-primary`), BEM o utility classes para clases.
- No usar `!important` excepto para overrides de librerías externas.
- Agrupar propiedades: layout → sizing → spacing → typography → visual → animation.

### Componentes

- Cada componente tiene hover, focus y active states definidos.
- Todos los elementos interactivos tienen `cursor: pointer`.
- Todos los contenedores de lista tienen `max-height` con `overflow-y: auto` si el contenido puede crecer.

---

*Última actualización: Marzo 2026*
