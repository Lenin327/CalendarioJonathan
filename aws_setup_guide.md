# 🚀 Setup AWS Backend — Mi Agenda Diaria

## Arquitectura

```
GitHub Pages (Angular)  ──►  API Gateway  ──►  Lambda  ──►  DynamoDB
```

---

## PASO 1 — Crear la tabla en DynamoDB

1. Ir a [AWS Console → DynamoDB](https://console.aws.amazon.com/dynamodb/)
2. **Create table**
3. Configurar:
   - **Table name**: `agenda-items`
   - **Partition key**: `userId` (String)
   - **Sort key**: `date` (String)
4. **Table settings**: On-demand (sin costo fijo, pagas solo lo que usas)
5. **Crear tabla**

> [!TIP]
> Con On-demand capacity no tienes que pagar nada mientras no uses la app.

---

## PASO 2 — Crear las funciones Lambda

Crear **3 funciones Lambda** (una por cada operación):

### 2a. Crear función GetDayData

1. Ir a [AWS Lambda → Create function](https://console.aws.amazon.com/lambda/)
2. **Function name**: `agenda-GetDayData`
3. **Runtime**: Node.js 20.x
4. **Create function**
5. En **Code source**, reemplazar el código por el contenido de `aws-backend/lambdas/getDayData.js`
6. En **Configuration → Environment variables** agregar:
   - `TABLE_NAME` = `agenda-items`
   - `AWS_REGION` = `us-east-1` (o la región que uses)

### 2b. Crear función SaveDayData

Igual que 2a pero:
- **Function name**: `agenda-SaveDayData`
- Código: `aws-backend/lambdas/saveDayData.js`

### 2c. Crear función DeleteDayData

Igual que 2a pero:
- **Function name**: `agenda-DeleteDayData`
- Código: `aws-backend/lambdas/deleteDayData.js`

### Permisos IAM para las Lambdas

Cada Lambda necesita permisos para acceder a DynamoDB. En **Configuration → Permissions** de cada Lambda:

1. Hacer clic en el rol de ejecución
2. **Add permissions → Attach policies**
3. Buscar y adjuntar: `AmazonDynamoDBFullAccess`

> [!WARNING]
> Para producción, usa una política personalizada con solo los permisos mínimos necesarios (GetItem, PutItem, DeleteItem en la tabla específica).

---

## PASO 3 — Crear API Gateway

1. Ir a [AWS API Gateway → Create API](https://console.aws.amazon.com/apigateway/)
2. Elegir **REST API** → **Build**
3. **API name**: `agenda-api`
4. **Create API**

### Crear el recurso y métodos:

En el panel de recursos:

```
/
└── agenda
    └── {date}
        ├── GET     → Lambda: agenda-GetDayData
        ├── PUT     → Lambda: agenda-SaveDayData
        ├── DELETE  → Lambda: agenda-DeleteDayData
        └── OPTIONS → (para CORS)
```

**Pasos:**
1. **Actions → Create Resource** → Resource Name: `agenda`
2. Dentro de `/agenda`, **Create Resource** → Resource Name: `{date}` (habilitar "Configure as proxy resource" NO, Resource Path: `{date}`)
3. Con `{date}` seleccionado, **Create Method**:
   - Crear `GET` → Integration type: Lambda Function → `agenda-GetDayData`
   - Crear `PUT` → `agenda-SaveDayData`
   - Crear `DELETE` → `agenda-DeleteDayData`

### Habilitar CORS:

1. Seleccionar el recurso `{date}`
2. **Actions → Enable CORS**
3. En **Access-Control-Allow-Origin**: poner la URL de tu GitHub Pages:
   ```
   https://TU_USUARIO.github.io
   ```
   (o `*` para desarrollo)
4. **Enable CORS and replace existing CORS headers**

### Deploy del API:

1. **Actions → Deploy API**
2. **Deployment stage**: New Stage → Stage name: `prod`
3. **Deploy**

Copia la **Invoke URL** — se verá así:
```
https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod
```

---

## PASO 4 — Conectar el frontend con AWS

Edita [`src/environments/environment.prod.ts`](file:///home/lenin/Documents/Personal/CalendarioJonathan/src/environments/environment.prod.ts):

```typescript
export const environment = {
  production: true,
  // ← Pega aquí tu Invoke URL de API Gateway
  apiUrl: 'https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod',
  userId: 'user#jonathan',
  useLocalStorage: false,  // ← Cambiar a false para usar AWS
};
```

---

## PASO 5 — Deploy en GitHub Pages

```bash
# 1. Asegúrate de estar en un repo de GitHub
git remote add origin https://github.com/TU_USUARIO/CalendarioJonathan.git

# 2. Hacer push del código
git add .
git commit -m "feat: Angular agenda app with AWS backend"
git push -u origin main

# 3. Deploy a GitHub Pages
npm run deploy
```

El script de deploy (`npm run deploy`) hace:
```bash
ng build --configuration production --base-href /CalendarioJonathan/ 
npx angular-cli-ghpages --dir=dist/agenda-diaria/browser
```

La app quedará en:
```
https://TU_USUARIO.github.io/CalendarioJonathan/
```

---

## PASO 6 — Actualizar CORS en API Gateway (producción)

Una vez tengas la URL de GitHub Pages, actualiza las lambdas:

En cada archivo `.js` de las Lambdas, cambia:
```javascript
'Access-Control-Allow-Origin': '*',
// por:
'Access-Control-Allow-Origin': 'https://TU_USUARIO.github.io',
```

---

## Costos estimados AWS (uso personal)

| Servicio | Tier Gratuito | Costo extra |
|----------|---------------|-------------|
| DynamoDB | 25 GB gratis + 200M requests/mes | ~$0 uso personal |
| Lambda   | 1M requests/mes gratis | ~$0 uso personal |
| API Gateway | 1M calls/mes gratis (12 meses) | $3.50/M llamadas |

> [!TIP]
> Para uso personal (solo tú), el costo mensual debería ser **$0 o centavos** dentro del free tier.

---

## Resumen de archivos del backend

```
aws-backend/
├── lambdas/
│   ├── getDayData.js      → GET /agenda/{date}
│   ├── saveDayData.js     → PUT /agenda/{date}
│   └── deleteDayData.js   → DELETE /agenda/{date}
└── scripts/
    └── (aquí puedes poner scripts de prueba con curl)
```
