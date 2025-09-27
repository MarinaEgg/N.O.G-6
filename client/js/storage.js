// ========== STORAGE.JS - GESTIONNAIRE DE STOCKAGE CENTRALISÉ ==========

class StorageManager {
    constructor() {
        this.cache = new Map();
        this.conversationPrefix = 'conversation:';
    }

    // ========== API CONVERSATIONS ==========
    
    async getConversation(id) {
        const conversation = await JSON.parse(
            localStorage.getItem(`${this.conversationPrefix}${id}`)
        );
        return conversation?.items || [];
    }

    async addConversation(id, title) {
        if (localStorage.getItem(`${this.conversationPrefix}${id}`) == null) {
            localStorage.setItem(
                `${this.conversationPrefix}${id}`,
                JSON.stringify({
                    id: id,
                    title: title,
                    items: [],
                })
            );
        }
    }

    async addMessage(conversationId, role, image, content) {
        const conversation = JSON.parse(
            localStorage.getItem(`${this.conversationPrefix}${conversationId}`)
        );

        conversation.items.push({
            role: role,
            image: image,
            content: content,
        });

        localStorage.setItem(
            `${this.conversationPrefix}${conversationId}`,
            JSON.stringify(conversation)
        );
    }

    async deleteConversation(id) {
        localStorage.removeItem(`${this.conversationPrefix}${id}`);
    }

    async clearAllConversations() {
        localStorage.clear();
    }

    async getAllConversations() {
        let conversations = [];
        for (let i = 0; i < localStorage.length; i++) {
            if (localStorage.key(i).startsWith(this.conversationPrefix)) {
                let conversation = localStorage.getItem(localStorage.key(i));
                conversations.push(JSON.parse(conversation));
            }
        }
        return conversations;
    }

    // ========== API SETTINGS ==========
    
    saveSetting(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    loadSetting(key, defaultValue = null) {
        const stored = localStorage.getItem(key);
        if (stored === null) {
            return defaultValue;
        }
        try {
            return JSON.parse(stored);
        } catch (e) {
            return stored; // Retourner la valeur brute si ce n'est pas du JSON
        }
    }

    // ========== API WORKSPACE (pour intégration future) ==========
    
    saveWorkspaceLayout(layout) {
        this.saveSetting('workspaceLayout', layout);
    }

    loadWorkspaceLayout() {
        return this.loadSetting('workspaceLayout', {});
    }
}

// Instance globale
window.storageManager = new StorageManager();
