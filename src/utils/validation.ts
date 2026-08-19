/**
 * Validar formato de email
 */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/**
 * Validar reglas de contraseña
 */
export function validatePassword(value: string): string | null {
  if (value.length < 8) return "Mínimo 8 caracteres.";
  if (!/[A-Z]/.test(value)) return "Debe incluir al menos una mayúscula.";
  if (!/[a-z]/.test(value)) return "Debe incluir al menos una minúscula.";
  if (!/[0-9]/.test(value)) return "Debe incluir al menos un número.";
  return null;
}

/**
 * Calcular nivel de seguridad de contraseña
 */
export function passwordStrength(value: string): 0 | 1 | 2 | 3 | 4 {
  if (!value) return 0;
  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;

  if (score <= 1) return 1;
  if (score === 2) return 2;
  if (score === 3) return 3;
  return 4;
}

export const strengthLabels: Record<number, string> = {
  0: "",
  1: "Débil",
  2: "Regular",
  3: "Fuerte",
  4: "Muy fuerte",
};

export const strengthColors: Record<number, string> = {
  0: "transparent",
  1: "var(--strength-weak)",
  2: "var(--strength-fair)",
  3: "var(--strength-good)",
  4: "var(--strength-strong)",
};

/**
 * Validar que el campo no esté vacío
 */
export function isRequired(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Validar coincidencia de contraseñas
 */
export function passwordsMatch(a: string, b: string): boolean {
  return a === b;
}

/**
 * Validar formato de username
 */
export function isValidUsername(value: string): boolean {
  return /^[a-zA-Z0-9_]{3,20}$/.test(value.trim());
}
