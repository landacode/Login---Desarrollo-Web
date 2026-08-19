import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { FormField } from "../components/FormField";
import { PasswordInput } from "../components/PasswordInput";
import { useToast } from "../context/ToastContext";
import { loginUser } from "../firebase/auth";
import { isRequired } from "../utils/validation";
import "./AuthPage.css";

export function LoginPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lockedSeconds, setLockedSeconds] = useState(0);

  /**
   * Validar campos antes de enviar
   */
  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!isRequired(identifier)) next.identifier = "Este campo es obligatorio.";
    if (!isRequired(password)) next.password = "Este campo es obligatorio.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  /**
   * Enviar formulario de inicio de sesión
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    const result = await loginUser(identifier.trim(), password, remember);
    setLoading(false);

    if (result.success) {
      addToast("¡Bienvenido! Sesión iniciada correctamente.", "success");
      navigate("/dashboard");
    } else {
      if (result.lockedSeconds) setLockedSeconds(result.lockedSeconds);
      addToast(result.error ?? "Error al iniciar sesión.", "error");
      setErrors({ form: result.error ?? "" });
    }
  };

  return (
    <AuthLayout>
      <div className="auth-form">
        <header className="auth-form__header">
          <h2 className="auth-form__title">Iniciar sesión</h2>
          <p className="auth-form__subtitle">
            ¿No tienes cuenta?{" "}
            <Link to="/registro" className="auth-link">
              Regístrate aquí
            </Link>
          </p>
        </header>

        {errors.form && (
          <div className="auth-alert auth-alert--error" role="alert">
            {errors.form}
            {lockedSeconds > 0 && (
              <span className="auth-alert__detail">
                {" "}— Tiempo restante: {Math.ceil(lockedSeconds / 60)} min
              </span>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="auth-form__fields">
          <FormField
            id="identifier"
            label="Usuario o correo electrónico"
            value={identifier}
            onChange={(v) => {
              setIdentifier(v);
              if (errors.identifier) setErrors((p) => ({ ...p, identifier: "" }));
            }}
            error={errors.identifier}
            placeholder="usuario o correo@ejemplo.com"
            autoComplete="username"
          />

          <PasswordInput
            id="password"
            label="Contraseña"
            value={password}
            onChange={(v) => {
              setPassword(v);
              if (errors.password) setErrors((p) => ({ ...p, password: "" }));
            }}
            error={errors.password}
            placeholder="Tu contraseña"
            autoComplete="current-password"
          />

          <div className="auth-form__options">
            <label className="auth-checkbox">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span className="auth-checkbox__mark" />
              Recordar sesión
            </label>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <span className="btn-primary__spinner" />
            ) : (
              "Iniciar sesión"
            )}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
