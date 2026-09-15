import re

app_html_path = 'app.html'
with open(app_html_path, 'r', encoding='utf-8') as f:
    html = f.read()

onboarding_modal = """
  <!-- ── Onboarding Modal ──────────────────────── -->
  <div class="modal-overlay hidden" id="onboardingModal" style="z-index: 10000;">
    <div class="modal-box" style="max-width: 500px;">
      <h2>Welcome to ForgeAI 🚀</h2>
      <p>Let's get started by setting up your first project. This helps the AI tailor its advice specifically for you.</p>
      
      <div class="modal-input-group" style="margin-bottom: 16px;">
        <label for="onboardName" style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 6px; display: block;">1. What is the name of your startup or idea?</label>
        <input type="text" id="onboardName" class="input-field" placeholder="e.g. VeriSolo" />
      </div>

      <div class="modal-input-group" style="margin-bottom: 16px;">
        <label for="onboardProblem" style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 6px; display: block;">2. What core problem are you solving?</label>
        <textarea id="onboardProblem" class="input-field" placeholder="e.g. Traditional audits take too much manual work..." style="height: 80px; resize: none; padding: 12px;"></textarea>
      </div>

      <div class="modal-input-group" style="margin-bottom: 24px;">
        <label for="onboardMarket" style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 6px; display: block;">3. Who is your target market?</label>
        <input type="text" id="onboardMarket" class="input-field" placeholder="e.g. Freelance CISOs, B2B SaaS startups" />
      </div>

      <button class="btn btn-primary" id="onboardSubmitBtn" style="width:100%;justify-content:center;">
        Start Building →
      </button>
      <button class="btn btn-icon" id="onboardSkipBtn" style="width:100%;justify-content:center;margin-top:12px;background:transparent;border:none;color:var(--text-muted);">
        Skip for now
      </button>
    </div>
  </div>
"""

# Insert before App Shell
if "id=\"onboardingModal\"" not in html:
    html = html.replace('<!-- ── App Shell ──────────────────────────── -->', onboarding_modal + '\n  <!-- ── App Shell ──────────────────────────── -->')
    with open(app_html_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print("Inserted Onboarding Modal into app.html")
else:
    print("Onboarding Modal already in app.html")
