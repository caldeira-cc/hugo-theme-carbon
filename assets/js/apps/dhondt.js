// Interactive D'Hondt Method Election Simulator
// IBM Carbon Design System v11 Component Island

(function () {
  const PRESETS = {
    parliament: {
      name: "National Parliament Sample",
      totalSeats: 230,
      threshold: 0,
      parties: [
        { name: "Socialist Party (PS)", votes: 1812020, color: "#da1e28" },
        { name: "Democratic Alliance (AD)", votes: 1867464, color: "#ff832b" },
        { name: "Chega (CH)", votes: 1169836, color: "#198038" },
        { name: "Liberal Initiative (IL)", votes: 319685, color: "#0f62fe" },
        { name: "Left Bloc (BE)", votes: 282033, color: "#8a3ffc" },
        { name: "Communist-Greens (CDU)", votes: 205436, color: "#a2191f" },
        { name: "Livre (L)", votes: 204676, color: "#007d79" },
        { name: "People-Animals-Nature (PAN)", votes: 126085, color: "#0043ce" }
      ]
    },
    council: {
      name: "Metropolitan City Council",
      totalSeats: 15,
      threshold: 3,
      parties: [
        { name: "Progressive Coalition", votes: 45200, color: "#0f62fe" },
        { name: "Civic Union", votes: 38900, color: "#ff832b" },
        { name: "Green Alliance", votes: 19400, color: "#198038" },
        { name: "Social Democrats", votes: 12100, color: "#da1e28" },
        { name: "Independent Voice", votes: 4800, color: "#8a3ffc" }
      ]
    },
    regional: {
      name: "Regional Assembly",
      totalSeats: 21,
      threshold: 5,
      parties: [
        { name: "Democratic Party", votes: 125000, color: "#0f62fe" },
        { name: "National Union", votes: 98000, color: "#ff832b" },
        { name: "Social Ecology", votes: 42000, color: "#198038" },
        { name: "Reform Movement", votes: 21000, color: "#8a3ffc" },
        { name: "Local First", votes: 8500, color: "#007d79" }
      ]
    }
  };

  let state = {
    totalSeats: 15,
    threshold: 3,
    parties: JSON.parse(JSON.stringify(PRESETS.council.parties))
  };

  function calculateDhondt(totalSeats, threshold, parties) {
    const totalVotes = parties.reduce((sum, p) => sum + (parseInt(p.votes, 10) || 0), 0);
    const minVotesRequired = totalVotes * (threshold / 100);

    // Filter parties that meet the threshold
    const eligibleParties = parties.map((p, idx) => ({
      ...p,
      originalIndex: idx,
      votes: parseInt(p.votes, 10) || 0,
      seats: 0,
      isEligible: (parseInt(p.votes, 10) || 0) >= minVotesRequired
    }));

    // Build quotient matrix
    const allQuotients = [];
    eligibleParties.forEach(party => {
      if (!party.isEligible || party.votes <= 0) return;
      for (let s = 1; s <= totalSeats; s++) {
        allQuotients.push({
          partyName: party.name,
          color: party.color,
          partyIndex: party.originalIndex,
          divisor: s,
          quotient: party.votes / s,
          allocated: false,
          seatNumber: null
        });
      }
    });

    // Sort quotients descending
    allQuotients.sort((a, b) => b.quotient - a.quotient);

    // Allocate seats
    const allocatedSeats = [];
    const maxAllocations = Math.min(totalSeats, allQuotients.length);
    for (let i = 0; i < maxAllocations; i++) {
      allQuotients[i].allocated = true;
      allQuotients[i].seatNumber = i + 1;
      allocatedSeats.push(allQuotients[i]);
      eligibleParties[allQuotients[i].partyIndex].seats++;
    }

    return {
      totalVotes,
      minVotesRequired,
      eligibleParties,
      allQuotients,
      allocatedSeats
    };
  }

  function renderApp() {
    const container = document.getElementById('dhondt-app-root');
    if (!container) return;

    const result = calculateDhondt(state.totalSeats, state.threshold, state.parties);

    container.innerHTML = `
      <div class="cds--grid cds--grid--full-width">
        
        <!-- Controls & Configuration Section -->
        <div class="cds--row" style="margin-bottom: 1.5rem;">
          <div class="cds--col-lg-16">
            <div class="cds--tile" style="padding: 1.5rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem;">
                <div>
                  <h2 class="cds--type-heading-04" style="margin: 0 0 0.25rem 0;">Simulation Parameters</h2>
                  <p class="cds--type-body-short-01" style="color: var(--cds-text-secondary); margin: 0;">Configure seats, electoral thresholds, and party data.</p>
                </div>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                  <label for="dhondt-preset" class="cds--type-label">Presets:</label>
                  <select id="dhondt-preset" class="theme-select" style="height: 32px;">
                    <option value="council" selected>City Council (15 seats)</option>
                    <option value="regional">Regional Assembly (21 seats)</option>
                    <option value="parliament">National Parliament (230 seats)</option>
                  </select>
                </div>
              </div>

              <div class="cds--row">
                <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-6" style="margin-bottom: 1rem;">
                  <label class="cds--type-label" for="dhondt-seats-input">Total Seats to Allocate</label>
                  <input type="number" id="dhondt-seats-input" min="1" max="500" value="${state.totalSeats}" class="csvw-search-input" style="width: 100%; height: 40px; margin-top: 0.25rem;">
                </div>
                <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-6" style="margin-bottom: 1rem;">
                  <label class="cds--type-label" for="dhondt-threshold-input">Electoral Threshold (%)</label>
                  <input type="number" id="dhondt-threshold-input" min="0" max="20" step="0.5" value="${state.threshold}" class="csvw-search-input" style="width: 100%; height: 40px; margin-top: 0.25rem;">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Metric KPI Cards -->
        <div class="cds--row" style="margin-bottom: 1.5rem;">
          <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-4" style="margin-bottom: 1rem;">
            <div class="cds--tile" style="padding: 1rem;">
              <span class="cds--type-label">Total Valid Votes</span>
              <div class="cds--type-heading-05" style="margin: 0.25rem 0 0; font-family: 'IBM Plex Mono', monospace;">
                ${result.totalVotes.toLocaleString()}
              </div>
            </div>
          </div>
          <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-4" style="margin-bottom: 1rem;">
            <div class="cds--tile" style="padding: 1rem;">
              <span class="cds--type-label">Seats Allocated</span>
              <div class="cds--type-heading-05" style="margin: 0.25rem 0 0; font-family: 'IBM Plex Mono', monospace;">
                ${result.allocatedSeats.length} / ${state.totalSeats}
              </div>
            </div>
          </div>
          <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-4" style="margin-bottom: 1rem;">
            <div class="cds--tile" style="padding: 1rem;">
              <span class="cds--type-label">Electoral Threshold</span>
              <div class="cds--type-heading-05" style="margin: 0.25rem 0 0; font-family: 'IBM Plex Mono', monospace;">
                ${Math.round(result.minVotesRequired).toLocaleString()} votes (${state.threshold}%)
              </div>
            </div>
          </div>
          <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-4" style="margin-bottom: 1rem;">
            <div class="cds--tile" style="padding: 1rem;">
              <span class="cds--type-label">Majority Benchmark</span>
              <div class="cds--type-heading-05" style="margin: 0.25rem 0 0; font-family: 'IBM Plex Mono', monospace;">
                ${Math.floor(state.totalSeats / 2) + 1} Seats
              </div>
            </div>
          </div>
        </div>

        <!-- Proportional Parliament Diagram / Seat Distribution Bar -->
        <div class="cds--row" style="margin-bottom: 2rem;">
          <div class="cds--col-lg-16">
            <div class="cds--tile" style="padding: 1.5rem;">
              <h3 class="cds--type-heading-03" style="margin: 0 0 1rem 0;">Seat Distribution Visualization</h3>
              
              <!-- Segmented Proportional Bar -->
              <div style="display: flex; height: 36px; width: 100%; border-radius: 4px; overflow: hidden; background-color: var(--cds-layer-02); border: 1px solid var(--cds-border-subtle-01); margin-bottom: 1.25rem;">
                ${result.eligibleParties.map(p => {
                  if (p.seats === 0) return '';
                  const pct = ((p.seats / state.totalSeats) * 100).toFixed(1);
                  return `
                    <div style="width: ${pct}%; background-color: ${p.color}; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; font-family: 'IBM Plex Mono', monospace; text-shadow: 0 1px 2px rgba(0,0,0,0.5);" title="${p.name}: ${p.seats} seats (${pct}%)">
                      ${p.seats >= 1 ? `${p.seats}` : ''}
                    </div>
                  `;
                }).join('')}
              </div>

              <!-- Party Result Badges -->
              <div style="display: flex; flex-wrap: wrap; gap: 1rem;">
                ${result.eligibleParties.map(p => `
                  <div style="display: flex; align-items: center; gap: 0.5rem; background: var(--cds-layer-02); padding: 0.375rem 0.75rem; border-radius: 2px; border-left: 4px solid ${p.color};">
                    <span style="font-weight: 600; font-size: 0.8125rem;">${escapeHtml(p.name)}</span>
                    <span class="cds--tag ${p.seats > 0 ? 'cds--tag--green' : 'cds--tag--gray'}" style="margin: 0;">
                      ${p.seats} ${p.seats === 1 ? 'seat' : 'seats'} (${result.totalVotes > 0 ? ((p.votes / result.totalVotes) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- Party Input Manager Table -->
        <div class="cds--row" style="margin-bottom: 2rem;">
          <div class="cds--col-lg-16">
            <div class="cds--tile" style="padding: 1.5rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3 class="cds--type-heading-03" style="margin: 0;">Party List & Votes</h3>
                <button type="button" class="cds--btn cds--btn--secondary cds--btn--sm" id="dhondt-add-party-btn">
                  + Add Party
                </button>
              </div>

              <div class="cds--table-wrapper">
                <table class="cds--data-table cds--data-table--zebra" aria-label="Parties and Votes Table">
                  <thead>
                    <tr>
                      <th style="width: 40px;">Color</th>
                      <th>Party Name</th>
                      <th style="width: 180px;">Vote Count</th>
                      <th style="width: 120px;">Vote %</th>
                      <th style="width: 120px;">Seats Won</th>
                      <th style="width: 80px;">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${state.parties.map((party, idx) => {
                      const voteCount = parseInt(party.votes, 10) || 0;
                      const votePct = result.totalVotes > 0 ? ((voteCount / result.totalVotes) * 100).toFixed(2) : '0.00';
                      const seatsWon = result.eligibleParties[idx] ? result.eligibleParties[idx].seats : 0;
                      const isEligible = result.eligibleParties[idx] ? result.eligibleParties[idx].isEligible : true;

                      return `
                        <tr>
                          <td>
                            <input type="color" class="party-color-input" data-index="${idx}" value="${party.color}" style="width: 32px; height: 32px; padding: 0; border: none; cursor: pointer; background: transparent;">
                          </td>
                          <td>
                            <input type="text" class="party-name-input" data-index="${idx}" value="${escapeHtml(party.name)}" style="width: 100%; height: 32px; background: var(--cds-field-01); border: 1px solid var(--cds-border-subtle-01); color: var(--cds-text-primary); padding: 0 0.5rem;">
                          </td>
                          <td>
                            <input type="number" class="party-votes-input" data-index="${idx}" value="${voteCount}" min="0" style="width: 100%; height: 32px; background: var(--cds-field-01); border: 1px solid var(--cds-border-subtle-01); color: var(--cds-text-primary); padding: 0 0.5rem; font-family: 'IBM Plex Mono', monospace;">
                          </td>
                          <td class="col-mono">
                            ${votePct}%
                            ${!isEligible ? '<span class="cds--tag cds--tag--red" style="font-size: 0.625rem; margin-left: 4px;">Below Threshold</span>' : ''}
                          </td>
                          <td>
                            <span class="cds--tag ${seatsWon > 0 ? 'cds--tag--green' : 'cds--tag--gray'}">
                              <strong>${seatsWon}</strong>
                            </span>
                          </td>
                          <td>
                            <button type="button" class="cds--btn cds--btn--ghost cds--btn--sm party-remove-btn" data-index="${idx}" style="color: var(--cds-support-error);" aria-label="Remove party">
                              ✕
                            </button>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Quotient Matrix Calculation Breakdown -->
        <div class="cds--row">
          <div class="cds--col-lg-16">
            <div class="cds--tile" style="padding: 1.5rem;">
              <h3 class="cds--type-heading-03" style="margin: 0 0 0.5rem 0;">D'Hondt Quotient Matrix (Rounds 1 to ${Math.min(state.totalSeats, 10)})</h3>
              <p class="cds--type-body-short-01" style="color: var(--cds-text-secondary); margin-bottom: 1.25rem;">
                Each party's vote total is divided by 1, 2, 3, etc. Winning quotients that earned seats are highlighted.
              </p>

              <div class="cds--table-wrapper">
                <table class="cds--data-table cds--data-table--zebra" aria-label="Quotient Table">
                  <thead>
                    <tr>
                      <th>Party</th>
                      ${Array.from({ length: Math.min(state.totalSeats, 8) }, (_, i) => `<th class="col-mono" style="text-align: right;">÷ ${i + 1}</th>`).join('')}
                    </tr>
                  </thead>
                  <tbody>
                    ${result.eligibleParties.map(party => {
                      if (!party.isEligible) {
                        return `
                          <tr style="opacity: 0.5;">
                            <td><strong style="color: ${party.color};">${escapeHtml(party.name)}</strong> (Below threshold)</td>
                            <td colspan="${Math.min(state.totalSeats, 8)}" style="text-align: center; color: var(--cds-text-secondary);">Excluded from allocation</td>
                          </tr>
                        `;
                      }

                      return `
                        <tr>
                          <td>
                            <strong style="color: ${party.color};">●</strong> ${escapeHtml(party.name)}
                          </td>
                          ${Array.from({ length: Math.min(state.totalSeats, 8) }, (_, i) => {
                            const divisor = i + 1;
                            const quotient = Math.round(party.votes / divisor);
                            // Check if this quotient won a seat
                            const match = result.allocatedSeats.find(s => s.partyIndex === party.originalIndex && s.divisor === divisor);

                            if (match) {
                              return `
                                <td class="col-mono" style="text-align: right; background-color: var(--cds-layer-02);">
                                  <span class="cds--tag cds--tag--green" style="margin: 0; font-size: 0.6875rem;" title="Allocated in Seat #${match.seatNumber}">
                                    #${match.seatNumber}: ${quotient.toLocaleString()}
                                  </span>
                                </td>
                              `;
                            }

                            return `
                              <td class="col-mono" style="text-align: right; color: var(--cds-text-secondary);">
                                ${quotient.toLocaleString()}
                              </td>
                            `;
                          }).join('')}
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </div>
    `;

    // Bind Event Listeners
    const seatsInput = container.querySelector('#dhondt-seats-input');
    if (seatsInput) {
      seatsInput.addEventListener('change', (e) => {
        state.totalSeats = Math.max(1, parseInt(e.target.value, 10) || 1);
        renderApp();
      });
    }

    const thresholdInput = container.querySelector('#dhondt-threshold-input');
    if (thresholdInput) {
      thresholdInput.addEventListener('change', (e) => {
        state.threshold = Math.max(0, parseFloat(e.target.value) || 0);
        renderApp();
      });
    }

    const presetSelect = container.querySelector('#dhondt-preset');
    if (presetSelect) {
      presetSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (PRESETS[val]) {
          state.totalSeats = PRESETS[val].totalSeats;
          state.threshold = PRESETS[val].threshold;
          state.parties = JSON.parse(JSON.stringify(PRESETS[val].parties));
          renderApp();
        }
      });
    }

    const addPartyBtn = container.querySelector('#dhondt-add-party-btn');
    if (addPartyBtn) {
      addPartyBtn.addEventListener('click', () => {
        const colors = ['#0f62fe', '#da1e28', '#198038', '#ff832b', '#8a3ffc', '#007d79', '#6929c4'];
        const randomColor = colors[state.parties.length % colors.length];
        state.parties.push({
          name: `Party ${String.fromCharCode(65 + state.parties.length)}`,
          votes: 10000,
          color: randomColor
        });
        renderApp();
      });
    }

    container.querySelectorAll('.party-name-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'), 10);
        state.parties[idx].name = e.target.value;
        renderApp();
      });
    });

    container.querySelectorAll('.party-votes-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'), 10);
        state.parties[idx].votes = Math.max(0, parseInt(e.target.value, 10) || 0);
        renderApp();
      });
    });

    container.querySelectorAll('.party-color-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'), 10);
        state.parties[idx].color = e.target.value;
        renderApp();
      });
    });

    container.querySelectorAll('.party-remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'), 10);
        if (state.parties.length > 1) {
          state.parties.splice(idx, 1);
          renderApp();
        }
      });
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m]));
  }

  document.addEventListener('DOMContentLoaded', renderApp);
})();
