'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { db } from '@/lib/firebase-config';
import { collection, query, where, getDocs } from 'firebase/firestore';

/**
 * @fileOverview مساعد الدعم الذكي - مجيب شامل على استفسارات المستخدمين مع حماية الخصوصية.
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
    description: 'يبحث عن معلومات المستخدم للمدير فقط.',
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
      if (userSnap.empty) return { found: false, currentBalance: 0, message: "غير موجود." };
      const userData = userSnap.docs[0].data();
      return {
        found: true,
        userName: userData.name || phoneClean,
        currentBalance: Number(userData.balance || 0),
        message: `المستخدم ${userData.name || phoneClean} رصيده ${userData.balance} ليرة.`
      };
    } catch (e) {
      return { found: false, currentBalance: 0, message: "خطأ فني." };
    }
  }
);

const prompt = ai.definePrompt({
  name: 'smartSupportAssistantPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: SmartSupportAssistantInputSchema },
  output: { schema: SmartSupportAssistantOutputSchema },
  tools: [searchUserTool],
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ]
  },
  prompt: `أنت "المساعد الذكي لتطبيق شبيك لبيك". تتحدث بالعربية الفصحى بأسلوب مهذب وشامل.

مهمتك: الإجابة على كل أسئلة المستخدم حول حسابه، الرصيد، الإيداع، والشحن.

قواعد صارمة جداً (أوامر المدير أيهم):
1. أجب على كل شيء يسأله المستخدم بلباقة.
2. إذا سألك المستخدم عن رصيده أو حسابه، استخدم البيانات التالية: رقم هاتفك هو {{{userPhone}}} ورصيدك الحالي هو {{{userBalance}}} ليرة سورية.
3. طرق الإيداع المتاحة: (سيريتل كاش: 0939549573)، (إم تي إن كاش: 0943899403)، (شام كاش: 5d093f196b8cd72873f06d5dbbfb2d43). يتم الإيداع عبر قسم "المحفظة" ثم إرسال صورة الإشعار.
4. طريقة الشحن: يتم الشحن تلقائياً عبر قسم "الخدمات الرقمية" في اللوحة الرئيسية باختيار اللعبة أو الشركة المطلوبة وإدخال الـ ID.
5. **ممنوع منعاً باتاً** إخبار المستخدم من هو المدير أو كشف هويته (أيهم). قل فقط أنك "مساعد منصة شبيك لبيك".
6. **ممنوع منعاً باتاً** إعطاء معلومات عن مستخدمين آخرين لأي شخص باستثناء المدير (isAdmin = true).
7. إذا كان المستخدم هو المدير (isAdmin = true)، يمكنك استخدام searchUserTool للبحث عن المستخدمين الآخرين.

سياق المستخدم:
- الهاتف: {{{userPhone}}}
- الرصيد: {{{userBalance}}}
- هل هو المدير: {{#if isAdmin}}نعم (أيهم){{else}}لا (عميل){{/if}}

استفسار المستخدم: {{{userQuery}}}`
});

export async function smartSupportAssistant(input: z.infer<typeof SmartSupportAssistantInputSchema>) {
  try {
    const { output } = await prompt(input);
    if (!output || !output.assistantResponse) throw new Error("AI Empty");
    return output;
  } catch (error: any) {
    console.error("AI Error Details:", error);
    return { assistantResponse: "أهلاً بك. أنا المساعد الذكي، حالياً أقوم بتحديث بياناتي لخدمتك بشكل أفضل. يرجى المحاولة بعد قليل أو التواصل مع الدعم الفني المباشر." };
  }
}
