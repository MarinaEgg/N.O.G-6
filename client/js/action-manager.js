class ActionManager {
    constructor() {
        console.log('🎯 ActionManager created');
    }

    async handleMessageSubmit() {
        if (window.conversationManager) {
            const messageInput = document.getElementById('message-input');
            if (messageInput && messageInput.value.trim()) {
                await window.conversationManager.sendMessage(messageInput.value.trim());
            }
        }
    }

    toggleSidebar() {
        const body = document.body;
        const isOpen = body.classList.contains('sidebar-open');
        
        if (isOpen) {
            body.classList.remove('sidebar-open');
            window.storageManager.saveSetting('sidebarOpen', false);
        } else {
            body.classList.add('sidebar-open');
            window.storageManager.saveSetting('sidebarOpen', true);
        }
    }

    async setConversation(conversationId) {
        if (typeof set_conversation === 'function') {
            await set_conversation(conversationId);
        }
    }

    async deleteConversation(conversationId) {
        if (typeof delete_conversation === 'function') {
            await delete_conversation(conversationId);
        }
    }
}

window.actionManager = new ActionManager();
