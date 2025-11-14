<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { AuthService } from '$lib/auth.js';
  import '../../../css/demo.css';

  const authService = new AuthService();
  
  let kardex: any = null;
  let porcentajeAvance: any = null;
  let isLoading: boolean = true;
  let error: string | null = null;

  onMount(async () => {
    console.log('🎯 KARDEX - Iniciando...');
    
    if (!authService.isAuthenticated()) {
      console.log('❌ No está autenticado, redirigiendo...');
      goto('/');
      return;
    }

    try {
      console.log('📡 Cargando kardex...');
      
      const response = await authService.authenticatedFetch('/api/movil/estudiante/kardex');
      
      if (response.ok) {
        const data = await response.json();
        console.log('📨 Kardex recibido:', data);
        
        // Extraer los datos según el formato del JSON
        if (data.flag && data.data && data.data.kardex) {
          kardex = data.data.kardex;
          porcentajeAvance = data.data.porcentaje_avance;
          console.log('✅ Kardex procesado:', kardex);
          console.log('📊 Porcentaje de avance:', porcentajeAvance);
        } else {
          throw new Error('Formato de respuesta incorrecto');
        }
      } else {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (err: any) {
      console.error('💥 Error cargando kardex:', err);
      error = err.message || 'Error desconocido';
      
      if (err.message && (err.message.includes('401') || err.message.includes('token'))) {
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

  function agruparPorSemestre(materias: any[]) {
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

  function calcularEstadisticas(materias: any[]) {
    if (!Array.isArray(materias)) return { totalMaterias: 0, aprobadas: 0, reprobadas: 0, promedio: 0 };
    
    const totalMaterias = materias.length;
    const aprobadas = materias.filter(m => parseFloat(m.calificacion) >= 70).length;
    const reprobadas = totalMaterias - aprobadas;
    
    const sumaCalificaciones = materias.reduce((suma, materia) => {
      return suma + (parseFloat(materia.calificacion) || 0);
    }, 0);
    const promedio = totalMaterias > 0 ? (sumaCalificaciones / totalMaterias).toFixed(2) : 0;
    
    return { totalMaterias, aprobadas, reprobadas, promedio };
  }

  $: materiasAgrupadas = kardex ? agruparPorSemestre(kardex) : {};
  $: estadisticas = kardex ? calcularEstadisticas(kardex) : { totalMaterias: 0, aprobadas: 0, reprobadas: 0, promedio: 0 };
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
        {#if porcentajeAvance}
          <div class="progress-info">
            <span class="progress-label">Avance de carrera:</span>
            <span class="progress-value">{porcentajeAvance}%</span>
          </div>
        {/if}
      </div>

      <!-- Estadísticas Generales -->
      {#if estadisticas.totalMaterias > 0}
        <div class="estadisticas-card">
          <h3>📊 Estadísticas Generales</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-number">{estadisticas.totalMaterias}</span>
              <span class="stat-label">Total Materias</span>
            </div>
            <div class="stat-item success">
              <span class="stat-number">{estadisticas.aprobadas}</span>
              <span class="stat-label">Aprobadas</span>
            </div>
            <div class="stat-item danger">
              <span class="stat-number">{estadisticas.reprobadas}</span>
              <span class="stat-label">Reprobadas</span>
            </div>
            <div class="stat-item info">
              <span class="stat-number">{estadisticas.promedio}</span>
              <span class="stat-label">Promedio General</span>
            </div>
          </div>
        </div>
      {/if}

      {#if Object.keys(materiasAgrupadas).length > 0}
        <div class="semestres-container">
          {#each Object.entries(materiasAgrupadas) as [semestre, materias]}
            <div class="semestre-section">
              <h3 class="semestre-title">Semestre {semestre}</h3>
              
              <div class="materias-table">
                <div class="table-header">
                  <div>Materia</div>
                  <div>Clave</div>
                  <div>Calificación</div>
                  <div>Créditos</div>
                  <div>Periodo</div>
                  <div>Tipo</div>
                </div>
                
                {#each materias as materia}
                  <div class="table-row">
                    <div class="materia-name">
                      <strong>{materia.nombre_materia}</strong>
                    </div>
                    <div class="materia-clave">{materia.clave_materia}</div>
                    <div class="calificacion" class:aprobada={parseFloat(materia.calificacion) >= 70}>
                      {materia.calificacion}
                    </div>
                    <div class="creditos">{materia.creditos}</div>
                    <div class="periodo">{materia.periodo}</div>
                    <div class="tipo">
                      <span class="tipo-badge" class:repeticion={materia.descripcion.includes('REPETICIÓN')}>
                        {materia.descripcion.includes('REPETICIÓN') ? 'Repetición' : 'Normal'}
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
    margin: 0 0 15px 0;
    opacity: 0.9;
  }

  .progress-info {
    background: rgba(255, 255, 255, 0.2);
    padding: 10px 20px;
    border-radius: 20px;
    display: inline-block;
    margin-top: 10px;
  }

  .progress-label {
    font-size: 0.9rem;
    margin-right: 8px;
  }

  .progress-value {
    font-size: 1.2rem;
    font-weight: bold;
  }

  .estadisticas-card {
    background: white;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    padding: 24px;
    margin-bottom: 30px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  .estadisticas-card h3 {
    margin: 0 0 20px 0;
    color: #1e40af;
    font-size: 1.3rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 20px;
  }

  .stat-item {
    text-align: center;
    padding: 20px;
    background: #f8fafc;
    border-radius: 12px;
    border: 2px solid #e2e8f0;
  }

  .stat-item.success {
    background: #ecfdf5;
    border-color: #a7f3d0;
  }

  .stat-item.danger {
    background: #fef2f2;
    border-color: #fca5a5;
  }

  .stat-item.info {
    background: #eff6ff;
    border-color: #93c5fd;
  }

  .stat-number {
    display: block;
    font-size: 2rem;
    font-weight: bold;
    color: #1e40af;
  }

  .stat-item.success .stat-number {
    color: #059669;
  }

  .stat-item.danger .stat-number {
    color: #dc2626;
  }

  .stat-item.info .stat-number {
    color: #2563eb;
  }

  .stat-label {
    display: block;
    font-size: 0.9rem;
    color: #64748b;
    margin-top: 8px;
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
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
    gap: 16px;
    padding: 16px 20px;
    background: #f1f5f9;
    font-weight: bold;
    color: #475569;
    border-bottom: 1px solid #e2e8f0;
  }

  .table-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
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
    font-size: 0.9rem;
  }

  .materia-clave {
    font-size: 0.8rem;
    color: #64748b;
    display: flex;
    align-items: center;
  }

  .calificacion {
    font-weight: bold;
    font-size: 1.1rem;
    color: #dc2626;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .calificacion.aprobada {
    color: #059669;
  }

  .creditos, .periodo {
    display: flex;
    align-items: center;
    color: #374151;
    font-size: 0.9rem;
  }

  .tipo {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .tipo-badge {
    background: #3b82f6;
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: bold;
  }

  .tipo-badge.repeticion {
    background: #f59e0b;
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
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    
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
      padding: 4px 0;
    }
    
    .table-row > div:before {
      content: attr(data-label);
      font-weight: bold;
      display: inline-block;
      width: 100px;
      color: #64748b;
    }
    
    .materia-name:before { content: "Materia: "; }
    .materia-clave:before { content: "Clave: "; }
    .calificacion:before { content: "Calificación: "; }
    .creditos:before { content: "Créditos: "; }
    .periodo:before { content: "Periodo: "; }
    .tipo:before { content: "Tipo: "; }
  }
</style>