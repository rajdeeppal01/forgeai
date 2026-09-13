import os
with open('app.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('<!-- Playbooks Section -->', '<!-- Departments Section -->')
html = html.replace('<div class="sidebar-section-label">Playbooks</div>', '<div class="sidebar-section-label">Departments</div>')
html = html.replace('<p class="welcome-sub">Pick a playbook to start with expert guidance, or just start chatting.</p>', '<p class="welcome-sub">Pick a department to start with expert guidance, or just start chatting.</p>')

with open('app.html', 'w', encoding='utf-8') as f:
    f.write(html)
