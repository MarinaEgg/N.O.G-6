const { app } = require('@azure/functions');
const cosmosService = require('../services/cosmosService');

app.http('messages-get', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'messages',
  handler: async (request, context) => {
    try {
      const conversationId = request.query.get('conversationId');
      
      if (!conversationId) {
        return {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          },
          body: JSON.stringify({
            success: false,
            data: null,
            error: 'conversationId est requis'
          })
        };
      }

      const query = {
        query: 'SELECT * FROM c WHERE c.conversationId = @conversationId ORDER BY c.timestamp ASC',
        parameters: [{ name: '@conversationId', value: conversationId }]
      };

      const messages = await cosmosService.queryItems('messages', query);

      return {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        body: JSON.stringify({
          success: true,
          data: messages,
          error: null
        })
      };
    } catch (error) {
      context.log.error('Erreur dans GET messages endpoint:', error);
      return {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        body: JSON.stringify({
          success: false,
          data: null,
          error: 'Erreur lors de la récupération des messages'
        })
      };
    }
  }
});

app.http('messages-post', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'messages',
  handler: async (request, context) => {
    try {
      const body = await request.json();
      
      if (!body.conversationId || !body.userId || !body.content || !body.role) {
        return {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          },
          body: JSON.stringify({
            success: false,
            data: null,
            error: 'conversationId, userId, content et role sont requis'
          })
        };
      }

      const message = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        conversationId: body.conversationId,
        userId: body.userId,
        content: body.content,
        role: body.role,
        timestamp: new Date().toISOString()
      };

      const createdMessage = await cosmosService.createItem('messages', message);

      return {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        body: JSON.stringify({
          success: true,
          data: createdMessage,
          error: null
        })
      };
    } catch (error) {
      context.log.error('Erreur dans POST messages endpoint:', error);
      return {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        body: JSON.stringify({
          success: false,
          data: null,
          error: 'Erreur lors de la création du message'
        })
      };
    }
  }
});
