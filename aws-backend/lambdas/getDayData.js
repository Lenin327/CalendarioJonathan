/**
 * Lambda: GetDayData
 * ----------------------------------------------------------
 * GET /agenda/{date}
 * Headers: x-user-id (ej: "user#jonathan")
 *
 * Respuesta: { slots, tasks, notes } o {} si no existe
 * ----------------------------------------------------------
 */

const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const TABLE_NAME = process.env.TABLE_NAME || 'agenda-items';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',        // <-- cambiar por tu URL de GitHub Pages en producción
  'Access-Control-Allow-Headers': 'Content-Type, x-user-id',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  // Preflight CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  const userId = event.headers?.['x-user-id'] || 'user#default';
  const date   = event.pathParameters?.date;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Formato de fecha inválido. Use YYYY-MM-DD' }),
    };
  }

  try {
    const result = await client.send(new GetItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({ userId, date }),
    }));

    if (!result.Item) {
      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(null) };
    }

    const item = unmarshall(result.Item);
    // Parsear los campos JSON almacenados como string
    const dayData = {
      slots:     typeof item.slots === 'string'  ? JSON.parse(item.slots)  : (item.slots  || {}),
      tasks:     typeof item.tasks === 'string'  ? JSON.parse(item.tasks)  : (item.tasks  || []),
      notes:     item.notes     || '',
      updatedAt: item.updatedAt || null,
    };

    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(dayData) };
  } catch (err) {
    console.error('[GetDayData] Error:', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Error interno del servidor' }),
    };
  }
};
