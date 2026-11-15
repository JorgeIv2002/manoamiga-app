export type CategoryId =
  | "todos"
  | "hogar"
  | "limpieza"
  | "mudanzas"
  | "mandados"
  | "tecnologia";

export interface CategoryItem {
  id: Exclude<CategoryId, "todos">;
  name: string;
  subtitle: string;
  badgeColor: string;
  count: number;
}

export interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Solucionador {
  id: string;
  name: string;
  role: string;
  category: Exclude<CategoryId, "todos">;
  categoryLabel: string;
  rating: number;
  reviewsCount: number;
  completedJobs: number;
  hourlyRate: string;
  responseTime: string;
  location: string;
  avatarUrl: string;
  verified: boolean;
  availableToday: boolean;
  bio: string;
  skills: string[];
  phone: string;
  reviews: ReviewItem[];
  fromSupabase?: boolean;
}

export interface ProblemaSolicitud {
  id: string;
  title: string;
  description: string;
  category: Exclude<CategoryId, "todos">;
  categoryLabel: string;
  location: string;
  urgency: "Urgente (Hoy)" | "En 24-48 hrs" | "Fecha flexible";
  budget: string;
  postedAgo: string;
  clientName: string;
  clientVerified: boolean;
  applicantsCount: number;
  status: "Abierto" | "En revisión" | "En proceso" | "Resuelta";
  fromSupabase?: boolean;
}

export const CATEGORIES: CategoryItem[] = [
  {
    id: "hogar",
    name: "Hogar",
    subtitle: "Plomería, electricidad, pintura y armado",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    count: 48,
  },
  {
    id: "limpieza",
    name: "Limpieza",
    subtitle: "Hogar, oficinas, lavado profundo y orden",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    count: 34,
  },
  {
    id: "mudanzas",
    name: "Mudanzas",
    subtitle: "Fletes, carga pesada, embalaje y traslado",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    count: 19,
  },
  {
    id: "mandados",
    name: "Mandados",
    subtitle: "Compras, filas, entregas, mascotas y apoyo",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    count: 27,
  },
  {
    id: "tecnologia",
    name: "Tecnología",
    subtitle: "PC, Wi-Fi, Smart TV, impresoras y celulares",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    count: 22,
  },
];

export const INITIAL_SOLUCIONADORES: Solucionador[] = [
  {
    id: "sol-1",
    name: "Carlos Méndez",
    role: "Maestro Plomero y Electricista Residencial",
    category: "hogar",
    categoryLabel: "Hogar",
    rating: 4.9,
    reviewsCount: 128,
    completedJobs: 215,
    hourlyRate: "$250 - $400 MXN / visita",
    responseTime: "Responde en ~8 min",
    location: "Centro y Zona Sur (hasta 10 km)",
    avatarUrl:
      "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=400&q=80",
    verified: true,
    availableToday: true,
    bio: "Más de 12 años solucionando fugas de agua, cortos eléctricos, cambio de llaves, bombas e instalación de lámparas y ventiladores de techo. Trabajo limpio y con garantía.",
    skills: ["Fugas de agua", "Cortos eléctricos", "Calentadores", "Armado de muebles"],
    phone: "+52 55 1234 5678",
    reviews: [
      {
        id: "r1",
        author: "Laura G.",
        rating: 5,
        date: "Hace 2 días",
        comment: "Llegó en 25 minutos y arregló una fuga debajo del fregadero que nadie podía solucionar.",
      },
      {
        id: "r2",
        author: "Roberto P.",
        rating: 5,
        date: "Hace 1 semana",
        comment: "Muy puntual, trajo todas sus herramientas y cobró exactamente lo acordado.",
      },
    ],
  },
  {
    id: "sol-2",
    name: "Elena Rojas",
    role: "Especialista en Limpieza Profunda y Organización",
    category: "limpieza",
    categoryLabel: "Limpieza",
    rating: 5.0,
    reviewsCount: 94,
    completedJobs: 160,
    hourlyRate: "$350 MXN / turno (4 hrs)",
    responseTime: "Responde en ~5 min",
    location: "Zona Norte, Centro y Poniente",
    avatarUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    verified: true,
    availableToday: true,
    bio: "Dejo tu casa o departamento impecable. Experta en limpieza post-mudanza, desinfección de cocinas y baños, y organización de alacenas y clósets.",
    skills: ["Limpieza profunda", "Post-mudanza", "Organización de espacios", "Planchado"],
    phone: "+52 55 8765 4321",
    reviews: [
      {
        id: "r3",
        author: "Mariana V.",
        rating: 5,
        date: "Ayer",
        comment: "Increíble atención al detalle. Mi departamento quedó como nuevo después de la remodelación.",
      },
    ],
  },
  {
    id: "sol-3",
    name: "Javier Morales y Equipo",
    role: "Mudanzas Express, Fletes y Carga Pesada",
    category: "mudanzas",
    categoryLabel: "Mudanzas",
    rating: 4.8,
    reviewsCount: 76,
    completedJobs: 142,
    hourlyRate: "$450 MXN / flete base",
    responseTime: "Responde en ~10 min",
    location: "Toda el Área Metropolitana",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    verified: true,
    availableToday: true,
    bio: "Contamos con camioneta cerrada y colchonetas protectoras. Te ayudamos a bajar y subir refrigeradores, lavadoras, salas o mudanzas completas sin rayar tus muebles.",
    skills: ["Camioneta propia", "Emplayado", "Subir por escaleras", "Armado de camas"],
    phone: "+52 55 2345 6789",
    reviews: [
      {
        id: "r4",
        author: "Daniel T.",
        rating: 5,
        date: "Hace 3 días",
        comment: "Movieron mi refrigerador y lavadora a un 3er piso en menos de una hora. Súper cuidadosos.",
      },
    ],
  },
  {
    id: "sol-4",
    name: "Sofía Castellanos",
    role: "Asistente Cotidiana, Compras y Cuidado de Mascotas",
    category: "mandados",
    categoryLabel: "Mandados",
    rating: 4.9,
    reviewsCount: 63,
    completedJobs: 118,
    hourlyRate: "$150 MXN / mandado o paseo",
    responseTime: "Responde en ~4 min",
    location: "Col. Del Valle, Narvarte, Condesa, Roma",
    avatarUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    verified: true,
    availableToday: true,
    bio: "Si no tienes tiempo hoy, yo lo hago por ti: compras de supermercado o farmacia, trámites sencillos, recoger paquetes, llevar tu mascota al veterinario o pasearla.",
    skills: ["Compras de súper", "Paseo de perros", "Trámites y filas", "Envíos urgentes"],
    phone: "+52 55 3456 7890",
    reviews: [
      {
        id: "r5",
        author: "Patricia L.",
        rating: 5,
        date: "Hace 5 días",
        comment: "Me salvó cuando estaba enferma: fue a la farmacia y al súper y me trajo todo en 40 minutos.",
      },
    ],
  },
  {
    id: "sol-5",
    name: "Ing. Diego Herrera",
    role: "Soporte Técnico PC, Redes Wi-Fi y Smart Home",
    category: "tecnologia",
    categoryLabel: "Tecnología",
    rating: 5.0,
    reviewsCount: 82,
    completedJobs: 135,
    completedJobsLabel: "135 problemas resueltos",
    hourlyRate: "$300 MXN / diagnóstico y solución",
    responseTime: "Responde en ~6 min",
    location: "Servicio a domicilio y remoto",
    avatarUrl:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
    verified: true,
    availableToday: false,
    bio: "Soluciono problemas de internet lento, instalación de repetidores Wi-Fi, limpieza y aceleración de laptops, configuración de impresoras, Smart TVs y cámaras de seguridad.",
    skills: ["Redes Wi-Fi", "Reparación PC/Mac", "Cámaras Wi-Fi", "Smart TV y Audio"],
    phone: "+52 55 4567 8901",
    reviews: [
      {
        id: "r6",
        author: "Fernando C.",
        rating: 5,
        date: "Hace 4 días",
        comment: "Instaló la red Mesh en mi casa y por fin tengo internet rápido en el segundo piso.",
      },
    ],
  } as Solucionador,
  {
    id: "sol-6",
    name: "Martín Ríos",
    role: "Carpintero, Armado de Muebles e Instalaciones",
    category: "hogar",
    categoryLabel: "Hogar",
    rating: 4.8,
    reviewsCount: 51,
    completedJobs: 89,
    hourlyRate: "$280 MXN / servicio base",
    responseTime: "Responde en ~12 min",
    location: "Zona Poniente y Sur",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    verified: true,
    availableToday: true,
    bio: "Especialista en armar muebles en caja (IKEA, Home Depot), colgar pantallas en pared con soporte, instalar repisas, persianas, chapas de puertas y reparaciones en madera.",
    skills: ["Armado de muebles", "Instalación de TV", "Persianas y cortinas", "Cerrajería básica"],
    phone: "+52 55 5678 9012",
    reviews: [
      {
        id: "r7",
        author: "Andrea S.",
        rating: 5,
        date: "Hace 1 semana",
        comment: "Armó un ropero grande y colocó dos soportes de televisión en una sola tarde. Excelente actitud.",
      },
    ],
  },
];

export const INITIAL_PROBLEMAS: ProblemaSolicitud[] = [
  {
    id: "prob-1",
    title: "Fuga de agua debajo del lavabo del baño principal",
    description:
      "Empezó a gotear la manguera flexible de agua fría debajo del lavabo y necesito cambiarla hoy mismo antes de que se moje el mueble.",
    category: "hogar",
    categoryLabel: "Hogar",
    location: "Col. Narvarte Poniente",
    urgency: "Urgente (Hoy)",
    budget: "$350 - $500 MXN",
    postedAgo: "Hace 9 minutos",
    clientName: "Alejandro M.",
    clientVerified: true,
    applicantsCount: 2,
    status: "Abierto",
  },
  {
    id: "prob-2",
    title: "Ayuda para trasladar un sillón de 3 plazas y un comedor",
    description:
      "Necesito una camioneta con ayudante para llevar un sillón y mesa de comedor a 4 kilómetros de distancia (ambos en planta baja).",
    category: "mudanzas",
    categoryLabel: "Mudanzas",
    location: "Col. Del Valle Centro",
    urgency: "En 24-48 hrs",
    budget: "$650 - $800 MXN",
    postedAgo: "Hace 22 minutos",
    clientName: "Claudia R.",
    clientVerified: true,
    applicantsCount: 3,
    status: "Abierto",
  },
  {
    id: "prob-3",
    title: "Configurar repetidor Wi-Fi e impresora inalámbrica en oficina en casa",
    description:
      "Compré un repetidor TP-Link y una impresora Epson Wi-Fi pero no logro que se conecten bien a mi laptop ni al celular.",
    category: "tecnologia",
    categoryLabel: "Tecnología",
    location: "Col. Roma Norte",
    urgency: "Urgente (Hoy)",
    budget: "$300 - $400 MXN",
    postedAgo: "Hace 38 minutos",
    clientName: "Jorge L.",
    clientVerified: true,
    applicantsCount: 1,
    status: "Abierto",
  },
  {
    id: "prob-4",
    title: "Limpieza profunda de departamento de 2 recámaras antes de mudarme",
    description:
      "El departamento está vacío, necesito limpieza general de pisos, ventanas, cocina y 1 baño para poder meter mis cosas mañana.",
    category: "limpieza",
    categoryLabel: "Limpieza",
    location: "Col. Polanco / Anzures",
    urgency: "En 24-48 hrs",
    budget: "$500 - $650 MXN",
    postedAgo: "Hace 1 hora",
    clientName: "Valeria D.",
    clientVerified: true,
    applicantsCount: 4,
    status: "Abierto",
  },
  {
    id: "prob-5",
    title: "Recoger despensa en supermercado y medicamentos en farmacia",
    description:
      "Tengo el pedido pagado para recoger (Pick Up) y necesito que alguien pase por él y me lo suba al 2do piso porque tengo el pie lastimado.",
    category: "mandados",
    categoryLabel: "Mandados",
    location: "Col. Coyoacán Centro",
    urgency: "Urgente (Hoy)",
    budget: "$180 - $250 MXN",
    postedAgo: "Hace 1 hora",
    clientName: "Sra. Carmen T.",
    clientVerified: true,
    applicantsCount: 2,
    status: "Abierto",
  },
];
