<script>
	import '../css/login.css';
	
	// Props del componente
	let { 
		title = "Iniciar Sesión",
		submitButtonText = "Entrar",
		disabled = false,
		onlogin
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

		// Simular loading
		isLoading = true;

		try {
			// Llamar función de callback si existe
			if (onlogin) {
				await onlogin({ email, password });
			}
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
					class="submit-button"
				>
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
					class="clear-button"
				>
					Limpiar
				</button>
			</div>
		</form>
	</div>
</div>