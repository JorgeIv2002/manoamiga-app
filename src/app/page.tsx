"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search,
  Wrench,
  Sparkles,
  Truck,
  ShoppingBag,
  Laptop,
  Star,
  ShieldCheck,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  PlusCircle,
  UserPlus,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Filter,
  AlertCircle,
  X,
  Briefcase,
  ThumbsUp,
  ChevronRight,
  HeartHandshake,
  Zap,
  Award,
  Menu,
  LogIn,
  LogOut,
  User,
  Database,
  Loader2,
} from "lucide-react";
import {
  CATEGORIES,
  INITIAL_SOLUCIONADORES,
  INITIAL_PROBLEMAS,
  CategoryId,
  Solucionador,
  ProblemaSolicitud,
  ReviewItem,
} from "@/data/mockData";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function HomePage() {
  // Data state (initialized with mockups + synced with Supabase)
  const [solucionadores, setSolucionadores] = useState<Solucionador[]>(
    INITIAL_SOLUCIONADORES
  );
  const [problemas, setProblemas] =
    useState<ProblemaSolicitud[]>(INITIAL_PROBLEMAS);
  const [isLoadingDb, setIsLoadingDb] = useState(true);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [dbErrorHint, setDbErrorHint] = useState<string | null>(null);

  // Supabase Auth State
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authFullName, setAuthFullName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);

  // Filters & Navigation state
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyAvailableToday, setOnlyAvailableToday] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals state
  const [selectedSolucionador, setSelectedSolucionador] =
    useState<Solucionador | null>(null);
  const [contactModalSolucionador, setContactModalSolucionador] =
    useState<Solucionador | null>(null);
  const [applyModalProblema, setApplyModalProblema] =
    useState<ProblemaSolicitud | null>(null);
  const [isRegisterSolucionadorOpen, setIsRegisterSolucionadorOpen] =
    useState(false);
  const [isPedirAyudaModalOpen, setIsPedirAyudaModalOpen] = useState(false);

  // 3-Step "Pedir Ayuda" Wizard State
  const [helpStep, setHelpStep] = useState<1 | 2 | 3>(1);
  const [helpCategory, setHelpCategory] =
    useState<Exclude<CategoryId, "todos">>("hogar");
  const [helpTitle, setHelpTitle] = useState("");
  const [helpDescription, setHelpDescription] = useState("");
  const [helpLocation, setHelpLocation] = useState("");
  const [helpUrgency, setHelpUrgency] = useState<
    "Urgente (Hoy)" | "En 24-48 hrs" | "Fecha flexible"
  >("Urgente (Hoy)");
  const [helpBudget, setHelpBudget] = useState("$300 - $500 MXN");
  const [helpClientName, setHelpClientName] = useState("");
  const [helpSubmitting, setHelpSubmitting] = useState(false);
  const [helpSubmittedSuccess, setHelpSubmittedSuccess] = useState(false);
  const [helpSaveStatus, setHelpSaveStatus] = useState<string | null>(null);

  // "Registrarse como Solucionador" Form State
  const [regName, setRegName] = useState("");
  const [regRole, setRegRole] = useState("");
  const [regCategory, setRegCategory] =
    useState<Exclude<CategoryId, "todos">>("hogar");
  const [regRate, setRegRate] = useState("");
  const [regLocation, setRegLocation] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regBio, setRegBio] = useState("");
  const [regSkills, setRegSkills] = useState("");
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [regSaveStatus, setRegSaveStatus] = useState<string | null>(null);

  // New Review in Solucionador Profile Modal
  const [newReviewAuthor, setNewReviewAuthor] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Contact & Apply feedback state
  const [contactMessage, setContactMessage] = useState("");
  const [contactSent, setContactSent] = useState(false);
  const [applyOffer, setApplyOffer] = useState("");
  const [applyMessage, setApplyMessage] = useState("");
  const [applySent, setApplySent] = useState(false);

  // Helper to format relative time from ISO date
  const formatTimeAgo = (isoDate?: string) => {
    if (!isoDate) return "Reciente";
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const mins = Math.max(1, Math.floor(diffMs / 60000));
    if (mins < 60) return `Hace ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Hace ${hours} h`;
    const days = Math.floor(hours / 24);
    return `Hace ${days} día(s)`;
  };

  // Fetch data from Supabase (`perfiles`, `resenas`, `solicitudes_ayuda`)
  const fetchSupabaseData = useCallback(async () => {
    setIsLoadingDb(true);
    try {
      const [perfilesRes, solicitudesRes, resenasRes] = await Promise.all([
        supabase
          .from("perfiles")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("solicitudes_ayuda")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("resenas")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      if (perfilesRes.error || solicitudesRes.error) {
        // Likely tables haven't been created yet via supabase_schema.sql
        setDbConnected(false);
        setDbErrorHint(
          perfilesRes.error?.message ||
            solicitudesRes.error?.message ||
            "Ejecuta supabase_schema.sql en el SQL Editor de Supabase para activar las tablas."
        );
      } else {
        setDbConnected(true);
        setDbErrorHint(null);

        // Map reviews by perfil_id
        const reviewsByPerfil: Record<string, ReviewItem[]> = {};
        if (resenasRes.data) {
          for (const r of resenasRes.data) {
            const pid = String(r.perfil_id);
            if (!reviewsByPerfil[pid]) reviewsByPerfil[pid] = [];
            reviewsByPerfil[pid].push({
              id: String(r.id),
              author: r.author || "Cliente Verificado",
              rating: Number(r.rating) || 5,
              date: formatTimeAgo(r.created_at),
              comment: r.comment || "",
            });
          }
        }

        if (perfilesRes.data && perfilesRes.data.length > 0) {
          const mappedPerfiles: Solucionador[] = perfilesRes.data.map(
            (row: Record<string, unknown>) => {
              const idStr = String(row.id);
              const rowReviews = reviewsByPerfil[idStr] || [
                {
                  id: `rev-init-${idStr}`,
                  author: "Comunidad ManoAmiga",
                  rating: 5,
                  date: "Verificado",
                  comment:
                    "Solucionador registrado en la base de datos de ManoAmiga.",
                },
              ];
              return {
                id: idStr,
                name: String(row.name || "Solucionador"),
                role: String(row.role || "Especialista"),
                category: (row.category as Exclude<CategoryId, "todos">) || "hogar",
                categoryLabel: String(row.category_label || "Hogar"),
                rating: Number(row.rating) || 5.0,
                reviewsCount: rowReviews.length,
                completedJobs: Number(row.completed_jobs) || 1,
                hourlyRate: String(row.hourly_rate || "$250 MXN"),
                responseTime: String(
                  row.response_time || "Responde en ~5 min"
                ),
                location: String(row.location || "Zona Centro"),
                avatarUrl: String(
                  row.avatar_url ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                ),
                verified: Boolean(row.verified ?? true),
                availableToday: Boolean(row.available_today ?? true),
                bio: String(row.bio || ""),
                skills: Array.isArray(row.skills)
                  ? (row.skills as string[])
                  : ["Atención rápida", "Garantía"],
                phone: String(row.phone || "+52 55 0000 0000"),
                reviews: rowReviews,
                fromSupabase: true,
              };
            }
          );
          setSolucionadores([...mappedPerfiles, ...INITIAL_SOLUCIONADORES]);
        }

        if (solicitudesRes.data && solicitudesRes.data.length > 0) {
          const mappedSolicitudes: ProblemaSolicitud[] =
            solicitudesRes.data.map((row: Record<string, unknown>) => ({
              id: String(row.id),
              title: String(row.title || "Solicitud de ayuda"),
              description: String(row.description || ""),
              category:
                (row.category as Exclude<CategoryId, "todos">) || "hogar",
              categoryLabel: String(row.category_label || "Hogar"),
              location: String(row.location || "Zona Centro"),
              urgency:
                (row.urgency as
                  | "Urgente (Hoy)"
                  | "En 24-48 hrs"
                  | "Fecha flexible") || "Urgente (Hoy)",
              budget: String(row.budget || "$300 MXN"),
              postedAgo: formatTimeAgo(row.created_at as string | undefined),
              clientName: String(row.client_name || "Usuario"),
              clientVerified: Boolean(row.client_verified ?? true),
              applicantsCount: Number(row.applicants_count) || 0,
              status:
                (row.status as
                  | "Abierto"
                  | "En revisión"
                  | "En proceso"
                  | "Resuelta") || "Abierto",
              fromSupabase: true,
            }));
          setProblemas([...mappedSolicitudes, ...INITIAL_PROBLEMAS]);
        }
      }
    } catch {
      setDbConnected(false);
    } finally {
      setIsLoadingDb(false);
    }
  }, []);

  // Auth listener & initial load
  useEffect(() => {
    fetchSupabaseData();

    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      if (user) {
        const displayName =
          (user.user_metadata?.full_name as string) ||
          user.email?.split("@")[0] ||
          "";
        setHelpClientName((prev) => prev || displayName);
        setRegName((prev) => prev || displayName);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      if (user) {
        const displayName =
          (user.user_metadata?.full_name as string) ||
          user.email?.split("@")[0] ||
          "";
        setHelpClientName((prev) => prev || displayName);
        setRegName((prev) => prev || displayName);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchSupabaseData]);

  // Handle Auth Submit (Sign Up or Sign In)
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccessMsg(null);

    try {
      if (authMode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail.trim(),
          password: authPassword,
          options: {
            data: {
              full_name: authFullName.trim() || authEmail.split("@")[0],
            },
          },
        });
        if (error) throw error;
        if (data.user) {
          setAuthSuccessMsg(
            "¡Cuenta creada con éxito! Si tu proyecto Supabase requiere confirmación por correo, revisa tu bandeja de entrada, o inicia sesión directamente."
          );
          if (data.session) {
            setTimeout(() => setIsAuthModalOpen(false), 1200);
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword,
        });
        if (error) throw error;
        if (data.session) {
          setAuthSuccessMsg("¡Sesión iniciada correctamente!");
          setTimeout(() => setIsAuthModalOpen(false), 800);
        }
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Ocurrió un error al autenticar con Supabase.";
      setAuthError(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  // Category Icon Helper
  const getCategoryIcon = (id: CategoryId, className = "w-6 h-6") => {
    switch (id) {
      case "hogar":
        return <Wrench className={className} />;
      case "limpieza":
        return <Sparkles className={className} />;
      case "mudanzas":
        return <Truck className={className} />;
      case "mandados":
        return <ShoppingBag className={className} />;
      case "tecnologia":
        return <Laptop className={className} />;
      default:
        return <HeartHandshake className={className} />;
    }
  };

  // Filtered Solucionadores
  const filteredSolucionadores = useMemo(() => {
    return solucionadores.filter((sol) => {
      const matchesCategory =
        selectedCategory === "todos" || sol.category === selectedCategory;
      const matchesAvailability = !onlyAvailableToday || sol.availableToday;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        sol.name.toLowerCase().includes(q) ||
        sol.role.toLowerCase().includes(q) ||
        sol.bio.toLowerCase().includes(q) ||
        sol.skills.some((s) => s.toLowerCase().includes(q)) ||
        sol.location.toLowerCase().includes(q);
      return matchesCategory && matchesAvailability && matchesSearch;
    });
  }, [solucionadores, selectedCategory, onlyAvailableToday, searchQuery]);

  // Filtered Problemas
  const filteredProblemas = useMemo(() => {
    return problemas.filter((prob) => {
      const matchesCategory =
        selectedCategory === "todos" || prob.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        prob.title.toLowerCase().includes(q) ||
        prob.description.toLowerCase().includes(q) ||
        prob.location.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [problemas, selectedCategory, searchQuery]);

  // Submit 3-Step Help Request (Saves to Supabase `solicitudes_ayuda` + updates UI)
  const handleCreateHelpRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setHelpSubmitting(true);
    setHelpSaveStatus(null);

    const categoryObj = CATEGORIES.find((c) => c.id === helpCategory);
    const payload = {
      user_id: currentUser?.id ?? null,
      title:
        helpTitle.trim() || "Necesito ayuda con un servicio en mi domicilio",
      description:
        helpDescription.trim() ||
        "Busco a alguien confiable y puntual para apoyarme con esta tarea.",
      category: helpCategory,
      category_label: categoryObj?.name || "Hogar",
      location: helpLocation.trim() || "Zona Centro",
      urgency: helpUrgency,
      budget: helpBudget.trim() || "$350 MXN",
      client_name:
        helpClientName.trim() ||
        (currentUser?.user_metadata?.full_name as string) ||
        currentUser?.email?.split("@")[0] ||
        "Usuario Verificado",
      client_verified: true,
      applicants_count: 0,
      status: "Abierto",
    };

    try {
      const { data, error } = await supabase
        .from("solicitudes_ayuda")
        .insert([payload])
        .select()
        .single();

      if (error) {
        // Fallback to local state if table not created yet, while showing clear message
        const fallbackProblema: ProblemaSolicitud = {
          id: `prob-${Date.now()}`,
          title: payload.title,
          description: payload.description,
          category: helpCategory,
          categoryLabel: payload.category_label,
          location: payload.location,
          urgency: helpUrgency,
          budget: payload.budget,
          postedAgo: "Justo ahora",
          clientName: payload.client_name,
          clientVerified: true,
          applicantsCount: 0,
          status: "Abierto",
          fromSupabase: false,
        };
        setProblemas((prev) => [fallbackProblema, ...prev]);
        setHelpSaveStatus(
          `Mostrado en el tablero local. (Aviso de Supabase: ${error.message}. Asegúrate de ejecutar supabase_schema.sql en tu panel de Supabase).`
        );
      } else if (data) {
        const savedProblema: ProblemaSolicitud = {
          id: String(data.id),
          title: data.title,
          description: data.description,
          category: data.category,
          categoryLabel: data.category_label,
          location: data.location,
          urgency: data.urgency,
          budget: data.budget,
          postedAgo: "Guardado justo ahora",
          clientName: data.client_name,
          clientVerified: true,
          applicantsCount: Number(data.applicants_count) || 0,
          status: data.status || "Abierto",
          fromSupabase: true,
        };
        setProblemas((prev) => [savedProblema, ...prev]);
        setDbConnected(true);
        setHelpSaveStatus(
          "¡Guardado exitosamente en la tabla 'solicitudes_ayuda' de Supabase!"
        );
      }
    } catch {
      setHelpSaveStatus("Solicitud agregada al tablero principal.");
    } finally {
      setHelpSubmitting(false);
      setHelpSubmittedSuccess(true);
    }
  };

  const resetHelpWizard = () => {
    setHelpStep(1);
    setHelpTitle("");
    setHelpDescription("");
    setHelpLocation("");
    setHelpBudget("$300 - $500 MXN");
    setHelpSubmittedSuccess(false);
    setHelpSaveStatus(null);
  };

  // Submit Register Solucionador (Saves to Supabase `perfiles` + `resenas` + updates UI)
  const handleRegisterSolucionador = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegSubmitting(true);
    setRegSaveStatus(null);

    const categoryObj = CATEGORIES.find((c) => c.id === regCategory);
    const skillsArray = regSkills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const finalSkills =
      skillsArray.length > 0
        ? skillsArray
        : ["Atención rápida", "Herramienta propia", "Garantía"];

    const payload = {
      user_id: currentUser?.id ?? null,
      name: regName.trim() || "Nuevo Solucionador",
      role: regRole.trim() || "Especialista en Servicios Generales",
      category: regCategory,
      category_label: categoryObj?.name || "Hogar",
      rating: 5.0,
      reviews_count: 1,
      completed_jobs: 1,
      hourly_rate: regRate.trim() || "$250 MXN / servicio",
      response_time: "Responde en ~5 min",
      location: regLocation.trim() || "Área Metropolitana",
      avatar_url:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      verified: true,
      available_today: true,
      bio:
        regBio.trim() ||
        "Comprometido con brindar soluciones rápidas, seguras y de excelente calidad.",
      skills: finalSkills,
      phone: regPhone.trim() || "+52 55 0000 0000",
    };

    try {
      const { data, error } = await supabase
        .from("perfiles")
        .insert([payload])
        .select()
        .single();

      if (error) {
        const fallbackSol: Solucionador = {
          id: `sol-${Date.now()}`,
          name: payload.name,
          role: payload.role,
          category: regCategory,
          categoryLabel: payload.category_label,
          rating: 5.0,
          reviewsCount: 1,
          completedJobs: 1,
          hourlyRate: payload.hourly_rate,
          responseTime: payload.response_time,
          location: payload.location,
          avatarUrl: payload.avatar_url,
          verified: true,
          availableToday: true,
          bio: payload.bio,
          skills: finalSkills,
          phone: payload.phone,
          reviews: [
            {
              id: `rev-${Date.now()}`,
              author: "Equipo ManoAmiga",
              rating: 5,
              date: "Hoy",
              comment:
                "Perfil verificado e integrado a la comunidad de solucionadores.",
            },
          ],
          fromSupabase: false,
        };
        setSolucionadores((prev) => [fallbackSol, ...prev]);
        setRegSaveStatus(
          `Mostrado en el directorio local. (Aviso de Supabase: ${error.message}. Ejecuta supabase_schema.sql en tu panel de Supabase).`
        );
      } else if (data) {
        // Also insert an initial welcome review in `resenas`
        await supabase.from("resenas").insert([
          {
            perfil_id: data.id,
            user_id: currentUser?.id ?? null,
            author: "Verificación ManoAmiga",
            rating: 5,
            comment:
              "Perfil verificado y registrado oficialmente en la plataforma.",
          },
        ]);

        const savedSol: Solucionador = {
          id: String(data.id),
          name: data.name,
          role: data.role,
          category: data.category,
          categoryLabel: data.category_label,
          rating: Number(data.rating) || 5.0,
          reviewsCount: 1,
          completedJobs: Number(data.completed_jobs) || 1,
          hourlyRate: data.hourly_rate,
          responseTime: data.response_time,
          location: data.location,
          avatarUrl: data.avatar_url,
          verified: true,
          availableToday: true,
          bio: data.bio,
          skills: Array.isArray(data.skills) ? data.skills : finalSkills,
          phone: data.phone,
          reviews: [
            {
              id: `rev-${Date.now()}`,
              author: "Verificación ManoAmiga",
              rating: 5,
              date: "Justo ahora",
              comment:
                "Perfil verificado y registrado oficialmente en la plataforma.",
            },
          ],
          fromSupabase: true,
        };
        setSolucionadores((prev) => [savedSol, ...prev]);
        setDbConnected(true);
        setRegSaveStatus(
          "¡Tu perfil se guardó exitosamente en la tabla 'perfiles' de Supabase!"
        );
      }
    } catch {
      setRegSaveStatus("Perfil agregado al directorio principal.");
    } finally {
      setRegSubmitting(false);
      setRegSuccess(true);
    }
  };

  // Change status of a Solicitud (Abierto -> En proceso -> Resuelta)
  const handleStatusChange = async (
    prob: ProblemaSolicitud,
    newStatus: "Abierto" | "En proceso" | "Resuelta"
  ) => {
    setProblemas((prev) =>
      prev.map((p) => (p.id === prob.id ? { ...p, status: newStatus } : p))
    );
    if (prob.fromSupabase) {
      await supabase
        .from("solicitudes_ayuda")
        .update({ status: newStatus })
        .eq("id", prob.id);
    }
  };

  // Add a review to a Solucionador (`public.resenas`)
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSolucionador || !newReviewComment.trim()) return;
    setReviewSubmitting(true);

    const authorName =
      newReviewAuthor.trim() ||
      (currentUser?.user_metadata?.full_name as string) ||
      currentUser?.email?.split("@")[0] ||
      "Cliente Satisfecho";

    const newRev: ReviewItem = {
      id: `rev-${Date.now()}`,
      author: authorName,
      rating: newReviewRating,
      date: "Justo ahora",
      comment: newReviewComment.trim(),
    };

    if (selectedSolucionador.fromSupabase) {
      await supabase.from("resenas").insert([
        {
          perfil_id: selectedSolucionador.id,
          user_id: currentUser?.id ?? null,
          author: authorName,
          rating: newReviewRating,
          comment: newReviewComment.trim(),
        },
      ]);
    }

    const updatedSol: Solucionador = {
      ...selectedSolucionador,
      reviewsCount: selectedSolucionador.reviewsCount + 1,
      reviews: [newRev, ...selectedSolucionador.reviews],
    };

    setSelectedSolucionador(updatedSol);
    setSolucionadores((prev) =>
      prev.map((s) => (s.id === updatedSol.id ? updatedSol : s))
    );
    setNewReviewComment("");
    setReviewSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 pb-20 md:pb-0">
      {/* TOP TRUST & SUPABASE STATUS BANNER */}
      <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Perfiles 100% verificados
            </span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[11px]">
              <Database className="w-3 h-3 text-blue-400" />
              {isLoadingDb ? (
                <span className="text-slate-300">Sincronizando Supabase...</span>
              ) : dbConnected ? (
                <span className="text-emerald-400 font-semibold">
                  Conectado a Supabase en vivo
                </span>
              ) : (
                <span
                  className="text-amber-300"
                  title={
                    dbErrorHint ||
                    "Ejecuta supabase_schema.sql en el SQL Editor de Supabase"
                  }
                >
                  Supabase listo (ejecuta supabase_schema.sql para crear tablas)
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-amber-400">
              <Zap className="w-3.5 h-3.5" /> Tiempo medio de respuesta: 8 min
            </span>
          </div>
        </div>
      </div>

      {/* STICKY NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <a
            href="#"
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/25 group-hover:bg-blue-700 transition-colors">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Mano<span className="text-blue-600">Amiga</span>
              </span>
              <span className="block text-[10px] font-medium text-slate-500 -mt-1">
                Soluciones al instante
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a
              href="#categorias"
              className="hover:text-blue-600 transition-colors"
            >
              Categorías
            </a>
            <a
              href="#solucionadores"
              className="hover:text-blue-600 transition-colors"
            >
              Solucionadores ({solucionadores.length})
            </a>
            <a
              href="#problemas"
              className="hover:text-blue-600 transition-colors flex items-center gap-1.5"
            >
              <span>Problemas por Resolver</span>
              <span className="px-1.5 py-0.5 text-[11px] font-bold bg-amber-100 text-amber-800 rounded-full">
                {problemas.length}
              </span>
            </a>
            <a
              href="#pedir-ayuda"
              className="hover:text-blue-600 transition-colors"
            >
              Pedir Ayuda
            </a>
          </nav>

          {/* Desktop Action & Auth Buttons */}
          <div className="hidden md:flex items-center gap-2.5">
            {currentUser ? (
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                <User className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800 max-w-[130px] truncate">
                  {(currentUser.user_metadata?.full_name as string) ||
                    currentUser.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold inline-flex items-center gap-1 ml-1"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthError(null);
                  setAuthSuccessMsg(null);
                  setAuthMode("login");
                  setIsAuthModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 bg-white transition-all"
              >
                <LogIn className="w-4 h-4 text-blue-600" />
                <span>Iniciar Sesión</span>
              </button>
            )}

            <button
              onClick={() => {
                setRegSuccess(false);
                setRegSaveStatus(null);
                setIsRegisterSolucionadorOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 transition-all"
            >
              <UserPlus className="w-4 h-4 text-blue-600" />
              <span>Ser Solucionador</span>
            </button>

            <button
              onClick={() => {
                resetHelpWizard();
                setIsPedirAyudaModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Pedir Ayuda</span>
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center gap-2 md:hidden">
            {!currentUser ? (
              <button
                onClick={() => {
                  setAuthError(null);
                  setAuthSuccessMsg(null);
                  setAuthMode("login");
                  setIsAuthModalOpen(true);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-600" />
                Entrar
              </button>
            ) : (
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50"
              >
                <LogOut className="w-3.5 h-3.5" />
                Salir
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2">
            {currentUser && (
              <div className="py-2 px-3 bg-blue-50 rounded-xl text-xs font-semibold text-blue-900 flex items-center justify-between">
                <span>Sesión: {currentUser.email}</span>
                <button
                  onClick={handleSignOut}
                  className="text-rose-600 underline"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
            <a
              href="#categorias"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 hover:text-blue-600"
            >
              Categorías de Servicio
            </a>
            <a
              href="#solucionadores"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 hover:text-blue-600"
            >
              Directorio de Solucionadores ({solucionadores.length})
            </a>
            <a
              href="#problemas"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 hover:text-blue-600"
            >
              Tablero de Problemas por Resolver ({problemas.length})
            </a>
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setRegSuccess(false);
                  setRegSaveStatus(null);
                  setIsRegisterSolucionadorOpen(true);
                }}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-blue-700 bg-blue-50 flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Registrarme como Solucionador
              </button>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION WITH MAIN SEARCH */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-slate-900 to-slate-900 text-white pt-10 pb-14 md:py-20 px-4">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs sm:text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>
              📍 Operando en Monterrey y toda el Área Metropolitana de Nuevo León
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-5">
            ¿Un imprevisto en casa o falta de tiempo?{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              Resuélvelo hoy con manos de confianza
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            Desde una fuga de agua, mantenimiento de minisplit o limpieza
            profunda, hasta un flete o las compras del súper. Conecta en minutos
            con solucionadores verificados cerca de tu colonia, sin comisiones
            ocultas y a precio justo.
          </p>

          {/* MAIN SEARCH BAR */}
          <div className="max-w-3xl mx-auto bg-white p-2 sm:p-2.5 rounded-2xl shadow-2xl shadow-blue-950/50 border border-slate-200/80">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 flex items-center gap-3 px-3.5 py-2.5 text-slate-800">
                <Search className="w-5 h-5 text-blue-600 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="¿Qué necesitas resolver hoy? (Ej. plomero, minisplit, flete, limpieza, H-E-B...)"
                  className="w-full text-sm sm:text-base bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-slate-400 hover:text-slate-600"
                    title="Limpiar búsqueda"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <a
                href="#solucionadores"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base transition-all shadow-md shadow-blue-600/25 shrink-0"
              >
                <span>Encontrar Solucionador</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Popular Tags */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300">
            <span className="text-slate-400 font-medium">
              Lo más pedido en Nuevo León:
            </span>
            {[
              { label: "❄️ Mantenimiento Minisplit", query: "minisplit" },
              { label: "🔧 Plomería y Fugas", query: "fuga" },
              { label: "✨ Limpieza Profunda", query: "limpieza" },
              { label: "🚚 Fletes y Mudanzas", query: "camioneta" },
              { label: "🛒 Mandados / H-E-B", query: "H-E-B" },
              { label: "💻 Redes Wi-Fi Mesh", query: "Wi-Fi" },
            ].map((tag) => (
              <button
                key={tag.label}
                onClick={() => {
                  setSearchQuery(tag.query);
                  setSelectedCategory("todos");
                }}
                className="px-3 py-1 rounded-full bg-slate-800/90 hover:bg-blue-600/40 border border-slate-700 hover:border-blue-400 text-slate-200 transition-colors"
              >
                {tag.label}
              </button>
            ))}
          </div>

          {/* Hero Trust Cards */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
            <div className="flex items-center gap-3 bg-slate-800/50 rounded-xl p-3.5 border border-slate-700/60">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  Seguridad Primero
                </p>
                <p className="text-xs text-slate-400">
                  Identidad verificada y reseñas de vecinos reales
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-slate-800/50 rounded-xl p-3.5 border border-slate-700/60">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  Respuesta en &lt; 10 Min
                </p>
                <p className="text-xs text-slate-400">
                  Solucionadores activos en todo Nuevo León
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-slate-800/50 rounded-xl p-3.5 border border-slate-700/60">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  Trato Directo y Justo
                </p>
                <p className="text-xs text-slate-400">
                  Acuerda el precio exacto antes de iniciar
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section
        id="categorias"
        className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 -mt-6 relative z-20"
      >
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/90 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Explora por Categoría
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Selecciona un área para filtrar tanto solucionadores como
                solicitudes activas
              </p>
            </div>
            {selectedCategory !== "todos" && (
              <button
                onClick={() => setSelectedCategory("todos")}
                className="self-start sm:self-auto text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Mostrar todas las categorías
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <button
              onClick={() => setSelectedCategory("todos")}
              className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
                selectedCategory === "todos"
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2.5 ${
                  selectedCategory === "todos"
                    ? "bg-white/20 text-white"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm">Todas</span>
              <span
                className={`text-[11px] mt-0.5 line-clamp-1 ${
                  selectedCategory === "todos"
                    ? "text-blue-100"
                    : "text-slate-500"
                }`}
              >
                Ver todo el catálogo
              </span>
            </button>

            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() =>
                    setSelectedCategory(isSelected ? "todos" : cat.id)
                  }
                  className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20"
                      : "bg-white hover:border-blue-300 hover:bg-blue-50/40 text-slate-800 border-slate-200"
                  }`}
                >
                  <div className="w-full flex items-center justify-between mb-2.5">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isSelected ? "bg-white/20 text-white" : cat.badgeColor
                      }`}
                    >
                      {getCategoryIcon(cat.id, "w-5 h-5")}
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {cat.count}
                    </span>
                  </div>
                  <span className="font-bold text-sm">{cat.name}</span>
                  <span
                    className={`text-[11px] mt-0.5 line-clamp-1 ${
                      isSelected ? "text-blue-100" : "text-slate-500"
                    }`}
                  >
                    {cat.subtitle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* DIRECTORY OF SOLUCIONADORES */}
      <section
        id="solucionadores"
        className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-12 pb-8"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Directorio de Expertos y Ayudantes</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Solucionadores Destacados
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Personas reales con calificaciones comprobadas listas para
              ayudarte hoy mismo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 bg-white px-3.5 py-2 rounded-xl border border-slate-200 cursor-pointer select-none shadow-sm hover:border-blue-300">
              <input
                type="checkbox"
                checked={onlyAvailableToday}
                onChange={(e) => setOnlyAvailableToday(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Disponibles hoy</span>
            </label>

            <button
              onClick={() => {
                setRegSuccess(false);
                setRegSaveStatus(null);
                setIsRegisterSolucionadorOpen(true);
              }}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl border border-blue-200 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>¿Ofreces un servicio? Únete aquí</span>
            </button>
          </div>
        </div>

        {filteredSolucionadores.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
            <Filter className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">
              No encontramos solucionadores con ese filtro
            </h3>
            <p className="text-sm text-slate-500 mt-1 mb-4">
              Prueba cambiando la categoría o publica tu problema directamente
              para que te contacten.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("todos");
                setSearchQuery("");
                setOnlyAvailableToday(false);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSolucionadores.map((sol) => (
              <div
                key={sol.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5 sm:p-6">
                  {/* Top Badge Row */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {getCategoryIcon(
                          sol.category,
                          "w-3.5 h-3.5 text-blue-600"
                        )}
                        {sol.categoryLabel}
                      </span>
                      {sol.fromSupabase && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <Database className="w-3 h-3" /> En vivo
                        </span>
                      )}
                    </div>
                    {sol.availableToday ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Disponible hoy
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        Agenda previa
                      </span>
                    )}
                  </div>

                  {/* Profile Header */}
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <img
                        src={sol.avatarUrl}
                        alt={sol.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-sm"
                      />
                      {sol.verified && (
                        <div
                          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center ring-2 ring-white"
                          title="Identidad Verificada"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                        {sol.name}
                      </h3>
                      <p className="text-xs sm:text-sm font-medium text-slate-600 line-clamp-1">
                        {sol.role}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                        <span className="inline-flex items-center gap-1 font-bold text-slate-900 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {sol.rating.toFixed(1)}
                          <span className="font-normal text-slate-500">
                            ({sol.reviewsCount})
                          </span>
                        </span>
                        <span className="text-slate-500">
                          • {sol.completedJobs} trabajos
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {sol.bio}
                  </p>

                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {sol.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{sol.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium text-emerald-700">
                        {sol.responseTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-5 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                      Tarifa estimada
                    </span>
                    <span className="text-sm font-extrabold text-slate-900">
                      {sol.hourlyRate}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedSolucionador(sol)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 transition-colors"
                    >
                      Ver perfil
                    </button>
                    <button
                      onClick={() => {
                        setContactMessage("");
                        setContactSent(false);
                        setContactModalSolucionador(sol);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Contactar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ACTIVE PROBLEMS BOARD ("PROBLEMAS POR RESOLVER") */}
      <section
        id="problemas"
        className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10"
      >
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 rounded-3xl p-6 sm:p-8 lg:p-10 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Tablero Conectado a Supabase</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold">
                Problemas por Resolver Ahora Mismo
              </h2>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                Personas reales buscando quién les eche la mano hoy. Postúlate
                con un clic, cambia el estado de la solicitud o publica tu
                propio problema.
              </p>
            </div>

            <button
              onClick={() => {
                resetHelpWizard();
                setIsPedirAyudaModalOpen(true);
              }}
              className="self-start md:self-auto inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              Publicar mi Problema
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredProblemas.map((prob) => {
              const isUrgent = prob.urgency === "Urgente (Hoy)";
              return (
                <div
                  key={prob.id}
                  className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between transition-all"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-700 text-slate-200">
                          {getCategoryIcon(
                            prob.category,
                            "w-3.5 h-3.5 text-blue-400"
                          )}
                          {prob.categoryLabel}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                            isUrgent
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          {prob.urgency}
                        </span>
                        {prob.fromSupabase && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                            <Database className="w-3 h-3" /> Supabase
                          </span>
                        )}
                      </div>

                      {/* Interactive Status Selector (Task 3.4: Abierta -> En proceso -> Resuelta) */}
                      <select
                        value={prob.status}
                        onChange={(e) =>
                          handleStatusChange(
                            prob,
                            e.target.value as
                              | "Abierto"
                              | "En proceso"
                              | "Resuelta"
                          )
                        }
                        aria-label="Estado de la solicitud"
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border cursor-pointer focus:outline-none ${
                          prob.status === "Resuelta"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : prob.status === "En proceso"
                            ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                            : "bg-slate-700 text-slate-200 border-slate-600"
                        }`}
                      >
                        <option value="Abierto" className="bg-slate-900">
                          🟢 Abierta
                        </option>
                        <option value="En proceso" className="bg-slate-900">
                          🟡 En proceso
                        </option>
                        <option value="Resuelta" className="bg-slate-900">
                          ✅ Resuelta
                        </option>
                      </select>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white mb-1.5">
                      {prob.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                      {prob.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 text-xs text-slate-300">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-blue-400" />
                          {prob.location}
                        </span>
                        <span>•</span>
                        <span>Por {prob.clientName}</span>
                        <span>•</span>
                        <span className="text-slate-400">{prob.postedAgo}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">
                          Presupuesto ofrecido:
                        </span>
                        <span className="text-sm font-extrabold text-emerald-400">
                          {prob.budget}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setApplyOffer(prob.budget);
                        setApplyMessage("");
                        setApplySent(false);
                        setApplyModalProblema(prob);
                      }}
                      disabled={prob.status === "Resuelta"}
                      className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors shadow-sm ${
                        prob.status === "Resuelta"
                          ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                          : "bg-white hover:bg-blue-50 text-slate-900"
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4 text-blue-600" />
                      <span>
                        {prob.status === "Resuelta"
                          ? "Solicitud Resuelta"
                          : `Yo te ayudo (${prob.applicantsCount})`}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* VISUAL 3-STEP FORM SECTION ("PEDIR AYUDA EN 3 PASOS") */}
      <section
        id="pedir-ayuda"
        className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12"
      >
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
          <div className="bg-blue-600 px-6 py-6 sm:px-10 sm:py-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-2">
                Conectado a Base de Datos en Tiempo Real
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold">
                Pide Ayuda en 3 Sencillos Pasos
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                Describe tu necesidad, guárdala en Supabase y recibe propuestas
                de solucionadores cercanos.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {[1, 2, 3].map((stepNum) => (
                <button
                  key={stepNum}
                  type="button"
                  onClick={() => {
                    setHelpSubmittedSuccess(false);
                    setHelpStep(stepNum as 1 | 2 | 3);
                  }}
                  className={`w-10 h-10 rounded-xl font-extrabold text-sm flex items-center justify-center transition-all ${
                    helpStep === stepNum
                      ? "bg-white text-blue-600 shadow-md scale-105"
                      : helpStep > stepNum
                      ? "bg-emerald-400 text-slate-950"
                      : "bg-blue-700/70 text-blue-200"
                  }`}
                >
                  {helpStep > stepNum ? "✓" : stepNum}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-10">
            {helpSubmittedSuccess ? (
              <div className="text-center py-8 max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-2">
                  ¡Tu solicitud ya está publicada!
                </h3>
                {helpSaveStatus && (
                  <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 mb-4">
                    {helpSaveStatus}
                  </p>
                )}
                <p className="text-sm text-slate-600 mb-6">
                  Tu problema ya aparece en la parte superior del{" "}
                  <a
                    href="#problemas"
                    className="text-blue-600 font-semibold underline"
                  >
                    Tablero de Problemas por Resolver
                  </a>
                  .
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <a
                    href="#problemas"
                    className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800"
                  >
                    Ver mi solicitud en el tablero
                  </a>
                  <button
                    type="button"
                    onClick={resetHelpWizard}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200"
                  >
                    Publicar otro problema
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateHelpRequest}>
                {helpStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                        Paso 1 de 3
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                        ¿Con qué problema necesitas ayuda?
                      </h3>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        1. Elige la categoría que mejor describa tu necesidad:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                        {CATEGORIES.map((cat) => {
                          const active = helpCategory === cat.id;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setHelpCategory(cat.id)}
                              className={`p-3 rounded-xl border text-left transition-all flex flex-col items-start gap-1.5 ${
                                active
                                  ? "border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-600/20"
                                  : "border-slate-200 hover:border-slate-300 text-slate-700"
                              }`}
                            >
                              <div className="text-blue-600">
                                {getCategoryIcon(cat.id, "w-5 h-5")}
                              </div>
                              <span className="font-bold text-xs sm:text-sm">
                                {cat.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        2. Título breve de lo que necesitas:
                      </label>
                      <input
                        type="text"
                        value={helpTitle}
                        onChange={(e) => setHelpTitle(e.target.value)}
                        placeholder="Ej. Cambiar llave de agua del fregadero que gotea"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        3. Cuéntanos un poco más de detalle:
                      </label>
                      <textarea
                        rows={3}
                        value={helpDescription}
                        onChange={(e) => setHelpDescription(e.target.value)}
                        placeholder="Ej. Ya compré la llave nueva pero no tengo herramienta para quitar la anterior..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setHelpStep(2)}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20"
                      >
                        <span>Siguiente: Dónde y Cuándo</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {helpStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                        Paso 2 de 3
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                        ¿Dónde estás ubicado y qué tan urgente es?
                      </h3>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Colonia, Barrio o Zona de referencia:
                      </label>
                      <div className="relative">
                        <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          value={helpLocation}
                          onChange={(e) => setHelpLocation(e.target.value)}
                          placeholder="Ej. Col. Del Valle, cerca del Parque Hundido"
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Nivel de urgencia:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {(
                          [
                            {
                              id: "Urgente (Hoy)",
                              desc: "Lo antes posible hoy mismo",
                            },
                            {
                              id: "En 24-48 hrs",
                              desc: "Entre mañana y pasado mañana",
                            },
                            {
                              id: "Fecha flexible",
                              desc: "Podemos coordinar horario esta semana",
                            },
                          ] as const
                        ).map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => setHelpUrgency(u.id)}
                            className={`p-4 rounded-xl border text-left transition-all ${
                              helpUrgency === u.id
                                ? "border-blue-600 bg-blue-50/70 ring-2 ring-blue-600/20"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <span className="block font-bold text-sm text-slate-900">
                              {u.id}
                            </span>
                            <span className="block text-xs text-slate-500 mt-1">
                              {u.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => setHelpStep(1)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Anterior</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setHelpStep(3)}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20"
                      >
                        <span>Siguiente: Presupuesto</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {helpStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                        Paso 3 de 3
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                        Presupuesto estimado y confirmación
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          ¿Cuánto estimas pagar por la ayuda?
                        </label>
                        <input
                          type="text"
                          value={helpBudget}
                          onChange={(e) => setHelpBudget(e.target.value)}
                          placeholder="Ej. $300 - $500 MXN"
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Tu nombre:
                        </label>
                        <input
                          type="text"
                          value={helpClientName}
                          onChange={(e) => setHelpClientName(e.target.value)}
                          placeholder="Ej. Ana García"
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs sm:text-sm space-y-1.5">
                      <p className="font-bold text-slate-800">
                        Resumen de tu solicitud:
                      </p>
                      <p className="text-slate-600">
                        <span className="font-semibold">Problema:</span>{" "}
                        {helpTitle || "Servicio general a domicilio"} (
                        {CATEGORIES.find((c) => c.id === helpCategory)?.name})
                      </p>
                      <p className="text-slate-600">
                        <span className="font-semibold">
                          Ubicación y Urgencia:
                        </span>{" "}
                        {helpLocation || "Zona Centro"} • {helpUrgency}
                      </p>
                      <p className="text-slate-600">
                        <span className="font-semibold">Presupuesto:</span>{" "}
                        <span className="text-emerald-700 font-bold">
                          {helpBudget}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => setHelpStep(2)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Anterior</span>
                      </button>

                      <button
                        type="submit"
                        disabled={helpSubmitting}
                        className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/25"
                      >
                        {helpSubmitting ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5" />
                        )}
                        <span>
                          {helpSubmitting
                            ? "Guardando en Supabase..."
                            : "Publicar Solicitud Ahora"}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION BANNER FOR SOLUCIONADORES */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-14">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-bold uppercase tracking-wider">
              <Briefcase className="w-3.5 h-3.5" /> Convierte tus habilidades en
              clientes diarios en Nuevo León
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              ¿Eres plomero, técnico, haces limpieza, fletes o mandados?
            </h2>
            <p className="text-blue-100 text-sm sm:text-base">
              Anúnciate gratis en ManoAmiga, recibe solicitudes directas en tu
              WhatsApp y quédate con el 100% de tu trabajo. Tú eliges tus zonas
              y tus tarifas.
            </p>
          </div>

          <button
            onClick={() => {
              setRegSuccess(false);
              setRegSaveStatus(null);
              setIsRegisterSolucionadorOpen(true);
            }}
            className="px-6 py-4 rounded-2xl bg-white hover:bg-blue-50 text-blue-700 font-extrabold text-sm sm:text-base shadow-lg transition-all shrink-0 flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            <span>Registrarme Gratis como Solucionador</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-4 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <span className="font-bold text-white text-base">
              Mano<span className="text-blue-400">Amiga</span>
            </span>
            <span>— Ayuda rápida y confiable para todos.</span>
          </div>
          <div className="flex gap-6">
            <a href="#categorias" className="hover:text-white">
              Categorías
            </a>
            <a href="#solucionadores" className="hover:text-white">
              Solucionadores
            </a>
            <a href="#problemas" className="hover:text-white">
              Problemas Activos
            </a>
            <a href="#pedir-ayuda" className="hover:text-white">
              Pedir Ayuda
            </a>
          </div>
        </div>
      </footer>

      {/* MOBILE STICKY BOTTOM BAR */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-around md:hidden shadow-lg">
        <a
          href="#solucionadores"
          className="flex flex-col items-center gap-0.5 text-[11px] font-semibold text-slate-600 hover:text-blue-600"
        >
          <Search className="w-5 h-5" />
          <span>Explorar</span>
        </a>
        <a
          href="#problemas"
          className="flex flex-col items-center gap-0.5 text-[11px] font-semibold text-slate-600 hover:text-blue-600"
        >
          <Briefcase className="w-5 h-5" />
          <span>Problemas ({problemas.length})</span>
        </a>
        <button
          onClick={() => {
            resetHelpWizard();
            setIsPedirAyudaModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-600/30"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Pedir Ayuda</span>
        </button>
        <button
          onClick={() => {
            setRegSuccess(false);
            setRegSaveStatus(null);
            setIsRegisterSolucionadorOpen(true);
          }}
          className="flex flex-col items-center gap-0.5 text-[11px] font-semibold text-slate-600 hover:text-blue-600"
        >
          <UserPlus className="w-5 h-5" />
          <span>Soy Experto</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* MODAL 0: AUTENTICACIÓN SUPABASE (LOGIN / REGISTRO)        */}
      {/* ========================================================= */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> Acceso Seguro con Supabase
              Auth
            </div>

            <h3 className="text-2xl font-extrabold text-slate-900 mb-1">
              {authMode === "login"
                ? "Iniciar Sesión en ManoAmiga"
                : "Crear Cuenta Gratis"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-5">
              {authMode === "login"
                ? "Ingresa con tu correo y contraseña para gestionar tus solicitudes o perfil."
                : "Regístrate en segundos para pedir ayuda u ofrecer tus servicios."}
            </p>

            {/* Toggle Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-5">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setAuthError(null);
                  setAuthSuccessMsg(null);
                }}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${
                  authMode === "login"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600"
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("register");
                  setAuthError(null);
                  setAuthSuccessMsg(null);
                }}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${
                  authMode === "register"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600"
                }`}
              >
                Crear Cuenta
              </button>
            </div>

            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {authError}
              </div>
            )}

            {authSuccessMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                {authSuccessMsg}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === "register" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tu nombre completo
                  </label>
                  <input
                    type="text"
                    required
                    value={authFullName}
                    onChange={(e) => setAuthFullName(e.target.value)}
                    placeholder="Ej. Jorge Ramírez"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contraseña (mínimo 6 caracteres)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-extrabold text-sm shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
              >
                {authLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>
                  {authMode === "login"
                    ? "Entrar a mi Cuenta"
                    : "Registrarme Ahora"}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: PERFIL DETALLADO DEL SOLUCIONADOR + RESEÑAS       */}
      {/* ========================================================= */}
      {selectedSolucionador && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setSelectedSolucionador(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-5">
              <img
                src={selectedSolucionador.avatarUrl}
                alt={selectedSolucionador.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-100"
              />
              <div>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Perfil Verificado
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {selectedSolucionador.name}
                </h3>
                <p className="text-sm text-slate-600">
                  {selectedSolucionador.role}
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed mb-4">
              {selectedSolucionador.bio}
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-5 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Calificación media:</span>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {selectedSolucionador.rating.toFixed(1)} (
                  {selectedSolucionador.reviewsCount} reseñas)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tarifa estimada:</span>
                <span className="font-bold text-emerald-700">
                  {selectedSolucionador.hourlyRate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Zona de cobertura:</span>
                <span className="font-medium text-slate-800">
                  {selectedSolucionador.location}
                </span>
              </div>
            </div>

            {/* Reviews List */}
            <div className="mb-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Reseñas de clientes ({selectedSolucionador.reviews.length})
              </h4>
              <div className="space-y-2.5 max-h-44 overflow-y-auto pr-1">
                {selectedSolucionador.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800">
                        {rev.author}
                      </span>
                      <span className="text-amber-500 font-bold text-xs">
                        {"★".repeat(rev.rating)}
                      </span>
                    </div>
                    <p className="text-slate-600">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Review Form (`public.resenas`) */}
            <form
              onSubmit={handleAddReview}
              className="mb-5 p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2.5"
            >
              <p className="text-xs font-bold text-slate-700">
                Dejar una reseña para {selectedSolucionador.name.split(" ")[0]}:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newReviewAuthor}
                  onChange={(e) => setNewReviewAuthor(e.target.value)}
                  placeholder="Tu nombre"
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                />
                <select
                  value={newReviewRating}
                  onChange={(e) => setNewReviewRating(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold"
                >
                  <option value={5}>★★★★★ (5 Excelente)</option>
                  <option value={4}>★★★★☆ (4 Muy bueno)</option>
                  <option value={3}>★★★☆☆ (3 Regular)</option>
                </select>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  placeholder="Escribe tu experiencia..."
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                />
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold shrink-0"
                >
                  Publicar
                </button>
              </div>
            </form>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  const sol = selectedSolucionador;
                  setSelectedSolucionador(null);
                  setContactMessage("");
                  setContactSent(false);
                  setContactModalSolucionador(sol);
                }}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
              >
                <MessageCircle className="w-4 h-4" />
                Contactar a {selectedSolucionador.name.split(" ")[0]}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: CONTACTAR SOLUCIONADOR                           */}
      {/* ========================================================= */}
      {contactModalSolucionador && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setContactModalSolucionador(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            {contactSent ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-1">
                  ¡Mensaje enviado a {contactModalSolucionador.name}!
                </h3>
                <p className="text-sm text-slate-600 mb-5">
                  {contactModalSolucionador.responseTime}. También puedes
                  llamarle o escribirle directo por WhatsApp al{" "}
                  <span className="font-bold text-slate-800">
                    {contactModalSolucionador.phone}
                  </span>
                  .
                </p>
                <button
                  onClick={() => setContactModalSolucionador(null)}
                  className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-sm"
                >
                  Listo, entendido
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={contactModalSolucionador.avatarUrl}
                    alt={contactModalSolucionador.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      Contactar a {contactModalSolucionador.name}
                    </h3>
                    <p className="text-xs text-emerald-600 font-semibold">
                      {contactModalSolucionador.responseTime}
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setContactSent(true);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                      Describe brevemente lo que necesitas:
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder={`Hola ${
                        contactModalSolucionador.name.split(" ")[0]
                      }, necesito ayuda hoy con...`}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-blue-600" /> Teléfono /
                      WhatsApp directo:
                    </span>
                    <span className="font-bold text-slate-900">
                      {contactModalSolucionador.phone}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Enviar Solicitud Directa
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: POSTULARSE A UN PROBLEMA ("YO TE AYUDO")          */}
      {/* ========================================================= */}
      {applyModalProblema && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setApplyModalProblema(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            {applySent ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-1">
                  ¡Propuesta enviada a {applyModalProblema.clientName}!
                </h3>
                <p className="text-sm text-slate-600 mb-5">
                  Hemos actualizado el contador de postulantes y cambiado el
                  estado a <span className="font-bold">En proceso</span>.
                </p>
                <button
                  onClick={() => setApplyModalProblema(null)}
                  className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-sm"
                >
                  Volver al tablero
                </button>
              </div>
            ) : (
              <>
                <span className="inline-block px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold mb-2">
                  Postularme como Solucionador
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mb-1">
                  {applyModalProblema.title}
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Solicitado por {applyModalProblema.clientName} en{" "}
                  {applyModalProblema.location}
                </p>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const nextCount = applyModalProblema.applicantsCount + 1;
                    setProblemas((prev) =>
                      prev.map((p) =>
                        p.id === applyModalProblema.id
                          ? {
                              ...p,
                              applicantsCount: nextCount,
                              status: "En proceso",
                            }
                          : p
                      )
                    );
                    if (applyModalProblema.fromSupabase) {
                      await supabase
                        .from("solicitudes_ayuda")
                        .update({
                          applicants_count: nextCount,
                          status: "En proceso",
                        })
                        .eq("id", applyModalProblema.id);
                    }
                    setApplySent(true);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                      Tu tarifa propuesta:
                    </label>
                    <input
                      type="text"
                      required
                      value={applyOffer}
                      onChange={(e) => setApplyOffer(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                      Mensaje para el cliente (¿Cuándo puedes llegar?):
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={applyMessage}
                      onChange={(e) => setApplyMessage(e.target.value)}
                      placeholder="Hola, estoy a 15 minutos de tu ubicación y llevo las herramientas necesarias..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md"
                  >
                    Enviar mi Propuesta de Ayuda
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: REGISTRARSE COMO SOLUCIONADOR (SUPABASE INSERT)   */}
      {/* ========================================================= */}
      {isRegisterSolucionadorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setIsRegisterSolucionadorOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            {regSuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-2">
                  ¡Bienvenido al Directorio de Solucionadores!
                </h3>
                {regSaveStatus && (
                  <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 mb-4">
                    {regSaveStatus}
                  </p>
                )}
                <p className="text-sm text-slate-600 mb-6">
                  Tu tarjeta profesional ya aparece en primera fila del
                  Directorio principal para que cualquier persona pueda
                  encontrarte y contratarte.
                </p>
                <button
                  onClick={() => {
                    setIsRegisterSolucionadorOpen(false);
                    setSelectedCategory("todos");
                  }}
                  className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm"
                >
                  Ver mi perfil en el Directorio
                </button>
              </div>
            ) : (
              <>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
                  <UserPlus className="w-3.5 h-3.5" /> Registro Conectado a
                  Supabase
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900">
                  Ofrece tus servicios en ManoAmiga
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-5">
                  Tus datos se guardarán en la tabla <code>perfiles</code> de
                  Supabase y aparecerás al instante en el directorio.
                </p>

                <form
                  onSubmit={handleRegisterSolucionador}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Ej. Luis Hernández"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Categoría principal *
                      </label>
                      <select
                        value={regCategory}
                        onChange={(e) =>
                          setRegCategory(
                            e.target.value as Exclude<CategoryId, "todos">
                          )
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tu oficio o especialidad principal *
                    </label>
                    <input
                      type="text"
                      required
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      placeholder="Ej. Electricista, Plomero y Reparaciones del Hogar"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tarifa estimada *
                      </label>
                      <input
                        type="text"
                        required
                        value={regRate}
                        onChange={(e) => setRegRate(e.target.value)}
                        placeholder="Ej. $250 MXN / visita"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Teléfono / WhatsApp *
                      </label>
                      <input
                        type="text"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="Ej. +52 55 1234 5678"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Zona o colonias donde trabajas *
                      </label>
                      <input
                        type="text"
                        required
                        value={regLocation}
                        onChange={(e) => setRegLocation(e.target.value)}
                        placeholder="Ej. Zona Centro y Sur"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Habilidades (separadas por coma)
                      </label>
                      <input
                        type="text"
                        value={regSkills}
                        onChange={(e) => setRegSkills(e.target.value)}
                        placeholder="Ej. Plomería, Pintura, Cerraduras"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Presentación y experiencia
                    </label>
                    <textarea
                      rows={2}
                      value={regBio}
                      onChange={(e) => setRegBio(e.target.value)}
                      placeholder="Cuéntale a tus futuros clientes por qué pueden confiar en tu trabajo..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={regSubmitting}
                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-extrabold text-sm shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
                  >
                    {regSubmitting && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    <span>
                      {regSubmitting
                        ? "Guardando en Supabase..."
                        : "Publicar mi Perfil de Solucionador"}
                    </span>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: ATAJO RÁPIDO "PEDIR AYUDA" (3 PASOS EN MODAL)    */}
      {/* ========================================================= */}
      {isPedirAyudaModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setIsPedirAyudaModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            {helpSubmittedSuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-2">
                  ¡Tu problema fue publicado con éxito!
                </h3>
                {helpSaveStatus && (
                  <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 mb-4">
                    {helpSaveStatus}
                  </p>
                )}
                <p className="text-sm text-slate-600 mb-6">
                  Ya aparece en primera fila del Tablero de Problemas por
                  Resolver para que los solucionadores te contacten.
                </p>
                <button
                  onClick={() => setIsPedirAyudaModalOpen(false)}
                  className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm"
                >
                  Ver en el Tablero
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  {[1, 2, 3].map((s) => (
                    <div
                      key={s}
                      className={`h-2 flex-1 rounded-full ${
                        helpStep >= s ? "bg-blue-600" : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>

                <form onSubmit={handleCreateHelpRequest} className="space-y-4">
                  {helpStep === 1 && (
                    <>
                      <span className="text-xs font-bold uppercase text-blue-600">
                        Paso 1 de 3 • ¿Qué necesitas?
                      </span>
                      <h3 className="text-xl font-extrabold text-slate-900">
                        Describe tu problema o tarea cotidiana
                      </h3>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setHelpCategory(cat.id)}
                            className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 text-xs font-bold ${
                              helpCategory === cat.id
                                ? "border-blue-600 bg-blue-50 text-blue-700"
                                : "border-slate-200 text-slate-600"
                            }`}
                          >
                            {getCategoryIcon(cat.id, "w-4 h-4")}
                            <span>{cat.name}</span>
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        required
                        value={helpTitle}
                        onChange={(e) => setHelpTitle(e.target.value)}
                        placeholder="Título breve (Ej. Instalar soporte de TV en pared)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                      />
                      <textarea
                        rows={3}
                        value={helpDescription}
                        onChange={(e) => setHelpDescription(e.target.value)}
                        placeholder="Detalles adicionales para que el solucionador sepa qué llevar..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setHelpStep(2)}
                          className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center gap-1.5"
                        >
                          <span>Siguiente</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}

                  {helpStep === 2 && (
                    <>
                      <span className="text-xs font-bold uppercase text-blue-600">
                        Paso 2 de 3 • Ubicación y Urgencia
                      </span>
                      <h3 className="text-xl font-extrabold text-slate-900">
                        ¿Dónde y cuándo necesitas la ayuda?
                      </h3>
                      <input
                        type="text"
                        required
                        value={helpLocation}
                        onChange={(e) => setHelpLocation(e.target.value)}
                        placeholder="Tu colonia o zona (Ej. Col. Roma Sur)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {(
                          [
                            "Urgente (Hoy)",
                            "En 24-48 hrs",
                            "Fecha flexible",
                          ] as const
                        ).map((u) => (
                          <button
                            key={u}
                            type="button"
                            onClick={() => setHelpUrgency(u)}
                            className={`p-3 rounded-xl border text-xs font-bold ${
                              helpUrgency === u
                                ? "border-blue-600 bg-blue-50 text-blue-700"
                                : "border-slate-200 text-slate-700"
                            }`}
                          >
                            {u}
                          </button>
                        ))}
                      </div>
                      <div className="flex justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => setHelpStep(1)}
                          className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm"
                        >
                          Atrás
                        </button>
                        <button
                          type="button"
                          onClick={() => setHelpStep(3)}
                          className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center gap-1.5"
                        >
                          <span>Siguiente</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}

                  {helpStep === 3 && (
                    <>
                      <span className="text-xs font-bold uppercase text-blue-600">
                        Paso 3 de 3 • Presupuesto y Contacto
                      </span>
                      <h3 className="text-xl font-extrabold text-slate-900">
                        Último paso para guardar en Supabase
                      </h3>
                      <input
                        type="text"
                        required
                        value={helpBudget}
                        onChange={(e) => setHelpBudget(e.target.value)}
                        placeholder="Presupuesto ofrecido (Ej. $350 MXN)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                      />
                      <input
                        type="text"
                        required
                        value={helpClientName}
                        onChange={(e) => setHelpClientName(e.target.value)}
                        placeholder="Tu nombre (Ej. Carlos R.)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                      />
                      <div className="flex justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => setHelpStep(2)}
                          className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm"
                        >
                          Atrás
                        </button>
                        <button
                          type="submit"
                          disabled={helpSubmitting}
                          className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-extrabold text-sm flex items-center gap-1.5 shadow-md"
                        >
                          {helpSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                          <span>
                            {helpSubmitting
                              ? "Guardando..."
                              : "Publicar Problema"}
                          </span>
                        </button>
                      </div>
                    </>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
