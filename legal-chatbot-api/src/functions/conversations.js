const { app } = require('@azure/functions');
const cosmosService = require('../services/cosmosService');

app.http('conversations-get', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'conversations',
  handler: async (request, context) => {
    try {
      const userId = request.query.get('userId');
      
      if (!userId) {
        return {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'http://localhost:3000',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          },
          body: JSON.stringify({
            success: false,
            data: null,
            error: 'userId est requis'
          })
        };
      }

      const query = {
        query: 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.lastMessageAt DESC',
        parameters: [{ name: '@userId', value: userId }]
      };

      const conversations = await cosmosService.queryItems('conversations', query);

      return {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        body: JSON.stringify({
          success: true,
          data: conversations,
          error: null
        })
      };
    } catch (error) {
      context.log.error('Erreur dans GET conversations endpoint:', error);
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
          error: 'Erreur lors de la récupération des conversations'
        })
      };
    }
  }
});

app.http('conversations-post', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'conversations',
  handler: async (request, context) => {
    try {
      const body = await request.json();
      
      if (!body.userId || !body.title) {
        return {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'http://localhost:3000',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          },
          body: JSON.stringify({
            success: false,
            data: null,
            error: 'userId et title sont requis'
          })
        };
      }

      const conversation = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        userId: body.userId,
        title: body.title,
        createdAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString()
      };

      const createdConversation = await cosmosService.createItem('conversations', conversation);

      return {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        body: JSON.stringify({
          success: true,
          data: createdConversation,
          error: null
        })
      };
    } catch (error) {
      context.log.error('Erreur dans POST conversations endpoint:', error);
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
          error: 'Erreur lors de la création de la conversation'
        })
      };
    }
  }
});
