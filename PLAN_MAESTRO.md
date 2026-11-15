# 📋 PLAN MAESTRO DEL PROYECTO: Plataforma de Ayuda y Servicios Cotidianos

> **Estado del Proyecto:** 🎉 100% Completado (Fases 1 a 5 Terminadas y Desplegado en Producción: https://manoamiga-app.vercel.app/)  
> **Responsable actual:** Director de Marketing Digital y Growth (`marketing-agent`)

---

## 1. Análisis de la Idea

### 🎯 Objetivo Principal
Crear una plataforma web/app rápida, intuitiva y confiable que conecte en tiempo real o de forma inmediata a personas que necesitan resolver un problema (desde reparaciones del hogar como plomería, electricidad o carpintería, hasta tareas cotidianas como mudanzas, compras, limpieza o asistencia general) con proveedores de servicios o ayudantes locales dispuestos a realizarlos.

### 👥 Público Objetivo (Target)
**Cualquier persona (Mercado Masivo B2C / P2P):**
1. **Solicitantes (Clientes):** Personas con falta de tiempo, conocimientos técnicos o herramientas que requieren una solución rápida, segura y a precio claro para un imprevisto del hogar o tarea diaria.
2. **Solucionadores (Proveedores / Ayudantes):** Profesionales independientes (plomeros, electricistas, técnicos) y personas con habilidades prácticas que buscan generar ingresos extra ofreciendo sus servicios en su zona.

> **Nota de Producto:** Dado que el público es "cualquier persona", la interfaz debe tener **cero fricción**, textos claros, botones grandes, flujo guiado en pocos clics y diseño 100% adaptable a móviles (*Mobile-First*).

---

## 2. Funciones Esenciales del Producto Mínimo Viable (MVP)

Para salir al mercado rápido y validar la plataforma sin complejizar el desarrollo inicial, el MVP se centrará en:

1. **Inicio y Buscador Rápido de Soluciones:**
   - Barra de búsqueda directa (*"¿Con qué necesitas ayuda hoy?"*) y cuadrícula de categorías visuales (Hogar y Reparaciones, Limpieza, Mudanzas/Fletes, Mandados, Tecnología, Otros).
2. **Publicación Express de Necesidad ("Pedir Ayuda"):**
   - Formulario simple en 3 pasos: Qué necesitas (título y descripción), Dónde (ubicación/barrio) y Urgencia/Presupuesto estimado.
3. **Directorio de Solucionadores y Solicitudes Activas:**
   - Vista para que los clientes encuentren ayudantes destacados por categoría y calificación.
   - Tablero de "Problemas por resolver" para que los ayudantes puedan postularse a solicitudes cercanas.
4. **Perfiles y Sistema de Confianza:**
   - Perfil público del Solucionador con foto, especialidad, tarifa base o rango de precios, zona de cobertura y reseñas/estrellas de otros usuarios.
5. ** Autenticación Simple y Cambio de Rol:**
   - Registro e inicio de sesión rápido (email o acceso social), permitiendo a cualquier usuario pedir ayuda o postularse para ayudar.
6. **Contacto Directo / Solicitud de Servicio:**
   - Botón de acción directa para contactar al solucionador (vía chat interno básico o enlace directo a WhatsApp/teléfono para cerrar el acuerdo rápidamente en el MVP).

---

## 3. Arquitectura y Stack Tecnológico Recomendado

Siguiendo el estándar de tecnologías modernas, gratuitas en su capa inicial y fáciles de desplegar:

- **Frontend y Framework Full-Stack:** **Next.js (App Router)** — Excelente rendimiento, SEO para que los servicios aparezcan en buscadores y experiencia fluida tipo app móvil.
- **Estilos y Diseño UI:** **Tailwind CSS** + Iconografía moderna (**Lucide Icons**) — Permite construir una interfaz limpia, accesible y responsiva rápidamente.
- **Base de Datos y Autenticación (Backend-as-a-Service):** **Supabase (PostgreSQL + Supabase Auth)** — Gratuito, seguro, en tiempo real y sin necesidad de mantener servidores propios.
- **Despliegue y Hosting:** **Vercel** — Integración continua gratuita y despliegue automático con HTTPS.

---

## 4. Hoja de Ruta y Lista de Tareas Paso a Paso (Checklist)

### Fase 1: Diseño UI/UX (`ui-agent`)
- [x] **1.1.** Definir la paleta de colores (tonos que transmitan confianza, rapidez y cercanía), tipografía legible y sistema de diseño base.
- [x] **1.2.** Diseñar la estructura de la **Página de Inicio (Landing Page)** con buscador principal, categorías de problemas y llamada a la acción clara.
- [x] **1.3.** Diseñar las tarjetas de **Solucionadores** (foto, oficio, calificación, precio base, botón de contacto) y tarjetas de **Solicitudes de Ayuda**.
- [x] **1.4.** Diseñar el flujo visual del formulario **"Publicar un Problema / Pedir Ayuda"** y la vista de detalle del servicio.

### Fase 2: Desarrollo Frontend y Estructura Base (`dev-agent` / `ui-agent`)
- [x] **2.1.** Inicializar el proyecto con **Next.js** y configurar **Tailwind CSS**.
- [x] **2.2.** Construir la barra de navegación responsiva (con acceso rápido a "Buscar Ayuda", "Publicar Problema" y "Ofrecer mis Servicios") y el pie de página.
- [x] **2.3.** Desarrollar la **Página Principal (Home)** con el buscador interactivo, filtro por categorías (Reparaciones, Cotidiano, Urgencias, etc.) y listado de solucionadores/solicitudes destacadas.
- [x] **2.4.** Desarrollar la vista de **Explorar / Buscar**, permitiendo filtrar por categoría, palabra clave y ubicación.
- [x] **2.5.** Desarrollar el formulario interactivo para **Publicar una Necesidad** y el perfil de **Registro como Solucionador**.

### Fase 3: Base de Datos, Autenticación y Lógica (`dev-agent`)
- [x] **3.1.** Configurar el cliente de **Supabase** y definir las tablas principales: `usuarios` (clientes/solucionadores), `categorias`, `solicitudes_ayuda`, `perfiles_solucionadores` y `resenas`.
- [x] **3.2.** Implementar el sistema de **Autenticación** (Registro e Inicio de Sesión) con Supabase Auth.
- [x] **3.3.** Conectar el frontend con la base de datos para crear, listar y filtrar solicitudes de ayuda y perfiles de solucionadores en tiempo real (con datos de prueba iniciales para demostración inmediata).
- [x] **3.4.** Implementar el flujo de contacto directo y cambio de estado de una solicitud (*Abierta → En proceso → Resuelta*).

### Fase 4: Lanzamiento, Despliegue y Calidad (`devops-agent`)
- [x] **4.1.** Configurar las variables de entorno de forma segura (`.env.local` / plantilla `.env.example`).
- [x] **4.2.** Verificar que el proyecto compile sin errores de código ni de tipos (`build` limpio) y auditar el rendimiento móvil.
- [x] **4.3.** Preparar y ejecutar el despliegue en producción (Vercel).

### Fase 5: Estrategia de Crecimiento y Copywriting (`marketing-agent`)
- [x] **5.1.** Optimizar los textos persuasivos (Copywriting) de la plataforma para generar confianza tanto en quienes piden ayuda como en quienes ofrecen servicios.
- [x] **5.2.** Definir la estrategia de lanzamiento inicial (captación de los primeros solucionadores y usuarios locales) y optimización SEO básica.
