import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { FormField } from "../components/FormField";
import { PasswordInput } from "../components/PasswordInput";
import { PasswordStrength } from "../components/PasswordStrength";
import { useToast } from "../context/ToastContext";
import { registerUser } from "../firebase/auth";
import { usernameExists } from "../firebase/users";
import {
  isRequired,
  isValidEmail,
  isValidUsername,
  validatePassword,
  passwordsMatch,
} from "../utils/validation";
import "./AuthPage.css";

export function RegisterPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  /**
   * Actualizar campo del formulario
   */
  const setField = (key: keyof typeof form) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  /**
   * Validar todos los campos
   */
  const validate = (): boolean => {
    const next: Record<string, string> = {};

    if (!isRequired(form.fullName)) next.fullName = "El nombre es obligatorio.";
    if (!isRequired(form.email)) {
      next.email = "El correo es obligatorio.";
    } else if (!isValidEmail(form.email)) {
      next.email = "Ingresa un correo válido.";
    }

    if (!isRequired(form.username)) {
      next.username = "El usuario es obligatorio.";
    } else if (!isValidUsername(form.username)) {
      next.username = "Solo letras, números y guión bajo (3–20 caracteres).";
    }

    const pwdError = validatePassword(form.password);
    if (!isRequired(form.password)) {
      next.password = "La contraseña es obligatoria.";
    } else if (pwdError) {
      next.password = pwdError;
    }

    if (!isRequired(form.confirm)) {
      next.confirm = "Confirma tu contraseña.";
    } else if (!passwordsMatch(form.password, form.confirm)) {
      next.confirm = "Las contraseñas no coinciden.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  /**
   * Enviar formulario de registro
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    // Verificar username disponible (lectura pública, no requiere auth)
    const uExists = await usernameExists(form.username);
    if (uExists) {
      setErrors((p) => ({ ...p, username: "Este usuario ya está en uso." }));
      setLoading(false);
      return;
    }

    const result = await registerUser({
      fullName: form.fullName.trim(),
      username: form.username.trim().toLowerCase(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
    });

    setLoading(false);

    if (result.success) {
      addToast("¡Cuenta creada con éxito!", "success");
      navigate("/dashboard");
      return;
    }

    if (result.field === "email") {
      setErrors((p) => ({ ...p, email: result.error ?? "" }));
    } else {
      addToast(result.error ?? "Error al crear la cuenta.", "error");
      setErrors({ form: result.error ?? "" });
    }
  };

  return (
    <AuthLayout>
      <div className="auth-form">
        <header className="auth-form__header">
          <h2 className="auth-form__title">Crear cuenta</h2>
          <p className="auth-form__subtitle">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="auth-link">
              Inicia sesión
            </Link>
          </p>
        </header>

        {errors.form && (
          <div className="auth-alert auth-alert--error" role="alert">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="auth-form__fields">
          <FormField
            id="fullName"
            label="Nombre completo"
            value={form.fullName}
            onChange={setField("fullName")}
            error={errors.fullName}
            placeholder="Juan Pérez"
            autoComplete="name"
          />

          <FormField
            id="email"
            label="Correo electrónico"
            type="email"
            value={form.email}
            onChange={setField("email")}
            error={errors.email}
            placeholder="correo@ejemplo.com"
            autoComplete="email"
          />

          <FormField
            id="username"
            label="Usuario"
            value={form.username}
            onChange={setField("username")}
            error={errors.username}
            placeholder="mi_usuario"
            autoComplete="username"
          />

          <div>
            <PasswordInput
              id="password"
              label="Contraseña"
              value={form.password}
              onChange={setField("password")}
              error={errors.password}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
            />
            <PasswordStrength password={form.password} />
          </div>

          <PasswordInput
            id="confirm"
            label="Confirmar contraseña"
            value={form.confirm}
            onChange={setField("confirm")}
            error={errors.confirm}
            placeholder="Repite tu contraseña"
            autoComplete="new-password"
          />

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? <span className="btn-primary__spinner" /> : "Crear cuenta"}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
