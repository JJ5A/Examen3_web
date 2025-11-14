<script>
	import { createEventDispatcher } from 'svelte';
	import '../css/login.css';
	import { AuthService } from './auth.js';
	
	// Crear dispatcher para eventos
	const dispatch = createEventDispatcher();
	
	// Crear una instancia local del servicio
	const authService = new AuthService();
	
	// Props del componente
	let { 
		title = "Iniciar Sesión",
		submitButtonText = "Entrar",
		disabled = false,
		apiUrl = '/api/login', // URL de la API por defecto
		onlogin,
		onsuccess,
		onerror
	} = $props();

	// Estado reactivo del formulario
	let email = $state('');
	let password = $state('');
	let isLoading = $state(false);
	let errors = $state({
		email: '',
		password: ''
	});

	// Estado derivado para validar si el formulario está completo
	let isFormValid = $derived(email.trim() !== '' && password.trim() !== '');

	// Función para validar email
	function validateEmail(emailValue) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(emailValue);
	}

	// Función para limpiar errores
	function clearErrors() {
		errors = {
			email: '',
			password: ''
		};
	}

	// Función para realizar la petición de login
	async function performLogin(credentials) {
		return await authService.login(credentials.email, credentials.password, apiUrl);
	}

	// Función para manejar una respuesta exitosa
	function handleLoginSuccess(data) {
		// El token ya fue guardado por el AuthService (si la respuesta tiene el formato esperado)
		// Usar accesso seguro a propiedades para evitar errores si la respuesta no tiene el mismo shape
		const token = data?.message?.login?.token || data?.token || data?.accessToken || null;
		const userType = data?.type || data?.userType || authService.getUserType() || 'unknown';

		if (!token) {
			// Si no hay token, lanzar un error para que el flujo de error lo maneje
			handleLoginError(new Error('Token no recibido desde el servidor'), data);
			return;
		}

		// Garantizar que el token esté guardado en el servicio (por si el servidor devolvió token en otra propiedad)
		try {
			authService.setToken(token, userType);
		} catch (err) {
			console.warn('No se pudo guardar el token en authService:', err);
		}

		// Crear objeto de datos de éxito
		const successData = {
			token,
			userType,
			fullResponse: data
		};

		// Disparar evento de éxito
		dispatch('success', successData);

		// Llamar callback de éxito si existe
		if (onsuccess) {
			onsuccess(successData);
		}

		// También llamar onlogin para compatibilidad
		if (onlogin) {
			onlogin({
				email,
				password,
				token,
				success: true,
				data
			});
		}
	}

	// Función para manejar errores de login
	function handleLoginError(error, serverData = null) {
		let errorMessage = 'Error al iniciar sesión';
		
		if (serverData) {
			errorMessage = serverData.message || 'Credenciales incorrectas';
		} else {
			errorMessage = error.message || errorMessage;
		}

		// Crear objeto de error
		const errorData = {
			error: errorMessage,
			originalError: error,
			serverResponse: serverData
		};

		// Disparar evento de error
		dispatch('error', errorData);

		// Llamar callback de error si existe
		if (onerror) {
			onerror(errorData);
		}

		// También llamar onlogin para compatibilidad
		if (onlogin) {
			onlogin({
				email,
				password,
				success: false,
				error: errorMessage
			});
		}

		// Mostrar error en el formulario
		errors = {
			email: '',
			password: errorMessage
		};
	}

	// Función para manejar el submit del formulario
	async function handleSubmit(event) {
		event.preventDefault();
		clearErrors();

		// Validaciones
		let newErrors = {
			email: '',
			password: ''
		};
		
		if (!email.trim()) {
			newErrors.email = 'El email es requerido';
		} else if (!validateEmail(email)) {
			newErrors.email = 'El email no es válido';
		}

		if (!password.trim()) {
			newErrors.password = 'La contraseña es requerida';
		} else if (password.length < 6) {
			newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
		}

		if (newErrors.email || newErrors.password) {
			errors = newErrors;
			return;
		}

		// Realizar petición de login
		isLoading = true;

		try {
			const credentials = { email, password };
			const loginResponse = await performLogin(credentials);
			
			// Manejar respuesta exitosa
			handleLoginSuccess(loginResponse);
			
		} catch (error) {
			console.error('Error en login:', error);
			
			// Intentar obtener datos del servidor si la respuesta tiene contenido
			let serverData = null;
			if (error.response) {
				try {
					serverData = await error.response.json();
				} catch (parseError) {
					// No hay datos del servidor o no es JSON
				}
			}
			
			handleLoginError(error, serverData);
		} finally {
			isLoading = false;
		}
	}

	// Función para limpiar el formulario
	function clearForm() {
		email = '';
		password = '';
		clearErrors();
	}
</script>

<div class="login-container">
	<div class="login-background">
		<div class="login-card">
			<div class="login-header">
				<div class="login-icon">
					<img src="/itcelaya.webp" alt="Tecnológico de Celaya" />
				</div>
				<h2 class="login-title">{title}</h2>
				<p class="login-subtitle">Tecnológico Nacional de México en Celaya</p>
			</div>
			
			<form onsubmit={handleSubmit} class="login-form">
				<!-- Campo Email -->
				<div class="form-group">
					<div class="input-wrapper">
						<div class="input-icon">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
								<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
							</svg>
						</div>
						<input
							id="email"
							type="email"
							bind:value={email}
							disabled={disabled || isLoading}
							class="form-input"
							class:error={errors.email}
							placeholder="Correo electrónico"
							autocomplete="email"
						/>
					</div>
					{#if errors.email}
						<span class="error-message">{errors.email}</span>
					{/if}
				</div>

				<!-- Campo Contraseña -->
				<div class="form-group">
					<div class="input-wrapper">
						<div class="input-icon">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
								<path d="M7 10V7C7 5.34 8.34 4 10 4H14C15.66 4 17 5.34 17 7V10H18C18.55 10 19 10.45 19 11V20C19 20.55 18.55 21 18 21H6C5.45 21 5 20.55 5 20V11C5 10.45 5.45 10 6 10H7ZM9 7V10H15V7C15 6.45 14.55 6 14 6H10C9.45 6 9 6.45 9 7Z"/>
							</svg>
						</div>
						<input
							id="password"
							type="password"
							bind:value={password}
							disabled={disabled || isLoading}
							class="form-input"
							class:error={errors.password}
							placeholder="Contraseña"
							autocomplete="current-password"
						/>
					</div>
					{#if errors.password}
						<span class="error-message">{errors.password}</span>
					{/if}
				</div>
				<!-- Botón de envío -->
				<div class="form-actions">
					<button
						type="submit"
						disabled={!isFormValid || disabled || isLoading}
						class="submit-button"
						class:loading={isLoading}>
						{#if isLoading}
							<div class="loading-spinner"></div>
							Accediendo...
						{:else}
							<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;">
								<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
							</svg>
							{submitButtonText}
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
