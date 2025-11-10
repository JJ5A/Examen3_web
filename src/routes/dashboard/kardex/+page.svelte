<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { AuthService } from '$lib/auth.js';
  import '../../../css/demo.css';

  const authService = new AuthService();
  
  let kardex = null;
  let isLoading = true;
  let error = null;

  onMount(async () => {
    console.log('🎯 KARDEX - Iniciando...');
    
    if (!authService.isAuthenticated()) {
      console.log('❌ No está autenticado, redirigiendo...');
      goto('/');
      return;
    }

    try {
      console.log('📡 Cargando kardex...');
      
      const response = await authService.authenticatedFetch('/api/kardex');
      
      if (response.ok) {
        const data = await response.json();
        console.log('📨 Kardex recibido:', data);
        kardex = data.data || data;
      } else {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('💥 Error al cargar kardex:', err);
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

  function agruparPorSemestre(materias) {
    if (!Array.isArray(materias)) return {};
    
    return materias.reduce((grupos, materia) => {
      const semestre = materia.semestre || 'Sin clasificar';
      if (!grupos[semestre]) {
        grupos[semestre] = [];
      }
      grupos[semestre].push(materia);
      return grupos;
    }, {});
  }

  $: materiasAgrupadas = kardex ? agruparPorSemestre(kardex) : {};
</script>

<main class="demo-container">
  <div class="demo-header">
    <h1 style="font-size: 48px; color: #333;">
      <b>📋 Kardex Académico</b>
    </h1>
    <button on:click={goBack} class="back-button">
      ← Regresar al Dashboard
    </button>
  </div>

  {#if isLoading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Cargando kardex...</p>
    </div>
  {:else if error}
    <div class="error-container">
      <h3>Error al cargar el kardex</h3>
      <p>{error}</p>
      <button on:click={goBack} class="action-button">
        Volver al Dashboard
      </button>
      <button on:click={handleLogout} class="logout-button">
        Cerrar Sesión
      </button>
    </div>
  {:else if kardex}
    <div class="kardex-content">
      <div class="content-header">
        <h2>Historial Académico Completo</h2>
        <p class="subtitle">Registro detallado de todas las materias cursadas</p>
      </div>

      {#if Object.keys(materiasAgrupadas).length > 0}
        <div class="semestres-container">
          {#each Object.entries(materiasAgrupadas) as [semestre, materias]}
            <div class="semestre-section">
              <h3 class="semestre-title">Semestre {semestre}</h3>
              
              <div class="materias-table">
                <div class="table-header">
                  <div>Materia</div>
                  <div>Calificación</div>
                  <div>Créditos</div>
                  <div>Estado</div>
                </div>
                
                {#each materias as materia}
                  <div class="table-row">
                    <div class="materia-name">
                      <strong>{materia.materia || materia.nombre}</strong>
                      {#if materia.profesor}
                        <div class="profesor">Prof. {materia.profesor}</div>
                      {/if}
                    </div>
                    <div class="calificacion" class:aprobada={parseFloat(materia.calificacion) >= 7}>
                      {materia.calificacion}
                    </div>
                    <div class="creditos">{materia.creditos || 'N/A'}</div>
                    <div class="estado">
                      <span class="estado-badge" class:aprobada={parseFloat(materia.calificacion) >= 7}>
                        {parseFloat(materia.calificacion) >= 7 ? 'Aprobada' : 'Reprobada'}
                      </span>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="no-data">
          <h3>No hay datos del kardex disponibles</h3>
          <p>No se encontró historial académico para mostrar.</p>
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

  .kardex-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  .content-header {
    text-align: center;
    margin-bottom: 30px;
    padding: 20px;
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
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

  .semestres-container {
    display: flex;
    flex-direction: column;
    gap: 30px;
    margin-bottom: 30px;
  }

  .semestre-section {
    background: white;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  .semestre-title {
    background: #f8fafc;
    padding: 16px 20px;
    margin: 0;
    color: #1e40af;
    font-size: 1.3rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .materias-table {
    display: flex;
    flex-direction: column;
  }

  .table-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 16px;
    padding: 16px 20px;
    background: #f1f5f9;
    font-weight: bold;
    color: #475569;
    border-bottom: 1px solid #e2e8f0;
  }

  .table-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 16px;
    padding: 16px 20px;
    border-bottom: 1px solid #f1f5f9;
    transition: background 0.2s ease;
  }

  .table-row:hover {
    background: #fafafa;
  }

  .materia-name strong {
    display: block;
    color: #1e40af;
    margin-bottom: 4px;
  }

  .profesor {
    font-size: 0.85rem;
    color: #64748b;
  }

  .calificacion {
    font-weight: bold;
    font-size: 1.1rem;
    color: #ef4444;
    display: flex;
    align-items: center;
  }

  .calificacion.aprobada {
    color: #059669;
  }

  .creditos {
    display: flex;
    align-items: center;
    color: #374151;
  }

  .estado {
    display: flex;
    align-items: center;
  }

  .estado-badge {
    background: #ef4444;
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: bold;
  }

  .estado-badge.aprobada {
    background: #059669;
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
    .table-header,
    .table-row {
      grid-template-columns: 1fr;
      gap: 8px;
    }
    
    .table-header {
      display: none;
    }
    
    .table-row {
      display: block;
      padding: 16px;
    }
    
    .table-row > div {
      margin-bottom: 8px;
    }
    
    .table-row > div:before {
      content: attr(data-label);
      font-weight: bold;
      display: inline-block;
      width: 100px;
    }
  }
</style>