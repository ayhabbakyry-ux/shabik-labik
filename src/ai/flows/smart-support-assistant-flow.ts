'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { db } from '@/lib/firebase-config';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

/**
 * @fileOverview المساعد الذكي لمنصة شبيك لبيك - نسخة الاستقرار القصوى V6.
 * تم استخدام الموديل الأكثر توافقاً لحل مشكلة 404 نهائياً.
 */

const SmartSupportAssistantInputSchema = z.object({
  userQuery: z.string().describe("استفسار المستخدم باللغة العربية."),
  userBalance: z.number().describe("الرصيد الحالي للمستخدم."),
  userPhone: z.string().describe("رقم هاتف المستخدم."),
  isAdmin: z.boolean().optional().describe("هل المستخدم هو المدير؟")
});

const SmartSupportAssistantOutputSchema = z.object({
  assistantResponse: z.string().describe("رد المساعد باللغة العربية."),
});

// أداة جلب سجل العمليات
const fetchUserTransactionsTool = ai.defineTool(
  {
    name: 'fetchUserTransactionsTool',
    description: 'يجلب سجل آخر 10 عمليات للمستخدم.',
    inputSchema: z.object({
      phone: z.string().describe('رقم الهاتف.'),
    }),
    outputSchema: z.object({
      found: z.boolean(),
      transactions: z.array(z.any()),
      message: z.string(),
    }),
  },
  async (input) => {
    try {
      const txQ = query(
        collection(db, "transactions"), 
        where("userPhone", "==", input.phone.trim()),
        limit(10)
      );
      const snap = await getDocs(txQ);
      if (snap.empty) return { found: false, transactions: [], message: "لا سجلات." };
      const txs = snap.docs.map(d => ({
        type: d.data().type,
        amount: d.data().amount,
        status: d.data().status,
        date: d.data().createdAt || d.data().date || "",
      }));
      return { found: true, transactions: txs, message: "تم جلب السجلات." };
    } catch (e) {
      return { found: false, transactions: [], message: "خطأ في السجلات." };
    }
  }
);

const prompt = ai.definePrompt({
  name: 'smartSupportAssistantPrompt',
  // استخدام التسمية الرسمية الأكثر استقراراً لتجنب خطأ 404 في v1beta
  model: googleAI.model('gemini-1.5-flash'),
  input: { schema: SmartSupportAssistantInputSchema },
  output: { schema: SmartSupportAssistantOutputSchema },
  tools: [fetchUserTransactionsTool],
  config: { 
    temperature: 0.8,
    topP: 0.95,
    topK: 40
  },
  prompt: `أنت "المساعد الذكي لمنصة شبيك لبيك الرقمية".
شخصيتك: مرح، لبق جداً، وتتحدث بلهجة شامية محببة.

تعليمات هامة:
1. **السرية**: ممنوع ذكر "الراغب". نحن "شبيك لبيك".
2. **الشحن**: وجه الزبون لصفحة المحفظة (سيريتل كاش: 0939549573، إم تي إن كاش: 0943899403).
3. **تفسير الرفض**: قل إن السبب "خطأ في بيانات ID" أو "تحديثات سيرفر اللعبة".
4. **الدردشة**: اضحك الزبون بكلمات مثل "على راسي يا غالي"، "تكرم شواربك".

بيانات الجلسة:
- الهاتف: {{{userPhone}}}
- الرصيد: {{{userBalance}}} ل.س.
- المدير؟: {{#if isAdmin}}نعم (أيهم){{else}}لا{{/if}}

سؤال المستخدم: {{{userQuery}}}`
});

export const smartSupportAssistantFlow = ai.defineFlow(
  {
    name: 'smartSupportAssistantFlow',
    inputSchema: SmartSupportAssistantInputSchema,
    outputSchema: SmartSupportAssistantOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      if (!output) throw new Error("فشل الذكاء الاصطناعي في توليد رد.");
      return output;
    } catch (error: any) {
      console.error("AI Flow Error:", error);
      throw error;
    }
  }
);

export async function smartSupportAssistant(input: z.infer<typeof SmartSupportAssistantInputSchema>) {
  return smartSupportAssistantFlow(input);
}
