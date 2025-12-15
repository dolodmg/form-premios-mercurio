export const API_BASE_URL = 'https://certificado.mktday.ar'

export const API_ENDPOINTS = {
    health: '/health',
    createRequest: '/requests',
    getRequest: (id: string) => `/requests/${id}`,
    login: '/admin/login',
    dashboard: '/admin/dashboard',
    listRequests: '/admin/requests',
    getRequestDetail: (id: string) => `/admin/requests/${id}`,
    updateRequest: (id: string) => `/admin/requests/${id}`,
    deleteRequest: (id: string) => `/admin/requests/${id}`,
    getPhoto: (id: string) => `/admin/requests/${id}/photo`,
    getCertificate: (id:string) => `/admin/certificates/${id}`,
    generateCertificate: (id: string) => `/admin/certificates/generate/${id}`,
    downloadCertificate: (id: string) => `/admin/certificates/download/${id}`,
    resendCertificate: (id: string) => `/admin/certificates/resend/${id}`,
    listTemplates: '/admin/templates',
    updateTemplate: (id: string) => `/admin/templates/${id}`,
    changePassword: '/admin/change-password',
}
export function getAuthHeaders(token: string) {
    return {
        'Authorization': `Bearer ${token}`,
    }
}
