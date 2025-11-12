<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { AuthService } from '$lib/auth.js';
  import { StudentService } from '$lib/studentService.js';
  import '../../css/demo.css';

  // Crear instancias de los servicios
  const authService = new AuthService();
  const studentService = new StudentService(authService);

  // Estado para los datos del estudiante
  let studentData = null;
  let isLoading = true;
  let error = null;

  onMount(async () => {
    console.log('🎯 DASHBOARD MOUNT - Iniciando...');
    
    // Verificar si está autenticado
    if (!authService.isAuthenticated()) {
      console.log('❌ No está autenticado, redirigiendo...');
      // Si no está autenticado, redirigir al login
      goto('/');
      return;
    }

    console.log('✅ Usuario autenticado');
    console.log('🔑 Token presente:', !!authService.getToken());
    
    // Mostrar info del usuario desde el token
    const userInfo = authService.getUserInfo();
    console.log('👤 User Info:', userInfo);

    try {
      console.log('📡 Iniciando petición de datos del estudiante...');
      
      // Obtener datos del estudiante usando el servicio separado
      const response = await studentService.getStudentData();
      console.log('📨 Respuesta completa recibida:', response);
      
      if (response && response.data) {
        studentData = response.data;
        console.log('✅ Datos del estudiante cargados exitosamente:', studentData);
      } else {
        console.log('⚠️ Respuesta recibida pero sin datos:', response);
        error = 'La respuesta del servidor no contiene datos del estudiante';
      }
    } catch (err) {
      console.error('💥 Error al cargar datos del estudiante:', err);
      error = err.message;
      
      // Si hay error de autenticación, redirigir al login
      if (err.message.includes('401') || err.message.includes('token')) {
        authService.logout();
        goto('/');
      }
    } finally {
      isLoading = false;
    }
  });

  function handleLogout() {
    authService.logout();
    goto('/');
  }

  async function refreshData() {
    console.log('🔄 Refrescando datos...');
    isLoading = true;
    error = null;
    
    try {
      const response = await studentService.getStudentData();
      console.log('🔄 Datos refrescados:', response);
      
      if (response && response.data) {
        studentData = response.data;
      } else {
        error = 'La respuesta del servidor no contiene datos del estudiante';
      }
    } catch (err) {
      console.error('💥 Error al refrescar datos:', err);
      error = err.message;
    } finally {
      isLoading = false;
    }
  }
</script>

<main class="demo-container">
  {#if isLoading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Cargando datos del estudiante...</p>
    </div>
  {:else if error}
    <div class="error-container">
      <h3>Error al cargar los datos</h3>
      <p>{error}</p>
      <button on:click={refreshData} class="action-button">
        Reintentar
      </button>
      <button on:click={handleLogout} class="logout-button">
        Volver al Login
      </button>
    </div>
  {:else if studentData}
    <div class="dashboard-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-content">
          <!-- Foto del estudiante -->
          {#if studentData.foto}
            <div class="sidebar-photo">
              <img src="data:image/jpeg;base64,{studentData.foto}" alt="Foto de {studentData.persona}" />
            </div>
          {/if}

          <!-- Información Personal -->
          <div class="sidebar-section">
            <h3>📋 Información Personal</h3>
            <div class="sidebar-info">
              <div><strong>Nombre:</strong></div>
              <div>{studentData.persona}</div>
              
              <div><strong>Número de Control:</strong></div>
              <div>{studentData.numero_control}</div>
              
              <div><strong>Email:</strong></div>
              <div class="email-text">{studentData.email}</div>
              
              <div><strong>Semestre:</strong></div>
              <div>{studentData.semestre}</div>
            </div>
          </div>

          <!-- Rendimiento Académico -->
          <div class="sidebar-section">
            <h3>📊 Rendimiento</h3>
            <div class="sidebar-stats">
              <div class="stat-row">
                <span>Promedio Ponderado:</span>
                <span class="stat-value">{parseFloat(studentData.promedio_ponderado).toFixed(2)}</span>
              </div>
              <div class="stat-row">
                <span>Promedio Aritmético:</span>
                <span class="stat-value">{parseFloat(studentData.promedio_aritmetico).toFixed(2)}</span>
              </div>
              <div class="stat-row">
                <span>Créditos:</span>
                <span class="stat-value">{studentData.creditos_acumulados}</span>
              </div>
              <div class="stat-row">
                <span>Avance:</span>
                <span class="stat-value">{studentData.porcentaje_avance}%</span>
              </div>
            </div>
          </div>

          <!-- Estadísticas -->
          <div class="sidebar-section">
            <h3>📚 Materias</h3>
            <div class="sidebar-stats">
              <div class="stat-row">
                <span>Cursadas:</span>
                <span class="stat-value">{studentData.materias_cursadas}</span>
              </div>
              <div class="stat-row">
                <span>Aprobadas:</span>
                <span class="stat-value success">{studentData.materias_aprobadas}</span>
              </div>
              <div class="stat-row">
                <span>Reprobadas:</span>
                <span class="stat-value warning">{studentData.materias_reprobadas}</span>
              </div>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="sidebar-actions">
            <button on:click={refreshData} class="sidebar-button refresh">
              🔄 Actualizar Datos
            </button>
            <button on:click={handleLogout} class="sidebar-button logout">
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      <!-- Contenido principal -->
      <main class="main-content">
        <div class="welcome-section">
          <div class="welcome-text">
            <h2>¡Bienvenido, {studentData.persona}!</h2>
            <p class="subtitle">Información académica actualizada</p>
          </div>
        </div>

        <!-- Servicios Académicos -->
        <div class="dashboard-actions">
          <h3>📚 Servicios Académicos</h3>
          <div class="services-grid">
            <button class="service-button calificaciones" on:click={() => goto('/dashboard/calificaciones')}>
              <div class="service-icon">📊</div>
              <div class="service-title">Calificaciones</div>
              <div class="service-description">Ver mis calificaciones por materia</div>
            </button>
            
            <button class="service-button kardex" on:click={() => goto('/dashboard/kardex')}>
              <div class="service-icon">📋</div>
              <div class="service-title">Kardex</div>
              <div class="service-description">Historial académico completo</div>
            </button>
            
            <button class="service-button horarios" on:click={() => goto('/dashboard/horarios')}>
              <div class="service-icon">🕒</div>
              <div class="service-title">Horarios</div>
              <div class="service-description">Consultar horario de clases</div>
            </button>
          </div>
        </div>
      </main>
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

  .dashboard-layout {
    display: flex;
    gap: 20px;
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
    min-height: calc(100vh - 100px);
  }

  /* Sidebar Styles */
  .sidebar {
    width: 320px;
    flex-shrink: 0;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    height: fit-content;
    position: sticky;
    top: 20px;
  }

  .sidebar-content {
    padding: 24px;
  }

  .sidebar-photo {
    text-align: center;
    margin-bottom: 24px;
  }

  .sidebar-photo img {
    width: 150px;
    height: 180px;
    object-fit: cover;
    border: 3px solid #e2e8f0;
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }

  .sidebar-section {
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid #e2e8f0;
  }

  .sidebar-section:last-of-type {
    border-bottom: none;
    margin-bottom: 20px;
  }

  .sidebar-section h3 {
    margin: 0 0 16px 0;
    color: #1e40af;
    font-size: 1rem;
  }

  .sidebar-info {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 8px 12px;
    font-size: 0.9rem;
  }

  .sidebar-info > div:nth-child(odd) {
    color: #64748b;
  }

  .sidebar-info > div:nth-child(even) {
    color: #1e293b;
    font-weight: 500;
  }

  .email-text {
    word-break: break-word;
    font-size: 0.85rem !important;
  }

  .sidebar-stats {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9rem;
  }

  .stat-row > span:first-child {
    color: #64748b;
  }

  .stat-value {
    font-weight: bold;
    color: #1e40af;
    font-size: 1rem;
  }

  .stat-value.success {
    color: #059669;
  }

  .stat-value.warning {
    color: #d97706;
  }

  .sidebar-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 24px;
  }

  .sidebar-button {
    width: 100%;
    padding: 12px 16px;
    border: none;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .sidebar-button.refresh {
    background: #3b82f6;
    color: white;
  }

  .sidebar-button.refresh:hover {
    background: #2563eb;
    transform: translateY(-1px);
  }

  .sidebar-button.logout {
    background: #dc2626;
    color: white;
  }

  .sidebar-button.logout:hover {
    background: #b91c1c;
    transform: translateY(-1px);
  }

  /* Main Content Styles */
  .main-content {
    flex: 1;
    min-width: 0;
  }

  .welcome-section {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 30px;
    padding: 40px 30px;
    background: white;
    border: 3px solid #10b981;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .welcome-text {
    text-align: center;
  }

  .welcome-text h2 {
    margin: 0 0 10px 0;
    font-size: 2rem;
    color: #1e293b;
  }

  .subtitle {
    margin: 0;
    font-size: 1.1rem;
    color: #64748b;
  }

  .dashboard-actions {
    padding: 30px 0;
  }

  .dashboard-actions h3 {
    margin: 0 0 24px 0;
    color: #1e40af;
    font-size: 1.4rem;
    text-align: center;
  }

  .services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }

  .service-button {
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 16px;
    padding: 24px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    min-height: 160px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .service-button:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  }

  .service-button.calificaciones {
    border-color: #3b82f6;
  }

  .service-button.calificaciones:hover {
    background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
    color: white;
  }

  .service-button.kardex {
    border-color: #059669;
  }

  .service-button.kardex:hover {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    color: white;
  }

  .service-button.horarios {
    border-color: #d97706;
  }

  .service-button.horarios:hover {
    background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
    color: white;
  }

  .service-icon {
    font-size: 2.5rem;
    margin-bottom: 12px;
  }

  .service-title {
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 8px;
  }

  .service-description {
    font-size: 0.9rem;
    color: #64748b;
    line-height: 1.4;
  }

  .service-button:hover .service-description {
    color: rgba(255, 255, 255, 0.9);
  }

  @media (max-width: 1024px) {
    .dashboard-layout {
      flex-direction: column;
    }

    .sidebar {
      width: 100%;
      position: static;
    }
  }

  @media (max-width: 768px) {
    .welcome-text h2 {
      font-size: 1.5rem;
    }

    .services-grid {
      grid-template-columns: 1fr;
    }
  }
</style>