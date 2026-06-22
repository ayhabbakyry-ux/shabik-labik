'use server';
/**
 * @fileOverview A smart support assistant AI agent for the Shabik Labik Digital app.
 *
 * - smartSupportAssistant - A function that handles user queries for support.
 * - SmartSupportAssistantInput - The input type for the smartSupportAssistant function.
 * - SmartSupportAssistantOutput - The return type for the smartSupportAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartSupportAssistantInputSchema = z.object({
  userQuery: z.string().describe("The user's natural language query about transfer details, transaction history, or app functionality."),
  userBalance: z.number().describe("The current balance of the user's wallet in SYP."),
  userPhone: z.string().describe("The phone number of the logged-in user."),
});
export type SmartSupportAssistantInput = z.infer<typeof SmartSupportAssistantInputSchema>;

const SmartSupportAssistantOutputSchema = z.object({
  assistantResponse: z.string().describe("A natural language response providing immediate, relevant assistance to the user's query."),
});
export type SmartSupportAssistantOutput = z.infer<typeof SmartSupportAssistantOutputSchema>;

export async function smartSupportAssistant(input: SmartSupportAssistantInput): Promise<SmartSupportAssistantOutput> {
  return smartSupportAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartSupportAssistantPrompt',
  input: {schema: SmartSupportAssistantInputSchema},
  output: {schema: SmartSupportAssistantOutputSchema},
  prompt: `You are the smart support assistant for the "Shabik Labik Digital" app. Your goal is to provide immediate, relevant assistance to users regarding their transfer details, transaction history, and general app functionality. Be friendly, helpful, and concise.

The user's current context is:
- User Phone Number: {{{userPhone}}}
- Current Wallet Balance: {{{userBalance}}} SYP

Here are some hypothetical transaction details and common FAQs that you can reference to answer user queries:

--- Hypothetical Transaction History ---
1. Date: 2023-10-26, Type: Deposit, Amount: 50000 SYP, Status: Completed, Transaction ID: DEP-12345
2. Date: 2023-10-27, Type: PUBG 60 UC purchase, Amount: 15000 SYP, Status: Completed, Transaction ID: PUR-67890
3. Date: 2023-10-28, Type: Deposit, Amount: 75000 SYP, Status: Pending (Waiting for admin verification), Transaction ID: DEP-98765
4. Date: 2023-10-29, Type: SyrCash Transfer, Amount: 10000 SYP, Status: Completed, Transaction ID: SYR-11223

--- FAQ/App Functionality ---
- To deposit money: Tap on your balance display on the main screen. You will see instructions to transfer money via ShamCash, Syriatel Cash, or MTN Cash, and then you'll upload a notification for admin approval.
- To view transaction history: Navigate to the "سجل" (History) tab in the bottom navigation bar. (Note: This feature is currently under development and will show your full history soon).
- Product availability: The app automatically fetches the latest products and prices from providers like Al-Ragheb. You can see these by tapping the "بضاعة ومنتجات الراغب الآلية" button.

Based on the user's query and the context provided, please generate a helpful response. If the user asks about their specific transactions, try to provide details from the hypothetical history above. If they ask about general app features, refer to the FAQ. If you cannot find a direct answer, guide them on how to use the app or where to find information.

User Query: {{{userQuery}}}`
});

const smartSupportAssistantFlow = ai.defineFlow(
  {
    name: 'smartSupportAssistantFlow',
    inputSchema: SmartSupportAssistantInputSchema,
    outputSchema: SmartSupportAssistantOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
