<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { AuthService } from '$lib/auth.js';
  import '../../../css/demo.css';

  const authService = new AuthService();
  
  let horariosData: any = null;
  let isLoading: boolean = true;
  let error: string | null = null;

  onMount(async () => {
    console.log('🎯 HORARIOS - Iniciando...');
    
    if (!authService.isAuthenticated()) {
      console.log('❌ No está autenticado, redirigiendo...');
      goto('/');
      return;
    }

    try {
      console.log('📡 Cargando horarios...');
      
      const response = await authService.authenticatedFetch('/api/movil/estudiante/horarios');
      
      if (response.ok) {
        const data = await response.json();
        console.log('📨 Horarios recibidos:', data);
        
        // Extraer los datos según el formato del JSON
        if (data.flag && data.data && Array.isArray(data.data)) {
          horariosData = data.data;
          console.log('✅ Horarios procesados:', horariosData);
        } else {
          throw new Error('Formato de respuesta incorrecto');
        }
      } else {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (err: any) {
      console.error('💥 Error al cargar horarios:', err);
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

  function formatearDia(dia: string) {
    const dias: { [key: string]: string } = {
      'lunes': 'Lunes',
      'martes': 'Martes', 
      'miercoles': 'Miércoles',
      'jueves': 'Jueves',
      'viernes': 'Viernes',
      'sabado': 'Sábado'
    };
    return dias[dia] || dia;
  }

  function formatearHora(hora: string) {
    if (!hora) return '';
    return hora.replace('-', ' - ');
  }
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
  {:else if horariosData && horariosData.length > 0}
    <div class="horarios-content">
      {#each horariosData as periodoData}
        <div class="periodo-section">
          <div class="periodo-header">
            <h2>📅 {periodoData.periodo.descripcion_periodo}</h2>
            <p class="periodo-info">
              Periodo: <strong>{periodoData.periodo.clave_periodo}</strong> | 
              Año: <strong>{periodoData.periodo.anio}</strong>
            </p>
          </div>

          <!-- Vista por días de la semana -->
          <div class="horarios-semana">
            <h3>📅 Horario Semanal</h3>
            <div class="dias-grid">
              {#each ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'] as dia}
                <div class="dia-card">
                  <h4 class="dia-titulo">{formatearDia(dia)}</h4>
                  <div class="materias-dia">
                    {#each periodoData.horario.filter(materia => materia[dia] !== null) as materia}
                      <div class="materia-horario">
                        <div class="hora-badge">
                          {formatearHora(materia[dia])}
                        </div>
                        <div class="materia-info">
                          <div class="materia-nombre">{materia.nombre_materia}</div>
                          <div class="materia-clave">{materia.clave_materia}</div>
                          <div class="materia-salon">🏫 {materia[`${dia}_clave_salon`]}</div>
                          <div class="materia-grupo">👥 Grupo {materia.letra_grupo}</div>
                        </div>
                      </div>
                    {/each}
                    {#if periodoData.horario.filter(materia => materia[dia] !== null).length === 0}
                      <div class="sin-clases">
                        <span>Sin clases</span>
                      </div>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          </div>

          <!-- Vista de tabla completa -->
          <div class="tabla-horarios">
            <h3>📊 Vista de Tabla Completa</h3>
            <div class="table-container">
              <table class="horario-table">
                <thead>
                  <tr>
                    <th>Materia</th>
                    <th>Clave</th>
                    <th>Grupo</th>
                    <th>Lunes</th>
                    <th>Martes</th>
                    <th>Miércoles</th>
                    <th>Jueves</th>
                    <th>Viernes</th>
                    <th>Sábado</th>
                  </tr>
                </thead>
                <tbody>
                  {#each periodoData.horario as materia}
                    <tr>
                      <td class="materia-cell">
                        <strong>{materia.nombre_materia}</strong>
                      </td>
                      <td class="clave-cell">{materia.clave_materia}</td>
                      <td class="grupo-cell">Grupo {materia.letra_grupo}</td>
                      {#each ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'] as dia}
                        <td class="horario-cell">
                          {#if materia[dia]}
                            <div class="horario-info">
                              <div class="tiempo">{formatearHora(materia[dia])}</div>
                              <div class="salon">{materia[`${dia}_clave_salon`]}</div>
                            </div>
                          {:else}
                            <span class="sin-clase">-</span>
                          {/if}
                        </td>
                      {/each}
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="no-data">
      <h3>No hay horarios disponibles</h3>
      <p>No se encontraron horarios para mostrar.</p>
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
    background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
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

  .horarios-semana {
    margin-bottom: 40px;
  }

  .horarios-semana h3 {
    color: #1e40af;
    margin-bottom: 20px;
    font-size: 1.4rem;
    text-align: center;
  }

  .dias-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }

  .dia-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  .dia-titulo {
    background: #f8fafc;
    padding: 16px;
    margin: 0;
    color: #1e40af;
    font-size: 1.1rem;
    text-align: center;
    border-bottom: 1px solid #e2e8f0;
  }

  .materias-dia {
    padding: 16px;
    min-height: 100px;
  }

  .materia-horario {
    border: 1px solid #f1f5f9;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
    background: #fafafa;
    transition: background 0.2s ease;
  }

  .materia-horario:last-child {
    margin-bottom: 0;
  }

  .materia-horario:hover {
    background: #f1f5f9;
  }

  .hora-badge {
    background: #d97706;
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: bold;
    margin-bottom: 8px;
    text-align: center;
    display: inline-block;
  }

  .materia-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .materia-nombre {
    font-weight: bold;
    color: #1e40af;
    font-size: 0.9rem;
  }

  .materia-clave,
  .materia-salon,
  .materia-grupo {
    font-size: 0.8rem;
    color: #64748b;
  }

  .sin-clases {
    text-align: center;
    padding: 30px;
    color: #9ca3af;
    font-style: italic;
  }

  .tabla-horarios {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    margin-top: 30px;
  }

  .tabla-horarios h3 {
    background: #f8fafc;
    padding: 16px 24px;
    margin: 0;
    color: #1e40af;
    border-bottom: 1px solid #e2e8f0;
  }

  .table-container {
    overflow-x: auto;
  }

  .horario-table {
    width: 100%;
    border-collapse: collapse;
  }

  .horario-table th {
    background: #f1f5f9;
    padding: 12px 8px;
    text-align: left;
    font-weight: bold;
    color: #475569;
    border-bottom: 1px solid #e2e8f0;
    font-size: 0.9rem;
  }

  .horario-table td {
    padding: 12px 8px;
    border-bottom: 1px solid #f1f5f9;
    color: #374151;
    font-size: 0.85rem;
    vertical-align: top;
  }

  .horario-table tr:hover td {
    background: #fafafa;
  }

  .materia-cell strong {
    color: #1e40af;
    font-size: 0.9rem;
  }

  .clave-cell {
    font-weight: 500;
    color: #64748b;
  }

  .grupo-cell {
    color: #64748b;
  }

  .horario-cell {
    min-width: 80px;
  }

  .horario-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .tiempo {
    font-weight: bold;
    color: #d97706;
    font-size: 0.8rem;
  }

  .salon {
    font-size: 0.75rem;
    color: #64748b;
    background: #f1f5f9;
    padding: 2px 6px;
    border-radius: 4px;
  }

  .sin-clase {
    color: #9ca3af;
    text-align: center;
    display: block;
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
    margin-top: 30px;
  }

  .action-button {
    background: #d97706;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    transition: background 0.2s ease;
  }

  .action-button:hover {
    background: #b45309;
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
    .dias-grid {
      grid-template-columns: 1fr;
    }

    .horario-table th,
    .horario-table td {
      padding: 8px 4px;
      font-size: 0.75rem;
    }
    
    .horario-table th:nth-child(n+4),
    .horario-table td:nth-child(n+4) {
      min-width: 60px;
    }
  }

  @media (max-width: 480px) {
    .table-container {
      font-size: 0.7rem;
    }
    
    .horario-table th,
    .horario-table td {
      padding: 6px 2px;
    }
  }
</style>