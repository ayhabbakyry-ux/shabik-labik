'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { db } from '@/lib/firebase-config';
import { collection, query, where, getDocs } from 'firebase/firestore';

const SmartSupportAssistantInputSchema = z.object({
  userQuery: z.string().describe("استفسار المستخدم باللغة العربية."),
  userBalance: z.number().describe("الرصيد الحالي للمستخدم."),
  userPhone: z.string().describe("رقم هاتف المستخدم."),
  isAdmin: z.boolean().optional().describe("هل المستخدم هو المدير أيهم؟")
});

const SmartSupportAssistantOutputSchema = z.object({
  assistantResponse: z.string().describe("رد المساعد بلهجة حلبية شهمة."),
});

const searchUserTool = ai.defineTool(
  {
    name: 'searchUserTool',
    description: 'يبحث عن معلومات زبون ويقدم تقريراً بالرصيد.',
    inputSchema: z.object({
      phone: z.string().describe('رقم هاتف الزبون للبحث عنه.'),
    }),
    outputSchema: z.object({
      found: z.boolean(),
      userName: z.string().optional(),
      currentBalance: z.number(),
      message: z.string(),
    }),
  },
  async (input) => {
    try {
      const phoneClean = input.phone.trim();
      const userQ = query(collection(db, "users"), where("phone", "==", phoneClean));
      const userSnap = await getDocs(userQ);
      
      if (userSnap.empty) {
        return { found: false, currentBalance: 0, message: "والله يا مدير ما لقيت هاد الرقم بالسيستم." };
      }

      const userData = userSnap.docs[0].data();
      return {
        found: true,
        userName: userData.name || phoneClean,
        currentBalance: Number(userData.balance || 0),
        message: `لقيتلك الزبون ${userData.name || phoneClean} ورصيده ${userData.balance} ليرة.`
      };
    } catch (e) {
      return { found: false, currentBalance: 0, message: "صار عندي ضغط بسيط بالاتصال يا مدير." };
    }
  }
);

const prompt = ai.definePrompt({
  name: 'smartSupportAssistantPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: SmartSupportAssistantInputSchema },
  output: { schema: SmartSupportAssistantOutputSchema },
  tools: [searchUserTool],
  prompt: `أنت "مساعد تطبيق شبيك لبيك". تتحدث بلهجة حلبية شهمة ومحترمة جداً.

قواعد الرد:
1. إذا كان السائل هو المدير أيهم (isAdmin = true) وسأل عن زبون، استخدم أداة searchUserTool فوراً.
2. أجب بلهجة حلبية محببة (يا غالي، من عيوني، أبشر).
3. ممنوع نهائياً ذكر أي تفاصيل تقنية أو أكواد.

معلومات السياق:
- رقم السائل: {{{userPhone}}}
- رصيد السائل: {{{userBalance}}}
- الحالة: {{#if isAdmin}}المعلم أيهم شخصياً{{else}}زبون غالي{{/if}}

استفسار المستخدم: {{{userQuery}}}`
});

export async function smartSupportAssistant(input: z.infer<typeof SmartSupportAssistantInputSchema>) {
  try {
    const { output } = await prompt(input);
    if (!output) throw new Error("AI Empty");
    return output;
  } catch (error: any) {
    return { assistantResponse: "أهلاً بك يا غالي. حالياً عم نحدث النظام لخدمتكم بشكل أفضل، يرجى المحاولة بعد دقيقة وبكون كل شي جاهز بإذن الله." };
  }
}