import { z } from "zod";

export const configSchema = z.object({
  geminiApiKey: z.string().min(1, "Gemini API key is required"),
  deepseekApiKey: z.string().min(1, "DeepSeek API key is required")
});

export type Config = z.infer<typeof configSchema>;

export const oAuthConfigSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  clientSecret: z.string().min(1, "Client Secret is required"),
  redirectUri: z.string().default("http://localhost:5000/api/auth/google/callback")
});

export type OAuthConfig = z.infer<typeof oAuthConfigSchema>;

export const colorSchemeSchema = z.enum([
  'default',
  'neutral',
  'blue',
  'green',
  'purple',
  'black',
  'white',
  'custom'
]).default('default');

export const styleSchema = z.object({
  modern: z.boolean().default(true),
  minimal: z.boolean().default(true),
  darkMode: z.boolean().default(false),
  // Add design customization options
  borderRadius: z.enum(['none', 'small', 'medium', 'large']).default('medium'),
  colorScheme: colorSchemeSchema,
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  spacing: z.enum(['compact', 'comfortable', 'spacious']).default('comfortable'),
  typography: z.enum(['modern', 'classic', 'minimal']).default('modern'),
  animations: z.enum(['none', 'subtle', 'smooth']).default('smooth'),
  iconStyle: z.enum(['outline', 'solid', 'duotone']).default('outline'),
  buttonStyle: z.enum(['rounded', 'pill', 'square']).default('rounded'),
  layout: z.enum(['centered', 'wide', 'boxed']).default('centered')
});

export type StylePreferences = z.infer<typeof styleSchema>;

export const userSessionSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expiryDate: z.number()
});

export type UserSession = z.infer<typeof userSessionSchema>;