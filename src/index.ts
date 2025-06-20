
import type { HomeAssistant, } from 'custom-card-helpers';

import type { HassEntity } from 'home-assistant-js-websocket';
import { LitElement, css, html } from "lit-element";
import "./ChoreHelperItem";
import type { ConfigDefaultType, ConfigType } from "./types/Config.type";

class ChoreHelperCard extends LitElement {

    private declare _hass: HomeAssistant;
    private declare config: ConfigType;
    private _status: string = "";
    private _chores: HassEntity[] = [];

    private _loadingChores: Set<string> = new Set();

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
            chores.forEach((c) => {

                if (this._loadingChores.has(c.entity_id) && +c.state === 0) {
                    this._loadingChores.delete(c.entity_id);
                }
            })

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
            return html`<li>
                        <chore-helper-item
                            .chore="${chore}"
                            .state="${state}"
                            .show_future="${this.config.show_future}"
                            .loading="${this._loadingChores.has(chore.entity_id)}"
                            @chore-complete="${(e: CustomEvent) => this._markChoreAsCompleted(e.detail.entityId)}"
                        ></chore-helper-item>
                    </li>
                    `;
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
          gap: 10px;
          margin:0;
        }
          .card-content ul li{
            z-index:1;
          }
          .card-content ul li chore-helper-item{
            display: flex; 
            justify-content: space-between; 
            align-items: center;
            background-color:var(--bubble-main-background-color, var(--background-color-2, var(--secondary-background-color)));
            border-radius:25px;
            padding: 5px 12px;
            gap: 10px;
            z-index:1;
          }
        .card-content ul li chore-helper-item .icon{
            flex:0 0 40px;
            border-radius: 45px;
            padding: 10px 0;
            display: flex;
            background-color: var(--bubble-button-icon-background-color, var(--bubble-icon-background-color, var(--bubble-secondary-background-color, var(--card-background-color, var(--ha-card-background)))));
            justify-content:center;
        }
        .card-content ul li chore-helper-item .name{
            flex:1 1 30%;
        }
        .card-content ul li chore-helper-item .button{
            cursor:pointer;
            margin-left:20px;
        }
     .button {
        cursor: pointer;
        margin-left: 20px;
      }
      .loader {
        display:block;
        border: 2px solid #f3f3f3;
        border-top: 2px solid #555;
        border-radius: 50%;
        width: 18px;
        height: 18px;
        animation: spin 1s linear infinite;
        display: inline-block;
      }
      @keyframes spin {
        0% { transform: rotate(0deg);}
        100% { transform: rotate(360deg);}
      }
    `;
    }


    _markChoreAsCompleted(entityId: string) {
        if (this._loadingChores.has(entityId)) return;
        this._loadingChores.add(entityId);
        this.requestUpdate();
        this._hass.callService("chore_helper", "complete", {
            entity_id: entityId,
        })
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
