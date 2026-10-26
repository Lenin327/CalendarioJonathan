/**
 * Lambda: SaveDayData
 * ----------------------------------------------------------
 * PUT /agenda/{date}
 * Headers: x-user-id, Content-Type: application/json
 * Body: { slots, tasks, notes, updatedAt? }
 *
 * Guarda (upsert) los datos del día en DynamoDB
 * ----------------------------------------------------------
 */

const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall } = require('@aws-sdk/util-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const TABLE_NAME = process.env.TABLE_NAME || 'agenda-items';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-user-id',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
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

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Body JSON inválido' }),
    };
  }

  const { slots = {}, tasks = [], notes = '' } = body;
  const updatedAt = new Date().toISOString();

  // DynamoDB no soporta objetos anidados complejos fácilmente —
  // guardamos slots y tasks como strings JSON para máxima compatibilidad
  const item = {
    userId,
    date,
    slots:     JSON.stringify(slots),
    tasks:     JSON.stringify(tasks),
    notes,
    updatedAt,
    // TTL: auto-eliminar en 2 años (opcional)
    ttl: Math.floor(Date.now() / 1000) + (2 * 365 * 24 * 60 * 60),
  };

  try {
    await client.send(new PutItemCommand({
      TableName: TABLE_NAME,
      Item: marshall(item),
    }));

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ slots, tasks, notes, updatedAt }),
    };
  } catch (err) {
    console.error('[SaveDayData] Error:', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Error guardando datos' }),
    };
  }
};
