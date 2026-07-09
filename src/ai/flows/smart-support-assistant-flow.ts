'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { db } from '@/lib/firebase-config';
import { collection, query, where, getDocs } from 'firebase/firestore';

const SmartSupportAssistantInputSchema = z.object({
  userQuery: z.string().describe("استفسار المستخدم باللغة العربية."),
  userBalance: z.number().describe("الرصيد الحالي للمستخدم."),
  userPhone: z.string().describe("رقم هاتف المستخدم."),
  isAdmin: z.boolean().optional().describe("هل المستخدم هو المدير؟")
});

const SmartSupportAssistantOutputSchema = z.object({
  assistantResponse: z.string().describe("رد المساعد باللغة العربية الفصحى وبشكل مهني."),
});

const searchUserTool = ai.defineTool(
  {
    name: 'searchUserTool',
    description: 'يبحث عن معلومات المستخدم ويقدم تقريراً بالرصيد.',
    inputSchema: z.object({
      phone: z.string().describe('رقم هاتف المستخدم للبحث عنه.'),
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
        return { found: false, currentBalance: 0, message: "لم يتم العثور على مستخدم مسجل بهذا الرقم." };
      }

      const userData = userSnap.docs[0].data();
      return {
        found: true,
        userName: userData.name || phoneClean,
        currentBalance: Number(userData.balance || 0),
        message: `تم العثور على المستخدم ${userData.name || phoneClean} ورصيده الحالي هو ${userData.balance} ليرة.`
      };
    } catch (e) {
      return { found: false, currentBalance: 0, message: "حدث خطأ أثناء جلب البيانات من النظام." };
    }
  }
);

const prompt = ai.definePrompt({
  name: 'smartSupportAssistantPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: SmartSupportAssistantInputSchema },
  output: { schema: SmartSupportAssistantOutputSchema },
  tools: [searchUserTool],
  prompt: `أنت "مساعد تطبيق شبك لبيك الرقمي". تتحدث باللغة العربية الفصحى بأسلوب مهني ومحترم جداً.

قواعد الرد:
1. إذا كان السائل هو المدير (isAdmin = true) واستفسر عن مستخدم، استخدم أداة searchUserTool فوراً.
2. أجب بلغة عربية رسمية ومهذبة وتجنب الكلمات العامية تماماً.
3. ممنوع ذكر أي تفاصيل تقنية أو أكواد برمجية.

معلومات السياق:
- رقم المستخدم: {{{userPhone}}}
- رصيد المستخدم: {{{userBalance}}}
- حالة المستخدم: {{#if isAdmin}}المدير العام{{else}}مستخدم مسجل{{/if}}

استفسار المستخدم: {{{userQuery}}}`
});

export async function smartSupportAssistant(input: z.infer<typeof SmartSupportAssistantInputSchema>) {
  try {
    const { output } = await prompt(input);
    if (!output) throw new Error("AI Empty");
    return output;
  } catch (error: any) {
    return { assistantResponse: "مرحباً بك. النظام قيد التحديث حالياً لضمان أفضل خدمة، يرجى المحاولة مرة أخرى لاحقاً." };
  }
}
