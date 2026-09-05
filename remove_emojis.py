import re

files = ['index.html', 'app.html', 'app.js']
emojis = r'[⚡🚀📊💰🎯📝🔍🧩📈🤝✨💾⚙️🧠💡✅❌🔥]'

for f in files:
    try:
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Replace emojis
        content = re.sub(emojis, '', content)
        
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"Processed {f}")
    except Exception as e:
        print(f"Error on {f}: {e}")

print("Done")
