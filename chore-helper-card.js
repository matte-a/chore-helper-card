class ChoreHelperCard extends HTMLElement {
  setConfig(config) {
    // Default configuration options
    this.config = {
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
  
        .mark-done-button {
          background-color: var(--primary-color);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 4px 12px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
  
        .mark-done-button:hover {
          background-color: var(--primary-color-dark);
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
      const dueDate = new Date(chore.attributes.due_date || chore.state);

      if (this.config.show_overdue && dueDate < now) {
        return true; // Include overdue chores
      }

      if (
        this.config.show_future &&
        dueDate >= now &&
        dueDate <= new Date(now.getTime() + this.config.show_future * 24 * 60 * 60 * 1000)
      ) {
        return true; // Include future chores within the specified range
      }

      return false; // Exclude others
    });

    filteredChores.sort((a, b) => {
      const dueDateA = new Date(a.attributes.due_date || a.state);
      const dueDateB = new Date(b.attributes.due_date || b.state);
      const stateA = parseInt(a.state, 10);
      const stateB = parseInt(b.state, 10);
    
      // Overdue chores first
      if (dueDateA < now && dueDateB >= now) return -1;
      if (dueDateA >= now && dueDateB < now) return 1;
    
      // Chores with state 0 next
      if (stateA === 0 && stateB !== 0) return -1;
      if (stateA !== 0 && stateB === 0) return 1;
    
      // Sort remaining by state (ascending order)
      return stateA - stateB;
    });
    

    if (filteredChores.length === 0) {
      this.content.innerHTML = `<p>No chores matching the criteria were found.</p>`;
      return;
    }

    // Render the list of chores with buttons
    this.content.innerHTML = `
      <h1 class="card-header">Chores</h1>
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
