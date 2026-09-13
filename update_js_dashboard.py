import os
import re

# 1. Update chat.js
chat_js_path = os.path.join('js', 'chat.js')
dashboard_func = """

// ── Instant Business Dashboard ───────────────────────────
window.generateBusinessDashboard = async function(idea) {
  const welcomeScreen = document.getElementById('welcomeScreen');
  const dashboardScreen = document.getElementById('dashboardScreen');
  const dashboardLoading = document.getElementById('dashboardLoading');
  const dashboardGrid = document.getElementById('dashboardGrid');
  const dashboardActions = document.getElementById('dashboardActions');
  
  // Hide welcome, show dashboard loading
  if(welcomeScreen) welcomeScreen.style.display = 'none';
  if(dashboardScreen) dashboardScreen.style.display = 'block';
  dashboardLoading.style.display = 'flex';
  dashboardGrid.style.display = 'none';
  dashboardActions.style.display = 'none';

  const prompt = `You are an elite VC and startup consultant. The user has an idea: "${idea}"
  
Generate a comprehensive, mathematically sound, and highly strategic business breakdown.
Return ONLY valid JSON matching this exact schema:
{
  "startupName": "A catchy, short name for the startup",
  "oneLiner": "A punchy, 10-word value proposition",
  "targetAudience": "Who is the exact ICP? Be specific.",
  "coreProblem": "What painful problem are they solving? 1-2 sentences.",
  "valueProposition": "How does this solve the problem 10x better?",
  "businessModel": "How will they make money? (e.g., $99/mo SaaS, 15% take rate).",
  "gtmStrategy": "A 3-step actionable go-to-market plan to get the first 100 customers."
}`;

  try {
    const apiKey = localStorage.getItem('forgeai_api_key');
    if (!apiKey) throw new Error("No API key found. Please log in.");
    
    // We do a raw fetch to ensure we can use JSON responseMimeType
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${window.SELECTED_MODEL || 'gemini-1.5-flash'}:generateContent?key=${apiKey}`;
    const body = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    };
    
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    if (!res.ok) throw new Error("Failed to generate dashboard");
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) throw new Error("No text returned");
    
    const insights = JSON.parse(text);
    
    // Populate UI
    document.getElementById('dashStartupName').textContent = insights.startupName;
    document.getElementById('dashOneLiner').textContent = insights.oneLiner;
    document.getElementById('dashAudience').textContent = insights.targetAudience;
    document.getElementById('dashProblem').textContent = insights.coreProblem;
    document.getElementById('dashValueProp').textContent = insights.valueProposition;
    document.getElementById('dashBusinessModel').textContent = insights.businessModel;
    
    // Convert 3-step GTM into list items
    const gtmArr = insights.gtmStrategy.split(/(?=\\d\\.)/);
    let gtmHtml = '<ul>';
    for(const step of gtmArr) {
      if(step.trim().length > 0) gtmHtml += `<li>${step.trim()}</li>`;
    }
    gtmHtml += '</ul>';
    document.getElementById('dashGTM').innerHTML = gtmHtml;
    
    // Switch UI states
    dashboardLoading.style.display = 'none';
    dashboardGrid.style.display = 'grid';
    dashboardActions.style.display = 'block';
    
    // Save state internally as first message
    window.currentProjectId = 'proj_' + Date.now();
    window.currentPlaybook = 'company-builder';
    db.projects.add({
      id: window.currentProjectId,
      playbookId: window.currentPlaybook,
      title: insights.startupName,
      updatedAt: new Date().toISOString()
    });
    
    // Prepare chat history behind the scenes
    const initMsg = {
      role: 'ai',
      text: `I've generated a business strategy dashboard for **${insights.startupName}** based on your idea: *"${idea}"*.\\n\\nWhat area would you like to drill into next? We can expand the GTM strategy, build a Pitch Deck, or refine the Business Model.`,
      time: new Date().toISOString()
    };
    db.messages.add({ projectId: window.currentProjectId, ...initMsg });
    
    document.getElementById('dashContinueBtn').onclick = () => {
      // Hide dashboard, show chat
      dashboardScreen.style.display = 'none';
      document.getElementById('chatMessages').style.display = 'flex';
      
      // Load the chat we just saved
      loadProject(window.currentProjectId);
    };

  } catch (err) {
    console.error(err);
    document.getElementById('dashboardLoadingText').textContent = "Error generating dashboard. Please refresh and try again.";
  }
};
"""

with open(chat_js_path, 'a', encoding='utf-8') as f:
    f.write(dashboard_func)

# 2. Update app.js
app_js_path = 'app.js'
with open(app_js_path, 'r', encoding='utf-8') as f:
    app_content = f.read()

old_logic = """        startNewProject('company-builder');
        chatInput.value = ideaParam;
        sendMessage();"""

new_logic = """        if (typeof generateBusinessDashboard === 'function') {
          generateBusinessDashboard(ideaParam);
        } else {
          startNewProject('company-builder');
          chatInput.value = ideaParam;
          sendMessage();
        }"""

app_content = app_content.replace(old_logic, new_logic)

with open(app_js_path, 'w', encoding='utf-8') as f:
    f.write(app_content)

print("Updated JS files for dashboard flow.")
