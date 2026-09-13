import re
import os

filepath = os.path.join('js', 'chat.js')
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix API key
content = content.replace("const apiKey = localStorage.getItem('forgeai_api_key');", "const apiKey = state.apiKey;")
content = content.replace("if (!apiKey) throw new Error(\"No API key found. Please log in.\");", "if (!apiKey || apiKey === 'FREE_PREVIEW_KEY_PLACEHOLDER') throw new Error(\"No API key provided. Please log in or enter an API key.\");")

# 2. Fix layout overlap (Hide/Show chat-input-area)
hide_input = "dashboardActions.style.display = 'none';\n  const chatInputArea = document.querySelector('.chat-input-area');\n  if(chatInputArea) chatInputArea.style.display = 'none';"
content = content.replace("dashboardActions.style.display = 'none';", hide_input)

show_input = "dashboardScreen.style.display = 'none';\n      if(chatInputArea) chatInputArea.style.display = '';"
content = content.replace("dashboardScreen.style.display = 'none';", show_input)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed bug and layout in chat.js")
