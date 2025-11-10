<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { AuthService } from '$lib/auth.js';
  import '../../../css/demo.css';

  const authService = new AuthService();
  
  let horarios = null;
  let isLoading = true;
  let error = null;

  onMount(async () => {
    console.log('🎯 HORARIOS - Iniciando...');
    
    if (!authService.isAuthenticated()) {
      console.log('❌ No está autenticado, redirigiendo...');
      goto('/');
      return;
    }

    try {
      console.log('📡 Cargando horarios...');
      
      const response = await authService.authenticatedFetch('/api/horarios');
      
      if (response.ok) {
        const data = await response.json();
        console.log('📨 Horarios recibidos:', data);
        horarios = data.data || data;
      } else {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('💥 Error al cargar horarios:', err);
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

  function organizarPorDia(materias) {
    if (!Array.isArray(materias)) return {};
    
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const horariosPorDia = {};
    
    dias.forEach(dia => {
      horariosPorDia[dia] = [];
    });
    
    materias.forEach(materia => {
      // Asumiendo que puede tener múltiples días
      const diasMateria = materia.dias || materia.dia || [];
      const diasArray = Array.isArray(diasMateria) ? diasMateria : [diasMateria];
      
      diasArray.forEach(dia => {
        const diaLimpio = dia?.trim();
        if (diaLimpio && horariosPorDia[diaLimpio]) {
          horariosPorDia[diaLimpio].push(materia);
        }
      });
    });
    
    // Ordenar por hora de inicio
    Object.keys(horariosPorDia).forEach(dia => {
      horariosPorDia[dia].sort((a, b) => {
        const horaA = a.hora_inicio || a.horaInicio || '00:00';
        const horaB = b.hora_inicio || b.horaInicio || '00:00';
        return horaA.localeCompare(horaB);
      });
    });
    
    return horariosPorDia;
  }

  $: horariosPorDia = horarios ? organizarPorDia(horarios) : {};
</script>

<main class="demo-container">
  <div class="demo-header">
    <h1 style="font-size: 48px; color: #333;">
      <b>🕒 Horarios de Clase</b>
    </h1>
    <button on:click={goBack} class="back-button">
      ← Regresar al Dashboard
    </button>
  </div>

  {#if isLoading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Cargando horarios...</p>
    </div>
  {:else if error}
    <div class="error-container">
      <h3>Error al cargar los horarios</h3>
      <p>{error}</p>
      <button on:click={goBack} class="action-button">
        Volver al Dashboard
      </button>
      <button on:click={handleLogout} class="logout-button">
        Cerrar Sesión
      </button>
    </div>
  {:else if horarios}
    <div class="horarios-content">
      <div class="content-header">
        <h2>Horario de Clases</h2>
        <p class="subtitle">Consulta tu horario semanal de clases</p>
      </div>

      {#if Object.keys(horariosPorDia).some(dia => horariosPorDia[dia].length > 0)}
        <div class="horarios-grid">
          {#each Object.entries(horariosPorDia) as [dia, materias]}
            {#if materias.length > 0}
              <div class="dia-card">
                <h3 class="dia-title">{dia}</h3>
                
                <div class="materias-dia">
                  {#each materias as materia}
                    <div class="materia-horario">
                      <div class="materia-time">
                        <span class="hora-inicio">{materia.hora_inicio || materia.horaInicio || 'N/A'}</span>
                        -
                        <span class="hora-fin">{materia.hora_fin || materia.horaFin || 'N/A'}</span>
                      </div>
                      
                      <div class="materia-info">
                        <div class="materia-nombre">
                          {materia.materia || materia.nombre || 'Materia sin nombre'}
                        </div>
                        
                        {#if materia.profesor}
                          <div class="materia-profesor">
                            👨‍🏫 {materia.profesor}
                          </div>
                        {/if}
                        
                        {#if materia.aula || materia.salon}
                          <div class="materia-aula">
                            🏫 {materia.aula || materia.salon}
                          </div>
                        {/if}
                        
                        {#if materia.grupo}
                          <div class="materia-grupo">
                            👥 Grupo {materia.grupo}
                          </div>
                        {/if}
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
          {/each}
        </div>
      {:else}
        <div class="no-data">
          <h3>No hay horarios disponibles</h3>
          <p>No se encontraron horarios para mostrar.</p>
        </div>
      {/if}

      <!-- Vista de tabla para pantallas más grandes -->
      {#if Array.isArray(horarios) && horarios.length > 0}
        <div class="tabla-horarios">
          <h3>Vista de Tabla</h3>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Materia</th>
                  <th>Profesor</th>
                  <th>Horario</th>
                  <th>Días</th>
                  <th>Aula</th>
                  <th>Grupo</th>
                </tr>
              </thead>
              <tbody>
                {#each horarios as materia}
                  <tr>
                    <td class="materia-cell">
                      <strong>{materia.materia || materia.nombre}</strong>
                    </td>
                    <td>{materia.profesor || 'N/A'}</td>
                    <td class="horario-cell">
                      {materia.hora_inicio || materia.horaInicio || 'N/A'} - 
                      {materia.hora_fin || materia.horaFin || 'N/A'}
                    </td>
                    <td>{Array.isArray(materia.dias) ? materia.dias.join(', ') : (materia.dia || 'N/A')}</td>
                    <td>{materia.aula || materia.salon || 'N/A'}</td>
                    <td>{materia.grupo || 'N/A'}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
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
    border-top: 4px solid #d97706;
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

  .horarios-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  .content-header {
    text-align: center;
    margin-bottom: 30px;
    padding: 20px;
    background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
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

  .horarios-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
  }

  .dia-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  .dia-title {
    background: #f8fafc;
    padding: 16px;
    margin: 0;
    color: #1e40af;
    font-size: 1.2rem;
    text-align: center;
    border-bottom: 1px solid #e2e8f0;
  }

  .materias-dia {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .materia-horario {
    border: 1px solid #f1f5f9;
    border-radius: 8px;
    padding: 12px;
    background: #fafafa;
    transition: background 0.2s ease;
  }

  .materia-horario:hover {
    background: #f1f5f9;
  }

  .materia-time {
    font-weight: bold;
    color: #d97706;
    font-size: 1.1rem;
    margin-bottom: 8px;
    text-align: center;
    padding: 8px;
    background: white;
    border-radius: 6px;
  }

  .materia-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .materia-nombre {
    font-weight: bold;
    color: #1e40af;
    font-size: 0.95rem;
  }

  .materia-profesor,
  .materia-aula,
  .materia-grupo {
    font-size: 0.85rem;
    color: #64748b;
  }

  .tabla-horarios {
    margin-top: 40px;
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  .tabla-horarios h3 {
    background: #f8fafc;
    padding: 16px;
    margin: 0;
    color: #1e40af;
    border-bottom: 1px solid #e2e8f0;
  }

  .table-container {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th {
    background: #f1f5f9;
    padding: 12px;
    text-align: left;
    font-weight: bold;
    color: #475569;
    border-bottom: 1px solid #e2e8f0;
  }

  td {
    padding: 12px;
    border-bottom: 1px solid #f1f5f9;
    color: #374151;
  }

  tr:hover td {
    background: #fafafa;
  }

  .materia-cell strong {
    color: #1e40af;
  }

  .horario-cell {
    font-weight: 500;
    color: #d97706;
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
    .horarios-grid {
      grid-template-columns: 1fr;
    }
    
    .tabla-horarios {
      display: none;
    }
  }
</style>