/**
 * LoaderEgg - Avatar intelligent SVG avec animation IDLE ↔ THINKING
 * Gère les états et positions dynamiques selon le contexte
 */
class LoaderEgg extends HTMLElement {
  static STATES = {
    IDLE: 'idle',
    THINKING: 'thinking', 
    HIDDEN: 'hidden'
  };

  static POSITIONS = {
    INLINE: 'inline',   // Dans message (avatar)
    FLOATING: 'floating' // Sous messages (standby)
  };

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.currentState = LoaderEgg.STATES.IDLE;
    this.currentPosition = LoaderEgg.POSITIONS.INLINE;
    this.transformer = null;
    this._uid = Math.random().toString(36).substr(2, 9); // UID unique pour éviter conflits
  }

  connectedCallback() {
    this.render();
    this.initTransformer();
  }

  disconnectedCallback() {
    if (this.transformer) {
      this.transformer.destroy();
    }
  }

  // API publique
  setState(newState) {
    if (!Object.values(LoaderEgg.STATES).includes(newState)) {
      console.warn(`État invalide: ${newState}`);
      return;
    }

    this.currentState = newState;
    
    if (newState === LoaderEgg.STATES.THINKING) {
      this.transformer?.startTransformation();
    } else if (newState === LoaderEgg.STATES.IDLE) {
      this.transformer?.resetToIdle();
    } else if (newState === LoaderEgg.STATES.HIDDEN) {
      this.style.display = 'none';
    } else {
      this.style.display = 'inline-block';
    }
  }

  setPosition(position) {
    // Position simplifiée - seulement inline maintenant
    this.currentPosition = LoaderEgg.POSITIONS.INLINE;
    this.classList.add('inline');
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :root {
          --colour-1: #ffffff;
          --colour-4: #f9e479;
          --glass-bg: rgba(255, 255, 255, 0.85);
          --glass-border: rgba(123, 125, 127, 0.8); /* ← GRIS NICKEL avec opacité pour le contour */
        }

        :host {
          display: inline-block;
          transition: all 0.3s ease;
        }

        /* Position inline (avatar dans message) */
        :host(.inline) {
          width: 40px;
          height: 40px;
          vertical-align: middle;
        }

        /* Position floating supprimée - plus utilisée */

        .loader-container {
          width: 100%;
          height: 100%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* AJOUT : Forcer dimensions SVG */
        #mainSVG {
          width: 100%;
          height: 100%;
          display: block; /* IMPORTANT */
        }

        /* Traits de chaîne IDLE */
        .chain-connector {
          stroke: #7b7d7f;
          stroke-width: 1;
          opacity: 0.4;
          transition: opacity 0.8s ease;
        }

        .chain-connector.hidden {
          opacity: 0;
        }

        /* Traits vers centre THINKING */
        .connector {
          stroke: #7b7d7f;
          stroke-width: 1;
          opacity: 0;
          transition: opacity 0.8s ease;
        }

        .connector.visible {
          opacity: 0.8;
        }

        /* Boules grises avec effet glass et contour gris nickel */
        .outer {
          /* fill appliqué en JavaScript avec UID correct */
          stroke: var(--glass-border);
          stroke-width: 1;
          r: 2;
          filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.08)) 
                  drop-shadow(0 2px 8px rgba(0, 0, 0, 0.04)) 
                  drop-shadow(0 1px 3px rgba(255, 255, 255, 0.6));
          transition: all 0.3s ease;
        }

        /* Boules jaunes intérieures */
        .inner {
          fill: var(--colour-4);
          r: 0;
          opacity: 0;
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .inner.visible {
          r: 1.5;
          opacity: 1;
        }

        /* CORRECTION : Centre jaune proportionnel au conteneur */
        .center-core {
          width: 24%; /* ← PROPORTIONNEL : 24% du conteneur */
          height: 24%; /* ← PROPORTIONNEL : 24% du conteneur */
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle at 30% 30%,
                      rgba(249, 228, 121, 0.95) 0%,
                      rgba(249, 228, 121, 0.85) 40%,
                      rgba(249, 228, 121, 0.7) 100%);
          box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.15),
                      0 4px 8px rgba(0, 0, 0, 0.12),
                      0 0 0 2px rgba(249, 228, 121, 0.4),
                      0 6px 12px rgba(249, 228, 121, 0.3) inset,
                      0 -2px 6px rgba(255, 255, 255, 0.5) inset;
          backdrop-filter: blur(4px);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 1;
          z-index: 10; /* ← AJOUTÉ pour passer au-dessus des boules */
        }

        .center-core.hidden {
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.1);
        }

        /* Templates cachés */
        .template {
          display: none;
        }
      </style>

      <div class="loader-container">
        <svg id="mainSVG" viewBox="0 0 120 120" preserveAspectRatio="xMidYMid meet">
          <!-- ↑ AJOUTÉ preserveAspectRatio -->
          <defs>
            <radialGradient id="glass-gradient-${this._uid}" cx="0.3" cy="0.3" r="0.8">
              <!-- ↑ AJOUTÉ uid unique pour éviter conflits entre instances -->
              <stop offset="0%" stop-color="rgba(255, 255, 255, 0.95)"/>
              <stop offset="40%" stop-color="rgba(255, 255, 255, 0.85)"/>
              <stop offset="100%" stop-color="rgba(255, 255, 255, 0.75)"/>
            </radialGradient>
          </defs>
          <g id="container">
            <!-- Templates -->
            <line class="chain-connector template"></line>
            <line class="connector template"></line>
            <circle class="outer template" fill="url(#glass-gradient-${this._uid})"></circle>
            <circle class="inner template"></circle>
          </g>
        </svg>
        <div class="center-core" id="centerCore"></div>
      </div>
    `;
  }

  initTransformer() {
    // Adapter la classe IdleToThinkingTransform pour Shadow DOM
    this.transformer = new IdleToThinkingTransform(this.shadowRoot);
  }
}

/**
 * Classe IdleToThinkingTransform adaptée pour Shadow DOM
 */
class IdleToThinkingTransform {
  constructor(shadowRoot) {
    this.shadowRoot = shadowRoot;
    this.mainSVG = shadowRoot.querySelector('#mainSVG');
    this.container = shadowRoot.querySelector('#container');
    this.centerCore = shadowRoot.querySelector('#centerCore');
    
    this.num = 23;
    this.radius = 40;
    this.innerRadius = 18;
    this.step = (2 * Math.PI) / this.num;
    this.centerX = 60;
    this.centerY = 60;
    this.elements = [];
    this.currentState = 'idle';
    this.animationId = null;
    this.time = 0;
    this.waveSpeed = 0.04;
    this.waveAmplitude = 6;

    this.init();
  }

  init() {
    this.createIdleState();
  }

  createIdleState() {
    this.clearElements();
    const templates = this.getTemplates();

    for (let i = 0; i < this.num; i++) {
      const angle = i * this.step;
      const x = this.centerX + Math.cos(angle) * this.radius;
      const y = this.centerY + Math.sin(angle) * this.radius;
      const innerX = this.centerX + Math.cos(angle) * this.innerRadius;
      const innerY = this.centerY + Math.sin(angle) * this.innerRadius;

      const nextAngle = ((i + 1) % this.num) * this.step;
      const nextX = this.centerX + Math.cos(nextAngle) * this.radius;
      const nextY = this.centerY + Math.sin(nextAngle) * this.radius;

      const chainConnector = templates.chainConnector.cloneNode(true);
      const connector = templates.connector.cloneNode(true);
      const outer = templates.outer.cloneNode(true);
      const inner = templates.inner.cloneNode(true);

      this.setupElement(chainConnector, connector, outer, inner);

      // Chaîne vers boule suivante (visible en IDLE)
      chainConnector.setAttribute('x1', x);
      chainConnector.setAttribute('y1', y);
      chainConnector.setAttribute('x2', nextX);
      chainConnector.setAttribute('y2', nextY);

      // Trait vers centre (caché en IDLE)
      connector.setAttribute('x1', innerX);
      connector.setAttribute('y1', innerY);
      connector.setAttribute('x2', x);
      connector.setAttribute('y2', y);

      // Boule grise externe
      outer.setAttribute('cx', x);
      outer.setAttribute('cy', y);
      outer.setAttribute('fill', `url(#glass-gradient-${this._uid})`); // ← Application du gradient avec UID correct

      // Boule jaune interne (cachée en IDLE)
      inner.setAttribute('cx', innerX);
      inner.setAttribute('cy', innerY);

      this.container.appendChild(chainConnector);
      this.container.appendChild(connector);
      this.container.appendChild(outer);
      this.container.appendChild(inner);

      this.elements.push({
        chainConnector,
        connector,
        outer,
        inner,
        angle,
        baseInnerX: innerX,
        baseInnerY: innerY,
        outerX: x,
        outerY: y,
        phase: i * (2 * Math.PI / this.num)
      });
    }
  }

  async startTransformation() {
    if (this.currentState !== 'idle') return;
    
    this.currentState = 'transforming';

    // Phase 1: Centre jaune disparaît
    this.centerCore.classList.add('hidden');
    await this.delay(800);

    // Phase 2: Boules jaunes apparaissent + traits se révèlent
    this.elements.forEach((el, i) => {
      setTimeout(() => {
        el.inner.classList.add('visible');
        el.connector.classList.add('visible');
        el.chainConnector.classList.add('hidden');
      }, i * 50);
    });

    await this.delay(this.elements.length * 50 + 500);

    // Phase 3: Animation THINKING
    this.currentState = 'thinking';
    this.startWaveAnimation();
  }

  startWaveAnimation() {
    const animate = () => {
      if (this.currentState !== 'thinking') return;

      this.elements.forEach((element) => {
        const lateralOffset = Math.sin(this.time + element.phase) * this.waveAmplitude;
        const tangentX = -Math.sin(element.angle);
        const tangentY = Math.cos(element.angle);
        const innerX = element.baseInnerX + tangentX * lateralOffset;
        const innerY = element.baseInnerY + tangentY * lateralOffset;

        element.inner.setAttribute('cx', innerX);
        element.inner.setAttribute('cy', innerY);
        element.connector.setAttribute('x1', innerX);
        element.connector.setAttribute('y1', innerY);
      });

      this.time += this.waveSpeed;
      this.animationId = requestAnimationFrame(animate);
    };

    animate();
  }

  async resetToIdle() {
    if (this.currentState === 'idle') return;

    this.currentState = 'resetting';

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    // Reset animation et éléments
    this.elements.forEach((el, i) => {
      setTimeout(() => {
        el.inner.classList.remove('visible');
        el.connector.classList.remove('visible');
        el.chainConnector.classList.remove('hidden');

        // Reset positions
        el.inner.setAttribute('cx', el.baseInnerX);
        el.inner.setAttribute('cy', el.baseInnerY);
        el.connector.setAttribute('x1', el.baseInnerX);
        el.connector.setAttribute('y1', el.baseInnerY);
      }, i * 30);
    });

    await this.delay(this.elements.length * 30 + 300);

    // Centre réapparaît
    this.centerCore.classList.remove('hidden');
    this.currentState = 'idle';
    this.time = 0;
  }

  getTemplates() {
    return {
      chainConnector: this.container.querySelector('.chain-connector.template'),
      connector: this.container.querySelector('.connector.template'),
      outer: this.container.querySelector('.outer.template'),
      inner: this.container.querySelector('.inner.template')
    };
  }

  setupElement(chainConnector, connector, outer, inner) {
    [chainConnector, connector, outer, inner].forEach(el => {
      el.classList.remove('template');
      el.style.display = '';
    });
  }

  clearElements() {
    this.elements.forEach(el => {
      [el.chainConnector, el.connector, el.outer, el.inner].forEach(elem => {
        if (elem && elem.parentNode) {
          elem.parentNode.removeChild(elem);
        }
      });
    });
    this.elements = [];
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// Enregistrer le custom element
customElements.define('loader-egg', LoaderEgg);

// LoaderEgg est disponible globalement via customElements.define()
// Accessible dans tout le code via document.createElement('loader-egg')
console.log('✅ LoaderEgg component registered globally');
