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
  <div class="demo-header">
    <h1 style="font-size: 48px; color: #333;">
      <b>Dashboard - Tecnológico Nacional de México en Celaya</b>
    </h1>
  </div>

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
    <div class="dashboard-content">
      <div class="welcome-section">
        <h2>¡Bienvenido, {studentData.persona}!</h2>
        <p class="subtitle">Información académica actualizada</p>
      </div>

      <div class="student-dashboard">
        <!-- Información Personal -->
        <div class="info-card">
          <h3>📋 Información Personal</h3>
          <div class="info-grid">
            <div><strong>Nombre:</strong> {studentData.persona}</div>
            <div><strong>Número de Control:</strong> {studentData.numero_control}</div>
            <div><strong>Email:</strong> {studentData.email}</div>
            <div><strong>Semestre Actual:</strong> {studentData.semestre}</div>
          </div>
        </div>

        <!-- Rendimiento Académico -->
        <div class="info-card">
          <h3>📊 Rendimiento Académico</h3>
          <div class="info-grid">
            <div><strong>Promedio Ponderado:</strong> 
              <span class="grade">{parseFloat(studentData.promedio_ponderado).toFixed(2)}</span>
            </div>
            <div><strong>Promedio Aritmético:</strong> 
              <span class="grade">{parseFloat(studentData.promedio_aritmetico).toFixed(2)}</span>
            </div>
            <div><strong>Créditos Acumulados:</strong> {studentData.creditos_acumulados}</div>
            <div><strong>Porcentaje de Avance:</strong> 
              <span class="progress-badge">{studentData.porcentaje_avance}%</span>
            </div>
          </div>
        </div>

        <!-- Estadísticas de Materias -->
        <div class="info-card">
          <h3>📚 Estadísticas de Materias</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-number">{studentData.materias_cursadas}</span>
              <span class="stat-label">Materias Cursadas</span>
            </div>
            <div class="stat-item success">
              <span class="stat-number">{studentData.materias_aprobadas}</span>
              <span class="stat-label">Aprobadas</span>
            </div>
            <div class="stat-item warning">
              <span class="stat-number">{studentData.materias_reprobadas}</span>
              <span class="stat-label">Reprobadas</span>
            </div>
          </div>
        </div>

        <!-- Foto del Estudiante -->
        {#if studentData.foto}
          <div class="info-card photo-card">
            <h3>📷 Fotografía</h3>
            <div class="student-photo">
              <img src="data:image/jpeg;base64,{studentData.foto}" alt="Foto de {studentData.persona}" />
            </div>
          </div>
        {/if}
      </div>

      <!-- Acciones del Dashboard -->
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
        
        <div class="general-actions">
          <button on:click={refreshData} class="action-button">
            🔄 Actualizar Datos
          </button>
          <button on:click={handleLogout} class="logout-button">
            🚪 Cerrar Sesión
          </button>
        </div>
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

  .dashboard-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  .welcome-section {
    text-align: center;
    margin-bottom: 30px;
    padding: 30px;
    background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
    color: white;
    border-radius: 12px;
  }

  .welcome-section h2 {
    margin: 0 0 10px 0;
    font-size: 2rem;
  }

  .subtitle {
    margin: 0;
    opacity: 0.9;
    font-size: 1.1rem;
  }

  .student-dashboard {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }

  .info-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .info-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  .info-card h3 {
    margin: 0 0 16px 0;
    color: #1e40af;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .grade {
    font-weight: bold;
    color: #059669;
    font-size: 1.1rem;
  }

  .progress-badge {
    background: #3b82f6;
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-weight: bold;
    font-size: 0.9rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .stat-item {
    text-align: center;
    padding: 16px;
    background: #f8fafc;
    border-radius: 8px;
    border: 2px solid #e2e8f0;
  }

  .stat-item.success {
    background: #ecfdf5;
    border-color: #a7f3d0;
  }

  .stat-item.warning {
    background: #fef3c7;
    border-color: #fcd34d;
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

  .stat-item.warning .stat-number {
    color: #d97706;
  }

  .stat-label {
    display: block;
    font-size: 0.9rem;
    color: #64748b;
    margin-top: 4px;
  }

  .photo-card {
    text-align: center;
  }

  .student-photo img {
    width: 120px;
    height: 150px;
    object-fit: cover;
    border: 3px solid #e2e8f0;
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }

  .dashboard-actions {
    text-align: center;
    padding: 30px;
    border-top: 1px solid #e2e8f0;
  }

  .dashboard-actions h3 {
    margin: 0 0 24px 0;
    color: #1e40af;
    font-size: 1.4rem;
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

  .general-actions {
    display: flex;
    justify-content: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .general-actions button {
    margin: 0;
  }

  @media (max-width: 768px) {
    .welcome-section h2 {
      font-size: 1.5rem;
    }
    
    .student-dashboard {
      grid-template-columns: 1fr;
    }
    
    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
</style>