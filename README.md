# AuthApp — Módulo de Autenticación

Proyecto React + Firebase para el curso de **Desarrollo Web**. Incluye registro, login, dashboard y funcionalidades adicionales.

## Tecnologías

- React 19 + TypeScript (Vite)
- Firebase Authentication (email/password)
- Firebase Firestore
- React Router v7
- CSS Variables (sin frameworks de UI)

## Funcionalidades

### Requerimientos mínimos
- Registro con nombre completo, correo, usuario, contraseña y confirmación
- Validación de campos obligatorios, formato de correo y reglas de contraseña
- Login con usuario **o** correo electrónico
- Toggle mostrar/ocultar contraseña
- Mensajes de error y éxito (toasts)
- Dashboard protegido tras iniciar sesión
- Cerrar sesión

### Extras implementados
1. **Indicador de seguridad de contraseña** — barra de 4 niveles en el registro
2. **Recordar sesión** — checkbox que usa persistencia local o de sesión
3. **Modo oscuro / claro** — toggle con preferencia guardada en `localStorage`
4. **Bloqueo temporal** — 5 intentos fallidos bloquean la cuenta por 5 minutos
5. **Notificaciones toast** — feedback visual en registro, login, logout y errores

---

## Configuración inicial

### 1. Crear proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com) y crea un nuevo proyecto.
2. En **Authentication → Sign-in method**, activa **Email/Password**.
3. En **Firestore Database**, crea la base de datos en **modo producción**.

### 2. Configurar reglas de Firestore

Copia el contenido de `firestore.rules` en **Firestore → Reglas** y publica.

### 3. Copiar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` y reemplaza los valores con los de tu proyecto:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

> Las claves las encuentras en **Firebase Console → Configuración del proyecto → Tus apps → SDK de configuración**.

### 4. Instalar dependencias y arrancar

```bash
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173).

---

## Estructura del proyecto

```
src/
├── firebase/
│   ├── config.ts       # Inicialización Firebase
│   ├── auth.ts         # Registro, login, logout
│   └── users.ts        # Perfil, username lookup, bloqueo
├── context/
│   ├── AuthContext.tsx  # Sesión activa
│   ├── ThemeContext.tsx # Modo claro/oscuro
│   └── ToastContext.tsx # Notificaciones
├── components/
│   ├── AuthLayout.tsx   # Layout dividido (marca + formulario)
│   ├── FormField.tsx    # Input genérico
│   ├── PasswordInput.tsx # Input con toggle visibilidad
│   ├── PasswordStrength.tsx # Medidor de seguridad
│   ├── ProtectedRoute.tsx  # Guardia de rutas
│   ├── ThemeToggle.tsx     # Botón de tema
│   └── ToastContainer.tsx  # Contenedor de toasts
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   └── DashboardPage.tsx
└── utils/
    ├── validation.ts   # Funciones de validación
    └── lockout.ts      # Bloqueo temporal (localStorage)
```

## Colección Firestore

**`users/{uid}`**
```json
{
  "fullName": "Juan Pérez",
  "username": "juanp",
  "email": "juan@ejemplo.com",
  "createdAt": Timestamp,
  "lastLoginAt": Timestamp
}
```

**`usernames/{username}`** (lookup público de username → email)
```json
{ "uid": "abc123...", "email": "juan@ejemplo.com" }
```

El bloqueo por intentos fallidos se guarda en `localStorage` (no requiere permisos de Firestore antes de iniciar sesión).
