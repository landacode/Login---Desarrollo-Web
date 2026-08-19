import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ThemeToggle } from "../components/ThemeToggle";
import { logoutUser } from "../firebase/auth";
import { getUserProfile, type UserProfile } from "../firebase/users";
import "./DashboardPage.css";

/**
 * Formatear fecha a texto legible
 */
function formatDate(ms: number): string {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(ms));
}

/**
 * Tarjeta de estadística del dashboard
 */
function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="stat-card">
      <span className="stat-card__icon">{icon}</span>
      <div>
        <p className="stat-card__label">{label}</p>
        <p className="stat-card__value">{value}</p>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Cargar perfil del usuario
  useEffect(() => {
    if (!user) return;
    getUserProfile(user.uid).then(setProfile);
  }, [user]);

  /**
   * Cerrar sesión
   */
  const handleLogout = async () => {
    await logoutUser();
    addToast("Sesión cerrada correctamente.", "info");
    navigate("/login");
  };

  const displayName = profile?.fullName ?? user?.displayName ?? "Usuario";
  const joinedAt = profile?.createdAt
    ? formatDate(profile.createdAt.toMillis())
    : "—";
  const lastLogin = profile?.lastLoginAt
    ? formatDate(profile.lastLoginAt.toMillis())
    : "Primera sesión";

  return (
    <div className="dashboard">
      {/* Barra superior */}
      <header className="dashboard__header">
        <div className="dashboard__brand">
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="12" fill="var(--accent)" />
            <path d="M12 28l8-16 8 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14.5 23h11" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <span className="dashboard__brand-name">AuthApp</span>
        </div>

        <div className="dashboard__actions">
          <ThemeToggle />
          <button className="btn-logout" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="16 17 21 12 16 7" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="dashboard__main">
        {/* Bienvenida */}
        <section className="dashboard__welcome">
          <div className="dashboard__avatar">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="dashboard__greeting">
              ¡Hola, {displayName.split(" ")[0]}!
            </h1>
            <p className="dashboard__email">{user?.email}</p>
          </div>
        </section>

        {/* Tarjetas de estadísticas */}
        <div className="dashboard__stats">
          <StatCard icon="👤" label="Usuario" value={`@${profile?.username ?? "—"}`} />
          <StatCard icon="📅" label="Miembro desde" value={joinedAt} />
          <StatCard icon="🕐" label="Último acceso" value={lastLogin} />
          <StatCard icon="🔒" label="Estado" value="Cuenta activa" />
        </div>

        {/* Panel de información */}
        <div className="dashboard__panel">
          <h2 className="dashboard__panel-title">Tu perfil</h2>
          <div className="dashboard__profile-grid">
            <div className="profile-row">
              <span className="profile-row__label">Nombre completo</span>
              <span className="profile-row__value">{profile?.fullName ?? "—"}</span>
            </div>
            <div className="profile-row">
              <span className="profile-row__label">Correo electrónico</span>
              <span className="profile-row__value">{profile?.email ?? user?.email ?? "—"}</span>
            </div>
            <div className="profile-row">
              <span className="profile-row__label">Nombre de usuario</span>
              <span className="profile-row__value">@{profile?.username ?? "—"}</span>
            </div>
            <div className="profile-row">
              <span className="profile-row__label">Cuenta creada</span>
              <span className="profile-row__value">{joinedAt}</span>
            </div>
            <div className="profile-row">
              <span className="profile-row__label">Último inicio de sesión</span>
              <span className="profile-row__value">{lastLogin}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
