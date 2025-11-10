# Arquitectura de Servicios - Examen 3

## 📁 Estructura de Servicios Separados

Esta aplicación ahora tiene una arquitectura modular con servicios independientes:

```
src/lib/
├── auth.js          # 🔐 Servicio de autenticación
├── studentService.js # 👨‍🎓 Servicio de datos de estudiantes
├── apiService.js     # 🌐 Servicio genérico de API
└── index.ts          # 📦 Exportaciones centrales
```

## 🔐 AuthService (auth.js)

**Propósito:** Manejo exclusivo de autenticación y tokens JWT.

### Funcionalidades:
- ✅ Gestión de tokens JWT
- ✅ Login y logout
- ✅ Verificación de autenticación
- ✅ Headers de autorización
- ✅ Decodificación de tokens

### Métodos principales:
```javascript
import { AuthService } from '$lib/auth.js';

const auth = new AuthService();
await auth.login(email, password);
auth.isAuthenticated();
auth.logout();
```

## 👨‍🎓 StudentService (studentService.js)

**Propósito:** Manejo exclusivo de datos específicos del estudiante.

### Funcionalidades:
- ✅ Obtener datos completos del estudiante
- ✅ Perfil académico
- ✅ Información básica
- ✅ Estadísticas académicas

### Métodos principales:
```javascript
import { StudentService } from '$lib/studentService.js';

const studentService = new StudentService(authService);
const data = await studentService.getStudentData();
const profile = await studentService.getAcademicProfile();
const basicInfo = await studentService.getBasicInfo();
const stats = await studentService.getAcademicStats();
```

## 🌐 ApiService (apiService.js)

**Propósito:** Servicio genérico para peticiones HTTP autenticadas.

### Funcionalidades:
- ✅ Peticiones GET, POST, PUT, DELETE
- ✅ Manejo automático de headers de autenticación
- ✅ Gestión de errores 401 (token expirado)
- ✅ Respuestas JSON automáticas

### Métodos principales:
```javascript
import { ApiService } from '$lib/apiService.js';

const api = new ApiService(authService);
const data = await api.get('/api/endpoint');
await api.post('/api/endpoint', { data });
```

## 🔄 Flujo de Uso

### 1. Autenticación
```javascript
import { AuthService } from '$lib/auth.js';

const auth = new AuthService();
const result = await auth.login('user@email.com', 'password');
```

### 2. Obtener datos del estudiante
```javascript
import { StudentService } from '$lib/studentService.js';

const studentService = new StudentService(auth);
const studentData = await studentService.getAcademicProfile();
```

### 3. Peticiones personalizadas
```javascript
import { ApiService } from '$lib/apiService.js';

const api = new ApiService(auth);
const customData = await api.get('/api/custom-endpoint');
```

## 📦 Exportaciones Convenientes

El archivo `index.ts` exporta funciones de conveniencia:

```javascript
import { 
  // Autenticación
  authService, 
  isAuthenticated, 
  logout,
  
  // Estudiante
  studentService,
  getStudentData,
  getAcademicProfile,
  
  // API
  apiService,
  apiGet,
  apiPost
} from '$lib';
```

## 🎯 Ventajas de esta Arquitectura

### ✅ **Separación de Responsabilidades**
- Cada servicio tiene una función específica
- Facilita el mantenimiento y debugging
- Código más limpio y organizado

### ✅ **Reutilización**
- Los servicios pueden usarse en cualquier componente
- Instancias independientes para diferentes contextos
- API genérica para endpoints futuros

### ✅ **Escalabilidad**
- Fácil agregar nuevos servicios (profesores, materias, etc.)
- Servicios independientes para diferentes tipos de datos
- Configuración flexible por servicio

### ✅ **Mantenibilidad**
- Cambios en autenticación no afectan datos de estudiantes
- Testing independiente de cada servicio
- Debugging más eficiente

## 🚀 Uso en Componentes

### Página de Login
```svelte
<script>
  import { AuthService } from '$lib/auth.js';
  
  const auth = new AuthService();
  
  async function handleLogin() {
    await auth.login(email, password);
    goto('/dashboard');
  }
</script>
```

### Dashboard
```svelte
<script>
  import { AuthService } from '$lib/auth.js';
  import { StudentService } from '$lib/studentService.js';
  
  const auth = new AuthService();
  const studentService = new StudentService(auth);
  
  onMount(async () => {
    if (auth.isAuthenticated()) {
      studentData = await studentService.getAcademicProfile();
    }
  });
</script>
```

## 🔧 Configuración

Cada servicio se puede configurar independientemente:

```javascript
// Configuración personalizada
const customAuth = new AuthService('https://api.custom.com');
const customStudent = new StudentService(customAuth);
const customApi = new ApiService(customAuth, 'https://api.custom.com');
```

## 📝 Notas de Migración

- ✅ `AuthService` ya no incluye `getStudentData()`
- ✅ Usar `StudentService` para todos los datos de estudiantes
- ✅ `ApiService` para peticiones genéricas futuras
- ✅ Mantener compatibilidad con funciones de conveniencia

Esta nueva arquitectura proporciona una base sólida y escalable para el desarrollo futuro de la aplicación.