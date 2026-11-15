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
  const [helpBudget, setHelpBudget] = useState("$350 - $500 MXN");
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
        setDbConnected(false);
        setDbErrorHint(
          perfilesRes.error?.message ||
            solicitudesRes.error?.message ||
            "Ejecuta supabase_schema.sql en el SQL Editor de Supabase para activar las tablas."
        );
      } else {
        setDbConnected(true);
        setDbErrorHint(null);

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
                category:
                  (row.category as Exclude<CategoryId, "todos">) || "hogar",
                categoryLabel: String(row.category_label || "Hogar y Climas"),
                rating: Number(row.rating) || 5.0,
                reviewsCount: rowReviews.length,
                completedJobs: Number(row.completed_jobs) || 1,
                hourlyRate: String(row.hourly_rate || "$350 MXN"),
                responseTime: String(
                  row.response_time || "Responde en ~5 min"
                ),
                location: String(row.location || "Monterrey, N.L."),
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
                phone: String(row.phone || "+52 81 0000 0000"),
                reviews: rowReviews,
                fromSupabase: true,
              };
            }
          );
              setSolucionadores(mappedPerfiles);
        } else {
          setSolucionadores([]);
        }

        if (solicitudesRes.data && solicitudesRes.data.length > 0) {
          const mappedSolicitudes: ProblemaSolicitud[] =
            solicitudesRes.data.map((row: Record<string, unknown>) => ({
              id: String(row.id),
              title: String(row.title || "Solicitud de ayuda"),
              description: String(row.description || ""),
              category:
                (row.category as Exclude<CategoryId, "todos">) || "hogar",
              categoryLabel: String(row.category_label || "Hogar y Climas"),
              location: String(row.location || "Monterrey, N.L."),
              urgency:
                (row.urgency as
                  | "Urgente (Hoy)"
                  | "En 24-48 hrs"
                  | "Fecha flexible") || "Urgente (Hoy)",
              budget: String(row.budget || "$350 MXN"),
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
          setProblemas(mappedSolicitudes);
        } else {
          setProblemas([]);
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

  // Category Icon Helper with uniform strokeWidth={1.75} per IDENTIDAD_VISUAL.md
  const getCategoryIcon = (id: CategoryId, className = "w-5 h-5") => {
    switch (id) {
      case "hogar":
        return <Wrench strokeWidth={1.75} className={className} />;
      case "limpieza":
        return <Sparkles strokeWidth={1.75} className={className} />;
      case "mudanzas":
        return <Truck strokeWidth={1.75} className={className} />;
      case "mandados":
        return <ShoppingBag strokeWidth={1.75} className={className} />;
      case "tecnologia":
        return <Laptop strokeWidth={1.75} className={className} />;
      default:
        return <HeartHandshake strokeWidth={1.75} className={className} />;
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
      category_label: categoryObj?.name || "Hogar y Climas",
      location: helpLocation.trim() || "Monterrey, Nuevo León",
      urgency: helpUrgency,
      budget: helpBudget.trim() || "$400 MXN",
      client_name:
        helpClientName.trim() ||
        (currentUser?.user_metadata?.full_name as string) ||
        currentUser?.email?.split("@")[0] ||
        "Vecino Verificado",
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
          `Mostrado en el tablero local. (Aviso de Supabase: ${error.message}).`
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
          "¡Tu solicitud ya fue publicada en el Muro Vecinal!"
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
    setHelpBudget("$350 - $500 MXN");
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
      category_label: categoryObj?.name || "Hogar y Climas",
      rating: 5.0,
      reviews_count: 1,
      completed_jobs: 1,
      hourly_rate: regRate.trim() || "$350 MXN / servicio",
      response_time: "Responde en ~5 min",
      location: regLocation.trim() || "Área Metropolitana de Monterrey",
      avatar_url:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      verified: true,
      available_today: true,
      bio:
        regBio.trim() ||
        "Comprometido con brindar soluciones rápidas, seguras y de excelente calidad en Nuevo León.",
      skills: finalSkills,
      phone: regPhone.trim() || "+52 81 0000 0000",
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
          `Mostrado en el directorio local. (Aviso de Supabase: ${error.message}).`
        );
      } else if (data) {
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
          "¡Tu perfil ya está activo en el Directorio de Solucionadores!"
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
    <div className="min-h-screen flex flex-col bg-[#FAFAF9] text-[#18181B] pb-24 md:pb-0">
      {/* STICKY EDITORIAL NAVBAR */}
      <header className="sticky top-0 z-40 bg-[#FAFAF9]/90 backdrop-blur-md border-b border-[#E7E5E4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Identity */}
          <a
            href="#"
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#0F4C3A] flex items-center justify-center text-[#FAFAF9] shadow-sm group-hover:bg-[#D95D39] transition-colors duration-300">
              <HeartHandshake strokeWidth={1.75} className="w-6 h-6" />
            </div>
            <div>
              <span className="font-display text-xl font-extrabold tracking-tight text-[#18181B]">
                Mano<span className="text-[#0F4C3A]">Amiga</span>
              </span>
              <span className="block text-[11px] font-medium text-[#57534E] -mt-0.5">
                Oficios y ayuda cotidiana • N.L.
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#57534E]">
            <a
              href="#categorias"
              className="hover:text-[#18181B] transition-colors"
            >
              Categorías
            </a>
            <a
              href="#solucionadores"
              className="hover:text-[#18181B] transition-colors tabular-nums"
            >
              Solucionadores ({solucionadores.length})
            </a>
            <a
              href="#problemas"
              className="hover:text-[#18181B] transition-colors flex items-center gap-2"
            >
              <span>Problemas por Resolver</span>
              <span className="px-2 py-0.5 text-[11px] font-bold tabular-nums bg-[#FFF1EC] text-[#D95D39] border border-[#D95D39]/20 rounded-full">
                {problemas.length}
              </span>
            </a>
            <a
              href="#pedir-ayuda"
              className="hover:text-[#18181B] transition-colors"
            >
              Pedir Ayuda
            </a>
          </nav>

          {/* Desktop Action & Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2 bg-[#F5F4F0] px-3.5 py-2 rounded-2xl border border-[#E7E5E4]">
                <User strokeWidth={1.75} className="w-4 h-4 text-[#0F4C3A]" />
                <span className="text-xs font-semibold text-[#18181B] max-w-[130px] truncate">
                  {(currentUser.user_metadata?.full_name as string) ||
                    currentUser.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-xs text-[#D95D39] hover:text-[#BF4B28] font-semibold inline-flex items-center gap-1 ml-1"
                  title="Cerrar sesión"
                >
                  <LogOut strokeWidth={1.75} className="w-3.5 h-3.5" />
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
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-[#18181B] hover:bg-[#F5F4F0] border border-[#E7E5E4] bg-white transition-all active:scale-[0.98]"
              >
                <LogIn strokeWidth={1.75} className="w-4 h-4 text-[#0F4C3A]" />
                <span>Entrar</span>
              </button>
            )}

            <button
              onClick={() => {
                setRegSuccess(false);
                setRegSaveStatus(null);
                setIsRegisterSolucionadorOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-[#0F4C3A] bg-[#E6F2EE] hover:bg-[#0F4C3A] hover:text-white transition-all duration-200 active:scale-[0.98]"
            >
              <UserPlus strokeWidth={1.75} className="w-4 h-4" />
              <span>Ser Solucionador</span>
            </button>

            <button
              onClick={() => {
                resetHelpWizard();
                setIsPedirAyudaModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-[#D95D39] hover:bg-[#BF4B28] shadow-sm hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98]"
            >
              <PlusCircle strokeWidth={1.75} className="w-4 h-4" />
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
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-[#18181B] bg-[#F5F4F0] border border-[#E7E5E4]"
              >
                <LogIn strokeWidth={1.75} className="w-3.5 h-3.5 text-[#0F4C3A]" />
                Entrar
              </button>
            ) : (
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-[#D95D39] bg-[#FFF1EC]"
              >
                <LogOut strokeWidth={1.75} className="w-3.5 h-3.5" />
                Salir
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-[#18181B] hover:bg-[#F5F4F0] border border-[#E7E5E4]"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? (
                <X strokeWidth={1.75} className="w-5 h-5" />
              ) : (
                <Menu strokeWidth={1.75} className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#FAFAF9] border-b border-[#E7E5E4] px-4 pt-3 pb-5 space-y-2.5">
            {currentUser && (
              <div className="py-2.5 px-3.5 bg-[#E6F2EE] rounded-2xl text-xs font-semibold text-[#0F4C3A] flex items-center justify-between">
                <span>Sesión: {currentUser.email}</span>
                <button
                  onClick={handleSignOut}
                  className="text-[#D95D39] underline"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
            <a
              href="#categorias"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-[#18181B]"
            >
              Categorías de Servicio
            </a>
            <a
              href="#solucionadores"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-[#18181B]"
            >
              Directorio de Solucionadores ({solucionadores.length})
            </a>
            <a
              href="#problemas"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-[#18181B]"
            >
              Tablero de Problemas por Resolver ({problemas.length})
            </a>
            <div className="pt-2 border-t border-[#E7E5E4]">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setRegSuccess(false);
                  setRegSaveStatus(null);
                  setIsRegisterSolucionadorOpen(true);
                }}
                className="w-full py-3 rounded-2xl text-sm font-bold text-[#0F4C3A] bg-[#E6F2EE] flex items-center justify-center gap-2"
              >
                <UserPlus strokeWidth={1.75} className="w-4 h-4" />
                Registrarme como Solucionador
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ===================================================================== */}
      {/* ASYMMETRIC 12-COLUMN BENTO HERO SECTION (WARM EDITORIAL CANVAS)       */}
      {/* ===================================================================== */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 pb-12 md:pt-14 md:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* LEFT 7 COLUMNS: Editorial Headline + Tactile Search Bar */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E7E5E4] p-6 sm:p-10 shadow-bento flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E6F2EE] border border-[#0F4C3A]/15 text-[#0F4C3A] text-xs font-semibold mb-6">
                <MapPin strokeWidth={1.75} className="w-3.5 h-3.5" />
                <span>
                  Monterrey, San Pedro, Cumbres, San Nicolás y Área Metropolitana
                </span>
              </div>

              <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-[#18181B] tracking-tight leading-[1.08] mb-5">
                ¿Un imprevisto en casa o falta de tiempo? Resuélvelo hoy con{" "}
                <span className="font-editorial-serif italic font-normal text-[#0F4C3A] text-[1.12em]">
                  manos de confianza
                </span>
                .
              </h1>

              <p className="text-base sm:text-lg text-[#57534E] leading-relaxed mb-8 max-w-2xl">
                Desde una fuga de agua, mantenimiento de minisplit o limpieza
                profunda, hasta un flete o tus compras en H-E-B. Conecta en
                minutos con vecinos expertos verificados,{" "}
                <span className="text-[#18181B] font-medium underline decoration-[#D95D39]/50 underline-offset-4">
                  sin comisiones ocultas y a trato directo
                </span>
                .
              </p>

              {/* TACTILE SEARCH BOX */}
              <div className="bg-[#FAFAF9] p-2 rounded-2xl border border-[#E7E5E4] focus-within:border-[#0F4C3A] focus-within:ring-4 focus-within:ring-[#0F4C3A]/10 transition-all">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="flex-1 flex items-center gap-3 px-3.5 py-2.5">
                    <Search
                      strokeWidth={1.75}
                      className="w-5 h-5 text-[#0F4C3A] shrink-0"
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="¿Qué necesitas resolver hoy? (Ej. plomero, minisplit, flete, limpieza...)"
                      className="w-full text-sm sm:text-base bg-transparent text-[#18181B] placeholder-[#57534E]/70 focus:outline-none"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="text-[#57534E] hover:text-[#18181B]"
                        title="Limpiar búsqueda"
                      >
                        <X strokeWidth={1.75} className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <a
                    href="#solucionadores"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#D95D39] hover:bg-[#BF4B28] text-white font-bold text-sm sm:text-base transition-all shadow-sm hover:-translate-y-0.5 active:scale-[0.98] shrink-0"
                  >
                    <span>Buscar Especialista</span>
                    <ArrowRight strokeWidth={1.75} className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Popular Tags */}
            <div className="mt-6 pt-5 border-t border-[#E7E5E4] flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#57534E] font-medium mr-1">
                Frecuentes hoy en N.L.:
              </span>
              {[
                { label: "❄️ Minisplits", query: "minisplit" },
                { label: "🔧 Fuga de agua", query: "fuga" },
                { label: "✨ Limpieza profunda", query: "limpieza" },
                { label: "🚚 Fletes con camioneta", query: "camioneta" },
                { label: "🛒 Mandados / H-E-B", query: "H-E-B" },
                { label: "💻 Wi-Fi Mesh", query: "Wi-Fi" },
              ].map((tag) => (
                <button
                  key={tag.label}
                  onClick={() => {
                    setSearchQuery(tag.query);
                    setSelectedCategory("todos");
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#F5F4F0] hover:bg-[#E6F2EE] text-[#18181B] hover:text-[#0F4C3A] border border-[#E7E5E4] font-medium transition-all active:scale-95"
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT 5 COLUMNS: Asymmetric Bento Trust Mosaic */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {/* Top Wide Bento Card (Deep Forest #0F4C3A) */}
            <div className="sm:col-span-2 bg-[#0F4C3A] text-[#FAFAF9] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-bento relative overflow-hidden">
              <div className="flex items-center justify-between gap-2 mb-6">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#E6F2EE] text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#D95D39] animate-ping" />
                  Tiempo real en tu colonia
                </span>
                <Zap strokeWidth={1.75} className="w-5 h-5 text-[#D95D39]" />
              </div>

              <div>
                <div className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight tabular-nums mb-2">
                  ~8 min
                </div>
                <p className="text-sm sm:text-base text-[#E6F2EE]/90 leading-relaxed">
                  Es lo que tarda en promedio un{" "}
                  <span className="font-editorial-serif italic text-lg text-white">
                    Solucionador verificado
                  </span>{" "}
                  en responder a una urgencia publicada en Monterrey.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-[#E6F2EE]/80">
                <span>¿Prefieres que te contacten?</span>
                <button
                  onClick={() => {
                    resetHelpWizard();
                    setIsPedirAyudaModalOpen(true);
                  }}
                  className="font-bold text-white underline decoration-[#D95D39] underline-offset-4 hover:text-[#D95D39] transition-colors inline-flex items-center gap-1"
                >
                  Publicar problema en 3 pasos
                  <ArrowRight strokeWidth={1.75} className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bottom Left Bento Card (Warm Stone #F5F4F0) */}
            <div className="bg-[#F5F4F0] rounded-3xl border border-[#E7E5E4] p-6 flex flex-col justify-between shadow-bento">
              <div className="w-11 h-11 rounded-2xl bg-white border border-[#E7E5E4] text-[#0F4C3A] flex items-center justify-center mb-4">
                <ShieldCheck strokeWidth={1.75} className="w-5 h-5" />
              </div>
              <div>
                <div className="font-display text-2xl font-extrabold text-[#18181B] tabular-nums">
                  4.9 ★
                </div>
                <p className="text-sm font-bold text-[#18181B] mt-0.5">
                  Reputación Comprobada
                </p>
                <p className="text-xs text-[#57534E] mt-1 leading-relaxed">
                  Reseñas escritas por vecinos reales de tu misma zona.
                </p>
              </div>
            </div>

            {/* Bottom Right Bento Card (Pure Card #FFFFFF) */}
            <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6 flex flex-col justify-between shadow-bento">
              <div className="w-11 h-11 rounded-2xl bg-[#FFF1EC] text-[#D95D39] flex items-center justify-center mb-4">
                <Award strokeWidth={1.75} className="w-5 h-5" />
              </div>
              <div>
                <div className="font-display text-2xl font-extrabold text-[#18181B] tabular-nums">
                  0% Extra
                </div>
                <p className="text-sm font-bold text-[#18181B] mt-0.5">
                  Trato Directo y Justo
                </p>
                <p className="text-xs text-[#57534E] mt-1 leading-relaxed">
                  Acuerdas la tarifa directamente antes de iniciar el trabajo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* BENTO MOSAIC OF CATEGORIES                                            */}
      {/* ===================================================================== */}
      <section
        id="categorias"
        className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6"
      >
        <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6 sm:p-8 shadow-bento">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0F4C3A]">
                Especialidades Locales
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#18181B] tracking-tight mt-0.5">
                ¿En qué área necesitas{" "}
                <span className="font-editorial-serif italic font-normal text-[#0F4C3A] text-[1.1em]">
                  apoyo hoy
                </span>
                ?
              </h2>
            </div>
            {selectedCategory !== "todos" && (
              <button
                onClick={() => setSelectedCategory("todos")}
                className="self-start sm:self-auto text-xs font-bold text-[#D95D39] hover:text-[#BF4B28] flex items-center gap-1.5 bg-[#FFF1EC] px-3.5 py-2 rounded-xl"
              >
                <X strokeWidth={1.75} className="w-3.5 h-3.5" /> Mostrar todas
                las categorías
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <button
              onClick={() => setSelectedCategory("todos")}
              className={`flex flex-col justify-between p-5 rounded-2xl border text-left transition-all duration-200 active:scale-[0.98] ${
                selectedCategory === "todos"
                  ? "bg-[#0F4C3A] text-white border-[#0F4C3A] shadow-md -translate-y-0.5"
                  : "bg-[#F5F4F0] hover:bg-white text-[#18181B] border-[#E7E5E4] hover:border-[#0F4C3A]/40"
              }`}
            >
              <div className="w-full flex items-center justify-between mb-4">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    selectedCategory === "todos"
                      ? "bg-white/15 text-white"
                      : "bg-white text-[#0F4C3A] border border-[#E7E5E4]"
                  }`}
                >
                  <HeartHandshake strokeWidth={1.75} className="w-5 h-5" />
                </div>
                <span
                  className={`text-xs font-bold tabular-nums px-2.5 py-0.5 rounded-full ${
                    selectedCategory === "todos"
                      ? "bg-white/15 text-white"
                      : "bg-white text-[#57534E] border border-[#E7E5E4]"
                  }`}
                >
                  {solucionadores.length}
                </span>
              </div>
              <div>
                <span className="font-display font-bold text-sm block">
                  Todas
                </span>
                <span
                  className={`text-xs mt-0.5 line-clamp-1 ${
                    selectedCategory === "todos"
                      ? "text-[#E6F2EE]"
                      : "text-[#57534E]"
                  }`}
                >
                  Catálogo completo
                </span>
              </div>
            </button>

            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const realCount = solucionadores.filter(
                (s) => s.category === cat.id
              ).length;
              return (
                <button
                  key={cat.id}
                  onClick={() =>
                    setSelectedCategory(isSelected ? "todos" : cat.id)
                  }
                  className={`flex flex-col justify-between p-5 rounded-2xl border text-left transition-all duration-200 active:scale-[0.98] ${
                    isSelected
                      ? "bg-[#0F4C3A] text-white border-[#0F4C3A] shadow-md -translate-y-0.5"
                      : "bg-[#FAFAF9] hover:bg-white text-[#18181B] border-[#E7E5E4] hover:border-[#0F4C3A]/40"
                  }`}
                >
                  <div className="w-full flex items-center justify-between mb-4">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                        isSelected
                          ? "bg-white/15 text-white"
                          : "bg-[#E6F2EE] text-[#0F4C3A]"
                      }`}
                    >
                      {getCategoryIcon(cat.id, "w-5 h-5")}
                    </div>
                    <span
                      className={`text-xs font-bold tabular-nums px-2.5 py-0.5 rounded-full ${
                        isSelected
                          ? "bg-white/15 text-white"
                          : "bg-[#F5F4F0] text-[#57534E] border border-[#E7E5E4]"
                      }`}
                    >
                      {realCount}
                    </span>
                  </div>
                  <div>
                    <span className="font-display font-bold text-sm block">
                      {cat.name}
                    </span>
                    <span
                      className={`text-xs mt-0.5 line-clamp-1 ${
                        isSelected ? "text-[#E6F2EE]" : "text-[#57534E]"
                      }`}
                    >
                      {cat.subtitle}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* DIRECTORY OF SOLUCIONADORES (EDITORIAL CREDENTIAL CARDS)              */}
      {/* ===================================================================== */}
      <section
        id="solucionadores"
        className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-12 pb-10"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0F4C3A] mb-1.5">
              <ShieldCheck strokeWidth={1.75} className="w-4 h-4" />
              <span>Directorio de Especialistas Verificados</span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-[#18181B] tracking-tight">
              Solucionadores listos{" "}
              <span className="font-editorial-serif italic font-normal text-[#0F4C3A] text-[1.08em]">
                en tu colonia
              </span>
            </h2>
            <p className="text-sm sm:text-base text-[#57534E] mt-1">
              Revisa su experiencia, lee reseñas de otros vecinos y contáctalos
              sin intermediarios.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2.5 text-sm font-medium text-[#18181B] bg-white px-4 py-2.5 rounded-2xl border border-[#E7E5E4] cursor-pointer select-none shadow-sm hover:border-[#0F4C3A]/40 transition-colors">
              <input
                type="checkbox"
                checked={onlyAvailableToday}
                onChange={(e) => setOnlyAvailableToday(e.target.checked)}
                className="rounded text-[#0F4C3A] focus:ring-[#0F4C3A] w-4 h-4"
              />
              <span className="w-2 h-2 rounded-full bg-[#15803D]" />
              <span>Disponibles hoy</span>
            </label>

            <button
              onClick={() => {
                setRegSuccess(false);
                setRegSaveStatus(null);
                setIsRegisterSolucionadorOpen(true);
              }}
              className="inline-flex items-center gap-2 text-sm font-bold text-[#0F4C3A] bg-[#E6F2EE] hover:bg-[#0F4C3A] hover:text-white px-4 py-2.5 rounded-2xl border border-[#0F4C3A]/15 transition-all"
            >
              <UserPlus strokeWidth={1.75} className="w-4 h-4" />
              <span>¿Ofreces un oficio? Anúnciate gratis</span>
            </button>
          </div>
        </div>

        {/* Warm Skeletons when first loading if needed */}
        {isLoadingDb && solucionadores.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-3xl border border-[#E7E5E4] p-7 space-y-4"
              >
                <div className="h-6 w-32 bg-[#E7E5E4]/60 rounded-full animate-pulse" />
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#E7E5E4]/60 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-3/4 bg-[#E7E5E4]/60 rounded-lg animate-pulse" />
                    <div className="h-4 w-1/2 bg-[#E7E5E4]/60 rounded-lg animate-pulse" />
                  </div>
                </div>
                <div className="h-16 w-full bg-[#E7E5E4]/60 rounded-2xl animate-pulse" />
              </div>
            ))}
          </div>
        ) : filteredSolucionadores.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E7E5E4] p-12 text-center shadow-bento max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-[#E6F2EE] text-[#0F4C3A] flex items-center justify-center mx-auto mb-4">
              <UserPlus strokeWidth={1.75} className="w-7 h-7" />
            </div>
            <h3 className="font-display text-xl font-extrabold text-[#18181B]">
              {solucionadores.length === 0
                ? "Sé de los primeros Solucionadores en Nuevo León"
                : "No encontramos solucionadores con ese filtro"}
            </h3>
            <p className="text-sm text-[#57534E] mt-2 mb-6 max-w-md mx-auto leading-relaxed">
              {solucionadores.length === 0
                ? "Estamos abriendo el directorio oficial sin perfiles de relleno. Si tienes un oficio o habilidad práctica, regístrate gratis hoy y aparece en primera fila."
                : "Prueba mostrando todas las categorías o publica tu necesidad para que te contacten directamente."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  setRegSuccess(false);
                  setRegSaveStatus(null);
                  setIsRegisterSolucionadorOpen(true);
                }}
                className="px-6 py-3 rounded-2xl bg-[#0F4C3A] text-white text-sm font-bold hover:bg-[#0B3B2D] inline-flex items-center gap-2"
              >
                <UserPlus strokeWidth={1.75} className="w-4 h-4" />
                Registrarme como Solucionador
              </button>
              {solucionadores.length > 0 && (
                <button
                  onClick={() => {
                    setSelectedCategory("todos");
                    setSearchQuery("");
                    setOnlyAvailableToday(false);
                  }}
                  className="px-5 py-3 rounded-2xl bg-[#F5F4F0] text-[#18181B] text-sm font-semibold hover:bg-[#E7E5E4]"
                >
                  Ver todas las categorías
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredSolucionadores.map((sol) => {
              const isFavorite =
                sol.rating >= 4.9 && sol.completedJobs >= 90;
              return (
                <div
                  key={sol.id}
                  className="bg-white rounded-3xl border border-[#E7E5E4] shadow-bento hover:shadow-bento-hover hover:-translate-y-1 hover:border-[#0F4C3A]/40 transition-all duration-300 flex flex-col justify-between overflow-hidden group relative"
                >
                  {/* Top Editorial Ribbon for Favorite / Top Rated */}
                  {isFavorite && (
                    <div className="bg-[#F5F4F0] border-b border-[#E7E5E4] px-6 py-2 flex items-center justify-between text-[11px] font-bold text-[#0F4C3A]">
                      <span>★ Favorito en tu zona</span>
                      <span className="text-[#57534E] font-medium tabular-nums">
                        +98% clientes satisfechos
                      </span>
                    </div>
                  )}

                  <div className="p-6 sm:p-7">
                    {/* Top Status Row */}
                    <div className="flex items-center justify-between gap-2 mb-5">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F5F4F0] text-[#18181B] border border-[#E7E5E4]">
                          {getCategoryIcon(
                            sol.category,
                            "w-3.5 h-3.5 text-[#0F4C3A]"
                          )}
                          {sol.categoryLabel}
                        </span>
                        {sol.fromSupabase && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F2EE] text-[#0F4C3A]">
                            <Database strokeWidth={1.75} className="w-3 h-3" />{" "}
                            Verificado
                          </span>
                        )}
                      </div>

                      {sol.availableToday ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E6F2EE] text-[#0F4C3A]">
                          <span className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse" />
                          Disponible hoy
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#F5F4F0] text-[#57534E]">
                          Agenda previa
                        </span>
                      )}
                    </div>

                    {/* Identity Block */}
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        <img
                          src={sol.avatarUrl}
                          alt={sol.name}
                          className="w-16 h-16 rounded-2xl object-cover border border-[#E7E5E4] shadow-sm"
                        />
                        {sol.verified && (
                          <div
                            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0F4C3A] text-white flex items-center justify-center ring-2 ring-white"
                            title="Identidad Verificada"
                          >
                            <ShieldCheck
                              strokeWidth={1.75}
                              className="w-3.5 h-3.5"
                            />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-lg font-extrabold text-[#18181B] truncate group-hover:text-[#0F4C3A] transition-colors">
                          {sol.name}
                        </h3>
                        <p className="text-xs sm:text-sm font-medium text-[#57534E] line-clamp-1">
                          {sol.role}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 mt-2.5 text-xs tabular-nums">
                          <span className="inline-flex items-center gap-1 font-bold text-[#18181B] bg-[#FEF3C7] border border-amber-300/60 px-2.5 py-0.5 rounded-lg">
                            <Star
                              strokeWidth={1.75}
                              className="w-3.5 h-3.5 fill-[#D97706] text-[#D97706]"
                            />
                            {sol.rating.toFixed(1)}
                            <span className="font-normal text-[#57534E]">
                              ({sol.reviewsCount})
                            </span>
                          </span>
                          <span className="text-[#57534E] font-medium">
                            • {sol.completedJobs} servicios
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="mt-4 text-xs sm:text-sm text-[#57534E] line-clamp-2 leading-relaxed">
                      {sol.bio}
                    </p>

                    {/* Skills Chips */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {sol.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 rounded-lg bg-[#F5F4F0] text-[#44403C] border border-[#E7E5E4] text-[11px] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Location & Response Time */}
                    <div className="mt-5 pt-4 border-t border-[#E7E5E4] space-y-1.5 text-xs text-[#57534E] tabular-nums">
                      <div className="flex items-center gap-2">
                        <MapPin
                          strokeWidth={1.75}
                          className="w-4 h-4 text-[#0F4C3A] shrink-0"
                        />
                        <span className="truncate">{sol.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock
                          strokeWidth={1.75}
                          className="w-4 h-4 text-[#0F4C3A] shrink-0"
                        />
                        <span className="font-semibold text-[#0F4C3A]">
                          {sol.responseTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Separated Card Footer (#FAFAF9) */}
                  <div className="px-6 py-4 bg-[#FAFAF9] border-t border-[#E7E5E4] flex items-center justify-between gap-3">
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider font-bold text-[#57534E]">
                        Tarifa base
                      </span>
                      <span className="font-display text-sm font-extrabold text-[#18181B] tabular-nums">
                        {sol.hourlyRate}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedSolucionador(sol)}
                        className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#18181B] hover:bg-[#F5F4F0] bg-white border border-[#E7E5E4] transition-all active:scale-95"
                      >
                        Perfil
                      </button>
                      <button
                        onClick={() => {
                          setContactMessage("");
                          setContactSent(false);
                          setContactModalSolucionador(sol);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#D95D39] hover:bg-[#BF4B28] shadow-sm hover:-translate-y-0.5 transition-all active:scale-95"
                      >
                        <MessageCircle
                          strokeWidth={1.75}
                          className="w-3.5 h-3.5"
                        />
                        Contactar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ===================================================================== */}
      {/* ACTIVE PROBLEMS BOARD (DEEP FOREST #0F4C3A BENTO CONTAINER)           */}
      {/* ===================================================================== */}
      <section
        id="problemas"
        className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10"
      >
        <div className="bg-[#0F4C3A] rounded-[32px] p-6 sm:p-10 lg:p-12 text-[#FAFAF9] shadow-bento">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-[#E6F2EE] text-xs font-semibold mb-3">
                <span className="w-2 h-2 rounded-full bg-[#D95D39] animate-ping" />
                <span>Muro Vecinal en Tiempo Real • Nuevo León</span>
              </div>
              <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight">
                Problemas que buscan{" "}
                <span className="font-editorial-serif italic font-normal text-[#E6F2EE] text-[1.1em]">
                  solución hoy
                </span>
              </h2>
              <p className="text-sm sm:text-base text-[#E6F2EE]/85 mt-1.5 max-w-2xl">
                Vecinos de Monterrey y su Área Metropolitana que necesitan una
                mano ahora mismo. Postúlate con un clic o publica tu propia
                solicitud.
              </p>
            </div>

            <button
              onClick={() => {
                resetHelpWizard();
                setIsPedirAyudaModalOpen(true);
              }}
              className="self-start md:self-auto inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#D95D39] hover:bg-[#BF4B28] text-white font-bold text-sm shadow-sm hover:-translate-y-0.5 transition-all active:scale-95 shrink-0"
            >
              <PlusCircle strokeWidth={1.75} className="w-4 h-4" />
              Publicar mi Problema
            </button>
          </div>

          {filteredProblemas.length === 0 ? (
            <div className="bg-[#FAFAF9] text-[#18181B] rounded-3xl p-10 text-center max-w-xl mx-auto">
              <h3 className="font-display text-xl font-extrabold mb-2">
                Aún no hay problemas publicados en esta vista
              </h3>
              <p className="text-sm text-[#57534E] mb-6">
                ¿Necesitas arreglar algo en casa, ayuda con limpieza, un flete o
                un mandado hoy? Publica tu solicitud gratis en menos de 1 minuto.
              </p>
              <button
                onClick={() => {
                  resetHelpWizard();
                  setIsPedirAyudaModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#D95D39] hover:bg-[#BF4B28] text-white font-bold text-sm"
              >
                <PlusCircle strokeWidth={1.75} className="w-4 h-4" />
                Publicar el primer problema
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredProblemas.map((prob) => {
              const isUrgent = prob.urgency === "Urgente (Hoy)";
              return (
                <div
                  key={prob.id}
                  className="bg-[#FAFAF9] text-[#18181B] border border-[#E7E5E4] rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 shadow-sm"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F5F4F0] text-[#18181B] border border-[#E7E5E4]">
                          {getCategoryIcon(
                            prob.category,
                            "w-3.5 h-3.5 text-[#0F4C3A]"
                          )}
                          {prob.categoryLabel}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            isUrgent
                              ? "bg-[#FFF1EC] text-[#C2410C] border border-[#D95D39]/25"
                              : "bg-[#FEF3C7] text-[#B45309] border border-amber-300/60"
                          }`}
                        >
                          <AlertCircle
                            strokeWidth={1.75}
                            className="w-3.5 h-3.5"
                          />
                          {prob.urgency}
                        </span>
                        {prob.fromSupabase && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F2EE] text-[#0F4C3A]">
                            <Database
                              strokeWidth={1.75}
                              className="w-3 h-3"
                            />{" "}
                            En vivo
                          </span>
                        )}
                      </div>

                      {/* Interactive Status Selector */}
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
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border cursor-pointer focus:outline-none ${
                          prob.status === "Resuelta"
                            ? "bg-[#E6F2EE] text-[#0F4C3A] border-[#0F4C3A]/20"
                            : prob.status === "En proceso"
                            ? "bg-[#FEF3C7] text-[#B45309] border-amber-300"
                            : "bg-white text-[#18181B] border-[#E7E5E4]"
                        }`}
                      >
                        <option value="Abierto">🟢 Abierta</option>
                        <option value="En proceso">🟡 En proceso</option>
                        <option value="Resuelta">✅ Resuelta</option>
                      </select>
                    </div>

                    <h3 className="font-display text-lg sm:text-xl font-extrabold text-[#18181B] mb-2">
                      {prob.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed mb-5">
                      {prob.description}
                    </p>
                  </div>

                  {/* Receipt-Style Footer with Tabular Budget */}
                  <div className="pt-4 border-t border-[#E7E5E4] flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#57534E]">
                        <span className="inline-flex items-center gap-1 font-medium text-[#18181B]">
                          <MapPin
                            strokeWidth={1.75}
                            className="w-3.5 h-3.5 text-[#D95D39]"
                          />
                          {prob.location}
                        </span>
                        <span>•</span>
                        <span>Por {prob.clientName}</span>
                        <span>•</span>
                        <span className="tabular-nums">{prob.postedAgo}</span>
                      </div>
                      <div className="inline-flex items-center gap-2 bg-[#F5F4F0] px-3 py-1 rounded-xl border border-[#E7E5E4] mt-1">
                        <span className="text-xs text-[#57534E]">
                          Presupuesto ofrecido:
                        </span>
                        <span className="font-display text-sm font-extrabold text-[#0F4C3A] tabular-nums">
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
                      className={`inline-flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all active:scale-95 tabular-nums ${
                        prob.status === "Resuelta"
                          ? "bg-[#E7E5E4] text-[#57534E] cursor-not-allowed"
                          : "bg-[#0F4C3A] hover:bg-[#0B3B2D] text-white shadow-sm"
                      }`}
                    >
                      <ThumbsUp strokeWidth={1.75} className="w-4 h-4" />
                      <span>
                        {prob.status === "Resuelta"
                          ? "Resuelta"
                          : `Yo te ayudo (${prob.applicantsCount})`}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* VISUAL 3-STEP FORM SECTION ("PEDIR AYUDA EN 3 PASOS")                 */}
      {/* ===================================================================== */}
      <section
        id="pedir-ayuda"
        className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12"
      >
        <div className="bg-white rounded-[32px] border border-[#E7E5E4] shadow-bento overflow-hidden">
          <div className="bg-[#F5F4F0] border-b border-[#E7E5E4] px-6 py-7 sm:px-10 sm:py-9 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-block px-3.5 py-1 rounded-full bg-[#E6F2EE] text-[#0F4C3A] text-xs font-bold uppercase tracking-wider mb-2">
                Sin Fricción • Trato Directo
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#18181B] tracking-tight">
                Publica lo que necesitas en{" "}
                <span className="font-editorial-serif italic font-normal text-[#0F4C3A] text-[1.12em]">
                  3 sencillos pasos
                </span>
              </h2>
              <p className="text-[#57534E] text-sm mt-1">
                Tu solicitud se guarda al instante en el muro vecinal para que
                los solucionadores disponibles te contacten.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 tabular-nums">
              {[1, 2, 3].map((stepNum) => (
                <button
                  key={stepNum}
                  type="button"
                  onClick={() => {
                    setHelpSubmittedSuccess(false);
                    setHelpStep(stepNum as 1 | 2 | 3);
                  }}
                  className={`w-11 h-11 rounded-2xl font-display font-extrabold text-sm flex items-center justify-center transition-all ${
                    helpStep === stepNum
                      ? "bg-[#D95D39] text-white shadow-sm scale-105"
                      : helpStep > stepNum
                      ? "bg-[#0F4C3A] text-white"
                      : "bg-white text-[#57534E] border border-[#E7E5E4]"
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
                <div className="w-16 h-16 rounded-2xl bg-[#E6F2EE] text-[#0F4C3A] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 strokeWidth={1.75} className="w-10 h-10" />
                </div>
                <h3 className="font-display text-2xl font-extrabold text-[#18181B] mb-2">
                  ¡Tu solicitud ya está en el Muro Vecinal!
                </h3>
                {helpSaveStatus && (
                  <p className="text-xs font-semibold text-[#0F4C3A] bg-[#E6F2EE] border border-[#0F4C3A]/20 rounded-2xl px-4 py-3 mb-4">
                    {helpSaveStatus}
                  </p>
                )}
                <p className="text-sm text-[#57534E] mb-6">
                  Puedes ver tu publicación ahora mismo en el{" "}
                  <a
                    href="#problemas"
                    className="text-[#0F4C3A] font-bold underline"
                  >
                    Tablero de Problemas por Resolver
                  </a>
                  .
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <a
                    href="#problemas"
                    className="px-6 py-3 rounded-2xl bg-[#0F4C3A] text-white text-sm font-bold hover:bg-[#0B3B2D]"
                  >
                    Ver mi solicitud en el tablero
                  </a>
                  <button
                    type="button"
                    onClick={resetHelpWizard}
                    className="px-6 py-3 rounded-2xl bg-[#F5F4F0] text-[#18181B] text-sm font-semibold hover:bg-[#E7E5E4]"
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
                      <span className="text-xs font-bold uppercase tracking-wider text-[#D95D39]">
                        Paso 1 de 3
                      </span>
                      <h3 className="font-display text-xl font-bold text-[#18181B] mt-0.5">
                        ¿Con qué problema necesitas ayuda hoy?
                      </h3>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#18181B] mb-2.5">
                        1. Elige la categoría que mejor describa tu necesidad:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {CATEGORIES.map((cat) => {
                          const active = helpCategory === cat.id;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setHelpCategory(cat.id)}
                              className={`p-4 rounded-2xl border text-left transition-all flex flex-col items-start gap-2 ${
                                active
                                  ? "border-[#0F4C3A] bg-[#E6F2EE] text-[#0F4C3A] ring-2 ring-[#0F4C3A]/15"
                                  : "border-[#E7E5E4] bg-[#FAFAF9] hover:bg-white text-[#18181B]"
                              }`}
                            >
                              <div className="text-[#0F4C3A]">
                                {getCategoryIcon(cat.id, "w-5 h-5")}
                              </div>
                              <span className="font-display font-bold text-xs sm:text-sm">
                                {cat.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#18181B] mb-1.5">
                        2. Título breve de lo que necesitas:
                      </label>
                      <input
                        type="text"
                        value={helpTitle}
                        onChange={(e) => setHelpTitle(e.target.value)}
                        placeholder="Ej. Cambiar llave de agua del fregadero o dar mantenimiento a minisplit"
                        className="w-full px-4 py-3.5 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] focus:bg-white text-sm focus:outline-none focus:border-[#0F4C3A]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#18181B] mb-1.5">
                        3. Cuéntanos un poco más de detalle:
                      </label>
                      <textarea
                        rows={3}
                        value={helpDescription}
                        onChange={(e) => setHelpDescription(e.target.value)}
                        placeholder="Ej. Ya compré el repuesto pero necesito alguien con herramienta hoy por la tarde..."
                        className="w-full px-4 py-3.5 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] focus:bg-white text-sm focus:outline-none focus:border-[#0F4C3A]"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setHelpStep(2)}
                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#0F4C3A] hover:bg-[#0B3B2D] text-white font-bold text-sm transition-all active:scale-95"
                      >
                        <span>Siguiente: Dónde y Cuándo</span>
                        <ArrowRight strokeWidth={1.75} className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {helpStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#D95D39]">
                        Paso 2 de 3
                      </span>
                      <h3 className="font-display text-xl font-bold text-[#18181B] mt-0.5">
                        ¿En qué colonia estás y qué tan urgente es?
                      </h3>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#18181B] mb-1.5">
                        Colonia y Municipio en Nuevo León:
                      </label>
                      <div className="relative">
                        <MapPin
                          strokeWidth={1.75}
                          className="w-5 h-5 text-[#57534E] absolute left-4 top-3.5"
                        />
                        <input
                          type="text"
                          value={helpLocation}
                          onChange={(e) => setHelpLocation(e.target.value)}
                          placeholder="Ej. Col. Cumbres 2do Sector, Monterrey"
                          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] focus:bg-white text-sm focus:outline-none focus:border-[#0F4C3A]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#18181B] mb-2.5">
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
                            className={`p-4 rounded-2xl border text-left transition-all ${
                              helpUrgency === u.id
                                ? "border-[#0F4C3A] bg-[#E6F2EE] text-[#0F4C3A]"
                                : "border-[#E7E5E4] bg-[#FAFAF9] hover:bg-white"
                            }`}
                          >
                            <span className="block font-display font-bold text-sm text-[#18181B]">
                              {u.id}
                            </span>
                            <span className="block text-xs text-[#57534E] mt-1">
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
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#F5F4F0] hover:bg-[#E7E5E4] text-[#18181B] font-semibold text-sm"
                      >
                        <ArrowLeft strokeWidth={1.75} className="w-4 h-4" />
                        <span>Anterior</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setHelpStep(3)}
                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#0F4C3A] hover:bg-[#0B3B2D] text-white font-bold text-sm"
                      >
                        <span>Siguiente: Presupuesto</span>
                        <ArrowRight strokeWidth={1.75} className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {helpStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#D95D39]">
                        Paso 3 de 3
                      </span>
                      <h3 className="font-display text-xl font-bold text-[#18181B] mt-0.5">
                        Presupuesto estimado y confirmación
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[#18181B] mb-1.5">
                          ¿Cuánto estimas pagar por la ayuda?
                        </label>
                        <input
                          type="text"
                          value={helpBudget}
                          onChange={(e) => setHelpBudget(e.target.value)}
                          placeholder="Ej. $350 - $500 MXN"
                          className="w-full px-4 py-3.5 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] focus:bg-white text-sm tabular-nums focus:outline-none focus:border-[#0F4C3A]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#18181B] mb-1.5">
                          Tu nombre:
                        </label>
                        <input
                          type="text"
                          value={helpClientName}
                          onChange={(e) => setHelpClientName(e.target.value)}
                          placeholder="Ej. Ana Garza"
                          className="w-full px-4 py-3.5 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] focus:bg-white text-sm focus:outline-none focus:border-[#0F4C3A]"
                        />
                      </div>
                    </div>

                    <div className="bg-[#F5F4F0] rounded-2xl p-5 border border-[#E7E5E4] text-xs sm:text-sm space-y-1.5">
                      <p className="font-display font-bold text-[#18181B]">
                        Resumen de tu publicación:
                      </p>
                      <p className="text-[#57534E]">
                        <span className="font-semibold text-[#18181B]">
                          Problema:
                        </span>{" "}
                        {helpTitle || "Servicio general a domicilio"} (
                        {CATEGORIES.find((c) => c.id === helpCategory)?.name})
                      </p>
                      <p className="text-[#57534E]">
                        <span className="font-semibold text-[#18181B]">
                          Ubicación y Urgencia:
                        </span>{" "}
                        {helpLocation || "Monterrey, N.L."} • {helpUrgency}
                      </p>
                      <p className="text-[#57534E] tabular-nums">
                        <span className="font-semibold text-[#18181B]">
                          Presupuesto:
                        </span>{" "}
                        <span className="text-[#0F4C3A] font-bold">
                          {helpBudget}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => setHelpStep(2)}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#F5F4F0] hover:bg-[#E7E5E4] text-[#18181B] font-semibold text-sm"
                      >
                        <ArrowLeft strokeWidth={1.75} className="w-4 h-4" />
                        <span>Anterior</span>
                      </button>

                      <button
                        type="submit"
                        disabled={helpSubmitting}
                        className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-[#D95D39] hover:bg-[#BF4B28] disabled:opacity-60 text-white font-extrabold text-sm shadow-sm transition-all active:scale-95"
                      >
                        <CheckCircle2 strokeWidth={1.75} className="w-5 h-5" />
                        <span>
                          {helpSubmitting
                            ? "Guardando en vivo..."
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

      {/* ===================================================================== */}
      {/* EDITORIAL CALL TO ACTION BANNER FOR SOLUCIONADORES                    */}
      {/* ===================================================================== */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-[#F5F4F0] border border-[#E7E5E4] rounded-[32px] p-7 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-bento">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E6F2EE] text-[#0F4C3A] text-xs font-bold uppercase tracking-wider">
              <Briefcase strokeWidth={1.75} className="w-3.5 h-3.5" /> Trabajo
              Independiente en Nuevo León
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-[#18181B] tracking-tight">
              ¿Eres plomero, técnico, haces limpieza, fletes o{" "}
              <span className="font-editorial-serif italic font-normal text-[#0F4C3A] text-[1.1em]">
                mandados
              </span>
              ?
            </h2>
            <p className="text-[#57534E] text-sm sm:text-base leading-relaxed">
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
            className="px-7 py-4 rounded-2xl bg-[#0F4C3A] hover:bg-[#0B3B2D] text-white font-extrabold text-sm sm:text-base shadow-sm hover:-translate-y-0.5 transition-all shrink-0 flex items-center gap-2.5 active:scale-95"
          >
            <UserPlus strokeWidth={1.75} className="w-5 h-5" />
            <span>Registrarme Gratis como Solucionador</span>
            <ChevronRight strokeWidth={1.75} className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white text-[#57534E] py-10 px-4 border-t border-[#E7E5E4] mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#0F4C3A] flex items-center justify-center text-white">
              <HeartHandshake strokeWidth={1.75} className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-[#18181B] text-base">
              Mano<span className="text-[#0F4C3A]">Amiga</span>
            </span>
            <span>— Hecho para conectar vecinos en Nuevo León, México.</span>
          </div>
          <div className="flex gap-6 font-medium">
            <a href="#categorias" className="hover:text-[#18181B]">
              Categorías
            </a>
            <a href="#solucionadores" className="hover:text-[#18181B]">
              Solucionadores
            </a>
            <a href="#problemas" className="hover:text-[#18181B]">
              Problemas Activos
            </a>
            <a href="#pedir-ayuda" className="hover:text-[#18181B]">
              Pedir Ayuda
            </a>
          </div>
        </div>
      </footer>

      {/* MOBILE STICKY BOTTOM BAR */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[#FAFAF9]/95 backdrop-blur-md border-t border-[#E7E5E4] px-3 py-2.5 flex items-center justify-around md:hidden shadow-lg">
        <a
          href="#solucionadores"
          className="flex flex-col items-center gap-0.5 text-[11px] font-semibold text-[#57534E] hover:text-[#0F4C3A]"
        >
          <Search strokeWidth={1.75} className="w-5 h-5" />
          <span>Explorar</span>
        </a>
        <a
          href="#problemas"
          className="flex flex-col items-center gap-0.5 text-[11px] font-semibold text-[#57534E] hover:text-[#0F4C3A] tabular-nums"
        >
          <Briefcase strokeWidth={1.75} className="w-5 h-5" />
          <span>Muro ({problemas.length})</span>
        </a>
        <button
          onClick={() => {
            resetHelpWizard();
            setIsPedirAyudaModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#D95D39] text-white text-xs font-bold shadow-sm"
        >
          <PlusCircle strokeWidth={1.75} className="w-4 h-4" />
          <span>Pedir Ayuda</span>
        </button>
        <button
          onClick={() => {
            setRegSuccess(false);
            setRegSaveStatus(null);
            setIsRegisterSolucionadorOpen(true);
          }}
          className="flex flex-col items-center gap-0.5 text-[11px] font-semibold text-[#57534E] hover:text-[#0F4C3A]"
        >
          <UserPlus strokeWidth={1.75} className="w-5 h-5" />
          <span>Soy Experto</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* MODAL 0: AUTENTICACIÓN SUPABASE (LOGIN / REGISTRO)        */}
      {/* ========================================================= */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#18181B]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E7E5E4] max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-[#F5F4F0] hover:bg-[#E7E5E4] text-[#57534E]"
            >
              <X strokeWidth={1.75} className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F2EE] text-[#0F4C3A] text-xs font-bold mb-3">
              <ShieldCheck strokeWidth={1.75} className="w-3.5 h-3.5" /> Acceso
              Seguro a ManoAmiga
            </div>

            <h3 className="font-display text-2xl font-extrabold text-[#18181B] mb-1">
              {authMode === "login"
                ? "Iniciar Sesión en ManoAmiga"
                : "Crear Cuenta Gratis"}
            </h3>
            <p className="text-xs sm:text-sm text-[#57534E] mb-5">
              {authMode === "login"
                ? "Ingresa con tu correo y contraseña para gestionar tus solicitudes o perfil."
                : "Regístrate en segundos para pedir ayuda u ofrecer tus servicios en Nuevo León."}
            </p>

            <div className="grid grid-cols-2 gap-2 p-1 bg-[#F5F4F0] rounded-2xl mb-5 border border-[#E7E5E4]">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setAuthError(null);
                  setAuthSuccessMsg(null);
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  authMode === "login"
                    ? "bg-white text-[#18181B] shadow-sm"
                    : "text-[#57534E]"
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
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  authMode === "register"
                    ? "bg-white text-[#18181B] shadow-sm"
                    : "text-[#57534E]"
                }`}
              >
                Crear Cuenta
              </button>
            </div>

            {authError && (
              <div className="mb-4 p-3.5 rounded-2xl bg-[#FFF1EC] border border-[#D95D39]/30 text-[#C2410C] text-xs font-medium">
                {authError}
              </div>
            )}

            {authSuccessMsg && (
              <div className="mb-4 p-3.5 rounded-2xl bg-[#E6F2EE] border border-[#0F4C3A]/20 text-[#0F4C3A] text-xs font-semibold">
                {authSuccessMsg}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === "register" && (
                <div>
                  <label className="block text-xs font-bold text-[#18181B] mb-1">
                    Tu nombre completo
                  </label>
                  <input
                    type="text"
                    required
                    value={authFullName}
                    onChange={(e) => setAuthFullName(e.target.value)}
                    placeholder="Ej. Jorge Ramírez"
                    className="w-full px-4 py-3 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] text-sm focus:outline-none focus:border-[#0F4C3A]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#18181B] mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  className="w-full px-4 py-3 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] text-sm focus:outline-none focus:border-[#0F4C3A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#18181B] mb-1">
                  Contraseña (mínimo 6 caracteres)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] text-sm focus:outline-none focus:border-[#0F4C3A]"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3.5 rounded-2xl bg-[#0F4C3A] hover:bg-[#0B3B2D] disabled:opacity-60 text-white font-extrabold text-sm transition-all"
              >
                {authLoading
                  ? "Procesando..."
                  : authMode === "login"
                  ? "Entrar a mi Cuenta"
                  : "Registrarme Ahora"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: PERFIL DETALLADO DEL SOLUCIONADOR + RESEÑAS       */}
      {/* ========================================================= */}
      {selectedSolucionador && (
        <div className="fixed inset-0 z-50 bg-[#18181B]/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#E7E5E4] max-w-lg w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setSelectedSolucionador(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-[#F5F4F0] hover:bg-[#E7E5E4] text-[#57534E]"
            >
              <X strokeWidth={1.75} className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-5">
              <img
                src={selectedSolucionador.avatarUrl}
                alt={selectedSolucionador.name}
                className="w-20 h-20 rounded-2xl object-cover border border-[#E7E5E4]"
              />
              <div>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-[#0F4C3A] bg-[#E6F2EE] px-2.5 py-0.5 rounded-full mb-1">
                  <ShieldCheck strokeWidth={1.75} className="w-3.5 h-3.5" />{" "}
                  Perfil Verificado
                </div>
                <h3 className="font-display text-xl font-extrabold text-[#18181B]">
                  {selectedSolucionador.name}
                </h3>
                <p className="text-sm text-[#57534E]">
                  {selectedSolucionador.role}
                </p>
              </div>
            </div>

            <p className="text-sm text-[#57534E] leading-relaxed mb-4">
              {selectedSolucionador.bio}
            </p>

            <div className="bg-[#F5F4F0] rounded-2xl p-4 border border-[#E7E5E4] mb-5 space-y-2 text-xs sm:text-sm tabular-nums">
              <div className="flex justify-between">
                <span className="text-[#57534E]">Calificación media:</span>
                <span className="font-bold text-[#18181B] flex items-center gap-1">
                  <Star
                    strokeWidth={1.75}
                    className="w-4 h-4 fill-[#D97706] text-[#D97706]"
                  />
                  {selectedSolucionador.rating.toFixed(1)} (
                  {selectedSolucionador.reviewsCount} reseñas)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#57534E]">Tarifa base:</span>
                <span className="font-bold text-[#0F4C3A]">
                  {selectedSolucionador.hourlyRate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#57534E]">Zona de cobertura:</span>
                <span className="font-medium text-[#18181B]">
                  {selectedSolucionador.location}
                </span>
              </div>
            </div>

            <div className="mb-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#57534E] mb-3">
                Reseñas de vecinos ({selectedSolucionador.reviews.length})
              </h4>
              <div className="space-y-2.5 max-h-44 overflow-y-auto pr-1">
                {selectedSolucionador.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-2xl bg-[#FAFAF9] border border-[#E7E5E4] text-xs sm:text-sm"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#18181B]">
                        {rev.author}
                      </span>
                      <span className="text-[#D97706] font-bold text-xs">
                        {"★".repeat(rev.rating)}
                      </span>
                    </div>
                    <p className="text-[#57534E]">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>

            <form
              onSubmit={handleAddReview}
              className="mb-5 p-4 rounded-2xl bg-[#F5F4F0] border border-[#E7E5E4] space-y-2.5"
            >
              <p className="text-xs font-bold text-[#18181B]">
                Dejar una reseña para {selectedSolucionador.name.split(" ")[0]}:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newReviewAuthor}
                  onChange={(e) => setNewReviewAuthor(e.target.value)}
                  placeholder="Tu nombre"
                  className="px-3 py-2 rounded-xl border border-[#E7E5E4] text-xs bg-white"
                />
                <select
                  value={newReviewRating}
                  onChange={(e) => setNewReviewRating(Number(e.target.value))}
                  className="px-3 py-2 rounded-xl border border-[#E7E5E4] text-xs bg-white font-semibold"
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
                  className="flex-1 px-3 py-2 rounded-xl border border-[#E7E5E4] text-xs bg-white"
                />
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="px-4 py-2 rounded-xl bg-[#0F4C3A] text-white text-xs font-bold shrink-0"
                >
                  Publicar
                </button>
              </div>
            </form>

            <button
              onClick={() => {
                const sol = selectedSolucionador;
                setSelectedSolucionador(null);
                setContactMessage("");
                setContactSent(false);
                setContactModalSolucionador(sol);
              }}
              className="w-full py-3.5 rounded-2xl bg-[#D95D39] hover:bg-[#BF4B28] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageCircle strokeWidth={1.75} className="w-4 h-4" />
              Contactar a {selectedSolucionador.name.split(" ")[0]}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: CONTACTAR SOLUCIONADOR                           */}
      {/* ========================================================= */}
      {contactModalSolucionador && (
        <div className="fixed inset-0 z-50 bg-[#18181B]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E7E5E4] max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setContactModalSolucionador(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-[#F5F4F0] hover:bg-[#E7E5E4] text-[#57534E]"
            >
              <X strokeWidth={1.75} className="w-5 h-5" />
            </button>

            {contactSent ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-2xl bg-[#E6F2EE] text-[#0F4C3A] flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 strokeWidth={1.75} className="w-8 h-8" />
                </div>
                <h3 className="font-display text-xl font-extrabold text-[#18181B] mb-1">
                  ¡Mensaje enviado a {contactModalSolucionador.name}!
                </h3>
                <p className="text-sm text-[#57534E] mb-5">
                  {contactModalSolucionador.responseTime}. También puedes
                  llamarle o escribirle directo por WhatsApp al{" "}
                  <span className="font-bold text-[#18181B] tabular-nums">
                    {contactModalSolucionador.phone}
                  </span>
                  .
                </p>
                <button
                  onClick={() => setContactModalSolucionador(null)}
                  className="w-full py-3.5 rounded-2xl bg-[#0F4C3A] text-white font-bold text-sm"
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
                    className="w-12 h-12 rounded-2xl object-cover border border-[#E7E5E4]"
                  />
                  <div>
                    <h3 className="font-display text-lg font-extrabold text-[#18181B]">
                      Contactar a {contactModalSolucionador.name}
                    </h3>
                    <p className="text-xs text-[#0F4C3A] font-semibold">
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
                    <label className="block text-xs font-bold uppercase text-[#57534E] mb-1.5">
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
                      className="w-full px-4 py-3 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] text-sm focus:outline-none focus:border-[#0F4C3A]"
                    />
                  </div>

                  <div className="bg-[#F5F4F0] p-3.5 rounded-2xl border border-[#E7E5E4] flex items-center justify-between text-xs tabular-nums">
                    <span className="text-[#57534E] flex items-center gap-1.5">
                      <Phone
                        strokeWidth={1.75}
                        className="w-4 h-4 text-[#0F4C3A]"
                      />{" "}
                      WhatsApp directo:
                    </span>
                    <span className="font-bold text-[#18181B]">
                      {contactModalSolucionador.phone}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-[#D95D39] hover:bg-[#BF4B28] text-white font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <MessageCircle strokeWidth={1.75} className="w-4 h-4" />
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
        <div className="fixed inset-0 z-50 bg-[#18181B]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E7E5E4] max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setApplyModalProblema(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-[#F5F4F0] hover:bg-[#E7E5E4] text-[#57534E]"
            >
              <X strokeWidth={1.75} className="w-5 h-5" />
            </button>

            {applySent ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-2xl bg-[#E6F2EE] text-[#0F4C3A] flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 strokeWidth={1.75} className="w-8 h-8" />
                </div>
                <h3 className="font-display text-xl font-extrabold text-[#18181B] mb-1">
                  ¡Propuesta enviada a {applyModalProblema.clientName}!
                </h3>
                <p className="text-sm text-[#57534E] mb-5">
                  Actualizamos el contador de postulantes y marcamos la
                  solicitud <span className="font-bold">En proceso</span>.
                </p>
                <button
                  onClick={() => setApplyModalProblema(null)}
                  className="w-full py-3.5 rounded-2xl bg-[#0F4C3A] text-white font-bold text-sm"
                >
                  Volver al tablero
                </button>
              </div>
            ) : (
              <>
                <span className="inline-block px-3 py-1 rounded-full bg-[#E6F2EE] text-[#0F4C3A] text-xs font-bold mb-2">
                  Postularme como Solucionador
                </span>
                <h3 className="font-display text-lg font-extrabold text-[#18181B] mb-1">
                  {applyModalProblema.title}
                </h3>
                <p className="text-xs text-[#57534E] mb-4">
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
                    <label className="block text-xs font-bold uppercase text-[#57534E] mb-1">
                      Tu tarifa propuesta:
                    </label>
                    <input
                      type="text"
                      required
                      value={applyOffer}
                      onChange={(e) => setApplyOffer(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] text-sm tabular-nums focus:outline-none focus:border-[#0F4C3A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#57534E] mb-1">
                      Mensaje para el cliente (¿Cuándo puedes llegar?):
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={applyMessage}
                      onChange={(e) => setApplyMessage(e.target.value)}
                      placeholder="Hola, estoy a 15 minutos de tu colonia y llevo toda la herramienta..."
                      className="w-full px-4 py-3 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] text-sm focus:outline-none focus:border-[#0F4C3A]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-[#0F4C3A] hover:bg-[#0B3B2D] text-white font-bold text-sm"
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
        <div className="fixed inset-0 z-50 bg-[#18181B]/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#E7E5E4] max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setIsRegisterSolucionadorOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-[#F5F4F0] hover:bg-[#E7E5E4] text-[#57534E]"
            >
              <X strokeWidth={1.75} className="w-5 h-5" />
            </button>

            {regSuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-2xl bg-[#E6F2EE] text-[#0F4C3A] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 strokeWidth={1.75} className="w-10 h-10" />
                </div>
                <h3 className="font-display text-2xl font-extrabold text-[#18181B] mb-2">
                  ¡Bienvenido al Directorio de Solucionadores!
                </h3>
                {regSaveStatus && (
                  <p className="text-xs font-semibold text-[#0F4C3A] bg-[#E6F2EE] border border-[#0F4C3A]/20 rounded-2xl px-4 py-3 mb-4">
                    {regSaveStatus}
                  </p>
                )}
                <p className="text-sm text-[#57534E] mb-6">
                  Tu credencial profesional ya aparece en primera fila del
                  Directorio principal.
                </p>
                <button
                  onClick={() => {
                    setIsRegisterSolucionadorOpen(false);
                    setSelectedCategory("todos");
                  }}
                  className="px-6 py-3.5 rounded-2xl bg-[#0F4C3A] text-white font-bold text-sm"
                >
                  Ver mi perfil en el Directorio
                </button>
              </div>
            ) : (
              <>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F2EE] text-[#0F4C3A] text-xs font-bold mb-2">
                  <UserPlus strokeWidth={1.75} className="w-3.5 h-3.5" />{" "}
                  Registro de Especialistas • Nuevo León
                </div>
                <h3 className="font-display text-2xl font-extrabold text-[#18181B]">
                  Ofrece tus servicios en ManoAmiga
                </h3>
                <p className="text-xs sm:text-sm text-[#57534E] mt-1 mb-5">
                  Tus datos se guardarán en vivo en el directorio para que
                  vecinos de tus zonas te contacten directo.
                </p>

                <form
                  onSubmit={handleRegisterSolucionador}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-[#18181B] mb-1">
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Ej. Luis Hernández"
                        className="w-full px-4 py-3 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] text-sm focus:outline-none focus:border-[#0F4C3A]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#18181B] mb-1">
                        Categoría principal *
                      </label>
                      <select
                        value={regCategory}
                        onChange={(e) =>
                          setRegCategory(
                            e.target.value as Exclude<CategoryId, "todos">
                          )
                        }
                        className="w-full px-4 py-3 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] text-sm focus:outline-none focus:border-[#0F4C3A]"
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
                    <label className="block text-xs font-bold text-[#18181B] mb-1">
                      Tu oficio o especialidad principal *
                    </label>
                    <input
                      type="text"
                      required
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      placeholder="Ej. Técnico en Minisplits, Plomero y Electricista"
                      className="w-full px-4 py-3 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] text-sm focus:outline-none focus:border-[#0F4C3A]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-[#18181B] mb-1">
                        Tarifa base estimada *
                      </label>
                      <input
                        type="text"
                        required
                        value={regRate}
                        onChange={(e) => setRegRate(e.target.value)}
                        placeholder="Ej. $350 MXN / revisión"
                        className="w-full px-4 py-3 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] text-sm tabular-nums focus:outline-none focus:border-[#0F4C3A]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#18181B] mb-1">
                        Teléfono / WhatsApp (Lada 81) *
                      </label>
                      <input
                        type="text"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="Ej. +52 81 1234 5678"
                        className="w-full px-4 py-3 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] text-sm tabular-nums focus:outline-none focus:border-[#0F4C3A]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-[#18181B] mb-1">
                        Municipios o colonias donde trabajas *
                      </label>
                      <input
                        type="text"
                        required
                        value={regLocation}
                        onChange={(e) => setRegLocation(e.target.value)}
                        placeholder="Ej. Monterrey, San Nicolás y Cumbres"
                        className="w-full px-4 py-3 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] text-sm focus:outline-none focus:border-[#0F4C3A]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#18181B] mb-1">
                        Habilidades (separadas por coma)
                      </label>
                      <input
                        type="text"
                        value={regSkills}
                        onChange={(e) => setRegSkills(e.target.value)}
                        placeholder="Ej. Minisplits, Fugas, Cortos eléctricos"
                        className="w-full px-4 py-3 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] text-sm focus:outline-none focus:border-[#0F4C3A]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#18181B] mb-1">
                      Presentación y experiencia
                    </label>
                    <textarea
                      rows={2}
                      value={regBio}
                      onChange={(e) => setRegBio(e.target.value)}
                      placeholder="Cuéntale a tus vecinos cuántos años de experiencia tienes y tu garantía..."
                      className="w-full px-4 py-3 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] text-sm focus:outline-none focus:border-[#0F4C3A]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={regSubmitting}
                    className="w-full py-4 rounded-2xl bg-[#0F4C3A] hover:bg-[#0B3B2D] disabled:opacity-60 text-white font-extrabold text-sm transition-all"
                  >
                    {regSubmitting
                      ? "Guardando perfil..."
                      : "Publicar mi Credencial de Solucionador"}
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
        <div className="fixed inset-0 z-50 bg-[#18181B]/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#E7E5E4] max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setIsPedirAyudaModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-[#F5F4F0] hover:bg-[#E7E5E4] text-[#57534E]"
            >
              <X strokeWidth={1.75} className="w-5 h-5" />
            </button>

            {helpSubmittedSuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-2xl bg-[#E6F2EE] text-[#0F4C3A] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 strokeWidth={1.75} className="w-10 h-10" />
                </div>
                <h3 className="font-display text-2xl font-extrabold text-[#18181B] mb-2">
                  ¡Tu problema fue publicado con éxito!
                </h3>
                {helpSaveStatus && (
                  <p className="text-xs font-semibold text-[#0F4C3A] bg-[#E6F2EE] border border-[#0F4C3A]/20 rounded-2xl px-4 py-3 mb-4">
                    {helpSaveStatus}
                  </p>
                )}
                <p className="text-sm text-[#57534E] mb-6">
                  Ya aparece en primera fila del Muro Vecinal para que los
                  solucionadores te contacten.
                </p>
                <button
                  onClick={() => setIsPedirAyudaModalOpen(false)}
                  className="px-6 py-3.5 rounded-2xl bg-[#0F4C3A] text-white font-bold text-sm"
                >
                  Ver en el Tablero
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-5">
                  {[1, 2, 3].map((s) => (
                    <div
                      key={s}
                      className={`h-2 flex-1 rounded-full transition-colors ${
                        helpStep >= s ? "bg-[#D95D39]" : "bg-[#E7E5E4]"
                      }`}
                    />
                  ))}
                </div>

                <form onSubmit={handleCreateHelpRequest} className="space-y-4">
                  {helpStep === 1 && (
                    <>
                      <span className="text-xs font-bold uppercase text-[#D95D39]">
                        Paso 1 de 3 • ¿Qué necesitas?
                      </span>
                      <h3 className="font-display text-xl font-extrabold text-[#18181B]">
                        Describe tu problema o tarea cotidiana
                      </h3>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setHelpCategory(cat.id)}
                            className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 text-xs font-bold transition-all ${
                              helpCategory === cat.id
                                ? "border-[#0F4C3A] bg-[#E6F2EE] text-[#0F4C3A]"
                                : "border-[#E7E5E4] bg-[#FAFAF9] text-[#57534E]"
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
                        className="w-full px-4 py-3 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] text-sm"
                      />
                      <textarea
                        rows={3}
                        value={helpDescription}
                        onChange={(e) => setHelpDescription(e.target.value)}
                        placeholder="Detalles adicionales para que el solucionador sepa qué herramienta llevar..."
                        className="w-full px-4 py-3 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] text-sm"
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setHelpStep(2)}
                          className="px-6 py-3 rounded-2xl bg-[#0F4C3A] text-white font-bold text-sm flex items-center gap-1.5"
                        >
                          <span>Siguiente</span>
                          <ArrowRight strokeWidth={1.75} className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}

                  {helpStep === 2 && (
                    <>
                      <span className="text-xs font-bold uppercase text-[#D95D39]">
                        Paso 2 de 3 • Ubicación y Urgencia
                      </span>
                      <h3 className="font-display text-xl font-extrabold text-[#18181B]">
                        ¿Dónde y cuándo necesitas la ayuda?
                      </h3>
                      <input
                        type="text"
                        required
                        value={helpLocation}
                        onChange={(e) => setHelpLocation(e.target.value)}
                        placeholder="Tu colonia o municipio (Ej. Col. Contry, Monterrey)"
                        className="w-full px-4 py-3 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] text-sm"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
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
                            className={`p-3.5 rounded-2xl border text-xs font-bold ${
                              helpUrgency === u
                                ? "border-[#0F4C3A] bg-[#E6F2EE] text-[#0F4C3A]"
                                : "border-[#E7E5E4] bg-[#FAFAF9] text-[#18181B]"
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
                          className="px-5 py-2.5 rounded-2xl bg-[#F5F4F0] text-[#18181B] font-semibold text-sm"
                        >
                          Atrás
                        </button>
                        <button
                          type="button"
                          onClick={() => setHelpStep(3)}
                          className="px-6 py-3 rounded-2xl bg-[#0F4C3A] text-white font-bold text-sm flex items-center gap-1.5"
                        >
                          <span>Siguiente</span>
                          <ArrowRight strokeWidth={1.75} className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}

                  {helpStep === 3 && (
                    <>
                      <span className="text-xs font-bold uppercase text-[#D95D39]">
                        Paso 3 de 3 • Presupuesto y Contacto
                      </span>
                      <h3 className="font-display text-xl font-extrabold text-[#18181B]">
                        Último paso para publicar en el muro
                      </h3>
                      <input
                        type="text"
                        required
                        value={helpBudget}
                        onChange={(e) => setHelpBudget(e.target.value)}
                        placeholder="Presupuesto ofrecido (Ej. $400 MXN)"
                        className="w-full px-4 py-3 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] text-sm tabular-nums"
                      />
                      <input
                        type="text"
                        required
                        value={helpClientName}
                        onChange={(e) => setHelpClientName(e.target.value)}
                        placeholder="Tu nombre (Ej. Carlos R.)"
                        className="w-full px-4 py-3 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] text-sm"
                      />
                      <div className="flex justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => setHelpStep(2)}
                          className="px-5 py-2.5 rounded-2xl bg-[#F5F4F0] text-[#18181B] font-semibold text-sm"
                        >
                          Atrás
                        </button>
                        <button
                          type="submit"
                          disabled={helpSubmitting}
                          className="px-6 py-3.5 rounded-2xl bg-[#D95D39] hover:bg-[#BF4B28] disabled:opacity-60 text-white font-extrabold text-sm flex items-center gap-1.5 shadow-sm"
                        >
                          <CheckCircle2
                            strokeWidth={1.75}
                            className="w-4 h-4"
                          />
                          <span>
                            {helpSubmitting
                              ? "Publicando..."
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
