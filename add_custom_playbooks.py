import re
import os

chat_js_path = os.path.join('js', 'chat.js')
with open(chat_js_path, 'r', encoding='utf-8') as f:
    chat_js = f.read()

# 1. Update switchPlaybook to use AI generation if context is present
old_switch_playbook = r"""function switchPlaybook\(pb\) \{
  if \(window\.startGreetingTimeoutId\) clearTimeout\(window\.startGreetingTimeoutId\);
  state\.activePlaybook = pb\.key;
  activePlaybookName\.textContent = `📁 \$\{state\.projects\.find\(p => p\.id === state\.activeProjectId\)\?\.name \|\| 'New Project'\}`;

  // Show welcome or reset chat
  chatMessages\.innerHTML = '';
  chatMessages\.style\.display = 'none';
  welcomeScreen\.style\.display = 'flex';

  // If not general, add a greeting
  if \(pb\.key !== 'general'\) \{
    const greeting = getPlaybookGreeting\(pb\);
    state\.messages = \[\];
    if \(window\.startGreetingTimeoutId\) clearTimeout\(window\.startGreetingTimeoutId\);
    window\.startGreetingTimeoutId = setTimeout\(\(\) => startPlaybookGreeting\(pb, greeting\), 100\);
  \}

  closeMobileSidebar\(\);
\}"""

new_switch_playbook = """function switchPlaybook(pb) {
  if (window.startGreetingTimeoutId) clearTimeout(window.startGreetingTimeoutId);
  state.activePlaybook = pb.key;
  activePlaybookName.textContent = `📁 ${state.projects.find(p => p.id === state.activeProjectId)?.name || 'New Project'}`;

  // Show welcome or reset chat
  chatMessages.innerHTML = '';
  chatMessages.style.display = 'none';
  welcomeScreen.style.display = 'flex';

  // If not general, add a greeting
  if (pb.key !== 'general') {
    state.messages = [];
    const ctx = state.context;
    const hasCtx = ctx.name || ctx.problem;
    
    if (hasCtx) {
      // Use AI generated playbook
      generateCustomPlaybookGreeting(pb);
    } else {
      // Fallback to static
      const greeting = getPlaybookGreeting(pb);
      if (window.startGreetingTimeoutId) clearTimeout(window.startGreetingTimeoutId);
      window.startGreetingTimeoutId = setTimeout(() => startPlaybookGreeting(pb, greeting), 100);
    }
  }

  closeMobileSidebar();
}"""

chat_js = re.sub(old_switch_playbook, new_switch_playbook, chat_js)

# 2. Add generateCustomPlaybookGreeting function
custom_playbook_func = """
async function generateCustomPlaybookGreeting(pb) {
  welcomeScreen.style.display = 'none';
  chatMessages.style.display = 'flex';
  
  // Show typing indicator in chat
  showTypingIndicator();
  
  const ctxString = buildContextString();
  const prompt = `You are an elite startup advisor and VC. The user has opened the "${pb.name}" department playbook.
  
Here is their startup context:${ctxString}

Please generate a highly customized, actionable 3-step initial playbook for ${pb.name} tailored specifically to this startup's context. 
Be concise, use markdown formatting, and make the advice highly specific to their stated problem and market.
End the message by asking the user for their thoughts or feedback on this plan, or what they'd like to dive into first.`;

  try {
    const apiKey = state.apiKey;
    if (!apiKey || apiKey === 'FREE_PREVIEW_KEY_PLACEHOLDER') {
      throw new Error("No API key provided.");
    }

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${state.model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      })
    });

    removeTypingIndicator();

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();
    let text = '';
    if (data.candidates && data.candidates[0].content.parts) {
      text = data.candidates[0].content.parts.map(p => p.text).join('');
    } else {
      throw new Error("Invalid response format");
    }

    const aiMsg = { role: 'model', parts: [{ text: text }] };
    state.messages.push(aiMsg);
    appendMessage('model', text, formatTime());
    autoSave();

  } catch (err) {
    console.error('Error generating custom playbook:', err);
    removeTypingIndicator();
    // Fallback to static greeting
    const staticGreeting = getPlaybookGreeting(pb);
    const aiMsg = { role: 'model', parts: [{ text: staticGreeting }] };
    state.messages.push(aiMsg);
    appendMessage('model', staticGreeting, formatTime());
    autoSave();
  }
}
"""

if "generateCustomPlaybookGreeting" not in chat_js:
    chat_js = chat_js.replace("function getPlaybookGreeting(pb) {", custom_playbook_func + "\nfunction getPlaybookGreeting(pb) {")

with open(chat_js_path, 'w', encoding='utf-8') as f:
    f.write(chat_js)

print("Updated chat.js successfully")
