// Servicio para manejar datos de estudiantes

/**
 * Clase para manejar datos específicos del estudiante
 */
export class StudentService {
	constructor(authService) {
		this.authService = authService;
	}

	/**
	 * Obtiene los datos del estudiante autenticado
	 * @returns {Promise<Object>} Datos del estudiante
	 */
	async getStudentData() {
		const token = this.authService.getToken();
		if (!token) {
			throw new Error('No hay token de autenticación');
		}

		try {
			console.log('🔍 STUDENT REQUEST - Token:', token.substring(0, 20) + '...');
			
			const response = await fetch('/api/movil/estudiante', {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token}`,
					'User-Agent': 'insomnia/12.0.0'
				}
			});

			console.log('📡 STUDENT RESPONSE STATUS:', response.status);
			console.log('📡 STUDENT RESPONSE OK:', response.ok);

			if (!response.ok) {
				let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
				try {
					const errorData = await response.json();
					errorMessage = errorData.message || errorMessage;
					console.log('❌ STUDENT ERROR DATA:', errorData);
				} catch (e) {
					console.log('❌ Could not parse student error response');
				}
				throw new Error(errorMessage);
			}

			const data = await response.json();
			console.log('📨 STUDENT RESPONSE DATA:', data);
			return data;

		} catch (error) {
			console.log('💥 STUDENT DATA FETCH ERROR:', error);
			throw error;
		}
	}

	/**
	 * Obtiene el perfil académico del estudiante
	 * @returns {Promise<Object>} Perfil académico
	 */
	async getAcademicProfile() {
		const studentData = await this.getStudentData();
		if (!studentData?.data) {
			throw new Error('No se pudieron obtener los datos del estudiante');
		}

		const data = studentData.data;
		return {
			persona: data.persona,
			numeroControl: data.numero_control,
			email: data.email,
			semestre: data.semestre,
			carrera: data.carrera || 'No especificada',
			promedios: {
				ponderado: parseFloat(data.promedio_ponderado || 0).toFixed(2),
				aritmetico: parseFloat(data.promedio_aritmetico || 0).toFixed(2)
			},
			creditos: {
				acumulados: data.creditos_acumulados || 0,
				porcentajeAvance: data.porcentaje_avance || 0
			},
			materias: {
				cursadas: data.materias_cursadas || 0,
				aprobadas: data.materias_aprobadas || 0,
				reprobadas: data.materias_reprobadas || 0
			},
			foto: data.foto
		};
	}

	/**
	 * Obtiene solo la información básica del estudiante
	 * @returns {Promise<Object>} Información básica
	 */
	async getBasicInfo() {
		const studentData = await this.getStudentData();
		if (!studentData?.data) {
			throw new Error('No se pudieron obtener los datos del estudiante');
		}

		const data = studentData.data;
		return {
			nombre: data.persona,
			numeroControl: data.numero_control,
			email: data.email,
			semestre: data.semestre,
			foto: data.foto
		};
	}

	/**
	 * Obtiene las estadísticas académicas del estudiante
	 * @returns {Promise<Object>} Estadísticas académicas
	 */
	async getAcademicStats() {
		const studentData = await this.getStudentData();
		if (!studentData?.data) {
			throw new Error('No se pudieron obtener los datos del estudiante');
		}

		const data = studentData.data;
		const materiasTotal = data.materias_cursadas || 0;
		const materiasAprobadas = data.materias_aprobadas || 0;
		const materiasReprobadas = data.materias_reprobadas || 0;

		return {
			promedios: {
				ponderado: parseFloat(data.promedio_ponderado || 0),
				aritmetico: parseFloat(data.promedio_aritmetico || 0)
			},
			materias: {
				total: materiasTotal,
				aprobadas: materiasAprobadas,
				reprobadas: materiasReprobadas,
				porcentajeAprobacion: materiasTotal > 0 ? (materiasAprobadas / materiasTotal * 100).toFixed(1) : 0
			},
			creditos: {
				acumulados: data.creditos_acumulados || 0,
				porcentajeAvance: data.porcentaje_avance || 0
			},
			semestre: data.semestre
		};
	}
}

// Crear instancia por defecto que usa el AuthService por defecto
import { authService } from './auth.js';
export const studentService = new StudentService(authService);

// Funciones de conveniencia
export const getStudentData = () => studentService.getStudentData();
export const getAcademicProfile = () => studentService.getAcademicProfile();
export const getBasicInfo = () => studentService.getBasicInfo();
export const getAcademicStats = () => studentService.getAcademicStats();