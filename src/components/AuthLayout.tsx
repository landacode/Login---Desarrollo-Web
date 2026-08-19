import { ThemeToggle } from "./ThemeToggle";
import "./AuthLayout.css";

interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * Fondo decorativo del panel izquierdo
 */
function BrandPanel() {
  return (
    <aside className="auth-brand">
      <div className="auth-brand__inner">
        <div className="auth-brand__logo">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="12" fill="var(--accent)" />
            <path d="M12 28l8-16 8 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14.5 23h11" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <span className="auth-brand__name">AuthApp</span>
        </div>

        <div className="auth-brand__copy">
          <h1 className="auth-brand__headline">
            Bienvenido al<br />módulo de acceso
          </h1>
          <p className="auth-brand__sub">
            Diseñado para el curso de Desarrollo Web. Gestiona tu cuenta con seguridad y simplicidad.
          </p>
        </div>

        <ul className="auth-brand__features">
          <li>
            <span className="auth-brand__feat-icon">🔒</span>
            Autenticación segura con Firebase
          </li>
          <li>
            <span className="auth-brand__feat-icon">🛡️</span>
            Protección contra ataques por fuerza bruta
          </li>
          <li>
            <span className="auth-brand__feat-icon">🌙</span>
            Modo oscuro incluido
          </li>
        </ul>
      </div>
    </aside>
  );
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-layout">
      <BrandPanel />
      <main className="auth-content">
        <div className="auth-content__top-bar">
          <ThemeToggle />
        </div>
        <div className="auth-content__card">
          {children}
        </div>
      </main>
    </div>
  );
}
