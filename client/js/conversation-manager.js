class ConversationManager {
    constructor() {
        this.isStreaming = false;
        this.currentController = null;
    }

    async sendMessage(message) {
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

            message_box.innerHTML += `
                <div class="message message-assistant">
                ${shape.replace('id="shape"', `id="shape_assistant_${window.token}"`)}
                ${loading_video.replace('id="nog_video"', `id="assistant_${window.token}"`)}
                    <div class="content" id="imanage_${window.token}">
                        <div id="cursor"></div>
                    </div>
                </div>
            `;

            message_box.scrollTop = message_box.scrollHeight;
            window.scrollTo(0, 0);
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
                            await writeNoRAGConversation(text, message, links);
                            if (links.length !== 0) {
                                await writeRAGConversation(links, text, language);
                            }
                            return;
                        }

                        const dataObject = JSON.parse(eventData);
                        if (links.length === 0) {
                            links = dataObject.metadata.links;
                            changeEggImageToGPTImage();
                        } else {
                            changeEggImageToImanage();
                        }
                        language = dataObject.metadata.language;
                        try {
                            if (dataObject.response) {
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
            document.getElementById(`shape_assistant_${window.token}`).src = "/assets/img/gpt_egg.png";
            document.getElementById(`assistant_${window.token}`).style.opacity = "0";

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
}

window.conversationManager = new ConversationManager();
console.log('✅ ConversationManager created');
