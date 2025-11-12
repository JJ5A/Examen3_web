<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { Login } from '$lib';
  import { AuthService } from '$lib/auth.js';
  import '../css/demo.css';

  // Crear instancia del servicio de autenticación
  const authService = new AuthService();

  // Estado para mostrar mensajes
  let loginResult = '';
  let showResult = false;

  onMount(() => {
    // Si ya está autenticado, redirigir al dashboard
    if (authService.isAuthenticated()) {
      goto('/dashboard');
    }
  });

  function showMsg(msg, ms = 5000) {
    loginResult = msg;
    showResult = true;
    setTimeout(() => (showResult = false), ms);
  }

  // Manejar login exitoso
  async function handleLoginSuccess(event) {
    const data = event?.detail ?? {};
    console.log('Login exitoso:', data);

    try {
      showMsg('Login exitoso. Redirigiendo...');
      
      // Verificar que el token se haya guardado correctamente
      if (authService.isAuthenticated()) {
        console.log('Token guardado correctamente, redirigiendo al dashboard...');
        
        // Usar una redirección inmediata
        await goto('/dashboard', { replaceState: true });
      } else {
        throw new Error('Token no se guardó correctamente');
      }
      
    } catch (error) {
      console.error('Error en redirección:', error);
      showMsg(`Error en redirección: ${error.message}`);
    }
  }

  // Manejar error de login
  function handleLoginError(event) {
    const error = event?.detail ?? {};
    console.error('Error en login:', error);
    showMsg(`Error en login: ${error.error || 'Credenciales incorrectas'}`);
  }
</script>

<main class="demo-container">
  {#if showResult}
    <div
      class="result-container"
      class:success={loginResult.includes('exitoso') || loginResult.includes('Redirigiendo')}
      class:error={loginResult.includes('Error')}
    >
      {loginResult}
    </div>
  {/if}

  <!-- Solo mostrar login -->
  <Login
    title="Iniciar Sesión"
    submitButtonText="Iniciar Sesión"
    apiUrl="/api/login"
    on:success={handleLoginSuccess}
    on:error={handleLoginError}
  />
</main>