// FPSTracker.js
class FPSTracker {
  constructor({ smooth = 0.9, history = 240, uiHz = 4 } = {}) {
    this.smooth = smooth;             // 0..1 (closer to 1 = smoother)
    this.uiIntervalMs = 1000 / uiHz;  // how often to refresh the overlay
    this.history = new Array(history).fill(16.67); // ms samples
    this.i = 0;

    this.lastT = performance.now();
    this.lastUiT = this.lastT;

    this.dtMs = 16.67;     // last frame in ms
    this.avgMs = 16.67;    // EMA of frame time
    this.minMs = Infinity; // rolling min over history window
    this.maxMs = 0;        // rolling max over history window

    // UI
    this.el = this._makeOverlay();
    this._renderNow();
  }

  frame(now = performance.now()) {
    // raw frame time
    let dt = now - this.lastT;
    this.lastT = now;

    this.dtMs = dt;

    // exponential moving average
    this.avgMs = this.smooth * this.avgMs + (1 - this.smooth) * dt;

    // keep a small history for min/max
    this.history[this.i] = dt;
    this.i = (this.i + 1) % this.history.length;
    this.minMs = Math.min(...this.history);
    this.maxMs = Math.max(...this.history);

    // refresh overlay at uiHz
    if (now - this.lastUiT >= this.uiIntervalMs) {
      this.lastUiT = now;
      this._renderNow();
    }
  }

  get fpsInstant() { return 1000 / this.dtMs; }
  get fpsSmooth()  { return 1000 / this.avgMs; }

  reset(now = performance.now()) {
    this.lastT = now;
    this.lastUiT = now;
    this.dtMs = this.avgMs = 16.67;
    this.history.fill(16.67);
    this.minMs = 16.67;
    this.maxMs = 16.67;
    this._renderNow();
  }

  _makeOverlay() {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position: 'fixed',
      top: '8px',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '6px 8px',
      background: 'rgba(0,0,0,0.6)',
      color: '#0f0',
      font: '12px/1.2 monospace',
      borderRadius: '6px',
      pointerEvents: 'none',
      zIndex: 99999,
      whiteSpace: 'pre',
      userSelect: 'none',
    });
    document.body.appendChild(el);
    return el;
  }

  _renderNow() {
    const fInst = this.fpsInstant;
    const fAvg  = this.fpsSmooth;
    const ms = (x)=>x.toFixed(2).padStart(6,' ');
    const fs = (x)=>x.toFixed(1).padStart(5,' ');
    this.el.textContent =
      `FPS avg ${fs(fAvg)} | inst ${fs(fInst)}\n` +
      `ms  avg ${ms(this.avgMs)} | min ${ms(this.minMs)} | max ${ms(this.maxMs)}`;
  }
}
