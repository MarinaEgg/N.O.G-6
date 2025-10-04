/**
 * LoaderEgg - Avatar intelligent SVG avec animation IDLE ↔ THINKING
 * Gère les états et positions dynamiques selon le contexte
 * 
 * VERSION : CORRECTIONS VISUELLES IDLE (SANS TOUCHER À LA LOGIQUE)
 */
class LoaderEgg extends HTMLElement {
  static STATES = {
    IDLE: 'idle',
    THINKING: 'thinking', 
    HIDDEN: 'hidden'
  };

  static POSITIONS = {
    INLINE: 'inline',
    FLOATING: 'floating'
  };

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.currentState = LoaderEgg.STATES.IDLE;
    this.currentPosition = LoaderEgg.POSITIONS.INLINE;
    this.transformer = null;
    this._uid = Math.random().toString(36).substr(2, 9);
    
    this.setAttribute('data-state', 'idle');
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

  setState(newState) {
    if (!Object.values(LoaderEgg.STATES).includes(newState)) {
      console.warn(`État invalide: ${newState}`);
      return;
    }

    this.currentState = newState;
    this.setAttribute('data-state', newState);
    
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
          --glass-border: #7b7d7f;
        }

        :host {
          display: inline-block;
          transition: all 0.3s ease;
        }

        :host(.inline) {
          width: 60px;
          height: 60px;
          vertical-align: middle;
        }

        .loader-container {
          width: 100%;
          height: 100%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        #mainSVG {
          width: 100%;
          height: 100%;
          display: block;
        }

        /* ✅ CORRECTION : Traits de chaîne SUPPRIMÉS en IDLE (remplacés par boules) */
        .chain-connector {
          stroke: rgba(123, 125, 127, 0.6);
          stroke-width: 1.5;
          opacity: 0; /* ← CACHÉ par défaut, boules visibles à la place */
          transition: opacity 0.8s ease;
        }

        .chain-connector.hidden {
          opacity: 0;
        }

        /* Traits vers centre THINKING */
        .connector {
          stroke: rgba(123, 125, 127, 0.3);
          stroke-width: 1.5;
          opacity: 0;
          transition: opacity 0.8s ease;
        }

        .connector.visible {
          opacity: 1;
        }

        /* ✅ CORRECTION : Boules grises TOUJOURS VISIBLES en IDLE */
        .outer {
          stroke: var(--glass-border);
          stroke-width: 1.5;
          r: 3;
          filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.12))
                  drop-shadow(0 1px 4px rgba(0, 0, 0, 0.08));
          transition: all 0.3s ease;
          opacity: 1; /* ← TOUJOURS VISIBLE */
        }

        /* Boules jaunes intérieures (THINKING uniquement) */
        .inner {
          fill: var(--colour-4);
          r: 0;
          opacity: 0;
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .inner.visible {
          r: 2.5;
          opacity: 1;
        }

        /* ✅ CORRECTION : Centre jaune IDLE réduit pour matcher le rayon intérieur THINKING */
        .center-core {
          width: 26%; /* ← RÉDUIT de 30% à 26% */
          height: 26%; /* ← RÉDUIT de 30% à 26% */
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          
          background: radial-gradient(circle at 30% 30%,
                      rgba(249, 228, 121, 1) 0%,
                      rgba(249, 228, 121, 0.9) 40%,
                      rgba(249, 228, 121, 0.75) 100%);
          
          box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.2),
                      0 4px 12px rgba(0, 0, 0, 0.15),
                      0 0 0 2px rgba(249, 228, 121, 0.5),
                      0 8px 16px rgba(249, 228, 121, 0.4) inset,
                      0 -3px 8px rgba(255, 255, 255, 0.6) inset;
          
          backdrop-filter: blur(4px);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 1;
          z-index: 10;
        }

        .center-core.hidden {
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.1);
        }

        .template {
          display: none;
        }
      </style>

      <div class="loader-container">
        <svg id="mainSVG" viewBox="0 0 120 120" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="glass-gradient-${this._uid}" cx="0.3" cy="0.3" r="0.8">
              <stop offset="0%" stop-color="rgba(255, 255, 255, 0.95)"/>
              <stop offset="40%" stop-color="rgba(255, 255, 255, 0.85)"/>
              <stop offset="100%" stop-color="rgba(255, 255, 255, 0.75)"/>
            </radialGradient>
          </defs>
          <g id="container">
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
    this.transformer = new IdleToThinkingTransform(this.shadowRoot, this._uid);
  }
}

/**
 * Classe IdleToThinkingTransform - LOGIQUE INCHANGÉE
 */
class IdleToThinkingTransform {
  constructor(shadowRoot, uid) {
    this.shadowRoot = shadowRoot;
    this._uid = uid;
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

      // Chaîne vers boule suivante (CACHÉE en IDLE maintenant)
      chainConnector.setAttribute('x1', x);
      chainConnector.setAttribute('y1', y);
      chainConnector.setAttribute('x2', nextX);
      chainConnector.setAttribute('y2', nextY);

      // Trait vers centre (caché en IDLE)
      connector.setAttribute('x1', innerX);
      connector.setAttribute('y1', innerY);
      connector.setAttribute('x2', x);
      connector.setAttribute('y2', y);

      // Boule grise externe (TOUJOURS VISIBLE)
      outer.setAttribute('cx', x);
      outer.setAttribute('cy', y);
      outer.setAttribute('fill', `url(#glass-gradient-${this._uid})`);

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

customElements.define('loader-egg', LoaderEgg);
console.log('✅ LoaderEgg component registered globally');
