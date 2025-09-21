/**
 * FloatingCardMenu - Menu flottant pour les actions des cartes
 * 
 * Ce composant gère l'affichage et les interactions du menu flottant
 * qui apparaît au-dessus des cartes sélectionnées dans le workspace.
 */

class FloatingCardMenu {
    constructor(workspaceManager) {
        this.workspaceManager = workspaceManager;
        this.currentCard = null;
        this.currentCardInstance = null;
        this.menuElement = null;
        this.isVisible = false;
        this.actions = new Map();

        // Configuration du positionnement
        this.positioning = {
            offsetY: -60,    // 60px au-dessus de la carte
            offsetX: 0,      // Centré horizontalement
            minMargin: 20,   // Marge minimale des bords de l'écran
            zIndex: 1001
        };

        // Optimisation des performances
        this.repositionTimeout = null;
        this.lastPosition = null;
        this.showTimeout = null;

        this.init();
    }

    /**
     * Initialise le menu flottant
     */
    init() {
        this.createElement();
        this.registerDefaultActions();
        this.setupEventListeners();
        console.log('FloatingCardMenu initialized');
    }

    /**
     * Crée l'élément HTML du menu flottant
     */
    createElement() {
        // Supprimer l'ancien menu s'il existe
        const existingMenu = document.getElementById('floatingCardMenu');
        if (existingMenu) {
            existingMenu.remove();
        }

        // Créer le nouveau menu
        this.menuElement = document.createElement('div');
        this.menuElement.className = 'floating-card-menu';
        this.menuElement.id = 'floatingCardMenu';

        // Structure interne
        this.menuElement.innerHTML = `
            <div class="menu-actions" id="menuActions">
                <!-- Les actions seront ajoutées dynamiquement -->
            </div>
        `;

        // Ajouter au DOM (caché par défaut)
        document.body.appendChild(this.menuElement);

        console.log('FloatingCardMenu element created');
    }

    /**
     * Enregistre les actions par défaut
     */
    registerDefaultActions() {
        // Configuration des actions disponibles avec ordre d'affichage
        const actionConfigs = {
            collaboration: {
                icon: 'fas fa-edit',
                title: 'Mode collaboration',
                types: ['text'],
                method: 'toggleDocumentMode',
                order: 1,
                category: 'primary'
            },
            clear: {
                icon: 'fas fa-eraser',
                title: 'Vider le contenu',
                types: ['text'],
                method: 'clearDocumentContent',
                order: 2,
                category: 'edit'
            },
            copy: {
                icon: 'fas fa-copy',
                title: 'Copier le contenu',
                types: ['text'],
                method: 'copyContent',
                order: 3,
                category: 'edit'
            },
            fullscreen: {
                icon: 'fas fa-expand',
                title: 'Mode plein écran',
                types: ['text'],
                method: 'toggleFullscreen',
                order: 4,
                category: 'view'
            },
            pin: {
                icon: 'fas fa-thumbtack',
                title: 'Épingler',
                types: ['text', 'file'],
                method: 'togglePin',
                order: 5,
                category: 'state'
            },
            delete: {
                icon: 'fas fa-trash',
                title: 'Supprimer',
                types: ['text', 'file'],
                method: 'delete',
                order: 6,
                category: 'danger'
            }
        };

        // Enregistrer chaque action dans l'ordre
        const sortedActions = Object.entries(actionConfigs)
            .sort(([, a], [, b]) => a.order - b.order);

        sortedActions.forEach(([actionId, config]) => {
            this.registerAction(actionId, config);
        });

        console.log(`Registered ${this.actions.size} default actions in order`);
    }

    /**
     * Enregistre une action dans le menu
     * @param {string} actionId - Identifiant unique de l'action
     * @param {Object} config - Configuration de l'action
     */
    registerAction(actionId, config) {
        this.actions.set(actionId, config);

        // Créer le bouton d'action
        const actionButton = document.createElement('button');
        actionButton.className = 'menu-action';
        actionButton.setAttribute('data-action', actionId);
        actionButton.title = config.title;
        actionButton.innerHTML = `<i class="${config.icon}"></i>`;

        // Ajouter au conteneur des actions
        const actionsContainer = this.menuElement.querySelector('#menuActions');
        actionsContainer.appendChild(actionButton);
    }

    /**
     * Affiche le menu pour une carte donnée
     * @param {HTMLElement} cardElement - Élément DOM de la carte
     * @param {BaseCard} cardInstance - Instance de la carte
     */
    show(cardElement, cardInstance) {
        if (!cardElement || !cardInstance) {
            console.warn('Cannot show menu: missing card element or instance');
            return;
        }

        // Optimisation : éviter de recalculer si c'est la même carte
        if (this.currentCard === cardElement && this.isVisible) {
            return;
        }

        this.currentCard = cardElement;
        this.currentCardInstance = cardInstance;

        // Mettre à jour les actions visibles selon le type de carte
        this.updateMenuActions(cardInstance.type);

        // Mettre à jour les états des actions
        this.updateActionStates();

        // Calculer et appliquer la position
        const position = this.calculateMenuPosition(cardElement);
        if (position) {
            // Utiliser requestAnimationFrame pour optimiser l'animation
            requestAnimationFrame(() => {
                this.menuElement.style.left = position.x + 'px';
                this.menuElement.style.top = position.y + 'px';

                // Afficher le menu avec animation
                this.menuElement.classList.add('visible', 'animate-in');
                this.isVisible = true;

                // Retirer la classe d'animation après l'animation
                setTimeout(() => {
                    this.menuElement.classList.remove('animate-in');
                }, 400);
            });

            console.log(`Menu shown for ${cardInstance.type} card at position:`, position);
        } else {
            console.warn('Cannot show menu: invalid position');
        }
    }

    /**
     * Masque le menu flottant
     */
    hide() {
        if (!this.isVisible) return;

        // Animation de sortie
        this.menuElement.classList.add('animate-out');
        this.menuElement.classList.remove('visible');

        // Nettoyer après l'animation
        setTimeout(() => {
            this.menuElement.classList.remove('animate-out');
            this.isVisible = false;
            this.currentCard = null;
            this.currentCardInstance = null;
        }, 200);

        console.log('Menu hidden');
    }

    /**
     * Met à jour la position du menu
     * @param {HTMLElement} cardElement - Élément DOM de la carte
     */
    updatePosition(cardElement) {
        if (!this.isVisible || !cardElement) return;

        const position = this.calculateMenuPosition(cardElement);
        if (position) {
            // Appliquer la position avec transition fluide
            this.menuElement.classList.add('repositioning');
            this.menuElement.style.left = position.x + 'px';
            this.menuElement.style.top = position.y + 'px';

            // Ajuster l'échelle selon le zoom si nécessaire
            const zoomLevel = this.workspaceManager.zoomLevel || 1;
            if (zoomLevel < 0.8 || zoomLevel > 1.2) {
                const scale = Math.max(0.7, Math.min(1.2, zoomLevel));
                this.menuElement.style.transform = `scale(${scale})`;
                this.menuElement.classList.add('scaled');
            } else {
                this.menuElement.style.transform = '';
                this.menuElement.classList.remove('scaled');
            }

            // Retirer la classe de repositionnement après la transition
            setTimeout(() => {
                this.menuElement.classList.remove('repositioning');
            }, 200);

        } else {
            // Carte pas assez visible, masquer le menu
            this.hide();
        }
    }

    /**
     * Repositionne le menu en tenant compte du scroll et du zoom
     */
    handleViewportChange() {
        if (!this.isVisible || !this.currentCard) return;

        // Utiliser requestAnimationFrame pour optimiser les performances
        if (this.repositionTimeout) {
            cancelAnimationFrame(this.repositionTimeout);
        }

        this.repositionTimeout = requestAnimationFrame(() => {
            this.updatePosition(this.currentCard);
        });
    }

    /**
     * Calcule la position optimale du menu
     * @param {HTMLElement} cardElement - Élément DOM de la carte
     * @returns {Object|null} Position {x, y} ou null si impossible
     */
    calculateMenuPosition(cardElement) {
        const cardRect = cardElement.getBoundingClientRect();
        const menuWidth = this.menuElement.offsetWidth || this.estimateMenuWidth();
        const menuHeight = this.menuElement.offsetHeight || 50;

        // Vérifier si la carte est suffisamment visible à l'écran
        const visibilityThreshold = 0.3; // 30% de la carte doit être visible
        const cardVisibleWidth = Math.max(0, Math.min(cardRect.right, window.innerWidth) - Math.max(cardRect.left, 0));
        const cardVisibleHeight = Math.max(0, Math.min(cardRect.bottom, window.innerHeight) - Math.max(cardRect.top, 0));
        const cardVisibleArea = cardVisibleWidth * cardVisibleHeight;
        const cardTotalArea = cardRect.width * cardRect.height;

        if (cardTotalArea === 0 || cardVisibleArea / cardTotalArea < visibilityThreshold) {
            return null; // Carte pas assez visible
        }

        // Prendre en compte le zoom du workspace
        const zoomLevel = this.workspaceManager.zoomLevel || 1;
        const effectiveOffsetY = this.positioning.offsetY / Math.max(0.5, zoomLevel);

        // Position de base : centré au-dessus de la carte
        let x = cardRect.left + (cardRect.width - menuWidth) / 2;
        let y = cardRect.top + effectiveOffsetY;

        // Ajustements pour éviter les débordements

        // Débordement horizontal
        const minX = this.positioning.minMargin;
        const maxX = window.innerWidth - menuWidth - this.positioning.minMargin;

        if (x < minX) {
            x = minX;
        } else if (x > maxX) {
            x = maxX;
        }

        // Débordement vertical - logique améliorée
        const minY = this.positioning.minMargin;
        const maxY = window.innerHeight - menuHeight - this.positioning.minMargin;

        if (y < minY) {
            // Pas de place au-dessus, essayer en dessous
            const belowY = cardRect.bottom + 10;
            if (belowY + menuHeight <= maxY) {
                y = belowY;
            } else {
                // Pas de place non plus en dessous, forcer au minimum
                y = minY;
            }
        } else if (y > maxY) {
            // Débordement en bas, forcer au maximum
            y = maxY;
        }

        // Vérifier que la position finale est valide
        if (x < 0 || y < 0 || x + menuWidth > window.innerWidth || y + menuHeight > window.innerHeight) {
            console.warn('Menu position would be invalid, hiding menu');
            return null;
        }

        return {
            x: Math.round(x),
            y: Math.round(y),
            placement: y < cardRect.top ? 'above' : 'below' // Info sur le placement
        };
    }

    /**
     * Estime la largeur du menu selon le nombre d'actions visibles
     * @returns {number} Largeur estimée en pixels
     */
    estimateMenuWidth() {
        if (!this.currentCardInstance) return 300;

        // Compter les actions visibles pour ce type de carte
        let visibleActions = 0;
        this.actions.forEach((config) => {
            if (config.types.includes(this.currentCardInstance.type)) {
                visibleActions++;
            }
        });

        // Calcul basé sur : padding (32px) + actions (32px chacune) + gaps (12px entre chaque)
        const basePadding = 32;
        const actionWidth = 32;
        const gapWidth = 12;

        return basePadding + (visibleActions * actionWidth) + ((visibleActions - 1) * gapWidth);
    }

    /**
     * Met à jour les actions visibles selon le type de carte
     * @param {string} cardType - Type de carte ('text', 'file', etc.)
     */
    updateMenuActions(cardType) {
        let visibleCount = 0;

        this.actions.forEach((config, actionId) => {
            const button = this.menuElement.querySelector(`[data-action="${actionId}"]`);
            if (button) {
                if (config.types.includes(cardType)) {
                    button.style.display = 'flex';
                    button.classList.add(`action-${config.category}`);
                    visibleCount++;
                } else {
                    button.style.display = 'none';
                    button.classList.remove(`action-${config.category}`);
                }
            }
        });

        // Ajuster la largeur du menu selon le nombre d'actions visibles
        const actionsContainer = this.menuElement.querySelector('#menuActions');
        if (actionsContainer) {
            actionsContainer.setAttribute('data-action-count', visibleCount);
        }

        console.log(`Menu actions updated for card type: ${cardType} (${visibleCount} visible)`);
    }

    /**
     * Exécute une action sur la carte courante
     * @param {string} actionId - Identifiant de l'action à exécuter
     */
    executeAction(actionId) {
        if (!this.currentCardInstance) {
            console.warn(`Cannot execute action ${actionId}: no current card`);
            return false;
        }

        const actionConfig = this.actions.get(actionId);
        if (!actionConfig) {
            console.warn(`Unknown action: ${actionId}`);
            return false;
        }

        // Vérifier que l'action est disponible pour ce type de carte
        if (!actionConfig.types.includes(this.currentCardInstance.type)) {
            console.warn(`Action ${actionId} not available for card type ${this.currentCardInstance.type}`);
            return false;
        }

        const method = actionConfig.method;
        if (typeof this.currentCardInstance[method] === 'function') {
            try {
                // Exécuter l'action
                const result = this.currentCardInstance[method]();
                console.log(`Executed action ${actionId} (${method}) on card ${this.currentCardInstance.data.id}`);

                // Mettre à jour l'état visuel avec un petit délai pour laisser l'action se terminer
                setTimeout(() => {
                    this.updateActionStates();
                }, 50);

                // Feedback visuel pour l'action exécutée
                this.showActionFeedback(actionId, actionConfig);

                return result !== false; // Considérer comme succès sauf si explicitement false
            } catch (error) {
                console.error(`Error executing action ${actionId}:`, error);
                this.showActionError(actionId, error.message);
                return false;
            }
        } else {
            console.warn(`Method ${method} not found on card instance`);
            return false;
        }
    }

    /**
     * Affiche un feedback visuel pour une action exécutée
     * @param {string} actionId - Identifiant de l'action
     * @param {Object} actionConfig - Configuration de l'action
     */
    showActionFeedback(actionId, actionConfig) {
        const button = this.menuElement.querySelector(`[data-action="${actionId}"]`);
        if (button) {
            // Animation de feedback
            button.classList.add('action-executed');
            setTimeout(() => {
                button.classList.remove('action-executed');
            }, 300);
        }
    }

    /**
     * Affiche une erreur pour une action
     * @param {string} actionId - Identifiant de l'action
     * @param {string} errorMessage - Message d'erreur
     */
    showActionError(actionId, errorMessage) {
        const button = this.menuElement.querySelector(`[data-action="${actionId}"]`);
        if (button) {
            button.classList.add('action-error');
            setTimeout(() => {
                button.classList.remove('action-error');
            }, 1000);
        }

        console.error(`Action ${actionId} failed: ${errorMessage}`);
    }

    /**
     * Met à jour les états visuels des actions (actif/inactif)
     */
    updateActionStates() {
        if (!this.currentCardInstance) return;

        // Mettre à jour l'état du bouton épingler
        const pinButton = this.menuElement.querySelector('[data-action="pin"]');
        if (pinButton) {
            if (this.currentCardInstance.data.pinned) {
                pinButton.classList.add('active');
                pinButton.title = 'Désépingler';
            } else {
                pinButton.classList.remove('active');
                pinButton.title = 'Épingler';
            }
        }

        // Mettre à jour l'état du bouton collaboration
        const collabButton = this.menuElement.querySelector('[data-action="collaboration"]');
        if (collabButton && this.currentCardInstance.type === 'text') {
            console.log('🔄 Updating collaboration button state:', this.currentCardInstance.isDocumentMode);
            if (this.currentCardInstance.isDocumentMode) {
                collabButton.classList.add('active');
                collabButton.title = 'Retour vue normale';
            } else {
                collabButton.classList.remove('active');
                collabButton.title = 'Mode collaboration';
            }
        }
    }

    /**
     * Configure les event listeners
     */
    setupEventListeners() {
        if (!this.menuElement) return;

        // Gestion des clics sur les actions du menu
        this.menuElement.addEventListener('click', (e) => {
            const actionButton = e.target.closest('.menu-action');
            if (actionButton) {
                e.preventDefault();
                e.stopPropagation();

                const actionId = actionButton.getAttribute('data-action');
                if (actionId) {
                    this.executeAction(actionId);
                }
            }
        });

        // Empêcher la propagation des clics sur le menu
        this.menuElement.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        console.log('FloatingCardMenu event listeners configured');
    }

    /**
     * Nettoie les ressources du menu
     */
    destroy() {
        // Nettoyer les timeouts
        if (this.repositionTimeout) {
            cancelAnimationFrame(this.repositionTimeout);
            this.repositionTimeout = null;
        }

        if (this.showTimeout) {
            clearTimeout(this.showTimeout);
            this.showTimeout = null;
        }

        // Supprimer l'élément DOM
        if (this.menuElement) {
            this.menuElement.remove();
            this.menuElement = null;
        }

        // Nettoyer les références
        this.actions.clear();
        this.currentCard = null;
        this.currentCardInstance = null;
        this.isVisible = false;
        this.lastPosition = null;

        console.log('FloatingCardMenu destroyed');
    }
}

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FloatingCardMenu;
} else {
    window.FloatingCardMenu = FloatingCardMenu;
}
