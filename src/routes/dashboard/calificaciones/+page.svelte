<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { AuthService } from '$lib/auth.js';
  import '../../../css/demo.css';

  const authService = new AuthService();
  
  let calificacionesData: any = null;
  let isLoading: boolean = true;
  let error: string | null = null;

  onMount(async () => {
    console.log('🎯 CALIFICACIONES - Iniciando...');
    
    if (!authService.isAuthenticated()) {
      console.log('❌ No está autenticado, redirigiendo...');
      goto('/');
      return;
    }

    try {
      console.log('📡 Cargando calificaciones...');
      
      const response = await authService.authenticatedFetch('/api/movil/estudiante/calificaciones');
      
      if (response.ok) {
        const data = await response.json();
        console.log('📨 Calificaciones recibidas:', data);
        
        // Extraer los datos según el formato del JSON
        if (data.flag && data.data && Array.isArray(data.data)) {
          calificacionesData = data.data;
          console.log('✅ Calificaciones procesadas:', calificacionesData);
        } else {
          throw new Error('Formato de respuesta incorrecto');
        }
      } else {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (err: any) {
      console.error('💥 Error al cargar calificaciones:', err);
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

  function calcularPromedioParcial(calificaciones: any[]): number | string {
    const calificacionesValidas = calificaciones.filter((c: any) => c.calificacion !== null && c.calificacion !== '');
    if (calificacionesValidas.length === 0) return 'N/A';
    
    const suma = calificacionesValidas.reduce((sum: number, c: any) => sum + parseFloat(c.calificacion), 0);
    return parseFloat((suma / calificacionesValidas.length).toFixed(1));
  }

  function obtenerUltimaCalificacion(calificaciones: any[]) {
    const calificacionesValidas = calificaciones.filter((c: any) => c.calificacion !== null && c.calificacion !== '');
    if (calificacionesValidas.length === 0) return 'Sin calificar';
    
    return calificacionesValidas[calificacionesValidas.length - 1].calificacion;
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
  {:else if calificacionesData && calificacionesData.length > 0}
    <div class="calificaciones-content">
      {#each calificacionesData as periodoData}
        <div class="periodo-section">
          <div class="periodo-header">
            <h2>📅 {periodoData.periodo.descripcion_periodo}</h2>
            <p class="periodo-info">
              Periodo: <strong>{periodoData.periodo.clave_periodo}</strong> | 
              Año: <strong>{periodoData.periodo.anio}</strong>
            </p>
          </div>

          {#if periodoData.materias && periodoData.materias.length > 0}
            <div class="materias-grid">
              {#each periodoData.materias as materiaData}
                <div class="materia-card">
                  <div class="materia-header">
                    <div class="materia-info">
                      <h3>{materiaData.materia.nombre_materia}</h3>
                      <div class="materia-details">
                        <span class="clave">{materiaData.materia.clave_materia}</span>
                        <span class="grupo">Grupo {materiaData.materia.letra_grupo}</span>
                      </div>
                    </div>
                    <div class="promedio-badge" 
                         class:alta={typeof calcularPromedioParcial(materiaData.calificaiones) === 'number' && calcularPromedioParcial(materiaData.calificaiones) >= 90}
                         class:media={typeof calcularPromedioParcial(materiaData.calificaiones) === 'number' && calcularPromedioParcial(materiaData.calificaiones) >= 70 && calcularPromedioParcial(materiaData.calificaiones) < 90}
                         class:baja={typeof calcularPromedioParcial(materiaData.calificaiones) === 'number' && calcularPromedioParcial(materiaData.calificaiones) < 70}>
                      {calcularPromedioParcial(materiaData.calificaiones)}
                    </div>
                  </div>

                  <div class="calificaciones-parciales">
                    <h4>Calificaciones Parciales:</h4>
                    <div class="parciales-grid">
                      {#each materiaData.calificaiones as calificacion}
                        <div class="parcial-item"
                             class:aprobado={calificacion.calificacion !== null && parseFloat(calificacion.calificacion) >= 70}
                             class:reprobado={calificacion.calificacion !== null && parseFloat(calificacion.calificacion) < 70}>
                          <span class="parcial-numero">Parcial {calificacion.numero_calificacion}</span>
                          <span class="parcial-calificacion" 
                                class:calificado={calificacion.calificacion !== null}
                                class:pendiente={calificacion.calificacion === null}>
                            {calificacion.calificacion || 'Pendiente'}
                          </span>
                        </div>
                      {/each}
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <div class="no-materias">
              <p>No hay materias registradas para este periodo.</p>
            </div>
          {/if}
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

  .error-container h3 {
    color: #991b1b;
    margin-bottom: 10px;
  }

  .calificaciones-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
  }

  .periodo-section {
    margin-bottom: 40px;
  }

  .periodo-header {
    text-align: center;
    margin-bottom: 30px;
    padding: 24px;
    background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
    color: white;
    border-radius: 12px;
  }

  .periodo-header h2 {
    margin: 0 0 10px 0;
    font-size: 1.8rem;
  }

  .periodo-info {
    margin: 0;
    opacity: 0.9;
    font-size: 1.1rem;
  }

  .materias-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 24px;
  }

  .materia-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 24px;
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
    align-items: flex-start;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e2e8f0;
  }

  .materia-info h3 {
    margin: 0 0 8px 0;
    color: #1e40af;
    font-size: 1.2rem;
    line-height: 1.3;
  }

  .materia-details {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .clave, .grupo {
    background: #f1f5f9;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 0.8rem;
    color: #64748b;
    font-weight: 500;
  }

  .promedio-badge {
    background: #9ca3af;
    color: white;
    padding: 12px 16px;
    border-radius: 20px;
    font-weight: bold;
    font-size: 1.2rem;
    min-width: 80px;
    text-align: center;
    flex-shrink: 0;
  }

  .promedio-badge.alta {
    background: #059669;
  }

  .promedio-badge.media {
    background: #f59e0b;
  }

  .promedio-badge.baja {
    background: #dc2626;
  }

  .calificaciones-parciales h4 {
    margin: 0 0 16px 0;
    color: #374151;
    font-size: 1rem;
  }

  .parciales-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
  }

  .parcial-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px;
    background: #f8fafc;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    transition: all 0.3s ease;
  }

  .parcial-item.aprobado {
    background: #dcfce7;
    border-color: #86efac;
  }

  .parcial-item.reprobado {
    background: #fee2e2;
    border-color: #fca5a5;
  }

  .parcial-numero {
    font-size: 0.8rem;
    color: #64748b;
    margin-bottom: 4px;
  }

  .parcial-calificacion {
    font-size: 1.1rem;
    font-weight: bold;
  }

  .parcial-calificacion.calificado {
    color: #1e40af;
  }

  .parcial-item.aprobado .parcial-calificacion.calificado {
    color: #15803d;
  }

  .parcial-item.reprobado .parcial-calificacion.calificado {
    color: #dc2626;
  }

  .parcial-calificacion.pendiente {
    color: #9ca3af;
    font-style: italic;
  }

  .no-materias, .no-data {
    text-align: center;
    padding: 60px 20px;
    background: #f8fafc;
    border-radius: 12px;
    margin: 20px 0;
  }

  .no-materias h3, .no-data h3 {
    color: #64748b;
    margin-bottom: 10px;
  }

  .actions {
    text-align: center;
    padding: 20px;
    margin-top: 30px;
  }

  .action-button {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    transition: background 0.2s ease;
  }

  .action-button:hover {
    background: #2563eb;
  }

  .logout-button {
    background: #dc2626;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    margin-left: 12px;
    transition: background 0.2s ease;
  }

  .logout-button:hover {
    background: #b91c1c;
  }

  @media (max-width: 768px) {
    .materias-grid {
      grid-template-columns: 1fr;
    }
    
    .materia-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
    
    .promedio-badge {
      align-self: flex-start;
    }
    
    .parciales-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 480px) {
    .parciales-grid {
      grid-template-columns: 1fr;
    }
  }
</style>