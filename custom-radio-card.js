import { LitElement, html, css } from "https://unpkg.com/lit-element/lit-element.js?module";

class CustomRadioCard extends LitElement {
    static get properties() {
        return {
            hass: {},
            config: {},
            draggingStation: { type: Object },
            connections: { type: Object },
            selectedPlayer: { type: String },
            dragOverPlayer: { type: String }
        };
    }

    constructor() {
        super();
        this.draggingStation = null;
        this.connections = this.loadConnections();
        this.selectedPlayer = null;
        this.dragOverPlayer = null;
    }

    static get styles() {
        return css`
            ha-card { padding: 16px; }
            h3 { margin: 0 0 8px 0; font-size: 1em; font-weight: bold; }
            .stations, .players { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
            .station, .player {
                padding: 8px 12px;
                background: var(--secondary-background-color);
                border-radius: 4px;
                cursor: pointer;
                white-space: nowrap;
                user-select: none;
            }
            .station:hover, .player:hover { background: var(--primary-color); color: var(--text-primary-color); }
            .player.unavailable { opacity: 0.4; cursor: not-allowed; }
            .player.dragover { background: var(--primary-color); color: var(--text-primary-color); }
            .playing-station { display: block; color: var(--text-primary-color); font-size: 0.85em; margin-top: 2px; }
            /* .controls { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; min-height: 48px; }
            input[type="range"] { width: 150px; accent-color: var(--primary-color); }
            .percent-label { width: 40px; text-align: center; font-size: 0.9em; }
            .icon-btn {
                background: var(--secondary-background-color);
                border-radius: 50%;
                width: 36px; height: 36px;
                display: flex; align-items: center; justify-content: center;
                cursor: pointer;
            }
            .icon-btn:hover { background: var(--primary-color); color: var(--text-primary-color); } */
        `;
    }

    setConfig(config) {
        if (!config.stations || !config.media_players) throw new Error("You must define stations[] and media_players[] in card config");
        this.config = config;
    }

    loadConnections() { try { return JSON.parse(localStorage.getItem("customRadioCardConnections")) || {}; } catch (e) { return {}; } }
    saveConnections() { localStorage.setItem("customRadioCardConnections", JSON.stringify(this.connections)); }

    handleDragStart(station) { this.draggingStation = station; }
    handleDragOver(ev, entityId) { ev.preventDefault(); this.dragOverPlayer = entityId; this.requestUpdate(); }
    handleDragLeave() { this.dragOverPlayer = null; this.requestUpdate(); }
    handleDrop(entityId) {
        this.connections[entityId] = this.draggingStation;
        this.saveConnections();
        this.draggingStation = null;
        this.dragOverPlayer = null;
        this.requestUpdate();
        this.startStream(entityId, this.connections[entityId].url);
    }

    startStream(entityId, url) { this.hass.callService("media_player", "play_media", { entity_id: entityId, media_content_id: url, media_content_type: "music" }); }
    setVolume(entityId, vol) { this.hass.callService("media_player", "volume_set", { entity_id: entityId, volume_level: vol }); }
    toggleMute(entityId) { this.hass.callService("media_player", "volume_mute", { entity_id: entityId, is_volume_muted: !this.hass.states[entityId]?.attributes.is_volume_muted }); }
    control(entityId, act) { this.hass.callService("media_player", act, { entity_id: entityId }); }

    openSpeakerMoreInfo(entityId) { this.dispatchEvent(new CustomEvent("hass-more-info", { bubbles: true, composed: true, detail: { entityId } })); }

    addLongPress(el, entityId) {
        let longPressTimer; const delay = 500;
        el.addEventListener("touchstart", () => longPressTimer = setTimeout(() => this.openSpeakerMoreInfo(entityId), delay));
        el.addEventListener("touchend", () => clearTimeout(longPressTimer));
        el.addEventListener("mousedown", e => { if (e.button === 0) longPressTimer = setTimeout(() => this.openSpeakerMoreInfo(entityId), delay); });
        el.addEventListener("mouseup", () => clearTimeout(longPressTimer));
        el.addEventListener("mouseleave", () => clearTimeout(longPressTimer));
    }

    /* renderControls() {
        if (!this.selectedPlayer) return html`<div class="controls"></div>`;
        const stateObj = this.hass.states[this.selectedPlayer];
        if (!stateObj) return html`<div class="controls"></div>`;
        const connectedStation = this.connections[this.selectedPlayer];
        const state = stateObj.state;
        if (!connectedStation || (state !== "playing" && state !== "paused")) return html`<div class="controls"></div>`;
        const vol = (stateObj.attributes.volume_level ?? 0) * 100;
        const renderStateButtons = () => {
            if (state === "playing") return html`<div class="icon-btn" @click=${() => this.control(this.selectedPlayer, "media_pause")}><ha-icon icon="mdi:pause"></ha-icon></div><div class="icon-btn" @click=${() => this.control(this.selectedPlayer, "media_stop")}><ha-icon icon="mdi:stop"></ha-icon></div>`;
            if (state === "paused") return html`<div class="icon-btn" @click=${() => this.control(this.selectedPlayer, "media_play")}><ha-icon icon="mdi:play"></ha-icon></div><div class="icon-btn" @click=${() => this.control(this.selectedPlayer, "media_stop")}><ha-icon icon="mdi:stop"></ha-icon></div>`;
            return html``;
        };
        return html`
            <div class="controls">
                <input type="range" min="0" max="50" step="5" .value=${vol} @input=${e => this.setVolume(this.selectedPlayer, e.target.value / 100)}>
                <div class="percent-label">${Math.round(vol)}%</div>
                <div class="icon-btn" @click=${() => this.toggleMute(this.selectedPlayer)}><ha-icon icon="mdi:volume-off"></ha-icon></div>
                ${renderStateButtons()}
            </div>
        `;
    } */

    firstUpdated() {
        this.updateComplete.then(() => this.shadowRoot.querySelectorAll(".player").forEach(el => {
            const entityId = this.config.media_players.find(mp => el.textContent.includes(mp.name))?.entity_id;
            if (entityId) this.addLongPress(el, entityId);
        }));
    }

    render() {
        return html`
            <ha-card>
                <h3>Stations</h3>
                <div class="stations">${this.config.stations.map(st => html`<div class="station" draggable="true" @dragstart=${() => this.handleDragStart(st)}>${st.name}</div>`)}</div>
                <h3>Players</h3>
                <div class="players">${this.config.media_players.map(mp => {
            const stateObj = this.hass.states[mp.entity_id];
            const unavailable = !stateObj || stateObj.state === "unavailable" || stateObj.state === "unknown";
            const stationName = (stateObj?.state === "playing" || stateObj?.state === "paused") ? this.connections[mp.entity_id]?.name : null;
            const classes = unavailable ? "player unavailable" : this.dragOverPlayer === mp.entity_id ? "player dragover" : "player";
            return html`<div class="${classes}" id="${mp.entity_id}" @click=${() => { if (!unavailable) this.selectedPlayer = mp.entity_id; }} @dragover=${e => this.handleDragOver(e, mp.entity_id)} @dragleave=${() => this.handleDragLeave()} @drop=${() => this.handleDrop(mp.entity_id)}><strong>${mp.name}</strong>${stationName ? html`<span class="playing-station">${stationName}</span>` : ``}</div>`;
        })}</div>
                <!-- ${/* this.renderControls() */''} -->
            </ha-card>
        `;
    }
}

customElements.define("custom-radio-card", CustomRadioCard);
