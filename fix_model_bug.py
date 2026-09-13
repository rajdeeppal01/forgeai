import os
import re

filepath = os.path.join('js', 'chat.js')
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace hardcoded model fallback with state.model
bad_url = "`https://generativelanguage.googleapis.com/v1beta/models/${window.SELECTED_MODEL || 'gemini-1.5-flash'}:generateContent?key=${apiKey}`;"
good_url = "`https://generativelanguage.googleapis.com/v1beta/models/${state.model}:generateContent?key=${apiKey}`;"

if bad_url in content:
    content = content.replace(bad_url, good_url)
else:
    print("Could not find the hardcoded url to replace")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed model name in chat.js")
