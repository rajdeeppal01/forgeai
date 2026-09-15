import re
import os

chat_js_path = os.path.join('js', 'chat.js')
with open(chat_js_path, 'r', encoding='utf-8') as f:
    chat_js = f.read()

old_activate_playbook = r"""  // If not general, add a greeting
  if \(pb\.key !== 'general'\) \{
    const greeting = getPlaybookGreeting\(pb\);
    state\.messages = \[\];
    if \(window\.startGreetingTimeoutId\) clearTimeout\(window\.startGreetingTimeoutId\);
    window\.startGreetingTimeoutId = setTimeout\(\(\) => startPlaybookGreeting\(pb, greeting\), 100\);
  \}"""

new_activate_playbook = """  // If not general, add a greeting
  if (pb.key !== 'general') {
    state.messages = [];
    if (window.startGreetingTimeoutId) clearTimeout(window.startGreetingTimeoutId);
    
    const ctx = state.context;
    const hasCtx = ctx.name || ctx.problem;
    
    if (hasCtx) {
      // Use AI generated playbook
      generateCustomPlaybookGreeting(pb);
    } else {
      // Fallback to static
      const greeting = getPlaybookGreeting(pb);
      window.startGreetingTimeoutId = setTimeout(() => startPlaybookGreeting(pb, greeting), 100);
    }
  }"""

chat_js = re.sub(old_activate_playbook, new_activate_playbook, chat_js)

with open(chat_js_path, 'w', encoding='utf-8') as f:
    f.write(chat_js)

print("Updated activatePlaybook in chat.js successfully")
