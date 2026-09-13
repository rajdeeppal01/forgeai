import os

with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_content = [
    '  <!-- ── Beta Testing ────────────────────────────── -->\n',
    '  <section class="section pricing-section" id="pricing">\n',
    '    <div class="container text-center">\n',
    '      <div class="section-header">\n',
    '        <div class="badge badge-accent">Beta Access</div>\n',
    '        <h2 class="section-title">Join the ForgeAI Beta</h2>\n',
    '        <p class="section-sub">ForgeAI is currently in closed beta. We are allowing early access to a select group of founders.</p>\n',
    '      </div>\n',
    '      <div style="margin: 40px auto; max-width: 500px; padding: 40px;" class="glass-card">\n',
    '        <h3 style="font-size: 1.5rem; margin-bottom: 16px;">100% Free During Beta</h3>\n',
    '        <p style="color: var(--text-secondary); margin-bottom: 32px; line-height: 1.6;">Get unlimited access to all AI Company Builder features, specialized departments, and contextual memory while we refine the product.</p>\n',
    '        <a href="app.html" class="btn btn-primary btn-lg" style="width: 100%; justify-content: center;">Start Building Now →</a>\n',
    '      </div>\n',
    '    </div>\n',
    '  </section>\n'
]

lines = lines[:297] + new_content + lines[370:]

with open('index.html', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Pricing section replaced with Beta Testing banner.")
