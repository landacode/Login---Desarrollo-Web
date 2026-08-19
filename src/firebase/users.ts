import { doc, setDoc, getDoc, updateDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "./config";

export interface UserProfile {
  uid: string;
  fullName: string;
  username: string;
  email: string;
  createdAt: Timestamp | null;
  lastLoginAt: Timestamp | null;
}

/**
 * Crear perfil de usuario en Firestore
 */
export async function createUserProfile(
  uid: string,
  data: Pick<UserProfile, "fullName" | "username" | "email">
): Promise<void> {
  await setDoc(doc(db, "users", uid), {
    ...data,
    createdAt: serverTimestamp(),
    lastLoginAt: null,
  });

  await setDoc(doc(db, "usernames", data.username.toLowerCase()), {
    uid,
    email: data.email.toLowerCase(),
  });
}

/**
 * Obtener perfil de usuario por uid
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return { uid, ...snap.data() } as UserProfile;
}

/**
 * Resolver email a partir de username o email
 */
export async function resolveEmail(identifier: string): Promise<string | null> {
  const lower = identifier.toLowerCase();

  if (lower.includes("@")) return lower;

  const snap = await getDoc(doc(db, "usernames", lower));
  if (!snap.exists()) return null;

  const data = snap.data() as { uid: string; email?: string };
  return data.email?.toLowerCase() ?? null;
}

/**
 * Verificar si el username ya existe
 */
export async function usernameExists(username: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "usernames", username.toLowerCase()));
  return snap.exists();
}

/**
 * Actualizar fecha de último acceso
 */
export async function updateLoginSuccess(uid: string): Promise<void> {
  await updateDoc(doc(db, "users", uid), {
    lastLoginAt: serverTimestamp(),
  });

  const profile = await getUserProfile(uid);
  if (profile?.username && profile.email) {
    await setDoc(doc(db, "usernames", profile.username.toLowerCase()), {
      uid,
      email: profile.email.toLowerCase(),
    });
  }
}
