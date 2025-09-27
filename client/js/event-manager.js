// ========== EVENT-MANAGER.JS - VERSION CENTRALISÉE ET SÉCURISÉE ==========
// Gestionnaire d'événements centralisé pour résoudre les conflits et améliorer les performances
// DEPENDENCIES: utils.js, storage.js doivent être chargés avant ce fichier

class EventManager {
    constructor() {
        this.listeners = new Map(); // Tracking des event listeners actifs
        this.delegators = new Map(); // Event delegation handlers
        this.initialized = false;
        this.currentPage = this.detectCurrentPage();

        // Flags pour éviter double initialization
        this.sidebarInitialized = false;
        this.chatInitialized = false;
        this.workspaceInitialized = false;

        console.log('🎯 EventManager created for page:', this.currentPage);
    }

    // ========== DÉTECTION DE PAGE ==========
    detectCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('/workspace')) return 'workspace';
        if (path.includes('/chat')) return 'chat';
        return 'chat'; // DEFAULT vers chat au lieu de 'unknown'
    }

    // ========== INITIALISATION PRINCIPALE ==========
    init() {
        if (this.initialized) {
            console.warn('⚠️ EventManager already initialized');
            return;
        }

        console.log('🚀 Initializing EventManager for', this.currentPage);

        // Nettoyage préventif
        this.cleanup();

        // Setup base selon la page
        this.setupGlobalEventDelegation();

        // Initialisation conditionnelle par page
        if (this.currentPage === 'chat') {
            this.initChatEvents();
        } else if (this.currentPage === 'workspace') {
            this.initWorkspaceEvents();
        }

        // Events communs à toutes les pages
        this.initCommonEvents();

        this.initialized = true;
        console.log('✅ EventManager initialized with', this.listeners.size, 'listeners');
    }

    // ========== EVENT DELEGATION GLOBALE ==========
    setupGlobalEventDelegation() {
        // Délégation pour boutons et liens courants
        this.addDelegatedListener(document.body, 'click', '[data-action]', (e, target) => {
            const action = target.getAttribute('data-action');
            this.handleDelegatedAction(action, target, e);
        }, 'global-actions');

        // Délégation pour les éléments avec rôles
        this.addDelegatedListener(document.body, 'click', '[role="button"]:not([disabled])', (e, target) => {
            if (!target.onclick) {
                this.handleRoleButton(target, e);
            }
        }, 'role-buttons');
    }

    // ========== GESTION SIDEBAR UNIFIÉE ==========
    initSidebarEvents() {
        if (this.sidebarInitialized) {
            console.warn('⚠️ Sidebar events already initialized');
            return;
        }

        console.log('🔧 Initializing sidebar events...');

        // SOLUTION HAMBURGER UNIQUE - un seul event listener
        this.addDelegatedListener(document.body, 'click', '.hamburger-icon, #sidebarToggle', (e, target) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleSidebar();
        }, 'sidebar-toggles');

        // Overlay mobile - délégation sécurisée
        this.addSafeListener(document.body, 'click', (e) => {
            if (window.innerWidth <= 990 &&
                e.target.matches('body') &&
                document.body.classList.contains('sidebar-open')) {
                this.closeSidebar();
            }
        }, 'sidebar-overlay');

        // User menu - délégation sur le container
        const sidebarContainer = document.querySelector('.sidebar, .conversations');
        if (sidebarContainer) {
            this.addDelegatedListener(sidebarContainer, 'click', '#userProfile', (e, target) => {
                e.stopPropagation();
                this.toggleUserMenu();
            }, 'user-profile');

            this.addDelegatedListener(sidebarContainer, 'click', '.nav-item', (e, target) => {
                const section = target.getAttribute('data-section');
                if (section) {
                    this.handleNavigation(section);
                }
            }, 'navigation');
        }

        this.sidebarInitialized = true;
        console.log('✅ Sidebar events initialized');
    }

    // ========== GESTION CHAT ==========
    initChatEvents() {
        if (this.chatInitialized) {
            console.warn('⚠️ Chat events already initialized');
            return;
        }

        console.log('🔧 Initializing chat events...');

        // Sidebar d'abord
        this.initSidebarEvents();

        // Message input - UN SEUL listener avec gestion propre
        const messageInput = document.getElementById('message-input');
        if (messageInput) {
            this.addSafeListener(messageInput, 'keydown', async (e) => {
                if (e.key === 'Enter' && !e.shiftKey && !window.prompt_lock) {
                    e.preventDefault();
                    await this.handleMessageSubmit();
                }
            }, 'message-input-keydown');

            // Blur pour mobile
            this.addSafeListener(messageInput, 'blur', () => {
                window.scrollTo(0, 0);
            }, 'message-input-blur');
        }

        // Send button
        const sendButton = document.getElementById('send-button');
        if (sendButton) {
            this.addSafeListener(sendButton, 'click', async (e) => {
                e.preventDefault();
                if (!window.prompt_lock) {
                    await this.handleMessageSubmit();
                }
            }, 'send-button');
        }

        // Cancel button
        const cancelButton = document.getElementById('cancelButton');
        if (cancelButton) {
            this.addSafeListener(cancelButton, 'click', () => {
                if (window.controller) {
                    window.controller.abort();
                }
            }, 'cancel-button');
        }

        // Conversations - délégation sur container
        this.setupConversationEvents();

        // Actions messages - délégation globale
        this.setupMessageActions();

        // Theme management
        this.setupThemeEvents();

        this.chatInitialized = true;
        console.log('✅ Chat events initialized');
    }

    // ========== GESTION WORKSPACE ==========
    initWorkspaceEvents() {
        if (this.workspaceInitialized) {
            console.warn('⚠️ Workspace events already initialized');
            return;
        }

        console.log('🔧 Initializing workspace events...');

        // Sidebar pour workspace aussi
        this.initSidebarEvents();

        // Canvas et cartes via délégation
        const canvas = document.getElementById('workspaceCanvas');
        if (canvas) {
            // Global mouse pour drag
            this.addSafeListener(document, 'mousemove', (e) => {
                if (window.workspaceManager) {
                    window.workspaceManager.handleGlobalMouseMove(e);
                }
            }, 'workspace-global-mousemove');

            this.addSafeListener(document, 'mouseup', () => {
                if (window.workspaceManager) {
                    window.workspaceManager.handleGlobalMouseUp();
                }
            }, 'workspace-global-mouseup');

            // Délégation pour les cartes
            this.addDelegatedListener(canvas, 'mousedown', '.workspace-card', (e, target) => {
                if (window.workspaceManager && !e.target.closest('.card-action-btn')) {
                    window.workspaceManager.handleMouseDown(e, target);
                }
            }, 'workspace-card-drag');

            this.addDelegatedListener(canvas, 'click', '.workspace-card', (e, target) => {
                if (window.workspaceManager && !e.target.closest('.card-action-btn')) {
                    window.workspaceManager.selectCard(target);
                }
            }, 'workspace-card-select');

            // Canvas background drag
            this.addSafeListener(canvas, 'mousedown', (e) => {
                if (window.workspaceManager && !e.target.closest('.workspace-card')) {
                    window.workspaceManager.handleCanvasMouseDown(e);
                }
            }, 'workspace-canvas-drag');
        }

        // Zoom controls - délégation sur le container
        this.addDelegatedListener(document.body, 'click', '#zoom-in', () => {
            window.workspaceManager?.zoomIn();
        }, 'zoom-in');

        this.addDelegatedListener(document.body, 'click', '#zoom-out', () => {
            window.workspaceManager?.zoomOut();
        }, 'zoom-out');

        this.addDelegatedListener(document.body, 'click', '#zoom-reset', () => {
            window.workspaceManager?.resetZoom();
        }, 'zoom-reset');

        // Wheel zoom avec délégation
        if (canvas) {
            this.addSafeListener(canvas, 'wheel', (e) => {
                if (e.ctrlKey && window.workspaceManager) {
                    e.preventDefault();
                    const delta = e.deltaY > 0 ? -0.1 : 0.1;
                    const currentZoom = window.workspaceManager.zoomLevel || 1.0;
                    window.workspaceManager.setZoom(currentZoom + delta);
                }
            }, 'workspace-wheel-zoom');
        }

        this.workspaceInitialized = true;
        console.log('✅ Workspace events initialized');
    }

    // ========== ÉVÉNEMENTS COMMUNS ==========
    initCommonEvents() {
        // Escape global
        this.addSafeListener(document, 'keydown', (e) => {
            if (e.key === 'Escape') {
                this.handleEscapeKey();
            }
        }, 'global-escape');

        // Prevent form submit sur les containers principaux
        const forms = document.querySelectorAll('form');
        forms.forEach((form, index) => {
            this.addSafeListener(form, 'submit', (e) => {
                e.preventDefault();
            }, `form-prevent-${index}`);
        });

        // Mobile sidebar gesture
        const mobileSidebar = document.querySelector('.mobile-sidebar');
        if (mobileSidebar) {
            this.addSafeListener(mobileSidebar, 'click', (e) => {
                this.handleMobileSidebarToggle(e);
            }, 'mobile-sidebar');
        }
    }

    // ========== CONFIGURATION CONVERSATIONS ==========
    setupConversationEvents() {
        const conversationsContainer = document.getElementById('conversationsList') ||
            document.querySelector('.conversations-list') ||
            document.querySelector('.top');

        if (!conversationsContainer) return;

        // Délégation pour toutes les actions de conversation
        this.addDelegatedListener(conversationsContainer, 'click', '.conversation-item-content, .left', (e, target) => {
            const convoElement = target.closest('[id^="convo-"]');
            if (convoElement) {
                const conversationId = convoElement.id.replace('convo-', '');
                this.setConversation(conversationId);
            }
        }, 'conversation-select');

        this.addDelegatedListener(conversationsContainer, 'click', '.fa-ellipsis-h, .fa-trash', (e, target) => {
            e.stopPropagation();
            const convoElement = target.closest('[id^="convo-"]');
            if (convoElement) {
                const conversationId = convoElement.id.replace('convo-', '');
                this.showConversationOptions(conversationId);
            }
        }, 'conversation-options');

        this.addDelegatedListener(conversationsContainer, 'click', '.fa-check', (e, target) => {
            e.stopPropagation();
            const conversationId = target.id.replace('yes-', '');
            this.deleteConversation(conversationId);
        }, 'conversation-delete-confirm');

        this.addDelegatedListener(conversationsContainer, 'click', '.fa-x', (e, target) => {
            e.stopPropagation();
            const conversationId = target.id.replace('not-', '');
            this.hideConversationOptions(conversationId);
        }, 'conversation-delete-cancel');
    }

    // ========== CONFIGURATION ACTIONS MESSAGES ==========
    setupMessageActions() {
        const messageBox = document.getElementById('messages');
        if (!messageBox) return;

        // Délégation pour toutes les actions des messages
        this.addDelegatedListener(messageBox, 'click', '.copy-icon', (e, target) => {
            const messageContent = target.closest('.message').querySelector('.content');
            if (messageContent) {
                this.copyMessageContent(messageContent);
            }
        }, 'message-copy');

        this.addDelegatedListener(messageBox, 'click', '.like-icon', (e, target) => {
            target.classList.toggle('liked');
            // Ajouter logique like si nécessaire
        }, 'message-like');

        this.addDelegatedListener(messageBox, 'click', '.dislike-icon', (e, target) => {
            target.classList.toggle('disliked');
            // Ajouter logique dislike si nécessaire
        }, 'message-dislike');

        this.addDelegatedListener(messageBox, 'click', '.video-source-bubble', (e, target) => {
            e.preventDefault();
            e.stopPropagation();
            // Logic pour ouvrir vidéos - déléguer à chat.js
            if (typeof openLinks === 'function') {
                const allBubbles = messageBox.querySelectorAll('.video-source-bubble');
                // Extraire les IDs et titres depuis les bubbles
                // Implementation détaillée si nécessaire
            }
        }, 'video-bubbles');
    }

    // ========== CONFIGURATION THÈMES ==========
    setupThemeEvents() {
        const themeInputs = document.querySelectorAll('[name="theme"]');
        themeInputs.forEach((input, index) => {
            this.addSafeListener(input, 'click', () => {
                this.applyTheme(input.id);
            }, `theme-${index}`);
        });
    }

    // ========== MÉTHODES DE GESTION ==========

    async handleMessageSubmit() {
        if (window.handle_ask && typeof window.handle_ask === 'function') {
            await window.handle_ask();
        } else {
            console.error('handle_ask function not available');
        }
    }

    toggleSidebar() {
        const body = document.body;
        const isOpen = body.classList.contains('sidebar-open');

        if (isOpen) {
            body.classList.remove('sidebar-open');
            if (window.storageManager) {
                window.storageManager.saveSetting('sidebarOpen', false);
            }
        } else {
            body.classList.add('sidebar-open');
            if (window.storageManager) {
                window.storageManager.saveSetting('sidebarOpen', true);
            }
        }

        console.log('🔧 Sidebar toggled:', !isOpen);
    }

    closeSidebar() {
        document.body.classList.remove('sidebar-open');
        if (window.storageManager) {
            window.storageManager.saveSetting('sidebarOpen', false);
        }
    }

    toggleUserMenu() {
        const userMenu = document.getElementById('userMenu');
        const userProfile = document.getElementById('userProfile');

        if (userMenu && userProfile) {
            const isShowing = userMenu.classList.toggle('show');
            userProfile.classList.toggle('active', isShowing);
        }
    }

    handleNavigation(section) {
        if (section === 'discussions') {
            // Déconnecter du workspace si actif
            if (window.workspaceManager?.activeCardChat) {
                window.workspaceManager.disconnectFromMainChat();
            }
            this.setActiveNavItem('discussions');
            window.location.href = '/chat/';
        } else if (section === 'workspace') {
            this.setActiveNavItem('workspace');
            window.location.href = '/workspace/';
        }
    }

    setActiveNavItem(section) {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === section) {
                item.classList.add('active');
            }
        });
    }

    handleEscapeKey() {
        // Fermer modals ouverts
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => modal.remove());

        // Fermer user menu
        const userMenu = document.getElementById('userMenu');
        const userProfile = document.getElementById('userProfile');
        if (userMenu?.classList.contains('show')) {
            userMenu.classList.remove('show');
            userProfile?.classList.remove('active');
        }

        // Fermer floating menu workspace
        if (window.workspaceManager?.floatingMenu?.isVisible) {
            window.workspaceManager.floatingMenu.hide();
        }
    }

    handleMobileSidebarToggle(e) {
        const sidebar = document.querySelector('.conversations');
        if (sidebar) {
            const isShown = sidebar.classList.toggle('shown');
            e.target.classList.toggle('rotated', isShown);
        }
        window.scrollTo(0, 0);
    }

    // ========== CONVERSATION MANAGEMENT ==========

    async setConversation(conversationId) {
        if (typeof set_conversation === 'function') {
            await set_conversation(conversationId);
        }
    }

    showConversationOptions(conversationId) {
        if (typeof show_option === 'function') {
            show_option(conversationId);
        }
    }

    hideConversationOptions(conversationId) {
        if (typeof hide_option === 'function') {
            hide_option(conversationId);
        }
    }

    async deleteConversation(conversationId) {
        if (typeof delete_conversation === 'function') {
            await delete_conversation(conversationId);
        }
    }

    copyMessageContent(messageContent) {
        const textContent = messageContent.textContent || messageContent.innerText;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(textContent).then(() => {
                console.log('Message copié');
            });
        }
    }

    applyTheme(themeId) {
        if (window.storageManager) {
            window.storageManager.saveSetting("theme", themeId);
        }
        document.documentElement.className = themeId;
    }

    // ========== GESTION DES LISTENERS ==========

    addSafeListener(element, event, handler, listenerId) {
        if (!element || this.listeners.has(listenerId)) {
            return false;
        }

        const wrappedHandler = this.createSafeHandler(handler, listenerId);
        element.addEventListener(event, wrappedHandler);

        this.listeners.set(listenerId, {
            element,
            event,
            handler: wrappedHandler,
            originalHandler: handler
        });

        return true;
    }

    addDelegatedListener(container, event, selector, handler, listenerId) {
        if (!container || this.delegators.has(listenerId)) {
            return false;
        }

        const delegatedHandler = (e) => {
            const target = e.target.closest(selector);
            if (target && container.contains(target)) {
                try {
                    handler(e, target);
                } catch (error) {
                    console.error(`Error in delegated handler ${listenerId}:`, error);
                }
            }
        };

        container.addEventListener(event, delegatedHandler);

        this.delegators.set(listenerId, {
            container,
            event,
            selector,
            handler: delegatedHandler,
            originalHandler: handler
        });

        return true;
    }

    createSafeHandler(handler, listenerId) {
        return (e) => {
            try {
                return handler(e);
            } catch (error) {
                console.error(`Error in event handler ${listenerId}:`, error);
            }
        };
    }

    handleDelegatedAction(action, target, e) {
        switch (action) {
            case 'toggle-sidebar':
                this.toggleSidebar();
                break;
            case 'new-conversation':
                if (typeof window.new_conversation === 'function') {
                    window.new_conversation();
                }
                break;
            case 'delete-conversations':
                if (typeof window.delete_conversations === 'function') {
                    window.delete_conversations();
                }
                break;
            default:
                console.log('Unknown action:', action);
        }
    }

    handleRoleButton(target, e) {
        // Handler pour boutons avec role="button" sans onclick
        const action = target.getAttribute('data-action');
        if (action) {
            this.handleDelegatedAction(action, target, e);
        }
    }

    // ========== NETTOYAGE ==========

    cleanup() {
        console.log('🧹 Cleaning up existing event listeners...');

        // Supprimer listeners trackés
        this.listeners.forEach((listener, id) => {
            try {
                listener.element.removeEventListener(listener.event, listener.handler);
            } catch (e) {
                console.warn(`Failed to remove listener ${id}:`, e);
            }
        });

        // Supprimer delegators trackés
        this.delegators.forEach((delegator, id) => {
            try {
                delegator.container.removeEventListener(delegator.event, delegator.handler);
            } catch (e) {
                console.warn(`Failed to remove delegator ${id}:`, e);
            }
        });

        this.listeners.clear();
        this.delegators.clear();

        // Reset flags
        this.sidebarInitialized = false;
        this.chatInitialized = false;
        this.workspaceInitialized = false;
        this.initialized = false;
    }

    // ========== DEBUGGING ==========

    getStats() {
        return {
            page: this.currentPage,
            initialized: this.initialized,
            listeners: this.listeners.size,
            delegators: this.delegators.size,
            sidebarInit: this.sidebarInitialized,
            chatInit: this.chatInitialized,
            workspaceInit: this.workspaceInitialized
        };
    }

    logStats() {
        console.table(this.getStats());
    }
}

// ========== INITIALISATION ET EXPORT ==========

// Instance globale
let eventManager = null;

// Fonction d'initialisation globale
function initEventManager() {
    if (eventManager) {
        console.warn('⚠️ EventManager already exists, cleaning up...');
        eventManager.cleanup();
    }

    eventManager = new EventManager();

    // Initialiser selon l'état du DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            eventManager.init();
        });
    } else {
        eventManager.init();
    }

    return eventManager;
}

// Auto-initialisation
if (typeof window !== 'undefined') {
    window.eventManager = initEventManager();

    // Export pour debugging
    window.initEventManager = initEventManager;
}

// Export pour modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EventManager, initEventManager };
}

console.log('🎯 event-manager.js loaded');
