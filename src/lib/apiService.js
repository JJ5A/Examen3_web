// Servicio genérico para hacer peticiones a la API

import { AuthService } from './auth.js';

/**
 * Clase para manejar peticiones genéricas a la API
 */
export class ApiService {
	constructor(authService, baseUrl = 'https://cetech.roque.tecnm.mx') {
		this.authService = authService;
		this.baseUrl = baseUrl;
	}

	/**
	 * Realiza una petición GET autenticada
	 * @param {string} endpoint - Endpoint de la API
	 * @param {Object} options - Opciones adicionales
	 * @returns {Promise<Object>} Respuesta de la API
	 */
	async get(endpoint, options = {}) {
		const token = this.authService.getToken();
		if (!token) {
			throw new Error('No hay token de autenticación');
		}

		const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
		
		try {
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					...options.headers
				},
				...options
			});

			return await this.handleResponse(response);
		} catch (error) {
			console.log('💥 API GET ERROR:', error);
			throw error;
		}
	}

	/**
	 * Realiza una petición POST autenticada
	 * @param {string} endpoint - Endpoint de la API
	 * @param {Object} data - Datos a enviar
	 * @param {Object} options - Opciones adicionales
	 * @returns {Promise<Object>} Respuesta de la API
	 */
	async post(endpoint, data = {}, options = {}) {
		const token = this.authService.getToken();
		if (!token) {
			throw new Error('No hay token de autenticación');
		}

		const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
		
		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					...options.headers
				},
				body: JSON.stringify(data),
				...options
			});

			return await this.handleResponse(response);
		} catch (error) {
			console.log('💥 API POST ERROR:', error);
			throw error;
		}
	}

	/**
	 * Realiza una petición PUT autenticada
	 * @param {string} endpoint - Endpoint de la API
	 * @param {Object} data - Datos a enviar
	 * @param {Object} options - Opciones adicionales
	 * @returns {Promise<Object>} Respuesta de la API
	 */
	async put(endpoint, data = {}, options = {}) {
		const token = this.authService.getToken();
		if (!token) {
			throw new Error('No hay token de autenticación');
		}

		const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
		
		try {
			const response = await fetch(url, {
				method: 'PUT',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					...options.headers
				},
				body: JSON.stringify(data),
				...options
			});

			return await this.handleResponse(response);
		} catch (error) {
			console.log('💥 API PUT ERROR:', error);
			throw error;
		}
	}

	/**
	 * Realiza una petición DELETE autenticada
	 * @param {string} endpoint - Endpoint de la API
	 * @param {Object} options - Opciones adicionales
	 * @returns {Promise<Object>} Respuesta de la API
	 */
	async delete(endpoint, options = {}) {
		const token = this.authService.getToken();
		if (!token) {
			throw new Error('No hay token de autenticación');
		}

		const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
		
		try {
			const response = await fetch(url, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					...options.headers
				},
				...options
			});

			return await this.handleResponse(response);
		} catch (error) {
			console.log('💥 API DELETE ERROR:', error);
			throw error;
		}
	}

	/**
	 * Maneja la respuesta de la API
	 * @param {Response} response - Respuesta de fetch
	 * @returns {Promise<Object>} Datos de la respuesta
	 */
	async handleResponse(response) {
		console.log('📡 API RESPONSE STATUS:', response.status);
		console.log('📡 API RESPONSE OK:', response.ok);

		if (!response.ok) {
			// Si es 401, el token expiró
			if (response.status === 401) {
				this.authService.logout();
				throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
			}

			let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
			try {
				const errorData = await response.json();
				errorMessage = errorData.message || errorMessage;
				console.log('❌ API ERROR DATA:', errorData);
			} catch (e) {
				console.log('❌ Could not parse error response');
			}
			throw new Error(errorMessage);
		}

		try {
			const data = await response.json();
			console.log('📨 API RESPONSE DATA:', data);
			return data;
		} catch (error) {
			console.log('❌ Could not parse JSON response');
			throw new Error('Error al procesar la respuesta del servidor');
		}
	}

	/**
	 * Verifica si el servicio está disponible
	 * @returns {Promise<boolean>} True si está disponible
	 */
	async isServiceAvailable() {
		try {
			const response = await fetch(`${this.baseUrl}/api/health`, {
				method: 'GET',
				headers: {
					'Accept': 'application/json'
				}
			});
			return response.ok;
		} catch (error) {
			return false;
		}
	}
}

// Crear instancia por defecto
import { authService } from './auth.js';
export const apiService = new ApiService(authService);

// Funciones de conveniencia
export const apiGet = (endpoint, options) => apiService.get(endpoint, options);
export const apiPost = (endpoint, data, options) => apiService.post(endpoint, data, options);
export const apiPut = (endpoint, data, options) => apiService.put(endpoint, data, options);
export const apiDelete = (endpoint, options) => apiService.delete(endpoint, options);