import re

html_path = 'index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update logo to use favicon.svg
old_logo = r'<a href="index\.html" class="nav-logo" style=".*?</a>'
new_logo = """<a href="index.html" class="nav-logo" style="display: flex; align-items: center; gap: 8px; color: white; font-weight: 700; font-size: 1.25rem;">
        <img src="favicon.svg" alt="ForgeAI Icon" style="width: 24px; height: 24px; opacity: 0.9;" />
        <span>ForgeAI</span>
      </a>"""
html = re.sub(old_logo, new_logo, html, flags=re.DOTALL)

# 2. Fix hero-prompt-wrapper max-width issue overriding landing.css
old_wrapper = r'<div class="hero-prompt-wrapper" style="(.*?)"'
new_wrapper = r'<div class="hero-prompt-wrapper" style="\1; max-width: 100%; width: 100%; margin: 0 auto;"'
html = re.sub(old_wrapper, new_wrapper, html)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated index.html to fix logo and wrapper width")
