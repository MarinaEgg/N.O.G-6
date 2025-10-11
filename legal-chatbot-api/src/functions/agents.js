const { app } = require('@azure/functions');
const cosmosService = require('../services/cosmosService');

app.http('agents', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'agents',
  handler: async (request, context) => {
    try {
      const agents = await cosmosService.queryItems('agents', 'SELECT * FROM c');

      return {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        body: JSON.stringify({
          success: true,
          data: agents,
          error: null
        })
      };
    } catch (error) {
      context.log.error('Erreur dans agents endpoint:', error);
      return {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        body: JSON.stringify({
          success: false,
          data: null,
          error: 'Erreur lors de la récupération des agents'
        })
      };
    }
  }
});
