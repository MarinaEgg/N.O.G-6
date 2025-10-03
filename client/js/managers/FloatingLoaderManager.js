/**
 * FloatingLoaderManager - Gestionnaire singleton
 * PAS D'IMPORT ES6 - LoaderEgg déjà enregistré globalement
 */

class FloatingLoaderManager {
  constructor() {
    this.loader = null;
    this.isInitialized = false;
  }

  init() {
    // Attendre que customElements soit défini
    if (!window.customElements || !customElements.get('loader-egg')) {
      console.warn('⚠️ LoaderEgg not registered yet, retrying...');
      setTimeout(() => this.init(), 100);
      return;
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.createLoader());
    } else {
      this.createLoader();
    }
  }

  createLoader() {
    if (this.isInitialized) return;

    // Vérifier que loader-egg est bien défini
    if (!customElements.get('loader-egg')) {
      console.error('❌ loader-egg custom element not defined!');
      return;
    }

    this.loader = document.createElement('loader-egg');
    this.loader.setPosition('floating');
    this.loader.setState('idle');
    this.loader.style.display = 'none';
    
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

// ✅ Export singleton GLOBAL (pas ES6)
window.floatingLoader = new FloatingLoaderManager();
window.floatingLoader.init();

console.log('✅ FloatingLoaderManager loaded globally');
