/**
 * CRUD Cosmos via Azure Functions
 * Exposé : window.cosmosService
 */
(function() {
  const API_URL = 'https://legal-chatbot-api-fwbqdwa0fecdc9bc.eastus2-01.azurewebsites.net/api';

  class CosmosService {
    constructor() {
      this.baseUrl = API_URL;
    }

    async request(endpoint, options = {}) {
      const url = `${this.baseUrl}${endpoint}`;
      const config = {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options
      };

      try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Cosmos API Error');
        }
        
        return data.data;
      } catch (error) {
        console.error(`Cosmos Error [${endpoint}]:`, error);
        throw error;
      }
    }

    async checkHealth() {
      return this.request('/health');
    }

    async getAgents() {
      return this.request('/agents');
    }

    async getConversations(userId) {
      return this.request(`/conversations?userId=${userId}`);
    }

    async createConversation(userId, title) {
      return this.request('/conversations', {
        method: 'POST',
        body: JSON.stringify({ userId, title })
      });
    }

    async getMessages(conversationId) {
      return this.request(`/messages?conversationId=${conversationId}`);
    }

    async createMessage(conversationId, userId, content, role) {
      return this.request('/messages', {
        method: 'POST',
        body: JSON.stringify({ conversationId, userId, content, role })
      });
    }
  }

  window.cosmosService = new CosmosService();
  console.log('✅ CosmosService loaded');
})();
