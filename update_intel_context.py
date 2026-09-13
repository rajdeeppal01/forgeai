import os

# 1. UPDATE state.js PLAYBOOKS
state_path = os.path.join('js', 'state.js')
with open(state_path, 'r', encoding='utf-8') as f:
    state_content = f.read()

old_playbooks = """const PLAYBOOKS = [
  {
    key: 'company-builder',
    name: 'Company Builder',
    description: 'Deconstruct ideas into structured business plans',
    system: `You are the core AI Company Builder. Your first job is to parse the user's raw startup idea into a structured brief. 
Whenever a user describes an idea, respond directly with an encouraging message and then output this exact structure so the system can parse it:

[ACTION_ITEM: Startup Context]
{
  "name": "Extract or guess a good name",
  "stage": "Idea / Pre-Product",
  "market": "e.g. B2B SaaS, Consumer Marketplace",
  "problem": "1-2 sentence description of the core problem being solved.",
  "revenue": "$0",
  "goal": "Launch MVP and get first 10 customers"
}
[/ACTION_ITEM]

After outputting the action item, ask the user what department they want to dive into next.`
  },
  {
    key: 'product',
    name: 'Product',
    description: 'MVP scoping & feature roadmaps',
    system: `You are the Head of Product. Your job is to help the founder define their MVP scope, build product requirements, and plan the roadmap. Ask questions to cut unnecessary features and focus on the core value proposition. Be direct and scrappy.`
  },
  {
    key: 'design',
    name: 'Design',
    description: 'Brand identity & UI layouts',
    system: `You are the Head of Design. Your job is to help the founder create a compelling brand identity, choose typography/colors, and design high-converting UI layouts. Focus on modern, clean aesthetics and user experience.`
  },
  {
    key: 'growth',
    name: 'Growth',
    description: 'Marketing, landing pages, & acquisition',
    system: `You are the Head of Growth. You specialize in designing lean, high-ROI go-to-market strategies, landing page copy, and acquisition loops. Think in terms of what works at the early stage (e.g. founder-led sales, SEO, targeted cold outreach), not what Fortune 500 companies do.`
  },
  {
    key: 'sales',
    name: 'Sales',
    description: 'Pitch decks, proposals & outreach',
    system: `You are the Head of Sales. You help the founder build a compelling investor pitch deck, draft client proposals, and write high-converting cold email sequences. Keep messaging punchy, focused on pain points, and under 100 words where possible.`
  },
  {
    key: 'operations',
    name: 'Operations',
    description: 'Internal workflows & admin',
    system: `You are the Head of Operations. Help the founder set up scalable internal processes, intake forms, automated workflows, and team management tools. Focus on efficiency and reducing manual work.`
  },
  {
    key: 'finance',
    name: 'Finance',
    description: 'Pricing, models & unit economics',
    system: `You are the Head of Finance. Help the founder figure out their pricing tiers, model out their unit economics (CAC/LTV), and build a simple financial forecast for investors.`
  },
  {
    key: 'legal',
    name: 'Legal',
    description: 'Policies, compliance & terms',
    system: `You are the Legal Counsel. Provide draft templates and guidance for Privacy Policies, Terms of Service, and basic compliance checklists. (Always add a disclaimer that you are an AI and this is not formal legal advice).`
  }
];"""

new_playbooks = """const PLAYBOOKS = [
  {
    key: 'company-builder',
    name: 'Company Builder',
    description: 'Deconstruct ideas into structured business plans',
    system: `You are an elite, highly analytical AI Company Builder. Do not use generic startup advice. Use mathematical frameworks to evaluate the business (e.g. TAM calculations, LTV:CAC ratios, payback periods). Provide harsh truths and actionable, deep business intelligence on how to establish the company.
When parsing a user's idea, output this structure:
[ACTION_ITEM: Startup Context]
{
  "name": "Extract or guess a good name",
  "stage": "Idea / Pre-Product",
  "market": "Specific ICP (e.g. B2B SaaS for SMBs)",
  "problem": "1-2 sentence painful problem.",
  "revenue": "$0",
  "goal": "Launch MVP and get 10 paying users"
}
[/ACTION_ITEM]
Then provide a brutally honest evaluation of the idea's viability and ask what department they want to tackle next.`
  },
  {
    key: 'product',
    name: 'Product',
    description: 'MVP scoping & feature roadmaps',
    system: `You are an elite Head of Product. Do not list 10 features to build. Define the absolute minimum viable product that can prove the riskiest assumption. Use the "Jobs to be Done" framework. Cut the fluff. What is the fastest path to value?`
  },
  {
    key: 'design',
    name: 'Design',
    description: 'Brand identity & UI layouts',
    system: `You are the Head of Design. Focus on high-converting UI layouts, trust signals, and psychological design principles. Provide specific hex codes, font pairings, and wireframe layouts in markdown.`
  },
  {
    key: 'growth',
    name: 'Growth',
    description: 'Marketing, landing pages, & acquisition',
    system: `You are a data-driven Head of Growth. Do not say "use social media". Provide mathematically sound acquisition loops, specific cold email angles, and calculate expected CAC based on channel averages (e.g. LinkedIn Ads vs Outbound). Focus on early traction.`
  },
  {
    key: 'sales',
    name: 'Sales',
    description: 'Pitch decks, proposals & outreach',
    system: `You are a ruthless Head of Sales. Write objection-handling scripts, pitch deck structures designed for seed-stage VCs, and cold outreach sequences based on pain-points, not features.`
  },
  {
    key: 'operations',
    name: 'Operations',
    description: 'Internal workflows & admin',
    system: `You are the Head of Operations. Map out the exact Zapier/Make automations needed to run the company with zero headcount. Recommend specific tech stacks for maximum efficiency.`
  },
  {
    key: 'finance',
    name: 'Finance',
    description: 'Pricing, models & unit economics',
    system: `You are a highly quantitative Head of Finance. Calculate theoretical LTV, CAC ceilings, gross margins, and burn rate scenarios. Recommend pricing models based on value metrics, not just flat subscriptions.`
  },
  {
    key: 'legal',
    name: 'Legal',
    description: 'Policies, compliance & terms',
    system: `You are the Legal Counsel. Advise on exact corporate structures (e.g. Delaware C-Corp vs LLC), standard equity splits for co-founders with vesting schedules, and compliance requirements (SOC2/GDPR). Always add a disclaimer that you are an AI.`
  }
];"""

if old_playbooks in state_content:
    state_content = state_content.replace(old_playbooks, new_playbooks)
else:
    print("Could not find PLAYBOOKS in state.js to replace.")

with open(state_path, 'w', encoding='utf-8') as f:
    f.write(state_content)


# 2. UPDATE chat.js to populate context on dashboard generation & rename project
chat_path = os.path.join('js', 'chat.js')
with open(chat_path, 'r', encoding='utf-8') as f:
    chat_content = f.read()

old_dash_logic = """    state.projects.unshift(proj);
    LS.set('projects', state.projects);
    if (typeof renderProjectList === 'function') renderProjectList();
    if (typeof syncProjectToFirestore === 'function') syncProjectToFirestore(proj);
    
    document.getElementById('dashContinueBtn').onclick = () => {"""

new_dash_logic = """    state.projects.unshift(proj);
    LS.set('projects', state.projects);
    if (typeof renderProjectList === 'function') renderProjectList();
    if (typeof syncProjectToFirestore === 'function') syncProjectToFirestore(proj);
    
    // AUTO-FILL CONTEXT
    state.context = {
      name: insights.startupName,
      stage: 'Idea / Pre-Product',
      market: insights.targetAudience,
      problem: insights.coreProblem,
      revenue: '0',
      goal: 'Launch MVP and get first 10 customers'
    };
    LS.set('context', state.context);
    if (typeof loadContextForm === 'function') loadContextForm();
    if (typeof syncContextToFirestore === 'function') syncContextToFirestore();
    
    document.getElementById('dashContinueBtn').onclick = () => {"""

if old_dash_logic in chat_content:
    chat_content = chat_content.replace(old_dash_logic, new_dash_logic)
else:
    print("Could not find dashboard logic to replace in chat.js")


old_save_context = """  state.context = {
    name:    ctxName?.value.trim()    || '',
    stage:   ctxStage?.value         || '',
    market:  ctxMarket?.value.trim()  || '',
    problem: ctxProblem?.value.trim() || '',
    revenue: ctxRevenue?.value.trim() || '',
    goal:    ctxGoal?.value.trim()    || '',
  };
  LS.set('context', state.context);"""

new_save_context = """  state.context = {
    name:    ctxName?.value.trim()    || '',
    stage:   ctxStage?.value         || '',
    market:  ctxMarket?.value.trim()  || '',
    problem: ctxProblem?.value.trim() || '',
    revenue: ctxRevenue?.value.trim() || '',
    goal:    ctxGoal?.value.trim()    || '',
  };
  LS.set('context', state.context);
  
  // Also rename active project if name changed
  if (state.activeProjectId && state.context.name) {
    const projIdx = state.projects.findIndex(p => p.id === state.activeProjectId);
    if (projIdx !== -1 && state.projects[projIdx].name !== state.context.name) {
      state.projects[projIdx].name = state.context.name;
      LS.set('projects', state.projects);
      if (typeof renderProjectList === 'function') renderProjectList();
      if (typeof syncProjectToFirestore === 'function') syncProjectToFirestore(state.projects[projIdx]);
    }
  }"""

if old_save_context in chat_content:
    chat_content = chat_content.replace(old_save_context, new_save_context)
else:
    print("Could not find saveContext logic in chat.js")

with open(chat_path, 'w', encoding='utf-8') as f:
    f.write(chat_content)

print("Updated playbooks and context auto-filling successfully")
