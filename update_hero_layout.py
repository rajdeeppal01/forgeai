import re

html_path = 'index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update Navbar
# Replace the nav-logo icon and text
old_logo = r'<a href="index\.html" class="nav-logo">.*?</a>'
new_logo = """<a href="index.html" class="nav-logo" style="display: flex; align-items: center; gap: 8px; color: white; font-weight: 700; font-size: 1.25rem;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.9;">
          <path d="M12 2v10M18.36 5.64a9 9 0 1 1-12.73 0"></path>
        </svg>
        <span>ForgeAI</span>
      </a>"""
html = re.sub(old_logo, new_logo, html, flags=re.DOTALL)

# Center the nav-links
old_nav_links = r'<div class="nav-links">.*?</div>'
new_nav_links = """<div class="nav-links" style="position: absolute; left: 50%; transform: translateX(-50%); display: flex; gap: 32px;">
        <a href="#features" style="color: white; font-weight: 500; font-size: 0.95rem;">Features <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline-block; margin-left:4px; vertical-align:middle; opacity:0.6;"><polyline points="6 9 12 15 18 9"></polyline></svg></a>
        <a href="#playbooks" style="color: white; font-weight: 500; font-size: 0.95rem;">Playbooks <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline-block; margin-left:4px; vertical-align:middle; opacity:0.6;"><polyline points="6 9 12 15 18 9"></polyline></svg></a>
        <a href="#pricing" style="color: white; font-weight: 500; font-size: 0.95rem;">Pricing</a>
        <a href="#faq" style="color: white; font-weight: 500; font-size: 0.95rem;">FAQ</a>
      </div>"""
html = re.sub(old_nav_links, new_nav_links, html, flags=re.DOTALL)

# Update nav-actions
old_nav_actions = r'<div class="nav-actions">.*?</div>'
new_nav_actions = """<div class="nav-actions" style="display: flex; gap: 16px; align-items: center;">
        <a href="app.html" style="color: white; font-weight: 500; font-size: 0.95rem;">Log in</a>
        <a href="app.html?auth=register" class="btn btn-primary" style="background: white; color: black; border-radius: 20px; padding: 8px 16px; font-weight: 600; font-size: 0.95rem;">Get started</a>
      </div>"""
html = re.sub(old_nav_actions, new_nav_actions, html, flags=re.DOTALL)


# 2. Update Hero content
old_hero_content = r'<div class="hero-content".*?</div>\s*</div>\s*</header>'
new_hero_content = """<div class="hero-content" style="align-items: center; width: 100%; display: flex; flex-direction: column; text-align: center;">
        <h1 class="hero-headline" style="font-size: clamp(3.5rem, 6.5vw, 6.5rem); letter-spacing: -0.05em; font-weight: 900; color: white; line-height: 1.1; margin-bottom: 16px;">What are we building today?</h1>
        <p style="font-size: 1.35rem; color: rgba(255,255,255,0.9); font-weight: 400; margin-bottom: 48px;">Instantly generate pitch decks, business models, and go-to-market strategies.</p>
        
        <form class="hero-prompt-form" id="heroPromptForm" style="width: 100%; max-width: 760px;" onsubmit="event.preventDefault(); window.location.href='app.html?idea=' + encodeURIComponent(document.getElementById('heroIdeaInput').value);">
          <div class="hero-prompt-wrapper" style="border-radius: 24px; padding: 20px 24px; background: rgba(26, 26, 26, 0.9); border: 1px solid rgba(255,255,255,0.06); box-shadow: 0 10px 40px rgba(0,0,0,0.4); display: flex; flex-direction: column;">
            <textarea 
              id="heroIdeaInput" 
              class="hero-prompt-input" 
              placeholder="e.g. A two-sided marketplace for local chefs to sell weekly meal prep..."
              rows="2"
              required
              style="width: 100%; min-height: 80px; padding: 0; margin-bottom: 16px; background: transparent; border: none; outline: none; color: white; font-size: 1.1rem; resize: none; font-family: inherit;"
            ></textarea>
            <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
              <button type="button" class="btn" style="border-radius: 50%; width: 40px; height: 40px; padding: 0; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: white; cursor: pointer; transition: all 0.2s;">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <button type="submit" class="btn btn-primary" style="border-radius: 24px; padding: 10px 24px; background: white; color: black; font-weight: 600; font-size: 0.95rem; display: flex; align-items: center; gap: 8px; cursor: pointer; border: none;" aria-label="Start Building">
                Start <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </header>"""

html = re.sub(old_hero_content, new_hero_content, html, flags=re.DOTALL)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated index.html to match Restart design")
