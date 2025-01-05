class ChoreHelperCard extends HTMLElement {
  setConfig(config) {
    // Default configuration options
    this.config = {
      title: 'Chores',
      show_today: true,
      show_overdue: true,
      show_future: 7, // Number of days into the future to display chores
      ...config, // Allow overriding via user configuration
    };
  }

  set hass(hass) {
    this._hass = hass;

    if (!this.content) {
      this.content = document.createElement('ha-card');
      const style = document.createElement("style");
      style.textContent = `
        ul {
          list-style: none;
          padding: 0;
        }
        ha-card {
          padding: 16px;
          font-family: Arial, sans-serif;
        }
  
        .header {
          font-size: 1.5em;
          margin: 0 0 16px;
          color: var(--primary-text-color);
        }
  
        .card-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
  
        .chore-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--card-background-color);
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid var(--divider-color);
        }
  
        .chore-item.overdue {
          border-color: var(--error-color);
        }
  
        .chore-info {
          display: flex;
          flex-direction: column;
        }
  
        .chore-name {
          font-size: 1.2em;
          font-weight: bold;
        }
  
        .chore-due-date {
          font-size: 0.9em;
          color: var(--secondary-text-color);
        }
      `;
      this.appendChild(style);
      this.appendChild(this.content);
    }

    // Filter entities with device_class: chore_helper__schedule
    const chores = Object.values(hass.states).filter(
      (entity) => entity.attributes.device_class === "chore_helper__schedule"
    );

    if (chores.length === 0) {
      this.content.innerHTML = `<p>No chores found.</p>`;
      return;
    }

    // Filter chores based on config
    const now = new Date();
    const filteredChores = chores.filter((chore) => {
      const state = chore.state;
    
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
    

    filteredChores.sort((a, b) => {
      const stateA = parseInt(a.state, 10);
      const stateB = parseInt(b.state, 10);
    
      return stateA - stateB; // Sort by state in ascending order
    });
    
    

    if (filteredChores.length === 0) {
      this.content.innerHTML = `<h1 class="card-header">Chores</h1><div class="card-content"><p>No chores matching the criteria were found.</p></div>`;
      return;
    }

    // Render the list of chores with buttons
    this.content.innerHTML = `
      <h1 class="card-header">${this.config.title}</h1>
      <div class="card-content">
        <ul>
        ${filteredChores
          .map(
            (chore) => `
          <li>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span><strong>${chore.attributes.friendly_name}:</strong> ${this._render_due(chore.state)}</span>
                <mwc-icon-button class="track-button"
                                .label="Track"
                                data-entity="${chore.entity_id}"}
                                >
                    <ha-icon class="track-button-icon" icon='mdi:check-circle-outline'></ha-icon>
                </mwc-icon-button>
            </div>
          </li>
        `
          )
          .join("")}
        </ul>
      </div>

    `;

    // Add event listeners to all buttons
    this.content.querySelectorAll(".track-button").forEach((button) =>
      button.addEventListener("click", (e) => {
        const entityId = e.currentTarget.dataset.entity;
        this._markChoreAsCompleted(entityId);
      })
    );
  }

  _markChoreAsCompleted(entityId) {
    console.log("Mark as complete: " + entityId)
    this._hass.callService("chore_helper", "complete", {
      entity_id: entityId,
    });
  }

  _render_due(state) {
    if(state == 0){
      return "Today";
    }
    else if (state == 1){
      return "1 day";
    }
    else if (state > 1) {
      return state + " days";
    }
    else if (state < 0)
    {
      return state + " day(s).";
    }
  }

  getCardSize() {
    return 3; // Approximate height in rows
  }
}

customElements.define("chore-helper-card", ChoreHelperCard);
