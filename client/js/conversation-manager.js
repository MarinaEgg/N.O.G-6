class ConversationManager {
    constructor() {
        this.isStreaming = false;
        this.currentController = null;
    }

    async sendMessage(message) {
        if (this.isStreaming) return;
        
        // Déplacer la logique depuis ask_gpt dans chat.js
        // Pour l'instant, rediriger vers l'ancienne fonction
        if (typeof ask_gpt === 'function') {
            return await ask_gpt(message);
        }
    }

    async createNewConversation() {
        if (typeof new_conversation === 'function') {
            return await new_conversation();
        }
    }

    async loadConversation(conversationId) {
        const conversation = {
            items: await window.storageManager.getConversation(conversationId)
        };
        return conversation?.items || [];
    }
}

window.conversationManager = new ConversationManager();
console.log('✅ ConversationManager created');
