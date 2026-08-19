const STORAGE_KEY = "auth-lockouts"; // mapa de intentos por identificador
const MAX_ATTEMPTS = 5;
const LOCK_MS = 5 * 60 * 1000; // 5 minutos

interface LockState {
  attempts: number;
  lockedUntil: number | null;
}

/**
 * Cargar mapa de bloqueos del almacenamiento local
 */
function loadMap(): Record<string, LockState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, LockState>;
  } catch {
    return {};
  }
}

/**
 * Guardar mapa de bloqueos
 */
function saveMap(map: Record<string, LockState>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

/**
 * Obtener estado de bloqueo de un identificador
 */
function getState(identifier: string): LockState {
  const key = identifier.toLowerCase();
  return loadMap()[key] ?? { attempts: 0, lockedUntil: null };
}

/**
 * Verificar si el identificador está bloqueado
 */
export function isLocked(identifier: string): boolean {
  const state = getState(identifier);
  if (!state.lockedUntil) return false;
  if (Date.now() < state.lockedUntil) return true;

  clearLock(identifier);
  return false;
}

/**
 * Obtener segundos restantes de bloqueo
 */
export function getLockRemainingSeconds(identifier: string): number {
  const state = getState(identifier);
  if (!state.lockedUntil) return 0;
  const remaining = state.lockedUntil - Date.now();
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

/**
 * Registrar intento fallido y devolver el total
 */
export function registerFailedAttempt(identifier: string): number {
  const key = identifier.toLowerCase();
  const map = loadMap();
  const current = map[key] ?? { attempts: 0, lockedUntil: null };
  const attempts = current.attempts + 1;

  map[key] = {
    attempts,
    lockedUntil: attempts >= MAX_ATTEMPTS ? Date.now() + LOCK_MS : null,
  };
  saveMap(map);
  return attempts;
}

/**
 * Limpiar bloqueo tras un login exitoso
 */
export function clearLock(identifier: string): void {
  const key = identifier.toLowerCase();
  const map = loadMap();
  delete map[key];
  saveMap(map);
}
