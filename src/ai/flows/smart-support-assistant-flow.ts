'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { db } from '@/lib/firebase-config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * @fileOverview مساعد الدعم الذكي - يقوم بالرد على استفسارات المستخدمين والبحث للمدير.
 */

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
    description: 'يبحث عن معلومات المستخدم في قاعدة البيانات ويقدم تقريراً بالرصيد.',
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
        return { found: false, currentBalance: 0, message: "لم يتم العثور على مستخدم مسجل بهذا الرقم في النظام." };
      }

      const userData = userSnap.docs[0].data();
      return {
        found: true,
        userName: userData.name || phoneClean,
        currentBalance: Number(userData.balance || 0),
        message: `تم العثور على المستخدم ${userData.name || phoneClean}. رصيده الحالي هو ${userData.balance} ليرة سورية.`
      };
    } catch (e) {
      return { found: false, currentBalance: 0, message: "حدث خطأ فني أثناء محاولة جلب البيانات من السيرفر." };
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

قواعد الرد الصارمة:
1. إذا كان السائل هو المدير (isAdmin = true) وطلب معلومات عن رقم هاتف معين، استخدم أداة searchUserTool فوراً.
2. أجب بلغة عربية رسمية ومهذبة، وابدأ الرد بتحية مناسبة.
3. ممنوع تماماً ذكر أي تفاصيل تقنية أو أكواد برمجة أو أسماء موديلات AI.
4. إذا سألك المستخدم عن رصيده، أخبره برصيده الموجود في معلومات السياق أدناه.

معلومات السياق الحالية:
- اسم المستخدم: {{{userPhone}}}
- رصيد المستخدم الحالي: {{{userBalance}}} ليرة
- صفة المستخدم: {{#if isAdmin}}المدير العام (أيهم){{else}}عميل مسجل{{/if}}

استفسار المستخدم: {{{userQuery}}}`
});

export async function smartSupportAssistant(input: z.infer<typeof SmartSupportAssistantInputSchema>) {
  try {
    // التأكد من وجود مفتاح API قبل الاستدعاء
    if (!process.env.GEMINI_API_KEY) {
      return { assistantResponse: "مرحباً بك. المساعد الذكي يحتاج لضبط مفتاح الـ API في إعدادات السيرفر ليعمل بشكل صحيح." };
    }

    const { output } = await prompt(input);
    
    if (!output || !output.assistantResponse) {
      throw new Error("AI Empty Output");
    }
    
    return output;
  } catch (error: any) {
    console.error("AI Flow Error:", error);
    return { assistantResponse: "أهلاً بك. أنا المساعد الذكي، حالياً أقوم بتحديث بياناتي لخدمتك بشكل أفضل. يرجى المحاولة بعد قليل أو التواصل مع الدعم الفني المباشر." };
  }
}
