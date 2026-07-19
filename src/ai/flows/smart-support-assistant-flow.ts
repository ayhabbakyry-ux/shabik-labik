'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { db } from '@/lib/firebase-config';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * @fileOverview المساعد الذكي المطور لمنصة شبيك لبيك - النسخة المتكاملة مع صلاحيات السجلات والدردشة اللطيفة.
 */

const SmartSupportAssistantInputSchema = z.object({
  userQuery: z.string().describe("استفسار المستخدم باللغة العربية."),
  userBalance: z.number().describe("الرصيد الحالي للمستخدم."),
  userPhone: z.string().describe("رقم هاتف المستخدم."),
  isAdmin: z.boolean().optional().describe("هل المستخدم هو المدير؟")
});

const SmartSupportAssistantOutputSchema = z.object({
  assistantResponse: z.string().describe("رد المساعد باللغة العربية بأسلوب لبق وفكاهي عند الطلب."),
});

// أداة البحث عن مستخدم (للمدير)
const searchUserTool = ai.defineTool(
  {
    name: 'searchUserTool',
    description: 'يبحث عن معلومات المستخدم الأساسية ورصيده. للمدير فقط.',
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
      const userQ = query(collection(db, "users"), where("phone", "==", phoneClean), limit(1));
      const userSnap = await getDocs(userQ);
      
      if (userSnap.empty) {
        return { found: false, currentBalance: 0, message: "عذراً، لم يتم العثور على مستخدم بهذا الرقم." };
      }

      const userData = userSnap.docs[0].data();
      return {
        found: true,
        userName: userData.name || "مستخدم",
        currentBalance: Number(userData.balance || 0),
        message: `تم العثور على ${userData.name}. رصيده: ${userData.balance} ل.س.`
      };
    } catch (e) {
      return { found: false, currentBalance: 0, message: "خطأ في الاتصال بقاعدة البيانات." };
    }
  }
);

// أداة جلب سجل العمليات (للمدير والزبون)
const fetchUserTransactionsTool = ai.defineTool(
  {
    name: 'fetchUserTransactionsTool',
    description: 'يجلب سجل آخر 10 عمليات (شحن، إيداع، مرفوضة) للمستخدم ليتمكن المساعد من تحليل سبب الرفض.',
    inputSchema: z.object({
      phone: z.string().describe('رقم الهاتف المراد جلب سجل عملياته.'),
    }),
    outputSchema: z.object({
      found: z.boolean(),
      transactions: z.array(z.any()),
      message: z.string(),
    }),
  },
  async (input) => {
    try {
      const phoneClean = input.phone.trim();
      // جلب آخر العمليات
      const txQ = query(
        collection(db, "transactions"), 
        where("userPhone", "==", phoneClean),
        limit(10)
      );
      const snap = await getDocs(txQ);
      
      if (snap.empty) {
        return { found: false, transactions: [], message: "لا يوجد سجل عمليات لهذا الرقم." };
      }

      const txs = snap.docs.map(d => ({
        type: d.data().type,
        amount: d.data().amount,
        status: d.data().status,
        details: d.data().details || "",
        date: d.data().createdAt || d.data().date || "",
      }));

      return {
        found: true,
        transactions: txs,
        message: `تم العثور على ${txs.length} عمليات مؤخراً.`
      };
    } catch (e) {
      return { found: false, transactions: [], message: "خطأ في قراءة السجلات." };
    }
  }
);

const prompt = ai.definePrompt({
  name: 'smartSupportAssistantPrompt',
  model: googleAI.model('gemini-flash-latest'),
  input: { schema: SmartSupportAssistantInputSchema },
  output: { schema: SmartSupportAssistantOutputSchema },
  tools: [searchUserTool, fetchUserTransactionsTool],
  config: {
    temperature: 0.8, // زيادة التلقائية للفكاهة والدردشة
  },
  prompt: `أنت "المساعد الذكي لمنصة شبيك لبيك الرقمية".
شخصيتك: مرح، ذكي، لبق جداً، وتحب المزاح اللطيف بلهجة شامية محببة إذا طلب منك الزبون ذلك.

تعليمات هامة جداً:
1. **السرية المطلقة**: ممنوع منعاً باتاً ذكر كلمة "الراغب" أو أي مزود خدمة خارجي. نحن "شبيك لبيك" ونحن من يدير وننفذ كافة العمليات.
2. **طريقة شحن الرصيد**: إذا سألك الزبون كيف يشحن رصيده، وجهه للذهاب لصفحة "المحفظة" ثم الضغط على "إيداع رصيد جديد". أخبره أن الأرقام المعتمدة هي (سيريتل كاش: 0939549573، إم تي إن كاش: 0943899403). بعد التحويل، يجب عليه رفع صورة الإشعار في التطبيق ليتم تفعيل رصيده فوراً.
3. **تفسير الرفض**: إذا وجدت في سجل العمليات (عبر أداة fetchUserTransactionsTool) عمليات مرفوضة (Rejected)، أخبر الزبون بلطف أن السبب غالباً هو "خطأ في بيانات الـ ID المدخلة" أو "تحديثات مؤقتة في سيرفرات اللعبة العالمية". اطلب منه مراجعة بياناته والمحاولة مرة أخرى.
4. **الدردشة والفكاهة**: إذا طلب الزبون "نكته" أو "دردشة"، اضحكه بكلمات لطيفة (مثلاً: رصيدك قليل بس هيبتك كبيرة!). استخدم عبارات مثل "على راسي يا غالي"، "من عيوني"، "تكرم شواربك".
5. **المدير أيهم**: إذا كان المستخدم هو المدير (isAdmin=true)، كن في غاية الاحترام ونفذ أوامره في البحث عن أي رقم فوراً.

بيانات الجلسة الحالية:
- رقم هاتف المستخدم الحالي: {{{userPhone}}}
- رصيده الحالي: {{{userBalance}}} ليرة سورية.
- هل المستخدم هو المدير العام؟: {{#if isAdmin}}نعم (أيهم - المدير العام){{else}}لا (زبون محترم){{/if}}

سؤال المستخدم: {{{userQuery}}}`
});

export const smartSupportAssistantFlow = ai.defineFlow(
  {
    name: 'smartSupportAssistantFlow',
    inputSchema: SmartSupportAssistantInputSchema,
    outputSchema: SmartSupportAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error("فشل الذكاء الاصطناعي في الرد.");
    return output;
  }
);

export async function smartSupportAssistant(input: z.infer<typeof SmartSupportAssistantInputSchema>) {
  return smartSupportAssistantFlow(input);
}
