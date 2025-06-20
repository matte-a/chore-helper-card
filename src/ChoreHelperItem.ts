import { LitElement, html } from "lit-element";

export class ChoreHelperItem extends LitElement {
    static properties = {
        chore: { type: Object },
        state: { type: Number },
        loading: { type: Boolean },
        show_future: { type: Number },
    };

    chore: any;
    state: number = 0;
    loading: boolean = false;
    show_future: number = 0;

    createRenderRoot() {
        return this; // Render in light DOM instead of shadow DOM
    }
    render() {
        return html`

            <ha-icon class="icon" icon="${this.chore.attributes.icon}" style="width: 20px; height: 20px;"></ha-icon>
            <strong class="name">${this.chore.attributes.friendly_name}</strong>
            <span class="state">${this._renderDue(this.state)}</span>
             ${this.show_future > this.state ? html`<div class="button"
                @click="${this._onComplete}"
                style="pointer-events: ${this.loading ? 'none' : 'auto'}; opacity: ${this.loading ? 0.5 : 1};"
            >
              ${this.loading
                    ? html`<span class="loader"></span>`
                    : html`<ha-icon class="track-button-icon" icon='mdi:check-circle-outline'></ha-icon>`
                }
            </div>`: html``}

        `;
    }

    _renderDue(state: number) {
        if (state == 0) return "Today";
        if (state == 1) return "1 day";
        if (state > 1) return state + " days";
        if (state < 0) return state + " day(s).";
    }

    async _onComplete() {
        if (this.loading) return;
        this.loading = true;
        this.dispatchEvent(new CustomEvent('chore-complete', {
            detail: { entityId: this.chore.entity_id },
            bubbles: true,
            composed: true,
        }));
    }
}

customElements.define("chore-helper-item", ChoreHelperItem);