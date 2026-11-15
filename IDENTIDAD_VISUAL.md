# 🎨 IDENTIDAD VISUAL Y SISTEMA DE DISEÑO: ManoAmiga

> **Documento Oficial de Dirección de Arte**  
> **Autor:** Director de Arte y Diseño Editorial (`@brand-director`)  
> **Aplicación Obligatoria para:** `@motion-ui-agent`, `@ui-agent` y `@dev-agent`  
> **Propósito:** Erradicar cualquier rastro de plantilla genérica de IA y dotar a **ManoAmiga** de una estética memorable, cálida, táctil y profundamente confiable.

---

## 1. Dirección Arquitectónica y Filosofía Visual

### 🏛️ Estilo Elegido: **Bento Grid Editorial Cálido (*Warm Tactile Bento*)**
Las plataformas de servicios del hogar suelen caer en dos extremos equivocados: o parecen directorios gubernamentales aburridos de los años 2000, o parecen plantillas SaaS de criptomonedas llenas de degradados morados/azules neón que generan desconfianza en una señora que necesita un plomero o en un técnico que busca trabajo.

**ManoAmiga** adopta una dirección **Editorial Cálida organizada en Bento Grids**:
- **Claridad modular (Bento Grid):** La información se organiza en bloques asimétricos con jerarquía visual clara, esquinas suavizadas (`rounded-2xl` / `rounded-3xl`) y aire generoso entre elementos.
- **Calidez táctil y humana:** Sustituimos el blanco clínico (`#FFFFFF`) y los azules eléctricos por tonos papel piedra, carbón suave, verde bosque profundo (que comunica seguridad, hogar y verificación) y terracota cálido (que evoca oficio, ladrillo, herramientas y acción inmediata).
- **Contraste editorial:** Combinamos titulares geométricos contundentes con detalles puntuales en cursiva serif (*Instrument Serif*) que humanizan la tecnología.

### 🚫 Lista Negra Anti-Cliché (Estrictamente Prohibido)
1. **PROHIBIDO** usar degradados neón o sintéticos (`from-purple-600 to-blue-500`, `from-blue-400 to-emerald-400`, fondos espaciales o brillos cyberpunk).
2. **PROHIBIDO** usar fondos oscuros azulados genéricos (`bg-slate-900` frío) como bloque dominante del Hero. El Hero debe respirar sobre el lienzo cálido editorial o usar bloques Bento contrastados en verde bosque profundo (`#0F4C3A`) y piedra cálida (`#F5F5F4`).
3. **PROHIBIDO** repetir cuadrículas monótonas de tarjetas 100% idénticas sin destacar elementos prioritarios.
4. **PROHIBIDO** usar sombras negras duras (`shadow-2xl` por defecto sin matizar) o bordes grises fríos (`border-gray-300`).

---

## 2. Paleta de Colores Exacta (Códigos HEX)

La regla de color es estricta: **1 fondo principal cálido, 1 tinta oscura, 1 color primario con carácter y 1 acento para llamadas a la acción.**

| Rol en el Sistema | Nombre del Color | Código HEX | Equivalente Tailwind / CSS | Uso Específico |
| :--- | :--- | :--- | :--- | :--- |
| **1. Fondo Principal** | **Papel Piedra (Warm Alabaster)** | `#FAFAF9` | `bg-[#FAFAF9]` (`stone-50`) | Lienzo general de toda la aplicación. Descansa la vista y da sensación de revista impresa de alta gama. |
| **Superficie Bento (Tarjetas)** | **Blanco Crema / Piedra Suave** | `#FFFFFF` / `#F5F4F0` | `bg-white` / `bg-[#F5F4F0]` | Tarjetas interactivas, modales y celdas secundarias del Bento Grid. |
| **2. Tinta Oscura** | **Carbón Editorial (Warm Ink)** | `#18181B` | `text-[#18181B]` (`zinc-900`) | Titulares principales, nombres de solucionadores, precios y textos de alto contraste. |
| **Tinta Secundaria** | **Grafito Cálido** | `#57534E` | `text-[#57534E]` (`stone-600`) | Descripciones, biografías, subtítulos y metadatos secundarios. |
| **3. Color Primario** | **Verde Bosque Oficio (Deep Forest)** | `#0F4C3A` | `bg-[#0F4C3A]` / `text-[#0F4C3A]` | Identidad de marca, sellos de verificación, bloques Bento destacados, encabezados de confianza y filtros activos. |
| **Primario Suave (Badge)** | **Salvia Pálido** | `#E6F2EE` | `bg-[#E6F2EE]` | Fondos de insignias de "Perfil Verificado", "Disponible Hoy" y pasos completados. |
| **4. Color de Acento (CTA)** | **Terracota Artesanal (Warm Clay)** | `#D95D39` | `bg-[#D95D39]` (hover `#BF4B28`) | Botones principales de conversión (*"Pedir Ayuda"*, *"Contactar Ahora"*, *"Buscar"*), indicadores de urgencia e íconos protagonistas. |
| **Bordes Sutiles** | **Línea de Piedra** | `#E7E5E4` | `border-[#E7E5E4]` (`stone-200`) | Bordes de `1px solid` en todas las tarjetas, inputs y divisores. |

---

## 3. Tipografía con Personalidad (Google Fonts)

Se importarán desde `next/font/google` en `src/app/layout.tsx` tres familias complementarias que crean una voz inconfundible:

1. **Fuente Expresiva para Títulos (`Plus Jakarta Sans`):**
   - **Pesos:** `600` (SemiBold), `700` (Bold), `800` (ExtraBold).
   - **Estilo:** `tracking-tight` (`-0.025em` a `-0.035em`), interlineado compacto (`leading-[1.1]`).
   - **Función:** Encabezados H1, H2, nombres de categorías en el Bento Grid y nombres de Solucionadores.
2. **Toque Editorial Humano (`Instrument Serif`):**
   - **Peso:** `400` Italic.
   - **Función:** Reservada exclusivamente para enfatizar 2 o 3 palabras clave dentro del H1 o subtítulos de sección (por ejemplo: *"Resuélvelo hoy con *manos de confianza* en tu colonia"*). Este contraste entre geométrica sin patines y serif cursiva elimina al 100% el aspecto robótico de IA.
3. **Fuente Ultra Legible para Lectura y Datos (`Inter`):**
   - **Pesos:** `400` (Regular), `500` (Medium), `600` (SemiBold).
   - ** Configuración numérica:** `font-variant-numeric: tabular-nums` obligatorio en tarifas (`$350 - $500 MXN`), calificaciones (`4.9 ★`) y tiempos de respuesta (`~8 min`).

---

## 4. Reglas de Composición, Bento Grid y Tarjetas

### 📐 4.1. Arquitectura de Espacios y Contenedores
- **Contenedor Máximo:** `max-w-7xl` (`1280px`) con márgenes laterales amplios (`px-4 sm:px-6 lg:px-8`).
- **Aire entre Secciones:** `py-12 md:py-20` para permitir que el fondo `#FAFAF9` respire.
- **Espaciado Interno (Padding):** Ninguna tarjeta principal puede tener menos de `p-6` (`24px`) en móvil y `p-7` o `p-8` (`28px–32px`) en escritorio.

### 🧩 4.2. El Bento Grid de Categorías y Hero
En lugar de un bloque oscuro simétrico y una fila plana de botones pequeños:
- **Hero Asimétrico en 12 Columnas:**
  - **Columna Izquierda (7 columnas en desktop):** Etiqueta superior tipo cápsula editorial (`border-[#0F4C3A]/20 bg-[#E6F2EE] text-[#0F4C3A]`), titular H1 con acento en *Instrument Serif*, buscador táctil elevado con botón en Terracota `#D95D39` y etiquetas rápidas con micro-interacción.
  - **Columna Derecha (5 columnas en desktop):** Composición Bento de 3 tarjetas de confianza en vivo (1 tarjeta grande superior en Verde Bosque `#0F4C3A` con texto crema mostrando el tiempo real de respuesta en Nuevo León, y 2 tarjetas inferiores en `#F5F4F0` con métricas de solucionadores verificados y garantía de trato directo).
- **Categorías en Mosaico Bento:**
  - Las 5 categorías (**Hogar y Climas, Limpieza, Mudanzas y Fletes, Mandados, Tecnología**) + **Todas** se presentan como celdas Bento interactivas con ícono en contenedor redondeado, contador de especialistas en esquina superior derecha y micro-descripción clara.

### 🪪 4.3. Reglas de las Tarjetas de Solucionadores
Cada tarjeta del **Directorio de Solucionadores** debe parecer una credencial editorial de alta confianza:
- **Superficie:** Fondo `#FFFFFF`, borde `1px solid #E7E5E4`, radio `rounded-3xl` (`24px`).
- **Sombra Multicapa:**
  `shadow-[0_1px_3px_rgba(24,24,27,0.03),0_10px_30px_-5px_rgba(24,24,27,0.05)]`
  Al pasar el cursor (`:hover`): elevación suave `-translate-y-1`, borde cambia a `#0F4C3A/40` y la sombra se intensifica sutilmente.
- **Solucionador Destacado:** El primer solucionador (o aquellos con calificación `>= 4.9` y más de 100 trabajos) lleva una cinta/insignia superior cálida: `"★ Favorito en tu zona"`.
- **Estructura Interna:**
  1. **Cabecera de Estado:** Píldora de categoría a la izquierda + indicador de disponibilidad con punto verde vivo (`#15803D`) a la derecha.
  2. **Identidad:** Foto cuadrada suavizada (`w-16 h-16 rounded-2xl object-cover`) con sello de verificación en verde bosque `#0F4C3A`, nombre en `Plus Jakarta Sans Bold`, oficio en `#57534E` y calificación en bloque ámbar cálido (`#FEF3C7` con estrella `#D97706`).
  3. **Habilidades (Tags):** Chips en tono piedra `#F5F4F0` con texto `#44403C` y borde `1px solid #E7E5E4`.
  4. **Pie de Tarjeta Separado:** Fondo `#FAFAF9`, borde superior `1px solid #F5F5F4`, tarifa en tipografía grande `tabular-nums` a la izquierda y par de botones a la derecha (*"Perfil"* en borde limpio + *"Contactar"* en Terracota `#D95D39` o Verde Bosque `#0F4C3A`).

### 📋 4.4. Reglas del Tablero "Problemas por Resolver"
En lugar de una caja negra pesada, el tablero utiliza un **Contenedor Bento en Verde Bosque Profundo (`#0F4C3A`)** con textura sutil y tarjetas internas en tono cálido oscuro o marfil contrastado:
- Cada solicitud muestra una **etiqueta de urgencia clara**:
  - `Urgente (Hoy)`: Fondo terracota suave `#FFF1EC` con texto `#C2410C` y punto pulsante.
  - `En 24-48 hrs`: Fondo ámbar suave `#FEF3C7` con texto `#B45309`.
- El presupuesto ofrecido se destaca en una caja tipo recibo/ticket con tipografía `tabular-nums` para que cualquier solucionador identifique de un vistazo cuánto ganará.

### ✨ 4.5. Iconografía y Detalles Humanos
- Todos los íconos de `lucide-react` deben utilizar `strokeWidth={1.75}` para mantener un trazo editorial fino y consistente.
- Los estados de carga deben usar **Skeletons cálidos** (`bg-[#E7E5E4]/60 animate-pulse`) en lugar de spinners genéricos aislados.
- Los micro-textos deben hablar como un vecino confiable de Nuevo León: directos, claros, respetuosos y sin jerga técnica.
