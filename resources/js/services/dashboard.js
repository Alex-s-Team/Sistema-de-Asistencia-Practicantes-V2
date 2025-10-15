// ============================================================================
// resources/js/services/dashboard.js - SERVICIOS DEL DASHBOARD
// ============================================================================
import api from './api';

export const dashboardService = {
  async getEstadisticas(mes = null, anio = null) {
    const params = {};
    if (mes) params.mes = mes;
    if (anio) params.anio = anio;
    
    const response = await api.get('/dashboard/estadisticas', { params });
    return response.data;
  }
};