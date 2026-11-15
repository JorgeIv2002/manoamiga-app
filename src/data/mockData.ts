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
    count: 0,
  },
  {
    id: "limpieza",
    name: "Limpieza",
    subtitle: "Casas, depas, lavado profundo y orden",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    count: 0,
  },
  {
    id: "mudanzas",
    name: "Mudanzas y Fletes",
    subtitle: "Camioneta, carga pesada y traslado seguro",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    count: 0,
  },
  {
    id: "mandados",
    name: "Mandados",
    subtitle: "Súper, farmacia, filas, entregas y mascotas",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    count: 0,
  },
  {
    id: "tecnologia",
    name: "Tecnología",
    subtitle: "PC, redes Wi-Fi, cámaras, Smart TV y soporte",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    count: 0,
  },
];

// Sin perfiles ni solicitudes falsas: todo proviene de registros reales en Supabase
export const INITIAL_SOLUCIONADORES: Solucionador[] = [];

export const INITIAL_PROBLEMAS: ProblemaSolicitud[] = [];
