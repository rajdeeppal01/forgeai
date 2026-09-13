import os

filepath = os.path.join('js', 'chat.js')
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the generic error with the actual error message
old_catch = """  } catch (err) {
    console.error(err);
    document.getElementById('dashboardLoadingText').textContent = "Error generating dashboard. Please refresh and try again.";
  }"""

new_catch = """  } catch (err) {
    console.error(err);
    document.getElementById('dashboardLoadingText').innerHTML = "Error: " + err.message + "<br><br><button onclick='location.reload()' style='padding: 8px 16px; background: var(--bg-card); color: white; border: 1px solid var(--border); border-radius: 4px;'>Refresh</button>";
  }"""

content = content.replace(old_catch, new_catch)

# Also update the res.ok check to capture the body if possible
old_res_check = "if (!res.ok) throw new Error(\"Failed to generate dashboard\");"
new_res_check = """if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error("API Error: " + (errData?.error?.message || `HTTP ${res.status}`));
    }"""
content = content.replace(old_res_check, new_res_check)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated chat.js error handling")
