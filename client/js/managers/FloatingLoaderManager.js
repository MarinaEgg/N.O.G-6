/**
 * FloatingLoaderManager - Gestionnaire singleton pour l'instance "standby"
 * Gère le loader global qui descend sous les messages en attente de nouvel input
 */
import LoaderEgg from '../components/LoaderEgg.js';

class FloatingLoaderManager {
  constructor() {
    this.loader = null;
    this.isInitialized = false;
    this.init();
  }

  init() {
    // S'assurer que le DOM est prêt
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.createLoader());
    } else {
      this.createLoader();
    }
  }

  createLoader() {
    if (this.isInitialized) return;

    // Créer loader global floating
    this.loader = document.createElement('loader-egg');
    this.loader.setPosition('floating');
    this.loader.setState('idle');
    this.loader.style.display = 'none'; // Caché au départ
    
    // Ajouter au body
    document.body.appendChild(this.loader);
    this.isInitialized = true;

    console.log('FloatingLoaderManager: Loader global créé');
  }

  /**
   * Affiche le loader en mode IDLE (standby)
   */
  show() {
    if (!this.loader) {
      console.warn('FloatingLoaderManager: Loader non initialisé');
      return;
    }

    this.loader.style.display = 'block';
    this.loader.setState('idle');
  }

  /**
   * Cache complètement le loader
   */
  hide() {
    if (!this.loader) return;
    
    this.loader.style.display = 'none';
  }

  /**
   * Affiche et démarre l'animation THINKING
   */
  startThinking() {
    if (!this.loader) {
      console.warn('FloatingLoaderManager: Loader non initialisé');
      return;
    }

    this.show();
    this.loader.setState('thinking');
  }

  /**
   * Arrête l'animation THINKING et revient en IDLE
   */
  stopThinking() {
    if (!this.loader) return;
    
    this.loader.setState('idle');
  }

  /**
   * Vérifie si le loader est visible
   */
  isVisible() {
    return this.loader && this.loader.style.display !== 'none';
  }

  /**
   * Obtient l'état actuel du loader
   */
  getCurrentState() {
    return this.loader?.currentState || null;
  }

  /**
   * Nettoyage pour tests ou rechargement
   */
  destroy() {
    if (this.loader && this.loader.parentNode) {
      this.loader.parentNode.removeChild(this.loader);
    }
    this.loader = null;
    this.isInitialized = false;
  }
}

// Export singleton
export default new FloatingLoaderManager();
