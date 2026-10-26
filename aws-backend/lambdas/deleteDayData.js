/**
 * Lambda: DeleteDayData
 * ----------------------------------------------------------
 * DELETE /agenda/{date}
 * Headers: x-user-id
 *
 * Elimina todos los datos de un día específico
 * ----------------------------------------------------------
 */

const { DynamoDBClient, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');
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

  try {
    await client.send(new DeleteItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({ userId, date }),
    }));

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: `Datos del ${date} eliminados` }),
    };
  } catch (err) {
    console.error('[DeleteDayData] Error:', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Error eliminando datos' }),
    };
  }
};
