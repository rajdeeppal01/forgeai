import os

css_to_add = """

/* =========================================
   DASHBOARD SCREEN
   ========================================= */
.dashboard-screen {
  position: absolute;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 40px;
  background: var(--bg-main);
  z-index: 50;
  overflow-y: auto;
  animation: fadeIn 0.4s ease-out;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 40px;
}

.dash-title {
  font-size: 2.5rem;
  letter-spacing: -0.03em;
  margin-bottom: 8px;
}

.dash-subtitle {
  font-size: 1.1rem;
  color: var(--text-muted);
}

.dashboard-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 40vh;
  gap: 16px;
  color: var(--text-muted);
}

.dashboard-loading .spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: var(--rose);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  max-width: 1000px;
  margin: 0 auto;
}

.dash-card {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 24px;
  transition: transform 0.2s, border-color 0.2s;
}

.dash-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255,255,255,0.15);
}

.dash-card.full-width {
  grid-column: 1 / -1;
}

.dash-card h3 {
  font-size: 1.1rem;
  margin-bottom: 12px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.dash-card p, .dash-card div {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.dash-card div ul {
  padding-left: 20px;
  margin-top: 8px;
}

.dash-card div li {
  margin-bottom: 8px;
}
"""

with open('app.css', 'a', encoding='utf-8') as f:
    f.write(css_to_add)

print("Appended dashboard CSS")
