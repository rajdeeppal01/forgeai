import os

with open('app.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

html_to_insert = """
      <!-- Business Dashboard Screen -->
      <div class="dashboard-screen" id="dashboardScreen" style="display:none;">
        <div class="dashboard-header">
          <h2 id="dashStartupName" class="dash-title">Loading...</h2>
          <p id="dashOneLiner" class="dash-subtitle">Analyzing market and generating business model...</p>
        </div>
        
        <div class="dashboard-loading" id="dashboardLoading">
          <div class="spinner"></div>
          <p id="dashboardLoadingText">Forging your business strategy...</p>
        </div>

        <div class="dashboard-grid" id="dashboardGrid" style="display:none;">
          <div class="dash-card">
            <h3>🎯 Target Audience & ICP</h3>
            <p id="dashAudience"></p>
          </div>
          <div class="dash-card">
            <h3>🚨 Core Problem</h3>
            <p id="dashProblem"></p>
          </div>
          <div class="dash-card">
            <h3>💡 Value Proposition</h3>
            <p id="dashValueProp"></p>
          </div>
          <div class="dash-card">
            <h3>💰 Business Model</h3>
            <p id="dashBusinessModel"></p>
          </div>
          <div class="dash-card full-width">
            <h3>🚀 Go-To-Market Strategy</h3>
            <div id="dashGTM"></div>
          </div>
        </div>
        
        <div class="dashboard-actions" id="dashboardActions" style="display:none; margin-top: 24px; text-align: center;">
          <button class="btn btn-primary btn-lg" id="dashContinueBtn" style="padding: 12px 32px;">Continue to Workspace →</button>
        </div>
      </div>
"""

# Insert after line 215
lines.insert(216, html_to_insert)

with open('app.html', 'w', encoding='utf-8') as f:
    f.writelines(lines)
    
print("Added dashboard HTML to app.html")
