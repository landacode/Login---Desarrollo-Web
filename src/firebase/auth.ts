import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
  updateProfile,
} from "firebase/auth";
import { auth } from "./config";
import { createUserProfile, resolveEmail, updateLoginSuccess } from "./users";
import {
  isLocked,
  getLockRemainingSeconds,
  registerFailedAttempt,
  clearLock,
} from "../utils/lockout";

export interface RegisterData {
  fullName: string;
  username: string;
  email: string;
  password: string;
}

export interface RegisterResult {
  success: boolean;
  field?: "email" | "form";
  error?: string;
}

export interface LoginResult {
  success: boolean;
  error?: string;
  lockedSeconds?: number;
}

/**
 * Registrar nuevo usuario
 */
export async function registerUser(data: RegisterData): Promise<RegisterResult> {
  try {
    const credential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    await updateProfile(credential.user, { displayName: data.fullName });

    await createUserProfile(credential.user.uid, {
      fullName: data.fullName,
      username: data.username,
      email: data.email.toLowerCase(),
    });

    return { success: true };
  } catch (err: unknown) {
    const code = (err as { code?: string }).code ?? "";

    if (code === "auth/email-already-in-use") {
      return { success: false, field: "email", error: "Este correo ya está registrado." };
    }
    if (code === "auth/weak-password") {
      return { success: false, field: "form", error: "La contraseña es demasiado débil." };
    }

    return {
      success: false,
      field: "form",
      error: "Error al crear la cuenta. Inténtalo de nuevo.",
    };
  }
}

/**
 * Iniciar sesión con email o username
 */
export async function loginUser(
  identifier: string,
  password: string,
  remember: boolean
): Promise<LoginResult> {
  const lockKey = identifier.trim().toLowerCase();

  if (isLocked(lockKey)) {
    const seconds = getLockRemainingSeconds(lockKey);
    return {
      success: false,
      error: `Cuenta bloqueada. Intenta en ${Math.ceil(seconds / 60)} min.`,
      lockedSeconds: seconds,
    };
  }

  let email: string | null = null;
  try {
    email = await resolveEmail(identifier.trim());
  } catch {
    email = identifier.includes("@") ? identifier.trim().toLowerCase() : null;
  }

  if (!email) {
    return { success: false, error: "Usuario o correo no encontrado." };
  }

  await setPersistence(
    auth,
    remember ? browserLocalPersistence : browserSessionPersistence
  );

  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    clearLock(lockKey);
    clearLock(email);
    try {
      await updateLoginSuccess(credential.user.uid);
    } catch {
      // El login ya fue exitoso; el perfil se actualiza en el siguiente acceso
    }
    return { success: true };
  } catch (err: unknown) {
    const code = (err as { code?: string }).code ?? "";

    if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
      const attempts = registerFailedAttempt(lockKey);
      if (attempts >= 5) {
        const seconds = getLockRemainingSeconds(lockKey);
        return {
          success: false,
          error: "Demasiados intentos. Cuenta bloqueada 5 minutos.",
          lockedSeconds: seconds,
        };
      }
      const left = 5 - attempts;
      return {
        success: false,
        error: `Contraseña incorrecta. ${left} intento${left !== 1 ? "s" : ""} restante${left !== 1 ? "s" : ""}.`,
      };
    }

    if (code === "auth/user-not-found") {
      return { success: false, error: "Usuario o correo no encontrado." };
    }

    return { success: false, error: "Error al iniciar sesión. Inténtalo de nuevo." };
  }
}

/**
 * Cerrar sesión
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}
