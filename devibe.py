import re
import os

def devibe_html(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove fade-up class
    content = re.sub(r'\s*fade-up\b', '', content)
    
    # 2. Remove transition-delay inline styles
    content = re.sub(r'\s*style="transition-delay:[^"]+"', '', content)
    
    # 3. Replace em dashes with standard colons or pipes
    content = content.replace('—', '|')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def devibe_js(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Replace em dashes
    content = content.replace('—', '-')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    devibe_html('index.html')
    if os.path.exists('app.html'):
        devibe_html('app.html')
    devibe_js('landing.js')
    if os.path.exists('app.js'):
        devibe_js('app.js')
    print("De-vibing completed.")
