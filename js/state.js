// =============================================
// ForgeAI - App Logic & Gemini Integration
// =============================================

// ── State ─────────────────────────────────────
const state = {
  apiKey: '',
  model: 'gemini-3.5-flash',
  messages: [],         // { role: 'user'|'model', parts: [{text}] }
  activePlaybook: null, // playbook key string
  projects: [],         // [{id, name, messages, playbook}]
  activeProjectId: null,
  context: {},          // startup context object
  isLoading: false,
  sidebarOpen: true,
  contextPanelOpen: true,
  messageCount: 0,      // for daily limit
  previewMessagesUsed: 0, // track free tier usage
  attachedDocumentText: '',
  attachedDocumentName: '',
};

// ── Departments Definition ───────────────────────
const PLAYBOOKS = [
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
Then provide a brutally honest evaluation of the idea's viability and ask what department they want to tackle next.`,
    steps: [
      "What is the core problem you are solving, and why is it painful enough that people will pay for a solution?",
      "Who is your absolute ideal, most desperate customer (ICP) right now?",
      "How are these people currently solving this problem today (the status quo)?",
      "What is your unique insight or unfair advantage that allows you to solve this better than anyone else?"
    ]
  },
  {
    key: 'product',
    name: 'Product',
    description: 'MVP scoping & feature roadmaps',
    system: `You are an elite Head of Product. Do not list 10 features to build. Define the absolute minimum viable product that can prove the riskiest assumption. Use the "Jobs to be Done" framework. Cut the fluff. What is the fastest path to value?`,
    steps: [
      "What is the single riskiest assumption about your product that you need to prove true?",
      "What is the absolute minimum set of features required to test that specific assumption?",
      "What features are you explicitly cutting, ignoring, or delaying for V2?",
      "How will we measure if the MVP is successful? (Define the core success metric)"
    ]
  },
  {
    key: 'design',
    name: 'Design',
    description: 'Brand identity & UI layouts',
    system: `You are the Head of Design. Focus on high-converting UI layouts, trust signals, and psychological design principles. Provide specific hex codes, font pairings, and wireframe layouts in markdown.`,
    steps: [
      "What 3 adjectives should people feel when they first look at your brand?",
      "Who is the target demographic, and what aesthetic expectations do they have?",
      "What is the single most important action (CTA) you want users to take on your main screen/landing page?",
      "What trust signals or social proof can we highlight in the design?"
    ]
  },
  {
    key: 'growth',
    name: 'Growth',
    description: 'Marketing, landing pages, & acquisition',
    system: `You are a data-driven Head of Growth. Do not say "use social media". Provide mathematically sound acquisition loops, specific cold email angles, and calculate expected CAC based on channel averages (e.g. LinkedIn Ads vs Outbound). Focus on early traction.`,
    steps: [
      "Where does your ideal customer hang out online or offline when they are trying to solve this problem?",
      "What is a wedge or 'hook' we can use to grab their attention in 3 seconds?",
      "What is your primary proposed acquisition channel for the first 100 users (e.g. cold email, SEO, specific communities)?",
      "What is the 'Aha!' moment in your product, and how fast can we get new users to experience it?"
    ]
  },
  {
    key: 'sales',
    name: 'Sales',
    description: 'Pitch decks, proposals & outreach',
    system: `You are a ruthless Head of Sales. Write objection-handling scripts, pitch deck structures designed for seed-stage VCs, and cold outreach sequences based on pain-points, not features.`,
    steps: [
      "What is the absolute biggest pain point or cost your customer faces by NOT using your product?",
      "Write a terrible, feature-heavy cold email. I will rewrite it into a pain-focused, high-converting sequence.",
      "What are the top 3 objections you expect to hear on a sales call?",
      "What is the compelling 'Why Now?' urgency that forces them to buy this month, not next year?"
    ]
  },
  {
    key: 'operations',
    name: 'Operations',
    description: 'Internal workflows & admin',
    system: `You are the Head of Operations. Map out the exact Zapier/Make automations needed to run the company with zero headcount. Recommend specific tech stacks for maximum efficiency.`,
    steps: [
      "What is the most manual, repetitive, or annoying task you currently do every week?",
      "Map out the exact data flow of your core user journey (from signup to value delivered).",
      "Which tools are you currently using, and are they integrated or siloed?",
      "Where are the single points of failure in your current operations?"
    ]
  },
  {
    key: 'finance',
    name: 'Finance',
    description: 'Pricing, models & unit economics',
    system: `You are a highly quantitative Head of Finance. Calculate theoretical LTV, CAC ceilings, gross margins, and burn rate scenarios. Recommend pricing models based on value metrics, not just flat subscriptions.`,
    steps: [
      "What is the primary value metric your customer cares about? (e.g. per seat, per transaction, time saved)",
      "How much does it cost you in direct expenses (servers, API costs, COGS) to deliver value to one customer?",
      "What are three pricing tiers we could offer, and what limits separate them?",
      "What is your current monthly burn rate, and how many months of runway does that give you?"
    ]
  },
  {
    key: 'legal',
    name: 'Legal',
    description: 'Policies, compliance & terms',
    system: `You are the Legal Counsel. Advise on exact corporate structures (e.g. Delaware C-Corp vs LLC), standard equity splits for co-founders with vesting schedules, and compliance requirements (SOC2/GDPR). Always add a disclaimer that you are an AI.`,
    steps: [
      "Are you operating as a solo founder, or do you have co-founders? If co-founders, what is the proposed equity split?",
      "Are you planning to raise VC money, or bootstrap? (This dictates C-Corp vs LLC)",
      "What user data are you collecting, and do you fall under GDPR, HIPAA, or SOC2 requirements?",
      "Are there any significant liability risks if your product fails or breaks?"
    ]
  }
];

const LS = {
  get: (k, def = null) => { try { const v = localStorage.getItem('forgeai_' + k); return v ? JSON.parse(v) : def; } catch { return def; } },
  set: (k, v) => { try { localStorage.setItem('forgeai_' + k, JSON.stringify(v)); } catch {} },
  remove: (k) => { localStorage.removeItem('forgeai_' + k); }
};
