class ConversationManager {
    constructor() {
        this.isStreaming = false;
        this.currentController = null;
        this.messageBox = null; // ← Initialisé à null
        this.currentMessageId = null;

        // ✅ Attendre que le DOM soit prêt et initialiser messageBox
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeDOM());
        } else {
            this.initializeDOM();
        }
    }

    /**
     * Initialise les références DOM nécessaires
     */
    initializeDOM() {
        this.messageBox = document.getElementById('messages');

        if (!this.messageBox) {
            console.error('❌ FATAL: #messages element not found in DOM!');
            return false;
        }

        console.log('✅ ConversationManager DOM initialized - messageBox ready');
        return true;
    }

    /**
     * Gère le loader unique : le crée ou le déplace sous le dernier message
     * @returns {HTMLElement} L'élément loader-egg
     */
    manageUniqueLoader() {
        // ✅ PROTECTION : Vérifier que messageBox existe
        if (!this.messageBox) {
            console.error('❌ messageBox undefined dans manageUniqueLoader');
            this.initializeDOM();

            if (!this.messageBox) {
                console.error('❌ FATAL: Impossible d\'initialiser messageBox');
                return null;
            }
        }

        const messagesContainer = this.messageBox;

        // Chercher un loader existant dans tout le DOM
        let existingLoader = messagesContainer.querySelector('.streaming-loader');

        if (existingLoader) {
            // DÉPLACER le loader existant sous le nouveau message
            const lastMessage = messagesContainer.querySelector(`#message-${this.currentMessageId}`);
            if (lastMessage) {
                const contentDiv = lastMessage.closest('.content');
                if (contentDiv) {
                    // Retirer de l'ancien parent
                    existingLoader.remove();
                    // Ajouter au nouveau parent
                    contentDiv.appendChild(existingLoader);

                    console.log('🥚 Loader déplacé sous le nouveau message');
                    console.log('🥚 DEBUG - Loaders dans DOM:', document.querySelectorAll('.streaming-loader').length);
                    return existingLoader.querySelector('loader-egg');
                }
            }
        }

        // Si pas de loader existant, EN CRÉER UN NOUVEAU
        const loaderDiv = document.createElement('div');
        loaderDiv.className = 'streaming-loader';
        loaderDiv.id = `loader-${this.currentMessageId}`;
        loaderDiv.innerHTML = '<loader-egg id="loader-egg-${this.currentMessageId}" class="inline"></loader-egg>';

        const lastMessage = messagesContainer.querySelector(`#message-${this.currentMessageId}`);
        if (lastMessage) {
            const contentDiv = lastMessage.closest('.content');
            if (contentDiv) {
                contentDiv.appendChild(loaderDiv);
            }
        }

        console.log('🥚 Nouveau loader créé');
        console.log('🥚 DEBUG - Loaders dans DOM:', document.querySelectorAll('.streaming-loader').length);
        return loaderDiv.querySelector('loader-egg');
    }

    async sendMessage(message) {
        // ✅ VÉRIFIER que messageBox est initialisé
        if (!this.messageBox) {
            console.error('❌ messageBox not initialized, retrying...');
            this.initializeDOM();

            if (!this.messageBox) {
                throw new Error('Cannot send message: messageBox element not found in DOM');
            }
        }

        if (this.isStreaming) return;

        this.isStreaming = true;
        this.currentController = new AbortController();

        try {
            const message_input = document.getElementById(`message-input`);
            const message_box = document.getElementById(`messages`);
            const stop_generating = document.querySelector(`.stop_generating`);

            message_input.value = ``;
            message_input.innerHTML = ``;
            message_input.innerText = ``;

            await window.storageManager.addConversation(window.conversation_id, message.substr(0, 20));
            window.scrollTo(0, 0);
            window.controller = this.currentController;

            const model = document.getElementById("model");
            window.prompt_lock = true;
            window.text = ``;
            window.token = window.message_id();

            if (stop_generating) {
                stop_generating.classList.remove(`stop_generating-hidden`);
            }

            message_box.innerHTML += `
                <div class="message message-user">
                    <div class="content" id="user_${window.token}">
                        ${window.format(message)}
                    </div>
                </div>`;

            message_box.scrollTop = message_box.scrollHeight;
            window.scrollTo(0, 0);
            await new Promise((r) => setTimeout(r, 500));
            window.scrollTo(0, 0);

            // ✅ Générer l'ID du message AVANT createLoadingMessage
            this.currentMessageId = window.token;

            // Créer le message avec loader intégré
            const avatarImage = '<div class="avatar-placeholder"></div>';
            this.createLoadingMessage(avatarImage);

            window.scrollTo(0, 0);

            // Le loader est automatiquement en mode THINKING via createLoadingMessage()
            const inlineLoader = document.querySelector(`#loader-egg-${window.token}`);
            if (inlineLoader && typeof inlineLoader.setState === 'function') {
                inlineLoader.setState('thinking');
            }

            await new Promise((r) => setTimeout(r, 1000));
            window.scrollTo(0, 0);

            const response = await fetch(`/backend-api/v2/conversation`, {
                method: `POST`,
                signal: this.currentController.signal,
                headers: {
                    "content-type": `application/json`,
                    accept: `text/event-stream`,
                },
                body: JSON.stringify({
                    conversation_id: window.conversation_id,
                    action: `_ask`,
                    model: model.options[model.selectedIndex]?.value,
                    meta: {
                        id: window.token,
                        content: {
                            conversation: await window.storageManager.getConversation(window.conversation_id),
                            content_type: "text",
                            parts: [
                                {
                                    content: message,
                                    role: "user",
                                },
                            ],
                        },
                    },
                }),
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            let text = "";
            let pendingText = "";
            let isProcessing = false;
            const TYPING_SPEED = 7;

            const processPendingText = async (newText = "") => {
                if (newText) {
                    pendingText += newText;
                }

                if (isProcessing) {
                    return;
                }

                isProcessing = true;
                while (pendingText.length > 0) {
                    const chars = pendingText.split("");
                    pendingText = "";

                    for (const char of chars) {
                        text += char;
                        document.getElementById(`imanage_${window.token}`).innerHTML = marked.parse(text);
                        document.getElementById(`imanage_${window.token}`).lastElementChild.innerHTML += loadingStream;
                        message_box.scrollTop = message_box.scrollHeight;
                        await new Promise((resolve) => setTimeout(resolve, TYPING_SPEED));
                    }
                }
                isProcessing = false;
            };

            let links = [];
            let language = "fr";
            let hasContent = false;

            while (true) {
                const { value, done } = await reader.read();

                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        const eventData = line.slice(6).trim();
                        if (eventData === "[DONE]") {
                            await processPendingText();

                            // ✅ Chercher le loader unique dans tout le DOM (pas seulement ce message)
                            const loaderEgg = this.messageBox.querySelector('.streaming-loader loader-egg');
                            if (loaderEgg) {
                                console.log('🥚 DEBUG - État avant IDLE:', loaderEgg.currentState);
                                loaderEgg.setState('idle');
                                console.log('🥚 Loader passé en IDLE');
                            }

                            await writeNoRAGConversation(text, message, links);
                            if (links.length !== 0) {
                                await writeRAGConversation(links, text, language);
                            }

                            return;
                        }

                        const dataObject = JSON.parse(eventData);

                        // ✅ GARDER LE LOADER EN THINKING - NE RIEN FAIRE
                        if (links.length === 0) {
                            links = dataObject.metadata.links;
                        }

                        // ✅ Ajouter badge iManage si nécessaire
                        if (links.length !== 0) {
                            this.addImanageBadge();
                        }

                        language = dataObject.metadata.language;
                        try {
                            if (dataObject.response) {
                                // Le loader reste en THINKING pendant tout le streaming
                                if (!hasContent) {
                                    hasContent = true;
                                }

                                await processPendingText(dataObject.response);
                            }
                        } catch (error) {
                            console.error("Error parsing JSON:", error);
                        }
                    }
                }
            }

            await window.storageManager.addMessage(window.conversation_id, "user", user_image, message);
        } catch (e) {
            // ✅ Chercher le loader unique dans tout le DOM (pas seulement ce message)
            const loaderEgg = this.messageBox.querySelector('.streaming-loader loader-egg');
            if (loaderEgg) {
                console.log('🥚 DEBUG - État avant IDLE:', loaderEgg.currentState);
                loaderEgg.setState('idle');
                console.log('🥚 Loader passé en mode IDLE (erreur)');
            }

            await window.storageManager.addMessage(window.conversation_id, "user", user_image, message);

            const message_box = document.getElementById(`messages`);
            message_box.scrollTop = message_box.scrollHeight;
            await remove_cancel_button();
            window.prompt_lock = false;

            await load_conversations(20, 0);

            let cursorDiv = document.getElementById(`cursor`);
            if (cursorDiv) cursorDiv.parentNode.removeChild(cursorDiv);

            if (e.name != `AbortError`) {
                let error_message = `oops ! something went wrong, please try again / reload.`;
                document.getElementById(`imanage_${window.token}`).innerHTML = error_message;
                await window.storageManager.addMessage(window.conversation_id, "assistant", gpt_image, error_message);
            } else {
                document.getElementById(`imanage_${window.token}`).innerHTML += ` [aborted]`;
                await window.storageManager.addMessage(window.conversation_id, "assistant", gpt_image, window.text + ` [aborted]`);
            }

            window.scrollTo(0, 0);
        } finally {
            this.isStreaming = false;
            this.currentController = null;
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

    createLoadingMessage(avatarImage) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message message-assistant';
        messageDiv.id = `message-${window.token}`;

        messageDiv.innerHTML = `
            ${avatarImage}
            <div class="content streaming-content">
                <div id="imanage_${window.token}" class="assistant-content"></div>
            </div>
        `;

        this.messageBox.appendChild(messageDiv);
        this.messageBox.scrollTop = this.messageBox.scrollHeight;

        // ✅ NOUVEAU : Gérer le loader unique
        setTimeout(() => {
            const loaderEgg = this.manageUniqueLoader();
            if (loaderEgg) {
                loaderEgg.setState('thinking');
                console.log('🥚 Loader passé en THINKING');
            }
        }, 100);

        return messageDiv;
    }

    // removeLoadingMessage() supprimée - le loader reste permanent

    addImanageBadge() {
        const messageEl = document.querySelector('.message:last-child');
        if (!messageEl) return;

        setTimeout(() => {
            const actionsEl = messageEl.querySelector('.actions');

            if (actionsEl && !actionsEl.querySelector('.source-badge')) {
                const badge = document.createElement('img');
                badge.src = '/assets/img/imanage_logo_small.png';
                badge.className = 'source-badge';
                badge.alt = 'iManage source';
                badge.style.width = '20px';
                badge.style.height = '20px';
                badge.style.marginRight = '8px';

                actionsEl.insertBefore(badge, actionsEl.firstChild);
            }
        }, 100);
    }
}

window.conversationManager = new ConversationManager();
console.log('✅ ConversationManager created');
