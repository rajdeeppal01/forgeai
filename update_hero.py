import os

with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if '<header class="hero">' in line:
        start_idx = i
    if '<!-- ── Features ────────────────────────────── -->' in line:
        end_idx = i - 2
        break

if start_idx != -1 and end_idx != -1:
    new_hero = """  <header class="hero" style="text-align: center;">
    <div class="hero-bg"></div>
    <div class="hero-grid"></div>
    <div class="container" style="display: flex; flex-direction: column; align-items: center; max-width: 800px; margin: 0 auto; gap: 40px; justify-content: center;">
      <div class="hero-content" style="align-items: center; width: 100%;">
        <h1 class="hero-headline" style="font-size: clamp(3.5rem, 6vw, 5rem); letter-spacing: -0.04em;">
          What's your idea?
        </h1>
        <p style="font-size: 1.25rem; color: var(--text-primary); margin-top: 16px;">Build and run your company on ForgeAI</p>
        
        <form class="hero-prompt-form" id="heroPromptForm" style="width: 100%; max-width: 720px; margin-top: 32px;" onsubmit="event.preventDefault(); window.location.href='app.html?idea=' + encodeURIComponent(document.getElementById('heroIdeaInput').value);">
          <div class="hero-prompt-wrapper" style="border-radius: 16px; padding: 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); align-items: flex-end; flex-direction: column; max-width: 100%;">
            <textarea 
              id="heroIdeaInput" 
              class="hero-prompt-input" 
              placeholder="Describe the company you want to build..."
              rows="2"
              required
              style="width: 100%; min-height: 80px; padding: 8px; font-size: 1.1rem;"
            ></textarea>
            <div style="display: flex; justify-content: space-between; width: 100%; align-items: center; margin-top: 12px;">
              <button type="button" class="btn" style="border-radius: 50%; width: 36px; height: 36px; padding: 0; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary);">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <button type="submit" class="btn btn-primary" style="border-radius: 20px; padding: 8px 24px; background: white; color: black; font-weight: 600;" aria-label="Start Building">
                Start →
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  </header>

"""
    lines = lines[:start_idx] + [new_hero] + lines[end_idx:]
    with open('index.html', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Hero section replaced successfully!")
else:
    print(f"Could not find hero bounds. start={start_idx}, end={end_idx}")

