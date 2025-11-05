<script>
	import { Login } from '$lib';
	import '../css/demo.css';

	// Estado para mostrar la respuesta del login
	let loginResult = $state('');
	let showResult = $state(false);

	// Función que maneja el evento de login
	async function handleLogin(data) {
		console.log('Datos de login:', data);
		
		// Simular una petición al servidor
		await new Promise(resolve => setTimeout(resolve, 1500));
		
		// Simular respuesta exitosa o de error
		const isSuccess = Math.random() > 0.3; // 70% de probabilidad de éxito
		
		if (isSuccess) {
			loginResult = '¡Bienvenido! Has iniciado sesión con: ' + data.email;
		} else {
			loginResult = 'Error: Credenciales incorrectas. Inténtalo de nuevo.';
		}
		
		showResult = true;
		
		// Ocultar el resultado después de 5 segundos
		setTimeout(() => {
			showResult = false;
		}, 5000);
	}
</script>

<main class="demo-container">
	<div class="demo-header">
		<h1>Demo del Componente Login</h1>
		<p>Este es un ejemplo de uso del componente Login de Svelte 5</p>
	</div>

	<!-- Resultado del login -->
	{#if showResult}
		<div class="result-container" class:success={loginResult.includes('Bienvenido')} class:error={loginResult.includes('Error')}>
			{loginResult}
		</div>
	{/if}

	<!-- Componente Login -->
	<Login 
		title="Acceder a mi cuenta"
		submitButtonText="Iniciar Sesión"
		onlogin={handleLogin}
	/>

	<!-- Información adicional -->
	<div class="info-section">
		<h2>Características del componente:</h2>
		<ul>
			<li>✅ Validación de email en tiempo real</li>
			<li>✅ Validación de contraseña (mínimo 6 caracteres)</li>
			<li>✅ Estado de carga con spinner</li>
			<li>✅ Manejo de errores</li>
			<li>✅ Botón para limpiar formulario</li>
			<li>✅ Diseño responsive</li>
			<li>✅ Accesibilidad completa</li>
			<li>✅ Svelte 5 con runes ($state, $derived, $props)</li>
		</ul>

		<h3>Cómo usar:</h3>
		<pre><code>&lt;script&gt;
	import &#123; Login &#125; from '$lib';

	function handleLogin(data) &#123;
		console.log('Email:', data.email);
		console.log('Password:', data.password);
		// Aquí enviarías los datos a tu API
	&#125;
&lt;/script&gt;

&lt;Login 
	title="Mi Login"
	submitButtonText="Entrar"
	onlogin=&#123;handleLogin&#125;
/&gt;</code></pre>
	</div>
</main>
