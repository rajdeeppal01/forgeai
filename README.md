# ForgeAI - The AI Company Builder

ForgeAI is a next-generation "AI Company Builder" that acts as your complete C-Suite in a box. Instead of general-purpose chat, ForgeAI breaks down your startup idea and sets up specialized departments—Product, Design, Growth, Sales, Operations, Finance, and Legal—to help you build your company systematically.

## 🚀 Features

- **Zero-Friction Prompt Onboarding:** Start building immediately from the landing page. Just type your idea in a single sentence (e.g., "A food delivery app for pets") and instantly dive into your workspace.
- **Automated Company Brief Deconstruction:** Your idea is automatically structured into a formal company brief (Shape, Target Customer, Offer, Supply/Demand) and saved to your Startup Context panel.
- **Specialized AI Departments:** 8 specialized AI personas trained to act as Heads of specific business units, giving you hyper-relevant, expert advice on growth, product, legal, and more.
- **Action Item Approval Queue (Human-in-the-loop):** When the AI suggests a structural change to your startup (e.g., updating the target market), it proposes an Action Item directly in the chat. You can review, approve, and instantly update your Startup Context panel with a single click.
- **Local Browser Storage & Firebase Integration:** Fully serverless architecture utilizing Firebase for auth and data persistence, while prioritizing speed.

## 🛠️ Tech Stack

- **Frontend:** Vanilla HTML, CSS, JavaScript (No heavy frameworks)
- **Backend/Auth:** Firebase (Authentication, Firestore)
- **AI Integration:** Google Gemini API (Streaming responses, Markdown rendering)
- **Hosting:** Static hosting ready (e.g. Vercel, Netlify)

## 🏃 Getting Started

1. Clone the repository.
2. Serve the directory locally:
   ```bash
   npx serve .
   ```
3. Open `http://localhost:3000` in your browser.
4. (Optional) Provide your own Gemini API key inside the app to unlock the full potential beyond the Free Preview.

## 📝 License

MIT License.
