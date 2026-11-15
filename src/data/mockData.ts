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
    name: "Hogar y Climas",
    subtitle: "Plomería, electricidad, minisplits y armado",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    count: 48,
  },
  {
    id: "limpieza",
    name: "Limpieza",
    subtitle: "Casas, depas, lavado profundo y orden",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    count: 34,
  },
  {
    id: "mudanzas",
    name: "Mudanzas y Fletes",
    subtitle: "Camioneta, carga pesada y traslado seguro",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    count: 19,
  },
  {
    id: "mandados",
    name: "Mandados",
    subtitle: "Súper, farmacia, filas, entregas y mascotas",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    count: 27,
  },
  {
    id: "tecnologia",
    name: "Tecnología",
    subtitle: "PC, redes Wi-Fi, cámaras, Smart TV y soporte",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    count: 22,
  },
];

export const INITIAL_SOLUCIONADORES: Solucionador[] = [
  {
    id: "sol-1",
    name: "Carlos Méndez",
    role: "Maestro Plomero, Electricista y Técnico en Minisplits",
    category: "hogar",
    categoryLabel: "Hogar y Climas",
    rating: 4.9,
    reviewsCount: 128,
    completedJobs: 215,
    hourlyRate: "$350 - $500 MXN / servicio base",
    responseTime: "Responde en ~8 min",
    location: "Monterrey Centro, Cumbres y San Jerónimo",
    avatarUrl:
      "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=400&q=80",
    verified: true,
    availableToday: true,
    bio: "Más de 12 años solucionando fugas de agua, cortos eléctricos, mantenimiento e instalación de minisplits y bombas hidroneumáticas en Monterrey. Trabajo limpio y con garantía por escrito.",
    skills: ["Fugas de agua", "Minisplits", "Cortos eléctricos", "Boilers"],
    phone: "+52 81 1234 5678",
    reviews: [
      {
        id: "r1",
        author: "Laura Garza (Col. Cumbres)",
        rating: 5,
        date: "Hace 2 días",
        comment:
          "Llegó en 25 minutos y arregló una fuga debajo del fregadero y revisó el clima de la sala. Súper honesto.",
      },
      {
        id: "r2",
        author: "Roberto Treviño (San Pedro)",
        rating: 5,
        date: "Hace 1 semana",
        comment:
          "Muy puntual, trajo todas sus herramientas y cobró exactamente lo acordado antes de empezar.",
      },
    ],
  },
  {
    id: "sol-2",
    name: "Elena Rojas",
    role: "Especialista en Limpieza Profunda y Organización de Hogar",
    category: "limpieza",
    categoryLabel: "Limpieza",
    rating: 5.0,
    reviewsCount: 94,
    completedJobs: 160,
    hourlyRate: "$450 MXN / turno (4 hrs)",
    responseTime: "Responde en ~5 min",
    location: "San Pedro, Valle Oriente, Contry y Carretera Nacional",
    avatarUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    verified: true,
    availableToday: true,
    bio: "Dejo tu casa o departamento impecable. Experta en limpieza post-mudanza, desinfección de cocinas y baños, y organización de alacenas y clósets con total confianza.",
    skills: ["Limpieza profunda", "Post-mudanza", "Organización", "Planchado"],
    phone: "+52 81 8765 4321",
    reviews: [
      {
        id: "r3",
        author: "Mariana Villarreal (Valle Oriente)",
        rating: 5,
        date: "Ayer",
        comment:
          "Increíble atención al detalle. Mi departamento quedó como nuevo después de la remodelación.",
      },
    ],
  },
  {
    id: "sol-3",
    name: "Javier Morales y Equipo",
    role: "Mudanzas Express, Fletes Seguros y Carga Pesada",
    category: "mudanzas",
    categoryLabel: "Mudanzas y Fletes",
    rating: 4.8,
    reviewsCount: 76,
    completedJobs: 142,
    hourlyRate: "$550 MXN / flete base",
    responseTime: "Responde en ~10 min",
    location: "Toda el Área Metropolitana de Monterrey",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    verified: true,
    availableToday: true,
    bio: "Contamos con camioneta cerrada y colchonetas protectoras. Te ayudamos a bajar y subir refrigeradores, lavadoras, salas o mudanzas completas en Monterrey, San Nicolás, Guadalupe y Apodaca.",
    skills: ["Camioneta propia", "Emplayado", "Subir por escaleras", "Armado de camas"],
    phone: "+52 81 2345 6789",
    reviews: [
      {
        id: "r4",
        author: "Daniel Cantú (San Nicolás)",
        rating: 5,
        date: "Hace 3 días",
        comment:
          "Movieron mi refrigerador y lavadora a un 3er piso en menos de una hora. Súper cuidadosos.",
      },
    ],
  },
  {
    id: "sol-4",
    name: "Sofía Castellanos",
    role: "Asistente Cotidiana, Compras Express y Cuidado de Mascotas",
    category: "mandados",
    categoryLabel: "Mandados",
    rating: 4.9,
    reviewsCount: 63,
    completedJobs: 118,
    hourlyRate: "$180 MXN / mandado o paseo",
    responseTime: "Responde en ~4 min",
    location: "Obispado, Chepevera, Mitras, San Jerónimo y Del Valle",
    avatarUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    verified: true,
    availableToday: true,
    bio: "Si el tráfico o el trabajo no te dejan tiempo hoy, yo lo hago por ti: compras en H-E-B o farmacia, recoger paquetes, vueltas urgentes o llevar a tu mascota al veterinario.",
    skills: ["Compras H-E-B / Súper", "Paseo de perros", "Vueltas y filas", "Envíos urgentes"],
    phone: "+52 81 3456 7890",
    reviews: [
      {
        id: "r5",
        author: "Patricia Lozano (Col. Del Valle)",
        rating: 5,
        date: "Hace 5 días",
        comment:
          "Me salvó cuando estaba enferma: fue a la farmacia y al súper y me trajo todo en 40 minutos.",
      },
    ],
  },
  {
    id: "sol-5",
    name: "Ing. Diego Herrera",
    role: "Soporte Técnico PC/Mac, Redes Wi-Fi Mesh y Cámaras",
    category: "tecnologia",
    categoryLabel: "Tecnología",
    rating: 5.0,
    reviewsCount: 82,
    completedJobs: 135,
    hourlyRate: "$350 MXN / diagnóstico y solución",
    responseTime: "Responde en ~6 min",
    location: "Servicio a domicilio en MTY, San Pedro, Guadalupe y San Nicolás",
    avatarUrl:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
    verified: true,
    availableToday: false,
    bio: "Soluciono problemas de internet lento en casa u oficina, instalación de repetidores Wi-Fi Mesh, optimización de laptops, configuración de impresoras, Smart TVs y cámaras CCTV.",
    skills: ["Redes Wi-Fi Mesh", "Reparación PC/Mac", "Cámaras Wi-Fi", "Smart TV y Audio"],
    phone: "+52 81 4567 8901",
    reviews: [
      {
        id: "r6",
        author: "Fernando Cavazos (Col. Contry)",
        rating: 5,
        date: "Hace 4 días",
        comment:
          "Instaló la red Mesh en mi casa y por fin llega el internet al segundo piso y a la terraza.",
      },
    ],
  },
  {
    id: "sol-6",
    name: "Martín Ríos",
    role: "Carpintero, Armado de Muebles e Instalación de Soportes TV",
    category: "hogar",
    categoryLabel: "Hogar y Climas",
    rating: 4.8,
    reviewsCount: 51,
    completedJobs: 89,
    hourlyRate: "$320 MXN / servicio base",
    responseTime: "Responde en ~12 min",
    location: "Apodaca, Guadalupe, San Nicolás y Monterrey",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    verified: true,
    availableToday: true,
    bio: "Especialista en armar muebles en caja (Home Depot, IKEA, Amazon), colgar pantallas en pared de concreto o tablaroca, instalar repisas, persianas y chapas de seguridad.",
    skills: ["Armado de muebles", "Instalación de TV", "Persianas", "Cerrajería básica"],
    phone: "+52 81 5678 9012",
    reviews: [
      {
        id: "r7",
        author: "Andrea Saldaña (Cumbres Elite)",
        rating: 5,
        date: "Hace 1 semana",
        comment:
          "Armó un comedor y colocó dos soportes de televisión en una sola tarde. Excelente actitud.",
      },
    ],
  },
];

export const INITIAL_PROBLEMAS: ProblemaSolicitud[] = [
  {
    id: "prob-1",
    title: "Fuga de agua debajo del lavabo y revisión de presión",
    description:
      "Empezó a gotear la manguera flexible de agua fría debajo del lavabo del baño principal y necesito cambiarla hoy mismo antes de que dañe el mueble.",
    category: "hogar",
    categoryLabel: "Hogar y Climas",
    location: "Col. Cumbres 2do Sector, Monterrey",
    urgency: "Urgente (Hoy)",
    budget: "$400 - $550 MXN",
    postedAgo: "Hace 9 minutos",
    clientName: "Alejandro M.",
    clientVerified: true,
    applicantsCount: 2,
    status: "Abierto",
  },
  {
    id: "prob-2",
    title: "Flete para trasladar un sillón de 3 plazas y un comedor",
    description:
      "Necesito una camioneta con ayudante para llevar un sillón y mesa de comedor desde Col. Del Valle hacia zona Tec (ambos en planta baja).",
    category: "mudanzas",
    categoryLabel: "Mudanzas y Fletes",
    location: "San Pedro Garza García → Zona Tec, MTY",
    urgency: "En 24-48 hrs",
    budget: "$700 - $900 MXN",
    postedAgo: "Hace 22 minutos",
    clientName: "Claudia R.",
    clientVerified: true,
    applicantsCount: 3,
    status: "Abierto",
  },
  {
    id: "prob-3",
    title: "Configurar repetidor Wi-Fi e impresora inalámbrica en Home Office",
    description:
      "Compré un sistema TP-Link Deco y una impresora Epson Wi-Fi pero no logro que la señal llegue bien a mi estudio ni imprimir desde la laptop.",
    category: "tecnologia",
    categoryLabel: "Tecnología",
    location: "Col. Contry, Monterrey",
    urgency: "Urgente (Hoy)",
    budget: "$350 - $450 MXN",
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
      "El departamento está vacío, necesito limpieza profunda de pisos, balcones, cocina y 2 baños para poder meter mis muebles mañana por la tarde.",
    category: "limpieza",
    categoryLabel: "Limpieza",
    location: "Col. Santa María / San Jerónimo, MTY",
    urgency: "En 24-48 hrs",
    budget: "$550 - $700 MXN",
    postedAgo: "Hace 1 hora",
    clientName: "Valeria D.",
    clientVerified: true,
    applicantsCount: 4,
    status: "Abierto",
  },
  {
    id: "prob-5",
    title: "Recoger pedido Pick Up en H-E-B y medicamentos en farmacia",
    description:
      "Ya tengo el pedido pagado en H-E-B Gonzalitos y necesito que alguien pase por él y me lo suba al 2do piso porque me lastimé el tobillo.",
    category: "mandados",
    categoryLabel: "Mandados",
    location: "Col. Vista Hermosa, Monterrey",
    urgency: "Urgente (Hoy)",
    budget: "$200 - $280 MXN",
    postedAgo: "Hace 1 hora",
    clientName: "Sra. Carmen T.",
    clientVerified: true,
    applicantsCount: 2,
    status: "Abierto",
  },
];
