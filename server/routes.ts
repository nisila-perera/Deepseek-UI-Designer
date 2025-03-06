import type { Express } from "express";
import { createServer, type Server } from "http";
import OpenAI from "openai";
import { type StylePreferences } from "@shared/schema";
import session from "express-session";
import { z } from "zod";
import { oAuthConfigSchema, type UserSession } from "@shared/schema";
import dotenv from 'dotenv';
import { config } from '@shared/schema';

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.DEEPSEEK_API_KEY) {
  throw new Error('DEEPSEEK_API_KEY is required in environment variables');
}

const SYSTEM_PROMPT = `You are a UI designer that creates modern, accessible websites using Tailwind CSS. 
IMPORTANT: Output ONLY raw HTML without any markdown code blocks or explanatory text.
Your response should start directly with <!DOCTYPE html> and include no other text.

When receiving user input:
1. Analyze the core concept/theme
2. Expand brief inputs into a complete website structure
3. Add relevant sections based on the context

For example:
- Input: "coffee shop website"
  Expand to include: Hero with coffee imagery, About Us story, Featured Drinks menu, 
  Store Locations, Coffee Bean Selection, Brewing Tips blog section, Events calendar, 
  Customer Reviews, Newsletter signup, Contact form

- Input: "fitness trainer portfolio"
  Expand to include: Dynamic hero with action shots, Trainer Bio, Services/Programs offered,
  Success Stories, Workout Philosophy, Class Schedule, Pricing Plans, Testimonials,
  Blog with fitness tips, Contact/Booking section

Follow these guidelines:
- Use semantic HTML
- Follow accessibility best practices
- Implement responsive design for mobile, tablet, and desktop
- Use Tailwind CSS for styling
- Include only inline JS and CSS
- Use Lucide icons (via CDN: https://unpkg.com/lucide-static) for UI elements

Create beautiful, professional layouts with:
- Proper spacing and alignment
- Consistent typography
- Engaging hover and focus states
- Smooth transitions
- Visual hierarchy
- Clear call-to-actions

Always implement these essential sections:
- Responsive navigation with mobile menu
- Hero section with clear value proposition
- Multiple content sections (minimum 4-5 sections)
- Feature highlights or services
- Social proof (testimonials/reviews)
- Call-to-action sections between content
- Contact form or booking system
- Footer with social links and site map

Additional UI patterns to include:
- Sticky navigation
- Progress indicators
- Image galleries or carousels
- FAQ accordions where relevant
- Newsletter subscription
- Social media integration
- Location maps (if location-based)
- Pricing tables (if service-based)

Remember to:
- Maintain consistent branding throughout
- Include appropriate micro-interactions
- Ensure logical content flow
- Add breadcrumbs for deeper pages
- Implement proper meta tags
- Include loading states
- Add error handling for forms`;

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: process.env.DEEPSEEK_API_KEY,
  dangerouslyAllowBrowser: true // Only if needed for development
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(session({
    secret: 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  }));

  app.get("/api/auth/google", (_req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      include_granted_scopes: true
    });
    res.json({ authUrl });
  });

  app.get("/api/auth/google/callback", async (req, res) => {
    try {
      const { code } = req.query;
      if (typeof code !== 'string') {
        throw new Error('Invalid authorization code');
      }

      const { tokens } = await oauth2Client.getToken(code);
      if (!tokens.access_token) {
        throw new Error('No access token received');
      }

      const session: UserSession = {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date || Date.now() + 3600000
      };

      req.session.tokens = session;
      res.redirect('/');
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  });

  app.get("/api/auth/session", (req, res) => {
    res.json({ authenticated: !!req.session.tokens });
  });

  app.post("/api/design/generate", async (req, res) => {
    try {
      const { prompt, negativePrompt, styles } = req.body as { 
        prompt: string; 
        negativePrompt: string;
        styles: StylePreferences 
      };

      // Set up SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Step 1: Refine prompt with DeepSeek Chat
      const refinedPrompt = await refinePrompt(prompt, negativePrompt, styles);

      // Step 2: Generate code with DeepSeek Reasoner
      const response = await openai.chat.completions.create({
        model: "deepseek-reasoner",
        messages: [
          { 
            role: "system", 
            content: SYSTEM_PROMPT
          },
          { 
            role: "user", 
            content: refinedPrompt 
          }
        ],
        stream: true
      });

      let generatedCode = "";
      let reasoningContent = "";

      for await (const chunk of response) {
        if (chunk.choices[0].delta.reasoning_content) {
          reasoningContent += chunk.choices[0].delta.reasoning_content;
          res.write(`data: ${JSON.stringify({ type: 'reasoning', content: chunk.choices[0].delta.reasoning_content })}\n\n`);
        } else if (chunk.choices[0].delta.content) {
          generatedCode += chunk.choices[0].delta.content;
        }
      }

      // Clean the generated code to ensure it starts with <!DOCTYPE html>
      const cleanCode = generatedCode.trim()
        .replace(/^```html\s*/, '')
        .replace(/```\s*$/, '')
        .replace(/^.*?<!DOCTYPE html>/i, '<!DOCTYPE html>')
        .trim();

      // Send the final code
      res.write(`data: ${JSON.stringify({ type: 'code', content: cleanCode })}\n\n`);
      res.end();
    } catch (error: any) {
      console.error('Design generation error:', error);
      res.write(`data: ${JSON.stringify({ type: 'error', content: error.message })}\n\n`);
      res.end();
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function refinePrompt(prompt: string, negativePrompt: string, styles: StylePreferences): Promise<string> {
  const stylePrefs = Object.entries(styles)
    .filter(([_, enabled]) => enabled)
    .map(([style]) => style)
    .join(", ");

  try {
    const response = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { 
          role: "system", 
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: `Create a UI design based on these requirements:
          ${prompt}
          ${negativePrompt ? `\nAvoid these elements: ${negativePrompt}` : ''}
          Style preferences: ${stylePrefs}

          Output ONLY the implementation details that will be used to generate the final HTML code.`
        }
      ]
    });

    if (!response.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from DeepSeek Chat API');
    }

    return response.choices[0].message.content;
  } catch (error: any) {
    console.error('DeepSeek Chat API Error:', error);
    throw new Error(`Failed to refine prompt: ${error.message}`);
  }
}
