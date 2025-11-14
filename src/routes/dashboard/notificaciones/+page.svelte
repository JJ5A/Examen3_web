<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { AuthService } from '$lib/auth.js';
  import '../../../css/dashboard-common.css';
  import '../../../css/notificaciones.css';

  const authService = new AuthService();
  
  let notifications: any[] = [];
  let isLoading: boolean = true;
  let error: string | null = null;

  // Datos simulados de notificaciones
  const mockNotifications = [
    {
      id: 1,
      type: 'importante',
      title: '📢 Período de Inscripciones',
      message: 'El período de inscripciones para el próximo semestre inicia el 15 de enero. Asegúrate de revisar tu horario y materias disponibles.',
      date: '2025-01-10',
      time: '09:00',
      read: false
    },
    {
      id: 2,
      type: 'recordatorio',
      title: '🗓️ Examen Final Programación',
      message: 'Recordatorio: Tu examen final de Programación Orientada a Objetos está programado para el 20 de enero a las 10:00 AM en el aula A-301.',
      date: '2025-01-15',
      time: '14:30',
      read: false
    },
    {
      id: 3,
      type: 'aviso',
      title: '📋 Calificaciones Disponibles',
      message: 'Las calificaciones del parcial 2 ya están disponibles en el sistema. Puedes consultarlas en la sección de Calificaciones.',
      date: '2025-01-08',
      time: '16:45',
      read: true
    },
    {
      id: 4,
      type: 'evento',
      title: '🎓 Conferencia Magistral',
      message: 'Conferencia sobre "Inteligencia Artificial en la Industria 4.0" el 25 de enero en el auditorio principal. ¡No te la pierdas!',
      date: '2025-01-12',
      time: '11:20',
      read: false
    },
    {
      id: 5,
      type: 'urgente',
      title: '⚠️ Cambio de Horario',
      message: 'URGENTE: La clase de Matemáticas del viernes se cambió al aula B-205 debido a mantenimiento en el aula original.',
      date: '2025-01-14',
      time: '08:15',
      read: false
    },
    {
      id: 6,
      type: 'recordatorio',
      title: '💳 Pago de Colegiatura',
      message: 'Te recordamos que el último día para realizar el pago de colegiatura sin recargo es el 30 de enero.',
      date: '2025-01-05',
      time: '12:00',
      read: true
    }
  ];

  onMount(() => {
    console.log('🔔 NOTIFICACIONES - Iniciando...');
    
    if (!authService.isAuthenticated()) {
      console.log('❌ No está autenticado, redirigiendo...');
      goto('/');
      return;
    }

    // Simular carga de datos
    setTimeout(() => {
      notifications = mockNotifications.sort((a, b) => {
        // Ordenar por fecha y hora, más recientes primero
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateB.getTime() - dateA.getTime();
      });
      isLoading = false;
      console.log('✅ Notificaciones cargadas:', notifications);
    }, 1000);
  });

  function goBack() {
    goto('/dashboard');
  }

  function handleLogout() {
    authService.logout();
    goto('/');
  }

  function markAsRead(notificationId: number) {
    notifications = notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
  }

  function markAllAsRead() {
    notifications = notifications.map(notif => ({ ...notif, read: true }));
  }

  function deleteNotification(notificationId: number) {
    notifications = notifications.filter(notif => notif.id !== notificationId);
  }

  function getNotificationIcon(type: string) {
    const icons: { [key: string]: string } = {
      importante: '📢',
      recordatorio: '🗓️',
      aviso: '📋',
      evento: '🎓',
      urgente: '⚠️'
    };
    return icons[type] || '📄';
  }

  function formatDate(dateStr: string, timeStr: string) {
    const date = new Date(`${dateStr} ${timeStr}`);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Hoy ${timeStr}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Ayer ${timeStr}`;
    } else {
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${timeStr}`;
    }
  }

  $: unreadCount = notifications.filter(n => !n.read).length;
</script>

<main class="dashboard-container">
  <div class="dashboard-header">
    <h1>🔔 Centro de Notificaciones</h1>
    <button on:click={goBack} class="action-button secondary">
      ← Regresar al Dashboard
    </button>
  </div>

  {#if isLoading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Cargando notificaciones...</p>
    </div>
  {:else if error}
    <div class="error-container">
      <h3>Error al cargar notificaciones</h3>
      <p>{error}</p>
      <button on:click={goBack} class="action-button">
        Volver al Dashboard
      </button>
      <button on:click={handleLogout} class="logout-button">
        Cerrar Sesión
      </button>
    </div>
  {:else}
    <div class="dashboard-content">
      <!-- Header de estadísticas -->
      <div class="notifications-header">
        <div class="notifications-stats">
          <div class="stat-card">
            <div class="stat-number">{notifications.length}</div>
            <div class="stat-label">Total</div>
          </div>
          <div class="stat-card unread">
            <div class="stat-number">{unreadCount}</div>
            <div class="stat-label">Sin Leer</div>
          </div>
          <div class="stat-card read">
            <div class="stat-number">{notifications.length - unreadCount}</div>
            <div class="stat-label">Leídas</div>
          </div>
        </div>
        
        {#if unreadCount > 0}
          <button class="mark-all-read-btn" on:click={markAllAsRead}>
            ✓ Marcar todas como leídas
          </button>
        {/if}
      </div>

      <!-- Lista de notificaciones -->
      {#if notifications.length > 0}
        <div class="notifications-list">
          {#each notifications as notification (notification.id)}
            <div class="notification-card {notification.type} {notification.read ? 'read' : 'unread'}">
              <div class="notification-header">
                <div class="notification-type-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                <div class="notification-title">{notification.title}</div>
                <div class="notification-date">
                  {formatDate(notification.date, notification.time)}
                </div>
                <div class="notification-actions">
                  {#if !notification.read}
                    <button class="mark-read-btn" on:click={() => markAsRead(notification.id)}>
                      👁️
                    </button>
                  {/if}
                  <button class="delete-btn" on:click={() => deleteNotification(notification.id)}>
                    🗑️
                  </button>
                </div>
              </div>
              <div class="notification-content">
                <p>{notification.message}</p>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="no-data-state">
          <div class="no-notifications-icon">🔔</div>
          <h3>No hay notificaciones</h3>
          <p>Cuando tengas nuevas notificaciones aparecerán aquí.</p>
        </div>
      {/if}
    </div>

    <div class="actions-footer">
      <button on:click={goBack} class="action-button">
        ← Regresar al Dashboard
      </button>
    </div>
  {/if}
</main>