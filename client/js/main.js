// ========== MAIN.JS - ORCHESTRATEUR PRINCIPAL ==========
// Point d'entrée unique pour toute l'application
// Gère l'initialisation, les dépendances et la configuration par page

class ApplicationOrchestrator {
    constructor() {
        this.currentPage = this.detectCurrentPage();
        this.initializationState = {
            utils: false,
            storage: false,
            eventManager: false,
            conversationManager: false,
            actionManager: false,
            workspaceManager: false,
            modernChatBar: false
        };
        
        this.managers = {};
        this.isInitialized = false;
        this.initializationPromise = null;
        
        console.log('🚀 ApplicationOrchestrator created for page:', this.currentPage);
    }

    // ========== DÉTECTION DE PAGE ET CONFIGURATION ==========
    
    detectCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('/workspace')) return 'workspace';
        if (path.includes('/chat')) return 'chat';
        if (path.includes('/onboarding')) return 'onboarding';
        return 'unknown';
    }

    getPageConfiguration() {
        const configs = {
            chat: {
                requiredManagers: ['utils', 'storage', 'conversationManager', 'actionManager', 'eventManager'],
                optionalManagers: ['modernChatBar'],
                features: ['sidebar', 'conversations', 'streaming', 'youtube', 'themes']
            },
            workspace: {
                requiredManagers: ['utils', 'storage', 'actionManager', 'eventManager', 'workspaceManager'],
                optionalManagers: ['conversationManager', 'modernChatBar'],
                features: ['sidebar', 'cards', 'zoom', 'chat-integration']
            },
            onboarding: {
                requiredManagers: ['utils', 'storage', 'eventManager'],
                optionalManagers: [],
                features: ['navigation', 'videos']
            }
        };
        
        return configs[this.currentPage] || configs.chat;
    }

    // ========== INITIALISATION PRINCIPALE ==========
    
    async initialize() {
        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise = this._initializeInternal();
        return this.initializationPromise;
    }

    async _initializeInternal() {
        console.log('🎯 Starting application initialization for:', this.currentPage);
        
        try {
            // 1. Attendre que le DOM soit prêt
            await this.waitForDOM();
            
            // 2. Vérifier les dépendances critiques
            await this.checkDependencies();
            
            // 3. Initialiser les managers dans l'ordre correct
            await this.initializeManagers();
            
            // 4. Configuration spécifique par page
            await this.configureForCurrentPage();
            
            // 5. Setup des intégrations cross-page
            await this.setupCrossPageIntegrations();
            
            // 6. Finalisation
            this.finalizeInitialization();
            
            console.log('✅ Application initialized successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Application initialization failed:', error);
            this.handleInitializationError(error);
            throw error;
        }
    }

    // ========== GESTION DES DÉPENDANCES ==========
    
    waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }

    async checkDependencies() {
        const required = [
            { name: 'marked', object: 'marked' },
            { name: 'hljs', object: 'hljs' }
        ];
        
        const optional = [
            { name: 'markdownit', object: 'markdownit' }
        ];
        
        // Vérifier les dépendances requises
        for (const dep of required) {
            if (typeof window[dep.object] === 'undefined') {
                throw new Error(`Required dependency missing: ${dep.name}`);
            }
        }
        
        // Logger les dépendances optionnelles manquantes
        for (const dep of optional) {
            if (typeof window[dep.object] === 'undefined') {
                console.warn(`⚠️ Optional dependency missing: ${dep.name}`);
            }
        }
        
        console.log('✅ Dependencies checked');
    }

    // ========== INITIALISATION DES MANAGERS ==========
    
    async initializeManagers() {
        const config = this.getPageConfiguration();
        
        // Initialiser dans l'ordre de dépendance
        const initSequence = [
            'utils',
            'storage', 
            'actionManager',
            'conversationManager',
            'eventManager',
            'workspaceManager',
            'modernChatBar'
        ];
        
        for (const managerName of initSequence) {
            if (config.requiredManagers.includes(managerName)) {
                await this.initializeManager(managerName, true);
            } else if (config.optionalManagers.includes(managerName)) {
                await this.initializeManager(managerName, false);
            }
        }
    }

    async initializeManager(managerName, isRequired = false) {
        try {
            const success = await this.initializeSpecificManager(managerName);
            
            if (!success && isRequired) {
                throw new Error(`Required manager ${managerName} failed to initialize`);
            }
            
            this.initializationState[managerName] = success;
            
            if (success) {
                console.log(`✅ ${managerName} initialized`);
            } else {
                console.warn(`⚠️ ${managerName} initialization skipped`);
            }
            
        } catch (error) {
            console.error(`❌ Error initializing ${managerName}:`, error);
            if (isRequired) {
                throw error;
            }
        }
    }

    async initializeSpecificManager(managerName) {
        switch (managerName) {
            case 'utils':
                return this.initializeUtils();
                
            case 'storage':
                return this.initializeStorage();
                
            case 'actionManager':
                return this.initializeActionManager();
                
            case 'conversationManager':
                return this.initializeConversationManager();
                
            case 'eventManager':
                return this.initializeEventManager();
                
            case 'workspaceManager':
                return this.initializeWorkspaceManager();
                
            case 'modernChatBar':
                return this.initializeModernChatBar();
                
            default:
                console.warn(`Unknown manager: ${managerName}`);
                return false;
        }
    }

    initializeUtils() {
        // Utils sont déjà chargés via window.* - juste vérifier
        const required = ['uuid', 'format', 'getYouTubeID', 'query'];
        
        for (const func of required) {
            if (typeof window[func] !== 'function') {
                console.error(`Utils function missing: ${func}`);
                return false;
            }
        }
        
        this.managers.utils = window.ChatUtils;
        return true;
    }

    initializeStorage() {
        if (!window.storageManager) {
            console.error('StorageManager not available');
            return false;
        }
        
        this.managers.storage = window.storageManager;
        return true;
    }

    initializeActionManager() {
        if (!window.actionManager) {
            console.error('ActionManager not available');
            return false;
        }
        
        this.managers.actionManager = window.actionManager;
        return true;
    }

    initializeConversationManager() {
        if (!window.conversationManager) {
            // ConversationManager optionnel pour workspace
            if (this.currentPage === 'workspace') {
                return false; // Pas d'erreur
            }
            console.error('ConversationManager not available');
            return false;
        }
        
        this.managers.conversationManager = window.conversationManager;
        return true;
    }

    initializeEventManager() {
        if (!window.eventManager) {
            console.error('EventManager not available');
            return false;
        }
        
        // Le EventManager s'initialise automatiquement
        this.managers.eventManager = window.eventManager;
        return true;
    }

    initializeWorkspaceManager() {
        // Seulement sur la page workspace
        if (this.currentPage !== 'workspace') {
            return false;
        }
        
        if (!window.workspaceManager) {
            console.error('WorkspaceManager not available on workspace page');
            return false;
        }
        
        this.managers.workspaceManager = window.workspaceManager;
        return true;
    }

    initializeModernChatBar() {
        if (!window.modernChatBar) {
            return false; // Optionnel
        }
        
        this.managers.modernChatBar = window.modernChatBar;
        return true;
    }

    // ========== CONFIGURATION PAR PAGE ==========
    
    async configureForCurrentPage() {
        switch (this.currentPage) {
            case 'chat':
                await this.configureChatPage();
                break;
                
            case 'workspace':
                await this.configureWorkspacePage();
                break;
                
            case 'onboarding':
                await this.configureOnboardingPage();
                break;
                
            default:
                console.warn('Unknown page configuration:', this.currentPage);
        }
    }

    async configureChatPage() {
        console.log('🔧 Configuring chat page...');
        
        // Initialiser l'état de la conversation
        await this.initializeChatState();
        
        // Configurer la sidebar
        this.configureSidebar();
        
        // Charger les conversations
        if (this.managers.conversationManager) {
            await this.loadInitialConversations();
        }
        
        // Configurer les thèmes
        this.configureThemes();
        
        // Modern chat bar si disponible
        if (this.managers.modernChatBar) {
            this.managers.modernChatBar.initialize?.();
        }
    }

    async configureWorkspacePage() {
        console.log('🔧 Configuring workspace page...');
        
        // Patcher les fonctions chat pour workspace
        this.patchChatForWorkspace();
        
        // Configurer la sidebar workspace
        this.configureSidebar();
        
        // Le workspace manager gère le reste
        if (this.managers.workspaceManager) {
            // Déjà initialisé par workspace.js
            console.log('✅ Workspace manager ready');
        }
    }

    async configureOnboardingPage() {
        console.log('🔧 Configuring onboarding page...');
        
        // Configuration minimale pour onboarding
        this.configureThemes();
    }

    // ========== MÉTHODES DE CONFIGURATION SPÉCIFIQUES ==========
    
    async initializeChatState() {
        // Déterminer l'ID de conversation depuis l'URL
        const pathMatch = window.location.pathname.match(/\/chat\/(.+)/);
        window.conversation_id = pathMatch ? pathMatch[1] : window.uuid();
        
        // Variables globales nécessaires
        window.prompt_lock = false;
        window.text = '';
    }

    configureSidebar() {
        const sidebarOpen = window.storageManager.loadSetting('sidebarOpen', false);
        
        if (sidebarOpen) {
            document.body.classList.add('sidebar-open');
        } else {
            document.body.classList.remove('sidebar-open');
        }
    }

    async loadInitialConversations() {
        if (typeof load_conversations === 'function') {
            setTimeout(() => load_conversations(20, 0), 100);
        }
        
        // Charger conversation spécifique si dans l'URL
        const pathMatch = window.location.pathname.match(/\/chat\/(.+)/);
        if (pathMatch && typeof load_conversation === 'function') {
            setTimeout(() => load_conversation(pathMatch[1]), 200);
        } else if (typeof new_conversation === 'function') {
            setTimeout(() => new_conversation(), 150);
        }
    }

    configureThemes() {
        if (typeof setTheme === 'function') {
            setTheme();
        }
        
        // Appliquer le thème sauvegardé
        const savedTheme = window.storageManager.loadSetting('theme');
        if (savedTheme) {
            document.documentElement.className = savedTheme;
        }
    }

    patchChatForWorkspace() {
        // Protection des fonctions chat qui peuvent être undefined sur workspace
        const originalSetTheme = window.setTheme;
        if (originalSetTheme && this.currentPage === 'workspace') {
            window.setTheme = function() {
                const activeTheme = window.storageManager.loadSetting("theme");
                const colorThemes = document.querySelectorAll('[name="theme"]');
                colorThemes.forEach((themeOption) => {
                    if (themeOption && themeOption.id === activeTheme) {
                        themeOption.checked = true;
                    }
                });
                document.documentElement.className = activeTheme;
                
                // Protection workspace - message_box n'existe pas
                const messageBox = document.getElementById('messages');
                if (window.back_scrolly >= 0 && messageBox) {
                    messageBox.scrollTo({ top: window.back_scrolly, behavior: "smooth" });
                }
            };
        }
    }

    // ========== INTÉGRATIONS CROSS-PAGE ==========
    
    async setupCrossPageIntegrations() {
        // Navigation entre chat et workspace
        this.setupPageNavigation();
        
        // Synchronisation d'état entre pages
        this.setupStateSync();
        
        // Gestion des erreurs globales
        this.setupGlobalErrorHandling();
    }

    setupPageNavigation() {
        // Ajout des fonctions de navigation globales
        window.switchToDiscussions = () => {
            if (window.workspaceManager?.activeCardChat) {
                window.workspaceManager.disconnectFromMainChat();
            }
            window.location.href = '/chat/';
        };
        
        window.switchToWorkspace = () => {
            window.location.href = '/workspace/';
        };
    }

    setupStateSync() {
        // Synchroniser les thèmes entre pages
        window.addEventListener('storage', (e) => {
            if (e.key === 'theme') {
                document.documentElement.className = e.newValue;
            }
        });
    }

    setupGlobalErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.handleGlobalError(e.error);
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            this.handleGlobalError(e.reason);
        });
    }

    // ========== GESTION D'ERREURS ==========
    
    handleInitializationError(error) {
        const errorElement = this.createErrorNotification(
            'Erreur d\'initialisation de l\'application',
            'Veuillez recharger la page. Si le problème persiste, contactez le support.'
        );
        
        document.body.appendChild(errorElement);
    }

    handleGlobalError(error) {
        // Ne pas afficher de notification pour les erreurs connues/mineures
        if (this.isMinorError(error)) {
            return;
        }
        
        const errorElement = this.createErrorNotification(
            'Une erreur est survenue',
            'L\'application continue de fonctionner. Rechargez si nécessaire.'
        );
        
        document.body.appendChild(errorElement);
    }

    isMinorError(error) {
        const minorPatterns = [
            'ResizeObserver loop limit exceeded',
            'Non-Error promise rejection captured',
            'Script error'
        ];
        
        const errorMessage = error?.message || String(error);
        return minorPatterns.some(pattern => errorMessage.includes(pattern));
    }

    createErrorNotification(title, message) {
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = `
            <div class="error-notification-content">
                <h4>${title}</h4>
                <p>${message}</p>
                <button onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 10000;
            background: rgba(239, 68, 68, 0.9); color: white;
            padding: 16px; border-radius: 8px; max-width: 300px;
            font-family: Inter, sans-serif;
        `;
        
        // Auto-remove après 10 secondes
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
        
        return notification;
    }

    // ========== FINALISATION ==========
    
    finalizeInitialization() {
        this.isInitialized = true;
        
        // Enregistrer les handlers de navigation
        this.exposePublicAPI();
        
        // Marquer l'app comme prête
        document.body.classList.add('app-initialized');
        document.body.setAttribute('data-page', this.currentPage);
        
        // Événement personnalisé pour autres scripts
        window.dispatchEvent(new CustomEvent('app:initialized', {
            detail: {
                page: this.currentPage,
                managers: Object.keys(this.managers),
                initializationState: this.initializationState
            }
        }));
        
        // Stats finales
        this.logInitializationStats();
    }

    exposePublicAPI() {
        window.appOrchestrator = this;
        
        // Fonctions utilitaires globales
        window.getInitializationState = () => this.initializationState;
        window.getManagers = () => this.managers;
        window.reinitializeApp = () => this.reinitialize();
    }

    async reinitialize() {
        console.log('🔄 Reinitializing application...');
        
        // Reset state
        this.isInitialized = false;
        this.initializationPromise = null;
        Object.keys(this.initializationState).forEach(key => {
            this.initializationState[key] = false;
        });
        
        // Cleanup event listeners si possible
        if (this.managers.eventManager?.cleanup) {
            this.managers.eventManager.cleanup();
        }
        
        // Réinitialiser
        return this.initialize();
    }

    logInitializationStats() {
        const stats = {
            page: this.currentPage,
            totalManagers: Object.keys(this.initializationState).length,
            initializedManagers: Object.values(this.initializationState).filter(Boolean).length,
            managers: this.initializationState,
            isReady: this.isInitialized
        };
        
        console.table(stats);
        console.log('🎉 Application orchestration complete!');
    }

    // ========== API PUBLIQUE ==========
    
    getStatus() {
        return {
            page: this.currentPage,
            initialized: this.isInitialized,
            managers: this.initializationState,
            config: this.getPageConfiguration()
        };
    }

    async waitForInitialization() {
        if (this.isInitialized) {
            return true;
        }
        
        if (this.initializationPromise) {
            return this.initializationPromise;
        }
        
        return this.initialize();
    }
}

// ========== AUTO-INITIALISATION ==========

// Instance globale
let appOrchestrator = null;

// Fonction d'initialisation
async function initializeApplication() {
    if (appOrchestrator) {
        console.warn('⚠️ Application already initialized');
        return appOrchestrator.waitForInitialization();
    }
    
    appOrchestrator = new ApplicationOrchestrator();
    
    try {
        await appOrchestrator.initialize();
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize application:', error);
        throw error;
    }
}

// Auto-start
if (typeof window !== 'undefined') {
    // Démarrer l'initialisation
    initializeApplication().catch(error => {
        console.error('Fatal application error:', error);
    });
    
    // Export pour debugging
    window.initializeApplication = initializeApplication;
}

// Export pour modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ApplicationOrchestrator, initializeApplication };
}

console.log('🎯 main.js loaded - Application orchestrator ready');
