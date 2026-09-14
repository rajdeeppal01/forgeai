import re
import os

app_css_path = 'app.css'
with open(app_css_path, 'r', encoding='utf-8') as f:
    app_css = f.read()
app_css = app_css.replace('background: var(--bg-main);', 'background: var(--bg-primary);')
with open(app_css_path, 'w', encoding='utf-8') as f:
    f.write(app_css)


chat_js_path = os.path.join('js', 'chat.js')
with open(chat_js_path, 'r', encoding='utf-8') as f:
    chat_js = f.read()

# Add context menu handler in renderProjectList
old_render = r"el\.addEventListener\('click', \(\) => \{(.*?)\}\);"
new_render = r"""el.addEventListener('click', () => {\1});
    el.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showProjectContextMenu(e, proj);
    });"""
chat_js = re.sub(old_render, new_render, chat_js, flags=re.DOTALL)

# Add showProjectContextMenu function
context_menu_code = """
// ── Project Context Menu ───────────────────────
let currentContextMenu = null;

function showProjectContextMenu(e, proj) {
  if (currentContextMenu) {
    currentContextMenu.remove();
  }

  const menu = document.createElement('div');
  menu.className = 'project-context-menu';
  menu.style.position = 'fixed';
  menu.style.left = e.clientX + 'px';
  menu.style.top = e.clientY + 'px';
  menu.style.background = 'var(--bg-secondary)';
  menu.style.border = '1px solid var(--border)';
  menu.style.borderRadius = 'var(--radius-md)';
  menu.style.padding = '8px 0';
  menu.style.boxShadow = '0 10px 40px rgba(0,0,0,0.4)';
  menu.style.zIndex = '9999';
  menu.style.minWidth = '140px';
  
  const renameBtn = document.createElement('div');
  renameBtn.textContent = 'Rename';
  renameBtn.style.padding = '8px 16px';
  renameBtn.style.cursor = 'pointer';
  renameBtn.style.color = 'var(--text-primary)';
  renameBtn.style.fontSize = '0.9rem';
  renameBtn.onmouseover = () => renameBtn.style.background = 'var(--bg-card-hover)';
  renameBtn.onmouseout = () => renameBtn.style.background = 'transparent';
  renameBtn.onclick = () => {
    menu.remove();
    const newName = prompt('Enter new project name:', proj.name);
    if (newName && newName.trim()) {
      proj.name = newName.trim();
      saveProjectsToFirebase();
      renderProjectList();
      if(state.activeProjectId === proj.id) {
        activePlaybookName.textContent = `📁 ${proj.name}`;
      }
    }
  };

  const deleteBtn = document.createElement('div');
  deleteBtn.textContent = 'Delete';
  deleteBtn.style.padding = '8px 16px';
  deleteBtn.style.cursor = 'pointer';
  deleteBtn.style.color = 'var(--rose)';
  deleteBtn.style.fontSize = '0.9rem';
  deleteBtn.onmouseover = () => deleteBtn.style.background = 'var(--bg-card-hover)';
  deleteBtn.onmouseout = () => deleteBtn.style.background = 'transparent';
  deleteBtn.onclick = () => {
    menu.remove();
    if (confirm(`Are you sure you want to delete "${proj.name}"?`)) {
      state.projects = state.projects.filter(p => p.id !== proj.id);
      if (state.activeProjectId === proj.id) {
        state.activeProjectId = null;
        LS.remove('activeProject');
        welcomeScreen.style.display = 'flex';
        chatMessages.style.display = 'none';
        activePlaybookName.textContent = 'General Chat';
      }
      saveProjectsToFirebase();
      renderProjectList();
    }
  };

  menu.appendChild(renameBtn);
  menu.appendChild(deleteBtn);
  document.body.appendChild(menu);
  currentContextMenu = menu;

  // Close when clicking outside
  setTimeout(() => {
    document.addEventListener('click', function closeMenu() {
      if (currentContextMenu) currentContextMenu.remove();
      currentContextMenu = null;
      document.removeEventListener('click', closeMenu);
    });
  }, 0);
}
"""

if "showProjectContextMenu" not in chat_js:
    chat_js += context_menu_code

with open(chat_js_path, 'w', encoding='utf-8') as f:
    f.write(chat_js)

print("Updated app.css and chat.js successfully")
