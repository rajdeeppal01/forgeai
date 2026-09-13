import os

# 1. Update app.js
app_js_path = 'app.js'
with open(app_js_path, 'r', encoding='utf-8') as f:
    app_content = f.read()

preview_code = """  if (ideaParam) {
    // Free Preview bypass for the first action
    if (!state.apiKey) {
      state.apiKey = "FREE_PREVIEW_KEY_PLACEHOLDER"; // Fallback key for the preview
    }
    // We will process the idea after auth/sync is complete
  }"""

app_content = app_content.replace(preview_code, "")

with open(app_js_path, 'w', encoding='utf-8') as f:
    f.write(app_content)

# 2. Update auth.js
auth_js_path = os.path.join('js', 'auth.js')
with open(auth_js_path, 'r', encoding='utf-8') as f:
    auth_content = f.read()

auth_content = auth_content.replace("      loadApp();", "      if (typeof checkApiKey === 'function') checkApiKey(); else loadApp();")

with open(auth_js_path, 'w', encoding='utf-8') as f:
    f.write(auth_content)

print("Removed preview bypass and updated auth.js")
