/**
 * Service d'intégration Chat (Cosmos + RAG)
 * Exposé : window.chatIntegrationService
 */
(function() {
  class ChatIntegrationService {
    constructor() {
      this.currentUserId = null;
      this.currentConversationId = null;
    }

    setUserId(userId) {
      this.currentUserId = userId;
    }

    setConversationId(conversationId) {
      this.currentConversationId = conversationId;
    }

    async initializeUser(userId) {
      this.setUserId(userId);
      
      try {
        // Vérifier la santé des services
        await window.cosmosService.checkHealth();
        console.log('✅ Cosmos service ready');
        
        return { success: true, userId };
      } catch (error) {
        console.error('❌ Service initialization failed:', error);
        throw error;
      }
    }

    async startNewConversation(title = 'Nouvelle conversation') {
      if (!this.currentUserId) {
        throw new Error('User ID not set. Call initializeUser() first.');
      }

      try {
        // Créer conversation dans Cosmos
        const conversation = await window.cosmosService.createConversation(
          this.currentUserId, 
          title
        );
        
        this.setConversationId(conversation.id);
        
        return {
          success: true,
          conversation,
          conversationId: conversation.id
        };
      } catch (error) {
        console.error('❌ Failed to start conversation:', error);
        throw error;
      }
    }

    async sendMessage(messageContent) {
      if (!this.currentUserId || !this.currentConversationId) {
        throw new Error('User ID and Conversation ID must be set');
      }

      try {
        // 1. Sauvegarder message utilisateur dans Cosmos
        const userMessage = await window.cosmosService.createMessage(
          this.currentConversationId,
          this.currentUserId,
          messageContent,
          'user'
        );

        // 2. Envoyer au RAG pour obtenir la réponse
        const ragResponse = await window.ragService.sendMessage(
          messageContent,
          this.currentConversationId,
          this.currentUserId
        );

        // 3. Sauvegarder réponse assistant dans Cosmos
        const assistantMessage = await window.cosmosService.createMessage(
          this.currentConversationId,
          this.currentUserId,
          ragResponse.response || ragResponse.message,
          'assistant'
        );

        return {
          success: true,
          userMessage,
          assistantMessage,
          ragResponse
        };
      } catch (error) {
        console.error('❌ Failed to send message:', error);
        throw error;
      }
    }

    async loadConversation(conversationId) {
      try {
        this.setConversationId(conversationId);
        
        // Charger messages depuis Cosmos
        const messages = await window.cosmosService.getMessages(conversationId);
        
        return {
          success: true,
          messages,
          conversationId
        };
      } catch (error) {
        console.error('❌ Failed to load conversation:', error);
        throw error;
      }
    }

    async getUserConversations() {
      if (!this.currentUserId) {
        throw new Error('User ID not set');
      }

      try {
        const conversations = await window.cosmosService.getConversations(this.currentUserId);
        
        return {
          success: true,
          conversations
        };
      } catch (error) {
        console.error('❌ Failed to load conversations:', error);
        throw error;
      }
    }

    async searchDocuments(query, limit = 5) {
      try {
        const results = await window.ragService.searchDocuments(query, limit);
        
        return {
          success: true,
          results
        };
      } catch (error) {
        console.error('❌ Failed to search documents:', error);
        throw error;
      }
    }

    // Méthodes utilitaires
    getCurrentUserId() {
      return this.currentUserId;
    }

    getCurrentConversationId() {
      return this.currentConversationId;
    }

    isReady() {
      return !!(this.currentUserId && window.cosmosService && window.ragService);
    }
  }

  window.chatIntegrationService = new ChatIntegrationService();
  console.log('✅ ChatIntegrationService loaded');
})();
