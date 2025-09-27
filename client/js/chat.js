// ========== CHAT.JS - VERSION NETTOYÉE APRÈS REFACTORISATION ==========
// DEPENDENCIES: utils.js must be loaded before this file



// ========== PATCH CHAT.JS POUR INTÉGRATION WORKSPACE ==========
// Fonction pour détecter si on est sur workspace
const isWorkspacePage = () => {
  return window.location.pathname.includes('/workspace');
};

// Fonction pour vérifier si une carte est active en mode chat
const isCardChatActive = () => {
  return window.workspaceManager && window.workspaceManager.activeCardChat;
};

// ========== SIDEBAR TOGGLE ========== 
function toggleSidebar() {
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





// NOUVELLE FONCTION : Initialiser l'intégration workspace
const initWorkspaceIntegration = () => {
  if (isWorkspacePage()) {
    console.log('🔧 Initialisation intégration workspace...');

    // Attendre que le workspace manager soit prêt
    const waitForWorkspace = () => {
      if (window.workspaceManager) {
        console.log('✅ Workspace manager détecté');
        return;
      }
      setTimeout(waitForWorkspace, 100);
    };

    waitForWorkspace();
  }
};

// Export des fonctions utilitaires pour le workspace
window.workspaceUtils = {
  isWorkspacePage,
  isCardChatActive,
};

// Initialize workspace integration when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ EventManager taking control of events');
  initWorkspaceIntegration(); // Garder seulement la logique métier
});

// ========== END SIDEBAR TOGGLE ==========

// ========== UTILISATION DES FONCTIONS DEPUIS UTILS.JS ==========
// SUPPRIMÉ: const query = (obj) => ... // Utilise window.query
// SUPPRIMÉ: const format = (text) => ... // Utilise window.format
// SUPPRIMÉ: const uuid = () => ... // Utilise window.uuid
// SUPPRIMÉ: const message_id = () => ... // Utilise window.message_id
// SUPPRIMÉ: function getYouTubeID(url) ... // Utilise window.getYouTubeID
// SUPPRIMÉ: function getScrollY(msg) ... // Utilise window.getScrollY
// SUPPRIMÉ: function h2a(str1) ... // Utilise window.h2a
// SUPPRIMÉ: const getDynamicWarning = () => ... // Utilise window.getDynamicWarning

const colorThemes = document.querySelectorAll('[name="theme"]');
const markdown = window.markdownit();
const message_box = document.getElementById(`messages`);
const message_input = document.getElementById(`message-input`);
const box_conversations = document.querySelector(`.conversations-list`) || document.querySelector(`.top`);
const spinner = box_conversations?.querySelector(".spinner");
const stop_generating = document.querySelector(`.stop_generating`);
const send_button = document.querySelector(`#send-button`);
const get_sep = "|||";
const copyButton = `<div class="copy-icon"> <img src="/assets/img/copy.png" height="14px" /> </div>`;
const likeButton = `<div class="like-icon"> <img src="/assets/img/like.png" height="14px" /> </div>`;
const dislikeButton = `<div class="dislike-icon"> <img src="/assets/img/dislike.png" height="14px" /> </div>`;

// CORRECTION: Utiliser window.getDynamicWarning depuis utils.js
const actionsButtons = `<div class="actions">
                              ${copyButton}
                              ${likeButton}
                              ${dislikeButton}
                              ${window.getDynamicWarning ? window.getDynamicWarning() : ''}
                          </div>`;
const loadingStream = `<span class="loading-stream"></span>`;
let prompt_lock = false;

// Messages de greeting mis à jour
const greetingMessages = {
  fr: "Bonjour. Je suis N.O.G – Nested Orchestration & Governance.\nJe suis conçu pour orchestrer et gouverner les interactions entre différents agents spécialisés, avec une capacité native de connexion à des systèmes tiers tels qu'iManage, entre autres.\n\nInteropérable avec plusieurs grands modèles de langage (GPT, Mistral, Claude), je prends en charge des opérations complexes tout en assurant une traçabilité fine et systématique de chaque interaction.\n\nCette architecture garantit une gouvernance robuste, conforme aux exigences des environnements juridiques professionnels.",
  en: "Hi. I am N.O.G – Nested Orchestration & Governance.\nI am designed to orchestrate and govern interactions between specialized agents, with native integration capabilities for third-party systems such as iManage, among others.\n\nInteroperable with leading large language models (GPT, Mistral, Claude), I support complex operations while ensuring fine-grained, systematic traceability of every interaction.\n\nThis architecture guarantees robust governance, aligned with the standards and expectations of professional legal environments."
};

hljs.addPlugin(new CopyButtonPlugin());

// S'assurer que l'élément existe avant de l'accéder
if (document.getElementsByClassName("library-side-nav-content")[0]) {
  document.getElementsByClassName("library-side-nav-content")[0].innerHTML = '';
}

const class_last_message_assistant = "last-message-assistant";



const delete_conversations = async () => {
  window.storageManager.clearAllConversations();
  await new_conversation();
};

const handle_ask = async () => {
  // Réinitialiser la hauteur de la barre de chat via le modernChatBar
  if (window.modernChatBar && window.modernChatBar.isInitialized) {
    window.modernChatBar.resetTextareaHeight();
  }

  message_input.focus();
  window.scrollTo(0, 0);
  let message = message_input.value;

  if (message.length > 0) {
    message_input.value = ``;
    // Réinitialiser la hauteur du textarea
    if (window.modernChatBar) {
      window.modernChatBar.resizeTextarea();
    }

    // Vérifier si on doit router vers une carte
    if (isWorkspacePage() && isCardChatActive()) {
      // Router vers le gestionnaire de document
      await window.workspaceManager.handleCardChatMessage(message, window.workspaceManager.activeCardChat);
      return; // IMPORTANT : éviter le double traitement
    } else {
      // Fonctionnement normal du chat
      await ask_gpt(message);
    }
  }
};

// ========== EXPORT FONCTIONS POUR EVENT-MANAGER ==========
// Ces fonctions seront appelées par event-manager.js

// Exporter les handlers métier
window.toggleSidebar = toggleSidebar;
window.handle_ask = handle_ask;
window.set_conversation = set_conversation;
window.show_option = show_option;
window.hide_option = hide_option;
window.delete_conversation = delete_conversation;
window.new_conversation = new_conversation;
window.delete_conversations = delete_conversations;

// Fonctions de navigation (pour event-manager)
window.switchToDiscussions = switchToDiscussions;
window.switchToWorkspace = switchToWorkspace;
window.setActiveNavItem = setActiveNavItem;

// Fonctions settings
window.storeTheme = storeTheme;
window.load_settings_localstorage = load_settings_localstorage;
window.register_settings_localstorage = register_settings_localstorage;

console.log('✅ Chat functions exported for event-manager');

const remove_cancel_button = async () => {
  if (stop_generating) {
    stop_generating.classList.add(`stop_generating-hiding`);

    setTimeout(() => {
      if (stop_generating) {
        stop_generating.classList.remove(`stop_generating-hiding`);
        stop_generating.classList.add(`stop_generating-hidden`);
      }
    }, 300);
  }
};

function openLibrary() {
  window.location.href = '/onboarding/';
}

function closeLibrary() {
  document.getElementById("librarySideNav").style.width = "0vw";
  document.getElementById("menu").style.visibility = "hidden";
}

async function openLinks(videoIdsParam, titlesParams) {
  document.getElementById("LinksSideNav").style.width = "100vw";
  document.getElementById("LinksSideNav").style.padding = "25px";
  document.getElementById("LinksSideNav").innerHTML = linksHTML();

  const video_ids = videoIdsParam.split(get_sep);
  const titles = titlesParams.split(get_sep);

  for (var i = 0; i < video_ids.length; i++) {
    const video_id = video_ids[i];
    const title = titles[i];
    const linksMenu = document.getElementById("linksMenu");
    linksMenu.innerHTML += `<button type="button" data-video-id="${video_id}" class="collapsible video-button onboarding-section">${title}</button>`;
  }

  var video_buttons = document.getElementsByClassName("video-button");
  var l;
  for (l = 0; l < video_buttons.length; l++) {
    const button = video_buttons[l];
    button.addEventListener("click", (event) => {
      const videoPlayer = document.getElementById(`link-video-iframe`);
      const videoId = button.getAttribute("data-video-id");

      videoPlayer.src = `https://www.youtube.com/embed/${videoId}`;
    });
  }
  document.getElementById("sideNavHeader").style.display = "flex";
}

function closeLinks() {
  document.getElementById("LinksSideNav").style.width = "0vw";
  document.getElementById("LinksSideNav").style.padding = "0px";
  document.getElementById("linksMenu").innerHTML = "";
}

const ask_gpt = async (message) => {
  try {
    message_input.value = ``;
    message_input.innerHTML = ``;
    message_input.innerText = ``;

    add_conversation(window.conversation_id, message.substr(0, 20));
    window.scrollTo(0, 0);
    window.controller = new AbortController();

    const model = document.getElementById("model");
    prompt_lock = true;
    window.text = ``;
    // CORRECTION: Utiliser window.message_id depuis utils.js
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
            ${shape.replace(
      'id="shape"',
      `id="shape_assistant_${window.token}"`
    )}
                  ${loading_video.replace(
      'id="nog_video"',
      `id="assistant_${window.token}"`
    )}
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
      signal: window.controller.signal,
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
            conversation: await get_conversation(window.conversation_id),
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
          document.getElementById(`imanage_${window.token}`).innerHTML =
            marked.parse(text);
          document.getElementById(
            `imanage_${window.token}`
          ).lastElementChild.innerHTML += loadingStream;
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

      // Decode chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });

      // Process buffer line by line
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Keep the last incomplete line in the buffer

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

    let responseContent = [];

    add_message(window.conversation_id, "user", user_image, message);
  } catch (e) {
    document.getElementById(`shape_assistant_${window.token}`).src =
      "/assets/img/gpt_egg.png";
    document.getElementById(`assistant_${window.token}`).style.opacity = "0";

    add_message(window.conversation_id, "user", user_image, message);

    message_box.scrollTop = message_box.scrollHeight;
    await remove_cancel_button();
    prompt_lock = false;

    await load_conversations(20, 0);

    let cursorDiv = document.getElementById(`cursor`);
    if (cursorDiv) cursorDiv.parentNode.removeChild(cursorDiv);

    if (e.name != `AbortError`) {
      let error_message = `oops ! something went wrong, please try again / reload.`;

      document.getElementById(`imanage_${window.token}`).innerHTML =
        error_message;
      add_message(
        window.conversation_id,
        "assistant",
        gpt_image,
        error_message
      );
    } else {
      document.getElementById(
        `imanage_${window.token}`
      ).innerHTML += ` [aborted]`;

      add_message(
        window.conversation_id,
        "assistant",
        gpt_image,
        text + ` [aborted]`
      );
    }

    window.scrollTo(0, 0);
  }
};

function changeEggImageToImanage() {
  let imanageImageChanged = false;
  if (!imanageImageChanged) {
    document.getElementById(`shape_assistant_${window.token}`).style.content =
      "url(/assets/img/imanage_egg.png)";

    const imgElement = document.getElementById(`assistant_${window.token}`);
    imgElement.style.opacity = "0";
    imanageImageChanged = true;
  }
}

function changeEggImageToGPTImage() {
  let eggImageChanged = false;
  if (!eggImageChanged) {
    document.getElementById(`shape_assistant_${window.token}`).style.content =
      "url(/assets/img/gpt_egg.png)";
    const imgElement = document.getElementById(`assistant_${window.token}`);
    imgElement.style.opacity = "0";
    eggImageChanged = true;
  }
}

async function writeNoRAGConversation(text, message, links) {
  document.getElementById(`imanage_${window.token}`).innerHTML =
    marked.parse(text) + actionsButtons;
  const loadingStreamElement =
    document.getElementsByClassName("loading-stream")[0];

  if (loadingStreamElement) {
    loadingStreamElement.parentNode.removeChild(loadingStreamElement);
  }

  message_box.scrollTop = message_box.scrollHeight;
  await remove_cancel_button();
  prompt_lock = false;
  await load_conversations(20, 0);
  window.scrollTo(0, 0);

  add_message(window.conversation_id, "user", user_image, message);
  if (links.length === 0) {
    add_message(window.conversation_id, "assistant", gpt_image, text);
  } else {
    add_message(window.conversation_id, "assistant", imanage_image, text);
  }
}

// Fonction pour créer une bulle vidéo YouTube qui redirige vers la page de liens
function createVideoSourceBubble(url, title, index, allVideoIds, allTitles) {
  const bubble = document.createElement('div');
  bubble.className = 'video-source-bubble';
  bubble.setAttribute('data-index', index);
  bubble.style.animationDelay = `${0.1 * (index + 1)}s`;

  bubble.innerHTML = `
    <div class="video-source-title">
      <svg class="youtube-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
      <span>${title}</span>
    </div>
    <p class="video-source-url">${url}</p>
  `;

  // Ajouter l'événement de clic pour ouvrir la page de liens
  bubble.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('Bubble clicked, opening links with:', allVideoIds.join(get_sep), allTitles.join(get_sep));
    openLinks(allVideoIds.join(get_sep), allTitles.join(get_sep));
  });

  return bubble;
}

async function writeRAGConversation(links, text, language) {
  const responseContent = text;

  document.querySelectorAll(`code`).forEach((el) => {
    hljs.highlightElement(el);
  });

  // CORRECTION: Utiliser window.getYouTubeID depuis utils.js
  const video_ids = links.map((link) => window.getYouTubeID(link));

  const titles = await Promise.all(
    video_ids.map(async (video_id) => {
      const title = await fetchVideoTitle(video_id);
      return title;
    })
  );

  // Créer le conteneur pour les bulles vidéo
  const videoSourcesContainer = document.createElement('div');
  videoSourcesContainer.className = 'video-sources-container';

  // Créer les bulles pour chaque vidéo (maximum 3)
  for (let i = 0; i < Math.min(links.length, 3); i++) {
    const bubble = createVideoSourceBubble(links[i], titles[i], i, video_ids, titles);
    videoSourcesContainer.appendChild(bubble);
  }

  // Ajouter le message avec les bulles vidéo
  message_box.innerHTML += `
    <div class="message message-assistant">
      ${video_image}
      <div class="content ${class_last_message_assistant}">
        ${videoSourcesContainer.outerHTML}
      </div>
    </div>`;

  message_box.scrollTop = message_box.scrollHeight;

  // Réattacher les événements de clic après l'ajout au DOM
  const addedBubbles = message_box.querySelectorAll('.video-source-bubble');
  addedBubbles.forEach((bubble, index) => {
    bubble.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Bubble clicked from DOM, opening links with:', video_ids.join(get_sep), titles.join(get_sep));
      openLinks(video_ids.join(get_sep), titles.join(get_sep));
    });
  });

  const last_message_assistant = document.getElementsByClassName(
    class_last_message_assistant
  )[0];

  // CORRECTION: Utiliser window.getScrollY depuis utils.js
  const scrolly = window.getScrollY(last_message_assistant);
  last_message_assistant.classList.remove(class_last_message_assistant);

  const links_and_language = {
    links: links,
    language: language,
    scrolly: scrolly,
    titles: titles,
  };

  add_message(
    window.conversation_id,
    "video_assistant",
    video_image,
    links_and_language
  );
}

async function fetchVideoTitle(videoID) {
  const response = await fetch(
    `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoID}&format=json`
  );
  if (response.ok) {
    const data = await response.json();
    const title = data.title;
    const cleanTitle = title.replace(/^\d+ - /, "");
    return cleanTitle; // Return the title of the video
  }
  return null;
}

const clear_conversations = async () => {
  const conversationsList = document.getElementById('conversationsList');
  if (conversationsList) {
    conversationsList.innerHTML = '';
    return;
  }

  // Fallback pour ancien système
  if (!box_conversations) return;
  const elements = box_conversations.childNodes;
  let index = elements.length;

  if (index > 0) {
    while (index--) {
      const element = elements[index];
      if (
        element.nodeType === Node.ELEMENT_NODE &&
        element.tagName.toLowerCase() !== `button`
      ) {
        box_conversations.removeChild(element);
      }
    }
  }
};

const clear_conversation = async () => {
  let messages = message_box.getElementsByTagName(`div`);

  while (messages.length > 0) {
    message_box.removeChild(messages[0]);
  }
};

const show_option = async (conversation_id) => {
  const conv = document.getElementById(`conv-${conversation_id}`);
  const yes = document.getElementById(`yes-${conversation_id}`);
  const not = document.getElementById(`not-${conversation_id}`);

  conv.style.display = "none";
  yes.style.display = "block";
  not.style.display = "block";
};

const hide_option = async (conversation_id) => {
  const conv = document.getElementById(`conv-${conversation_id}`);
  const yes = document.getElementById(`yes-${conversation_id}`);
  const not = document.getElementById(`not-${conversation_id}`);

  conv.style.display = "block";
  yes.style.display = "none";
  not.style.display = "none";
};

const delete_conversation = async (conversation_id) => {
  window.storageManager.deleteConversation(conversation_id);

  const conversation = document.getElementById(`convo-${conversation_id}`);
  conversation.remove();

  if (window.conversation_id == conversation_id) {
    await new_conversation();
  }

  await load_conversations(20, 0, true);
};

const set_conversation = async (conversation_id) => {
  history.pushState({}, null, `/chat/${conversation_id}`);
  window.conversation_id = conversation_id;

  await clear_conversation();
  await load_conversation(conversation_id);
  await load_conversations(20, 0, true);
};

const new_conversation = async () => {
  history.pushState({}, null, `/chat/`);
  // CORRECTION: Utiliser window.uuid depuis utils.js
  window.conversation_id = window.uuid();

  await clear_conversation();

  // Afficher le message de greeting au début d'une nouvelle conversation
  const language = navigator.language.startsWith('fr') ? 'fr' : 'en';
  const greetingText = greetingMessages[language];

  // Ajouter le message de greeting
  message_box.innerHTML += `
    <div class="message message-assistant">
      ${nog_image}
      <div class="content">
        <div class="assistant-content" style="word-wrap: break-word; max-width: 100%; overflow-x: auto;">
          ${markdown.render(greetingText)}
        </div>
        ${actionsButtons}
      </div>
    </div>
  `;

  message_box.scrollTop = message_box.scrollHeight;

  await load_conversations(20, 0, true);
};

const load_conversation = async (conversation_id) => {
  let conversation = {
    items: await window.storageManager.getConversation(conversation_id)
  };

  conversation?.items.forEach((item) => {
    const messageAlignmentClass =
      item.role === "user" ? "message-user" : "message-assistant";
    const img = item.image;
    if (item.role === "user" || item.role === "assistant") {
      message_box.innerHTML += `
          <div class="message ${messageAlignmentClass}">
            ${img}
            <div class="content">
              ${item.role === "assistant"
          ? `<div class="assistant-content" style="word-wrap: break-word; max-width: 100%; overflow-x: auto;">${markdown.render(
            item.content
          )}</div>`
          : item.content
        }
              ${item.role === "assistant" ? actionsButtons : ""}
            </div>
          </div>
        `;
    } else if (item.role === "video_assistant") {
      const links = item.content.links;
      // CORRECTION: Utiliser window.getYouTubeID depuis utils.js
      const video_ids = links.map((link) => window.getYouTubeID(link));
      const titles = item.content.titles;
      const language = item.content.language;

      // Créer le conteneur pour les bulles vidéo lors du rechargement
      let videoSourcesHTML = '<div class="video-sources-container">';
      for (let i = 0; i < Math.min(links.length, 3); i++) {
        const bubbleId = `bubble-${conversation_id}-${i}`;
        videoSourcesHTML += `
          <div class="video-source-bubble" data-index="${i}" id="${bubbleId}">
            <div class="video-source-title">
              <svg class="youtube-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span>${titles[i]}</span>
            </div>
            <p class="video-source-url">${links[i]}</p>
          </div>
        `;
      }
      videoSourcesHTML += '</div>';

      message_box.innerHTML += `
        <div class="message message-assistant">
          ${img}
          <div class="content">
            ${videoSourcesHTML}
          </div>
        </div>`;

      // Ajouter les événements de clic après l'ajout au DOM
      setTimeout(() => {
        for (let i = 0; i < Math.min(links.length, 3); i++) {
          const bubbleId = `bubble-${conversation_id}-${i}`;
          const bubbleElement = document.getElementById(bubbleId);
          if (bubbleElement) {
            bubbleElement.addEventListener('click', function (e) {
              e.preventDefault();
              e.stopPropagation();
              console.log('Loaded bubble clicked, opening links with:', video_ids.join(get_sep), titles.join(get_sep));
              openLinks(video_ids.join(get_sep), titles.join(get_sep));
            });
          }
        }
      }, 100);
    }
  });

  document.querySelectorAll(`code`).forEach((el) => {
    hljs.highlightElement(el);
  });

  message_box.scrollTo({ top: message_box.scrollHeight, behavior: "smooth" });

  setTimeout(() => {
    message_box.scrollTop = message_box.scrollHeight;
  }, 500);
};

const get_conversation = async (conversation_id) => {
  return await window.storageManager.getConversation(conversation_id);
};

const add_conversation = async (conversation_id, title) => {
  await window.storageManager.addConversation(conversation_id, title);
};

const add_message = async (conversation_id, role, image, content) => {
  await window.storageManager.addMessage(conversation_id, role, image, content);
};

const load_conversations = async (limit, offset, loader) => {
  let conversations = await window.storageManager.getAllConversations();

  // Vider la nouvelle liste des conversations
  const conversationsList = document.getElementById('conversationsList');
  if (conversationsList) {
    conversationsList.innerHTML = '';

    // Ajouter chaque conversation avec la nouvelle structure
    for (conversation of conversations) {
      conversationsList.innerHTML += `
        <div class="conversation-item" id="convo-${conversation.id}">
          <div class="conversation-item-content" onclick="set_conversation('${conversation.id}')">
            <span class="conversation-item-title">${conversation.title}</span>
          </div>
          <div class="conversation-item-actions">
            <i class="fas fa-ellipsis-h" onclick="show_option('${conversation.id}')" title="Options"></i>
          </div>
        </div>
      `;
    }
  } else {
    // Fallback pour l'ancien système si le nouvel élément n'existe pas
    console.warn('conversationsList non trouvé, utilisation de l\'ancien système');
    await clear_conversations();
    for (conversation of conversations) {
      box_conversations.innerHTML += `
        <div class="convo" id="convo-${conversation.id}">
          <div class="left" onclick="set_conversation('${conversation.id}')">
              <i class="fa-regular fa-comments"></i>
              <span class="convo-title">${conversation.title}</span>
          </div>
          <i onclick="show_option('${conversation.id}')" class="fa-regular fa-trash" id="conv-${conversation.id}"></i>
          <i onclick="delete_conversation('${conversation.id}')" class="fa-regular fa-check" id="yes-${conversation.id}" style="display:none;"></i>
          <i onclick="hide_option('${conversation.id}')" class="fa-regular fa-x" id="not-${conversation.id}" style="display:none;"></i>
        </div>
      `;
    }
  }

  document.querySelectorAll(`code`).forEach((el) => {
    hljs.highlightElement(el);
  });
};



// ========== GESTION NOUVELLE SIDEBAR ========== 



// Navigation entre sections
function switchToDiscussions() {
  // Déconnecter du workspace si actif
  if (window.workspaceManager && window.workspaceManager.activeCardChat) {
    window.workspaceManager.disconnectFromMainChat();
  }

  setActiveNavItem('discussions');
  window.location.href = '/chat/';
}

function switchToWorkspace() {
  setActiveNavItem('workspace');
  window.location.href = '/workspace/';
}

function setActiveNavItem(section) {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.classList.remove('active');
    if (item.dataset.section === section) {
      item.classList.add('active');
    }
  });
}

// Actions du menu utilisateur
function openSettings() {
  console.log('Opening settings');
  // Implémenter l'ouverture des paramètres
}

function toggleLanguageSubmenu() {
  console.log('Toggle language submenu');
  // Implémenter le sous-menu langues
}

function toggleAboutSubmenu() {
  console.log('Toggle about submenu');
  // Implémenter le sous-menu "En savoir plus"
}

function logout() {
  if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
    window.storageManager.clearAllConversations();
    window.location.href = '/login';
  }
}

// Mise à jour de l'état actif des sections de navigation
function updateNavigationState() {
  // Par défaut, discussions est actif
  setActiveNavItem('discussions');
}



console.log('🔧 Patch chat.js pour workspace appliqué');

window.onload = async () => {
  load_settings_localstorage();

  const allConversations = await window.storageManager.getAllConversations();
  conversations = allConversations.length;

  if (conversations == 0) window.storageManager.clearAllConversations();

  await setTimeout(() => {
    load_conversations(20, 0);
  }, 1);

  if (!window.location.href.endsWith(`#`)) {
    if (/\/chat\/.+/.test(window.location.href)) {
      await load_conversation(window.conversation_id);
    }
  }

  register_settings_localstorage();
};



const register_settings_localstorage = async () => {
  // Event-manager prend en charge les événements settings
  console.log('Settings events handled by event-manager');
};

const load_settings_localstorage = async () => {
  settings_ids = ["model"];
  settings_elements = settings_ids.map((id) => document.getElementById(id));
  settings_elements.map((element) => {
    const savedValue = window.storageManager.loadSetting(element.id);
    if (savedValue !== null) {
      switch (element.type) {
        case "checkbox":
          element.checked = savedValue === true;
          break;
        case "select-one":
          element.selectedIndex = parseInt(savedValue);
          break;
        default:
          console.warn("Unresolved element type");
      }
    }
  });
};

// Theme storage for recurring viewers
const storeTheme = function (theme) {
  window.storageManager.saveSetting("theme", theme);
};

// set theme when visitor returns
const setTheme = function () {
  const activeTheme = window.storageManager.loadSetting("theme");
  colorThemes.forEach((themeOption) => {
    if (themeOption.id === activeTheme) {
      themeOption.checked = true;
    }
  });
  // fallback for no :has() support
  document.documentElement.className = activeTheme;
  // scroll if requested
  if (back_scrolly >= 0) {
    message_box.scrollTo({ top: back_scrolly, behavior: "smooth" });
  }
};



document.onload = setTheme();

// Initialize highlight.js copy button plugin
hljs.addPlugin(new CopyButtonPlugin());

// Initialize library side nav with empty content
if (document.getElementsByClassName("library-side-nav-content")[0]) {
  document.getElementsByClassName("library-side-nav-content")[0].innerHTML = '';
}
