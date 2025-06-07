
import type { HomeAssistant, } from 'custom-card-helpers';

import type { HassEntity } from 'home-assistant-js-websocket';
import { LitElement, css, html } from "lit-element";
import type { ConfigDefaultType, ConfigType } from "./types/Config.type";
class ChoreHelperCard extends LitElement {

    private declare _hass: HomeAssistant;
    private declare config: ConfigType;
    private _status: string = "";
    private _chores: HassEntity[] = [];


    static properties = {
        _status: { type: String }
    };

    constructor() {
        super();
        this._status = "";
    }

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

    public set hass(hass: HomeAssistant) {
        this._hass = hass;
        let chores = Object.values(hass.states).filter((entity) => entity.attributes.device_class === "chore_helper__schedule", this)
        let state = chores
            .map(a => a.state + "").join("");

        if (state !== this._status) {
            this._chores = chores;
            this._status = state;
        }

    }
    public render() {


        // Filter entities with device_class: chore_helper__schedule


        if (!this._chores || this._chores.length === 0) {
            return html`<p>No chores found.</p>`;
        }

        // Filter chores based on config
        let filteredChores: HassEntity[] = [];

        if (this.config.show_all)
            filteredChores = this._chores
        else {

            this._chores.filter((chore) => {
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
            return html`<div class="card-content">${title}<p>No chores matching the criteria were found.</p></div>`;
        }

        // Render the list of chores with buttons

        return html`
            <div class="card-content">
                ${title}
                    <ul>
                    ${filteredChores.map((chore) => {
            const state = parseInt(chore.state);
            return html`
                        <li>
                            <ha-icon class="icon" icon="${chore.attributes.icon}"style="width: 20px; height: 20px;"></ha-icon>
                            <strong class="name">${chore.attributes.friendly_name}</strong> 
                            <span class="state">${this._render_due(state)}</span>

                        ${this.config.show_future > state ? html`
                                <div class="button"
                                                @click="${() => this._markChoreAsCompleted(chore.entity_id)}"
                                                >
                                    <ha-icon class="track-button-icon" icon='mdi:check-circle-outline'></ha-icon>
                                </div>
                                `: html``}
                        </li>
                    `
        })
            }   
                    </ul>
            </div>
        `;
    }

    static get styles() {
        return css`
        .card-content{
            padding: 16px;
        }
         ul {
          list-style: none;
          padding: 0;
        }
       
        .card-content ul {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
          .card-content ul li{
            display: flex; 
            justify-content: space-between; 
            align-items: baseline;
            background-color:black;
            border-radius:25px;
            padding:12px;
          }
        .card-content ul li .icon{
        flex:0 0 40px;
        }
        .card-content ul li .name{
            flex:1 1 30%;
        }
        .card-content ul li .button{
            cursor:pointer;
            margin-left:20px;
        }

    `;
    }


    _markChoreAsCompleted(entityId: string) {
        console.log("Mark as complete: " + entityId)
        this._hass.callService("chore_helper", "complete", {
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
