/*
 * Energy Optimizer Card
 * Read-only Lovelace card for the observe-only optimizer pipeline.
 */

const DEFAULT_ENTITIES = {
  soc: "sensor.optimizer_battery_soc",
  load: "sensor.optimizer_load_power",
  grid: "sensor.optimizer_grid_power",
  pv: "sensor.optimizer_pv_power",
  charge: "sensor.optimizer_battery_charge_power",
  discharge: "sensor.optimizer_battery_discharge_power",
  current_price: "sensor.nord_pool_se4_current_price",
  next_price: "sensor.nord_pool_se4_next_price",
  health: "sensor.energy_optimizer_health",
  data_quality: "binary_sensor.optimizer_data_quality_problem",
  replay: "sensor.energy_optimizer_replay_safety_status",
  retention: "sensor.energy_optimizer_retention_audit",
  forecast: "sensor.energy_optimizer_forecast_status",
  billing_validated: "sensor.energy_optimizer_billing_validated",
  grid_import: "sensor.energy_optimizer_estimated_grid_import",
  variable_cost: "sensor.energy_optimizer_variable_cost_incl_vat",
  savings: "sensor.energy_optimizer_estimated_savings",
  fixed_fee: "sensor.energy_optimizer_fixed_fee_reference_month",
};

const DEFAULT_CONFIG = {
  title: "Energy Optimizer",
  show_financials: true,
  show_safety: true,
  show_timeline: true,
  entities: DEFAULT_ENTITIES,
};

const CARD_STYLES = `
  :host { display: block; }
  ha-card { overflow: hidden; }
  .card { padding: 20px; color: var(--primary-text-color); }
  .header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 18px; }
  .title-wrap { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .title-icon { color: var(--accent-color, var(--primary-color)); font-size: 28px; }
  h1 { font-size: 21px; line-height: 1.2; margin: 0; font-weight: 600; }
  .subtitle { color: var(--secondary-text-color); font-size: 12px; margin-top: 3px; }
  .badge { border-radius: 999px; padding: 6px 10px; font-size: 12px; white-space: nowrap; background: var(--secondary-background-color); color: var(--secondary-text-color); }
  .badge.observe { background: color-mix(in srgb, var(--primary-color) 16%, transparent); color: var(--primary-color); }
  .badge.good { background: rgba(76, 175, 80, .16); color: #70c174; }
  .badge.warn { background: rgba(255, 193, 7, .18); color: #f6c744; }
  .badge.bad { background: rgba(244, 67, 54, .18); color: #ff7b72; }
  .hero { display: grid; grid-template-columns: minmax(150px, .85fr) minmax(0, 1.15fr); gap: 18px; align-items: center; }
  .soc-panel { display: grid; place-items: center; padding: 4px; }
  .soc-ring { --soc: 0%; width: 152px; height: 152px; border-radius: 50%; display: grid; place-items: center; background: conic-gradient(var(--primary-color) var(--soc), var(--divider-color) 0); position: relative; }
  .soc-ring::after { content: ""; position: absolute; inset: 11px; border-radius: 50%; background: var(--ha-card-background, var(--card-background-color)); }
  .soc-value { z-index: 1; text-align: center; font-size: 31px; font-weight: 600; }
  .soc-label { z-index: 1; font-size: 12px; color: var(--secondary-text-color); margin-top: -48px; }
  .stat-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }
  .stat { background: var(--secondary-background-color); border-radius: 12px; padding: 11px 12px; min-width: 0; }
  .stat-label { color: var(--secondary-text-color); font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .stat-value { font-size: 16px; font-weight: 600; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .section { border-top: 1px solid var(--divider-color); margin-top: 18px; padding-top: 15px; }
  .section-title { font-size: 13px; font-weight: 600; margin-bottom: 10px; color: var(--secondary-text-color); text-transform: uppercase; letter-spacing: .04em; }
  .status-grid, .money-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
  .status, .money { border: 1px solid var(--divider-color); border-radius: 10px; padding: 9px 10px; min-width: 0; }
  .status-name, .money-name { font-size: 11px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .status-value, .money-value { margin-top: 4px; font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .status-value.good { color: #70c174; }
  .status-value.warn { color: #f6c744; }
  .status-value.bad { color: #ff7b72; }
  .notice { margin-top: 14px; border-radius: 10px; padding: 11px 12px; font-size: 12px; line-height: 1.45; background: color-mix(in srgb, var(--primary-color) 11%, transparent); }
  .notice.warn { background: rgba(255, 193, 7, .13); }
  .notice.bad { background: rgba(244, 67, 54, .13); }
  .footer { margin-top: 16px; font-size: 11px; color: var(--secondary-text-color); display: flex; justify-content: space-between; gap: 12px; }
  .timeline-controls { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 8px; }
  .day-buttons { display: inline-flex; gap: 6px; }
  .day-button { border: 1px solid var(--divider-color); border-radius: 999px; padding: 5px 10px; background: transparent; color: var(--secondary-text-color); font: inherit; font-size: 11px; cursor: pointer; }
  .day-button.active { background: var(--primary-color); color: var(--text-primary-color, #fff); border-color: var(--primary-color); }
  .day-button:disabled { opacity: .42; cursor: not-allowed; }
  .timeline-meta { color: var(--secondary-text-color); font-size: 11px; text-align: right; }
  .timeline-svg { display: block; width: 100%; height: auto; min-height: 190px; }
  .timeline-grid { stroke: var(--divider-color); stroke-width: 1; opacity: .72; }
  .timeline-axis { fill: var(--secondary-text-color); font-size: 10px; }
  .timeline-price { fill: none; stroke: #f6c744; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
  .timeline-soc { fill: none; stroke: #66bb6a; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
  .timeline-load { fill: none; stroke: #42a5f5; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 6 4; }
  .timeline-legend { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 4px; color: var(--secondary-text-color); font-size: 11px; }
  .legend-item { display: inline-flex; align-items: center; gap: 5px; }
  .legend-swatch { width: 18px; height: 3px; border-radius: 3px; display: inline-block; }
  .legend-swatch.price { background: #f6c744; }
  .legend-swatch.soc { background: #66bb6a; }
  .legend-swatch.load { background: #42a5f5; }
  .timeline-empty { border: 1px dashed var(--divider-color); border-radius: 10px; padding: 12px; color: var(--secondary-text-color); font-size: 12px; }
  .unavailable { color: var(--secondary-text-color); font-style: italic; }
  @media (max-width: 650px) {
    .card { padding: 15px; }
    .hero { grid-template-columns: 1fr; }
    .soc-ring { width: 132px; height: 132px; }
    .status-grid, .money-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .footer { display: block; }
    .footer span { display: block; margin-top: 4px; }
  }
`;

const escapeHtml = (value) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

class EnergyOptimizerCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = { ...DEFAULT_CONFIG, entities: { ...DEFAULT_ENTITIES } };
    this._hass = undefined;
  }

  setConfig(config) {
    if (!config || typeof config !== "object") {
      throw new Error("A card configuration object is required");
    }
    this._config = {
      ...DEFAULT_CONFIG,
      ...config,
      entities: { ...DEFAULT_ENTITIES, ...(config.entities || {}) },
    };
    this._render();
  }

  set hass(value) {
    this._hass = value;
    this._render();
  }

  get hass() {
    return this._hass;
  }

  getCardSize() {
    return 7;
  }

  getGridOptions() {
    return { rows: 7, columns: 12, min_rows: 5, min_columns: 6, max_columns: 12 };
  }

  static getStubConfig() {
    return { title: "Energy Optimizer", show_financials: true, show_safety: true };
  }

  static getConfigForm() {
    return {
      schema: [
        { name: "title", selector: { text: {} } },
        { name: "show_financials", selector: { boolean: {} } },
        { name: "show_safety", selector: { boolean: {} } },
        { name: "show_timeline", selector: { boolean: {} } },
      ],
    };
  }

  _entity(key) {
    return this._config.entities[key];
  }

  _state(key) {
    const entity = this._hass?.states?.[this._entity(key)];
    return entity || { state: "unavailable", attributes: {} };
  }

  _number(key) {
    const value = Number.parseFloat(this._state(key).state);
    return Number.isFinite(value) ? value : undefined;
  }

  _display(key, fallback = "—") {
    const entity = this._state(key);
    if (!entity || entity.state === "unavailable" || entity.state === "unknown") return fallback;
    const unit = entity.attributes?.unit_of_measurement || "";
    return `${entity.state}${unit ? ` ${unit}` : ""}`;
  }

  _status(key) {
    const value = this._state(key).state;
    const normalized = String(value).toLowerCase();
    if (key === "data_quality") {
      if (["off", "false", "no"].includes(normalized)) return { text: "OK", className: "good" };
      if (["on", "true", "yes", "problem"].includes(normalized)) return { text: "Problem", className: "bad" };
    }
    if (["ok", "on", "true", "yes"].includes(normalized)) return { text: "OK", className: "good" };
    if (["off", "false", "no"].includes(normalized)) return { text: "Pending", className: "warn" };
    if (["unavailable", "unknown", "error", "problem"].includes(normalized)) return { text: value, className: "bad" };
    if (normalized.includes("insufficient") || normalized.includes("degraded")) return { text: value, className: "warn" };
    return { text: value, className: "" };
  }

  _stat(label, value) {
    return `<div class="stat"><div class="stat-label">${escapeHtml(label)}</div><div class="stat-value">${escapeHtml(value)}</div></div>`;
  }

  _statusBox(label, key) {
    const status = this._status(key);
    return `<div class="status"><div class="status-name">${escapeHtml(label)}</div><div class="status-value ${status.className}">${escapeHtml(status.text)}</div></div>`;
  }

  _moneyBox(label, key) {
    return `<div class="money"><div class="money-name">${escapeHtml(label)}</div><div class="money-value">${escapeHtml(this._display(key))}</div></div>`;
  }

  _dayStart(offset = 0) {
    const value = new Date();
    value.setHours(0, 0, 0, 0);
    value.setDate(value.getDate() + offset);
    return value;
  }

  _priceEntries(raw, dayStart) {
    if (!Array.isArray(raw)) return [];
    return raw.map((entry, index) => {
      let value;
      let timestamp;
      if (entry && typeof entry === "object") {
        value = entry.value ?? entry.price ?? entry.total ?? entry.state;
        timestamp = entry.start ?? entry.start_time ?? entry.timestamp ?? entry.datetime ?? entry.time ?? entry.date;
      } else {
        value = entry;
      }
      const numeric = Number.parseFloat(value);
      const parsed = timestamp === undefined ? Number.NaN : Date.parse(timestamp);
      return {
        ts: Number.isFinite(parsed) ? parsed : dayStart.getTime() + index * 15 * 60 * 1000,
        value: numeric,
      };
    }).filter((point) => Number.isFinite(point.value));
  }

  _priceSeries(day) {
    const entity = this._state("current_price");
    const dayStart = this._dayStart(day === "tomorrow" ? 1 : 0);
    const values = day === "tomorrow" ? entity.attributes?.tomorrow : entity.attributes?.today;
    return this._priceEntries(values, dayStart);
  }

  _historyPoints(key, day) {
    if (day !== "today") return [];
    const start = this._dayStart(0).getTime();
    const end = start + 24 * 60 * 60 * 1000;
    return (this._history?.[key] || []).filter((point) => point.ts >= start && point.ts < end);
  }

  _linePath(points, min, max, width, height, left, top) {
    if (!points.length) return "";
    const range = max - min || 1;
    const dayStart = this._dayStart(this._selectedDay === "tomorrow" ? 1 : 0).getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;
    let active = false;
    return points.map((point) => {
      if (!Number.isFinite(point.value)) {
        active = false;
        return "";
      }
      const ratio = Math.max(0, Math.min(1, (point.ts - dayStart) / (dayEnd - dayStart)));
      const x = left + ratio * width;
      const y = top + (1 - (point.value - min) / range) * height;
      const command = `${active ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      active = true;
      return command;
    }).join(" ");
  }

  _timelineMarkup() {
    const todayPrices = this._priceSeries("today");
    const tomorrowPrices = this._priceSeries("tomorrow");
    const hasTomorrow = tomorrowPrices.length > 0;
    if (!hasTomorrow && this._selectedDay === "tomorrow") this._selectedDay = "today";
    const day = this._selectedDay || "today";
    const prices = day === "tomorrow" ? tomorrowPrices : todayPrices;
    const soc = this._historyPoints("soc", day);
    const load = this._historyPoints("load", day);
    const allPrices = prices.map((point) => point.value);
    const priceMin = allPrices.length ? Math.min(...allPrices) : 0;
    const priceMax = allPrices.length ? Math.max(...allPrices) : 1;
    const allLoads = load.map((point) => point.value).filter(Number.isFinite);
    const loadMax = allLoads.length ? Math.max(...allLoads, 1) : 1;
    const width = 720;
    const height = 190;
    const left = 46;
    const right = 16;
    const top = 18;
    const bottom = 28;
    const plotWidth = width - left - right;
    const plotHeight = height - top - bottom;
    const pricePath = this._linePath(prices, priceMin, priceMax, plotWidth, plotHeight, left, top);
    const socPath = this._linePath(soc, 0, 100, plotWidth, plotHeight, left, top);
    const loadPath = this._linePath(load, 0, loadMax, plotWidth, plotHeight, left, top);
    const empty = !prices.length && !soc.length && !load.length;
    const dateLabel = this._dayStart(day === "tomorrow" ? 1 : 0).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
    const tomorrowText = hasTomorrow ? "Tomorrow" : "Tomorrow unavailable";
    const note = day === "tomorrow" && (soc.length === 0 || load.length === 0)
      ? `<div class="timeline-empty">Tomorrow's prices are available. SOC and house load are shown only for measured history, so future traces remain blank.</div>`
      : "";
    if (empty) {
      return `<div class="section"><div class="section-title">Price, SOC & load</div><div class="timeline-controls"><div class="day-buttons"><button class="day-button active" data-day="today">Today</button><button class="day-button" data-day="tomorrow" disabled>${tomorrowText}</button></div><div class="timeline-meta">No timeline data yet</div></div><div class="timeline-empty">The Nord Pool sensor does not expose a price curve yet. Measured SOC and house-load history will appear here once available.</div></div>`;
    }
    const gridLines = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
      const y = top + ratio * plotHeight;
      return `<line class="timeline-grid" x1="${left}" x2="${width - right}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" />`;
    }).join("");
    const xLabels = [0, 6, 12, 18, 24].map((hour) => {
      const x = left + (hour / 24) * plotWidth;
      return `<text class="timeline-axis" text-anchor="middle" x="${x.toFixed(1)}" y="${height - 8}">${String(hour).padStart(2, "0")}:00</text>`;
    }).join("");
    return `<div class="section"><div class="section-title">Price, SOC & load</div><div class="timeline-controls"><div class="day-buttons"><button class="day-button ${day === "today" ? "active" : ""}" data-day="today">Today</button><button class="day-button ${day === "tomorrow" ? "active" : ""}" data-day="tomorrow" ${hasTomorrow ? "" : "disabled"}>${tomorrowText}</button></div><div class="timeline-meta">${escapeHtml(dateLabel)} · SEK/kWh · % · W</div></div><svg class="timeline-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Electricity price, battery state of charge, and house load timeline">${gridLines}<text class="timeline-axis" x="4" y="${top + 4}">${priceMax.toFixed(2)}</text><text class="timeline-axis" x="4" y="${top + plotHeight}">${priceMin.toFixed(2)}</text><text class="timeline-axis" text-anchor="end" x="${width - 2}" y="${top + 10}">SOC 100%</text><text class="timeline-axis" text-anchor="end" x="${width - 2}" y="${top + plotHeight}">Load ${Math.round(loadMax)} W</text>${pricePath ? `<path class="timeline-price" d="${pricePath}" />` : ""}${socPath ? `<path class="timeline-soc" d="${socPath}" />` : ""}${loadPath ? `<path class="timeline-load" d="${loadPath}" />` : ""}${xLabels}</svg><div class="timeline-legend"><span class="legend-item"><span class="legend-swatch price"></span>Price</span><span class="legend-item"><span class="legend-swatch soc"></span>Battery SOC</span><span class="legend-item"><span class="legend-swatch load"></span>House load</span></div>${note}</div>`;
  }

  async _refreshHistory() {
    if (!this._hass?.callApi || this._historyLoading) return;
    const now = Date.now();
    if (now - (this._historyFetched || 0) < 5 * 60 * 1000) return;
    this._historyLoading = true;
    const start = this._dayStart(-1).toISOString();
    const end = this._dayStart(1).toISOString();
    const ids = [this._entity("soc"), this._entity("load")].join(",");
    try {
      const rows = await this._hass.callApi("GET", `history/period/${encodeURIComponent(start)}?filter_entity_id=${encodeURIComponent(ids)}&end_time=${encodeURIComponent(end)}&minimal_response`);
      const result = { soc: [], load: [] };
      for (const series of rows || []) {
        const first = series?.[0]?.entity_id || "";
        const key = first === this._entity("soc") ? "soc" : first === this._entity("load") ? "load" : undefined;
        if (!key) continue;
        result[key] = series.map((item) => ({ ts: Date.parse(item.last_changed || item.last_updated), value: Number.parseFloat(item.state) })).filter((point) => Number.isFinite(point.ts) && Number.isFinite(point.value));
      }
      this._history = result;
      this._historyFetched = now;
    } catch (error) {
      this._historyError = error;
    } finally {
      this._historyLoading = false;
      this._render();
    }
  }

  _render() {
    if (!this.shadowRoot) return;
    const soc = this._number("soc");
    const socValue = soc === undefined ? "—" : `${soc.toFixed(1)}%`;
    const health = this._status("health");
    const dataQuality = this._state("data_quality").state;
    const billing = this._state("billing_validated").state;
    const forecast = this._state("forecast").state;
    const warnings = [];
    if (["on", "true", "problem"].includes(String(dataQuality).toLowerCase())) {
      warnings.push(`<div class="notice bad"><strong>Data quality needs attention.</strong> Keep the optimizer observe-only and review the journal.</div>`);
    }
    if (["false", "off"].includes(String(billing).toLowerCase())) {
      warnings.push(`<div class="notice warn"><strong>Billing is not validated.</strong> Cost figures remain estimates until reconciled with an authoritative meter export.</div>`);
    }
    if (String(forecast).toLowerCase().includes("insufficient")) {
      warnings.push(`<div class="notice"><strong>Forecast is warming up.</strong> Recommendations remain disabled until enough history is collected.</div>`);
    }

    this.shadowRoot.innerHTML = `
      <style>${CARD_STYLES}</style>
      <ha-card>
        <div class="card">
          <div class="header">
            <div class="title-wrap">
              <ha-icon class="title-icon" icon="mdi:lightning-bolt-circle"></ha-icon>
              <div><h1>${escapeHtml(this._config.title)}</h1><div class="subtitle">Live read-only system overview</div></div>
            </div>
            <div class="badge observe ${health.className}">Observe-only · ${escapeHtml(health.text)}</div>
          </div>
          <div class="hero">
            <div class="soc-panel">
              <div class="soc-ring" style="--soc:${soc === undefined ? 0 : Math.max(0, Math.min(100, soc))}%">
                <div class="soc-value">${escapeHtml(socValue)}</div><div class="soc-label">Battery SOC</div>
              </div>
            </div>
            <div class="stat-grid">
              ${this._stat("Home load", this._display("load"))}
              ${this._stat("Grid power", this._display("grid"))}
              ${this._stat("PV power", this._display("pv"))}
              ${this._stat("Battery charging", this._display("charge"))}
              ${this._stat("Battery discharging", this._display("discharge"))}
              ${this._stat("Current price", this._display("current_price"))}
              ${this._stat("Next price", this._display("next_price"))}
              ${this._stat("Forecast", this._state("forecast").state)}
            </div>
          </div>
          ${this._config.show_timeline ? this._timelineMarkup() : ""}
          ${this._config.show_safety ? `
            <div class="section"><div class="section-title">Safety & readiness</div><div class="status-grid">
              ${this._statusBox("Data quality", "data_quality")}
              ${this._statusBox("Replay safety", "replay")}
              ${this._statusBox("Forecast", "forecast")}
              ${this._statusBox("Billing validated", "billing_validated")}
              ${this._statusBox("Retention", "retention")}
            </div></div>` : ""}
          ${this._config.show_financials ? `
            <div class="section"><div class="section-title">Cost snapshot</div><div class="money-grid">
              ${this._moneyBox("Estimated import", "grid_import")}
              ${this._moneyBox("Variable cost incl. VAT", "variable_cost")}
              ${this._moneyBox("Estimated savings", "savings")}
              ${this._moneyBox("Fixed fee reference", "fixed_fee")}
            </div></div>` : ""}
          ${warnings.join("")}
          <div class="footer"><span>Battery limits: 10–90% SOC</span><span>No inverter commands are issued by this card</span></div>
        </div>
      </ha-card>`;
    const dayButtons = this.shadowRoot.querySelectorAll?.(".day-button:not(:disabled)") || [];
    dayButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this._selectedDay = button.dataset.day;
        this._render();
      });
    });
    this._refreshHistory();
  }
}

customElements.define("energy-optimizer-card", EnergyOptimizerCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "energy-optimizer-card",
  name: "Energy Optimizer Card",
  description: "Read-only live overview for the Energy Optimizer pipeline.",
  preview: true,
});
