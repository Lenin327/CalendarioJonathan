export const environment = {
  production: false,
  // ── AWS Config ──────────────────────────────────────────
  // Reemplaza esta URL cuando configures tu API Gateway en AWS
  // Ejemplo: 'https://xxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod'
  apiUrl: '',
  // ID del usuario (sin auth por ahora - fase 1)
  userId: 'user#jonathan',
  // Si true, usa LocalStorage en lugar del API de AWS
  useLocalStorage: true,
};
