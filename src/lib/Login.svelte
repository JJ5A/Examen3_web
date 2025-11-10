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
	<div class="login-card">
		<h2 class="login-title">{title}</h2>
		
		<form onsubmit={handleSubmit} class="login-form">
			<!-- Campo Email -->
			<div class="form-group">
				<label for="email" class="form-label">Email:</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					disabled={disabled || isLoading}
					class="form-input"
					class:error={errors.email}
					placeholder="ejemplo@correo.com"
					autocomplete="email"
				/>
				{#if errors.email}
					<span class="error-message">{errors.email}</span>
				{/if}
			</div>

			<!-- Campo Contraseña -->
			<div class="form-group">
				<label for="password" class="form-label">Contraseña:</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					disabled={disabled || isLoading}
					class="form-input"
					class:error={errors.password}
					placeholder="••••••••"
					autocomplete="current-password"
				/>
				{#if errors.password}
					<span class="error-message">{errors.password}</span>
				{/if}
			</div>
			<!-- Botones -->
			<div class="form-actions">
				<button
					type="submit"
					disabled={!isFormValid || disabled || isLoading}
					class="submit-button">
					{#if isLoading}
						<span class="loading-spinner"></span>
						Cargando...
					{:else}
						{submitButtonText}
					{/if}
				</button>
				<button
					type="button"
					onclick={clearForm}
					disabled={disabled || isLoading}
					class="clear-button">
					Limpiar
				</button>
			</div>
		</form>
	</div>
</div>
