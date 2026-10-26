export const environment = {
  production: true,
  // ── AWS Config ──────────────────────────────────────────
  // Reemplaza con tu URL real de API Gateway
  // Ejemplo: 'https://abc123.execute-api.us-east-1.amazonaws.com/prod'
  apiUrl: 'https://TU_API_GATEWAY_URL.execute-api.us-east-1.amazonaws.com/prod',
  userId: 'user#jonathan',
  // Cambiar a false cuando el API de AWS esté configurado
  useLocalStorage: false,
};
