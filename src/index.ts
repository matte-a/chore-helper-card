
import type { HomeAssistant, } from 'custom-card-helpers';

import type { HassEntity } from 'home-assistant-js-websocket';
import { LitElement, css, html } from "lit-element";
import type { ConfigDefaultType, ConfigType } from "./types/Config.type";
class ChoreHelperCard extends LitElement {
    private declare hass: HomeAssistant;
    private declare config: ConfigType;
    public setConfig(config: ConfigDefaultType) {

        // Default configuration options
        this.config = {
            title: 'Chores',
            show_today: true,
            show_overdue: true,
            show_future: 7, // Number of days into the future to display chores
            ...config, // Allow overriding via user configuration
        };
    }

    public render() {


        // Filter entities with device_class: chore_helper__schedule
        const chores: HassEntity[] = Object.values(this.hass.states).filter(
            (entity) => entity.attributes.device_class === "chore_helper__schedule"
            , this);

        if (chores.length === 0) {
            return html`<p>No chores found.</p>`;
        }

        // Filter chores based on config
        let filteredChores: HassEntity[] = [];

        if (this.config.show_all)
            filteredChores = chores
        else {

            chores.filter((chore) => {
                const state = parseInt(chore.state);

                if (this.config.show_today && state == 0) return true;

                // Include overdue chores if show_overdue is enabled
                if (this.config.show_overdue && state < 0) {
                    return true;
                }

                // Include future chores within the specified range
                if (
                    this.config.show_future > 0 &&
                    state > 0 &&
                    state <= this.config.show_future
                ) {
                    return true;
                }

                // Exclude chores outside the range
                return false;
            });

        }

        filteredChores.sort((a, b) => {
            const stateA = parseInt(a.state, 10);
            const stateB = parseInt(b.state, 10);

            return stateA - stateB; // Sort by state in ascending order
        });


        const title = this.config.title ? `<h1 class="card-header">${this.config.title}</h1>` : "";

        if (filteredChores.length === 0) {
            return html`${title}<div class="card-content"><p>No chores matching the criteria were found.</p></div>`;
        }

        // Render the list of chores with buttons

        return html`
                ${title}
                <div class="card-content">
                    <ul>
                    ${filteredChores
                .map(
                    (chore) => {
                        const state = parseInt(chore.state);
                        return html`
                        <li>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span>
                            <ha-icon icon="${chore.attributes.icon}"
                            style="width: 20px; height: 20px;">
                            </ha-icon>
                            <strong>${chore.attributes.friendly_name}:</strong> ${this._render_due(state)}</span>

                    ${this.config.show_future > state ? html`
                                <mwc-icon-button class="track-button"
                                                .label="Track"
                                                @click="${() => this._markChoreAsCompleted(chore.entity_id)}"
                                                data-entity="${chore.entity_id}"}
                                                >
                                    <ha-icon class="track-button-icon" icon='mdi:check-circle-outline'></ha-icon>
                                </mwc-icon-button>
                                `: html``}
                            </div>
                        </li>
                        `
                    }
                )
            }
                    </ul>
                </div>

         `;

    }
    static get styles() {
        return css`
         ul {
          list-style: none;
          padding: 0;
        }
       
        .card-content ul {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

    `;
    }


    _markChoreAsCompleted(entityId: string) {
        console.log("Mark as complete: " + entityId)
        this.hass.callService("chore_helper", "complete", {
            entity_id: entityId,
        });
    }

    _render_due(state: number) {
        if (state == 0) {
            return "Today";
        }
        else if (state == 1) {
            return "1 day";
        }
        else if (state > 1) {
            return state + " days";
        }
        else if (state < 0) {
            return state + " day(s).";
        }
    }

    getCardSize() {
        return 3; // Approximate height in rows
    }
}

customElements.define("chore-helper-card", ChoreHelperCard);
