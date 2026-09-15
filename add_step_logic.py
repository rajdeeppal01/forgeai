import re
import os

chat_js_path = os.path.join('js', 'chat.js')
with open(chat_js_path, 'r', encoding='utf-8') as f:
    chat_js = f.read()

# I want to add the step logic right before onboardSubmitBtn is defined
step_logic = """
let currentOnboardStep = 1;
const onboardNextBtn = document.getElementById('onboardNextBtn');
const onboardBackBtn = document.getElementById('onboardBackBtn');
const onboardStep1 = document.getElementById('onboardStep1');
const onboardStep2 = document.getElementById('onboardStep2');
const onboardStep3 = document.getElementById('onboardStep3');
const onboardTitle = document.getElementById('onboardTitle');
const onboardDesc = document.getElementById('onboardDesc');

function updateOnboardSteps() {
  if (onboardStep1) onboardStep1.style.display = currentOnboardStep === 1 ? 'block' : 'none';
  if (onboardStep2) onboardStep2.style.display = currentOnboardStep === 2 ? 'block' : 'none';
  if (onboardStep3) onboardStep3.style.display = currentOnboardStep === 3 ? 'block' : 'none';
  
  if (currentOnboardStep === 1) {
    if (onboardBackBtn) onboardBackBtn.style.display = 'none';
    if (onboardNextBtn) onboardNextBtn.style.display = 'flex';
    if (onboardSubmitBtn) onboardSubmitBtn.style.display = 'none';
    if (onboardTitle) onboardTitle.textContent = 'Welcome to ForgeAI';
  } else if (currentOnboardStep === 2) {
    if (onboardBackBtn) onboardBackBtn.style.display = 'flex';
    if (onboardNextBtn) onboardNextBtn.style.display = 'flex';
    if (onboardSubmitBtn) onboardSubmitBtn.style.display = 'none';
    if (onboardTitle) onboardTitle.textContent = 'The Problem';
  } else if (currentOnboardStep === 3) {
    if (onboardBackBtn) onboardBackBtn.style.display = 'flex';
    if (onboardNextBtn) onboardNextBtn.style.display = 'none';
    if (onboardSubmitBtn) onboardSubmitBtn.style.display = 'flex';
    if (onboardTitle) onboardTitle.textContent = 'The Market';
  }
}

if (onboardNextBtn) {
  onboardNextBtn.addEventListener('click', () => {
    if (currentOnboardStep < 3) {
      currentOnboardStep++;
      updateOnboardSteps();
    }
  });
}

if (onboardBackBtn) {
  onboardBackBtn.addEventListener('click', () => {
    if (currentOnboardStep > 1) {
      currentOnboardStep--;
      updateOnboardSteps();
    }
  });
}

// Reset steps when skipping or submitting
"""

if "let currentOnboardStep = 1;" not in chat_js:
    chat_js = chat_js.replace("const onboardSubmitBtn = document.getElementById('onboardSubmitBtn');", step_logic + "\nconst onboardSubmitBtn = document.getElementById('onboardSubmitBtn');")
    
    # Reset steps when submitting
    chat_js = chat_js.replace("onboardingModal.classList.add('hidden');", "onboardingModal.classList.add('hidden');\n    currentOnboardStep = 1;\n    if (typeof updateOnboardSteps === 'function') updateOnboardSteps();")

    with open(chat_js_path, 'w', encoding='utf-8') as f:
        f.write(chat_js)
    print("Added step logic to chat.js")
else:
    print("Step logic already added")
