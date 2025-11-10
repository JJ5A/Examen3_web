<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { AuthService } from '$lib/auth.js';
  import '../../../css/demo.css';

  const authService = new AuthService();
  
  let calificaciones = null;
  let isLoading = true;
  let error = null;

  onMount(async () => {
    console.log('🎯 CALIFICACIONES - Iniciando...');
    
    if (!authService.isAuthenticated()) {
      console.log('❌ No está autenticado, redirigiendo...');
      goto('/');
      return;
    }

    try {
      console.log('📡 Cargando calificaciones...');
      
      const response = await authService.authenticatedFetch('/api/calificaciones');
      
      if (response.ok) {
        const data = await response.json();
        console.log('📨 Calificaciones recibidas:', data);
        calificaciones = data.data || data;
      } else {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('💥 Error al cargar calificaciones:', err);
      error = err.message;
      
      if (err.message.includes('401') || err.message.includes('token')) {
        authService.logout();
        goto('/');
      }
    } finally {
      isLoading = false;
    }
  });

  function goBack() {
    goto('/dashboard');
  }

  function handleLogout() {
    authService.logout();
    goto('/');
  }
</script>

<main class="demo-container">
  <div class="demo-header">
    <h1 style="font-size: 48px; color: #333;">
      <b>📊 Calificaciones</b>
    </h1>
    <button on:click={goBack} class="back-button">
      ← Regresar al Dashboard
    </button>
  </div>

  {#if isLoading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Cargando calificaciones...</p>
    </div>
  {:else if error}
    <div class="error-container">
      <h3>Error al cargar las calificaciones</h3>
      <p>{error}</p>
      <button on:click={goBack} class="action-button">
        Volver al Dashboard
      </button>
      <button on:click={handleLogout} class="logout-button">
        Cerrar Sesión
      </button>
    </div>
  {:else if calificaciones}
    <div class="calificaciones-content">
      <div class="content-header">
        <h2>Reporte de Calificaciones</h2>
        <p class="subtitle">Consulta tus calificaciones por materia</p>
      </div>

      {#if Array.isArray(calificaciones) && calificaciones.length > 0}
        <div class="calificaciones-grid">
          {#each calificaciones as materia}
            <div class="materia-card">
              <div class="materia-header">
                <h3>{materia.materia || materia.nombre}</h3>
                <div class="calificacion-badge" class:aprobada={parseFloat(materia.calificacion) >= 7}>
                  {materia.calificacion}
                </div>
              </div>
              
              <div class="materia-details">
                <div><strong>Profesor:</strong> {materia.profesor || 'No disponible'}</div>
                <div><strong>Créditos:</strong> {materia.creditos || 'N/A'}</div>
                <div><strong>Periodo:</strong> {materia.periodo || 'N/A'}</div>
                {#if materia.oportunidad}
                  <div><strong>Oportunidad:</strong> {materia.oportunidad}</div>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="no-data">
          <h3>No hay calificaciones disponibles</h3>
          <p>No se encontraron calificaciones para mostrar.</p>
        </div>
      {/if}

      <div class="actions">
        <button on:click={goBack} class="action-button">
          ← Regresar al Dashboard
        </button>
      </div>
    </div>
  {/if}
</main>

<style>
  .loading {
    text-align: center;
    padding: 60px 20px;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f4f6;
    border-top: 4px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .back-button {
    background: #6b7280;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    margin-top: 10px;
    transition: background 0.2s ease;
  }

  .back-button:hover {
    background: #4b5563;
  }

  .error-container {
    text-align: center;
    padding: 40px 20px;
    background: #fee2e2;
    border: 1px solid #fca5a5;
    border-radius: 8px;
    margin: 20px auto;
    max-width: 500px;
  }

  .calificaciones-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  .content-header {
    text-align: center;
    margin-bottom: 30px;
    padding: 20px;
    background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
    color: white;
    border-radius: 12px;
  }

  .content-header h2 {
    margin: 0 0 10px 0;
    font-size: 1.8rem;
  }

  .subtitle {
    margin: 0;
    opacity: 0.9;
  }

  .calificaciones-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }

  .materia-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .materia-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  .materia-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e2e8f0;
  }

  .materia-header h3 {
    margin: 0;
    color: #1e40af;
    font-size: 1.1rem;
    flex: 1;
  }

  .calificacion-badge {
    background: #ef4444;
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-weight: bold;
    font-size: 1.1rem;
    min-width: 60px;
    text-align: center;
  }

  .calificacion-badge.aprobada {
    background: #059669;
  }

  .materia-details {
    display: grid;
    gap: 8px;
  }

  .materia-details div {
    font-size: 0.9rem;
    color: #374151;
  }

  .no-data {
    text-align: center;
    padding: 60px 20px;
    background: #f8fafc;
    border-radius: 12px;
    margin: 20px 0;
  }

  .no-data h3 {
    color: #64748b;
    margin-bottom: 10px;
  }

  .actions {
    text-align: center;
    padding: 20px;
  }

  @media (max-width: 768px) {
    .calificaciones-grid {
      grid-template-columns: 1fr;
    }
    
    .materia-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }
  }
</style>