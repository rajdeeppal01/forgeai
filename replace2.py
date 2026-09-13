with open('js/chat.js', 'a', encoding='utf-8') as f:
    f.write("""
window.handleActionApprove = function(btn, jsonStr) {
  try {
    const data = JSON.parse(jsonStr.replace(/&quot;/g, '\\"'));
    const ctx = state.context;
    if(data.name) ctx.name = data.name;
    if(data.stage) ctx.stage = data.stage;
    if(data.market) ctx.market = data.market;
    if(data.problem) ctx.problem = data.problem;
    if(data.revenue) ctx.revenue = data.revenue;
    if(data.goal) ctx.goal = data.goal;
    
    LS.set('context', ctx);
    loadContextForm();
    
    btn.closest('.action-item-card').innerHTML = '<div style="padding: 16px; color: var(--green); font-weight: 500; display: flex; align-items: center; gap: 8px;"><svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg> Context Approved & Saved!</div>';
    showToast('Startup Context updated successfully.');
  } catch(e) {
    console.error('Failed to parse Action Item JSON', e);
    showToast('Error saving context.');
  }
};
""")
