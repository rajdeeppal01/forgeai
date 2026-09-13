import os

filepath = 'app.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    "<h3>🎯 Target Audience & ICP</h3>": "<h3>Target Audience & ICP</h3>",
    "<h3>🚨 Core Problem</h3>": "<h3>Core Problem</h3>",
    "<h3>💡 Value Proposition</h3>": "<h3>Value Proposition</h3>",
    "<h3>💰 Business Model</h3>": "<h3>Business Model</h3>",
    "<h3>🚀 Go-To-Market Strategy</h3>": "<h3>Go-To-Market Strategy</h3>"
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Removed emojis from dashboard headers in app.html")
