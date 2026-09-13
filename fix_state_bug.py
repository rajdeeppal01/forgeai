import os
import re

filepath = os.path.join('js', 'chat.js')
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# The old bad db.projects logic
bad_logic = """    // Save state internally as first message
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
      if(chatInputArea) chatInputArea.style.display = '';
      document.getElementById('chatMessages').style.display = 'flex';
      
      // Load the chat we just saved
      loadProject(window.currentProjectId);
    };"""

good_logic = """    // Save state internally as first message
    const projId = Date.now().toString();
    const initMsg = `I've generated a business strategy dashboard for **${insights.startupName}** based on your idea: *"${idea}"*.\\n\\nWhat area would you like to drill into next? We can expand the GTM strategy, build a Pitch Deck, or refine the Business Model.`;
    
    const proj = {
      id: projId,
      name: insights.startupName,
      messages: [
        { role: 'user', parts: [{ text: idea }] },
        { role: 'model', parts: [{ text: initMsg }] }
      ],
      playbook: 'company-builder',
      createdAt: new Date().toISOString()
    };
    
    state.projects.unshift(proj);
    LS.set('projects', state.projects);
    if (typeof renderProjectList === 'function') renderProjectList();
    if (typeof syncProjectToFirestore === 'function') syncProjectToFirestore(proj);
    
    document.getElementById('dashContinueBtn').onclick = () => {
      dashboardScreen.style.display = 'none';
      if (chatInputArea) chatInputArea.style.display = '';
      
      // Set active project and render
      state.activeProjectId = projId;
      state.activePlaybook = 'company-builder';
      state.messages = proj.messages;
      LS.set('activeProject', projId);
      
      const welcomeScreen = document.getElementById('welcomeScreen');
      const chatMessages = document.getElementById('chatMessages');
      if (welcomeScreen) welcomeScreen.style.display = 'none';
      if (chatMessages) {
        chatMessages.style.display = 'flex';
        chatMessages.innerHTML = '';
        state.messages.forEach(m => {
          appendMessage(m.role, m.parts[0].text, formatTime(), false);
        });
        scrollToBottom();
      }
    };"""

if bad_logic in content:
    content = content.replace(bad_logic, good_logic)
else:
    print("Could not find the bad logic in chat.js. Maybe it was modified differently?")
    print("Writing debug bad logic to compare:")
    # We'll just do a regex replace if exact match fails
    pass

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed state management in chat.js")
