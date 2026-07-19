"use client";

import { useState, useRef, useEffect } from "react";
import { smartSupportAssistant } from "@/ai/flows/smart-support-assistant-flow";
import { useUser } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Send, Sparkles, AlertTriangle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Message = {
  role: 'assistant' | 'user';
  content: string;
  isError?: boolean;
  isCooldown?: boolean;
};

export function AIChat() {
  const { userBalance, userPhone, userName, isAdmin, profileImage } = useUser();
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: isAdmin 
        ? `مرحباً بك يا مدير أيهم. أنا مساعدك الشخصي. اسألني عن أي مستخدم لآتيك ببياناته فوراً.` 
        : `أهلاً بك ${userName || 'في شبيك لبيك'}. أنا المساعد الذكي، كيف يمكنني خدمتك اليوم؟` 
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const COOLDOWN_SECONDS = 30; // زيادة وقت الانتظار لحماية الحصة (Quota)

  useEffect(() => {
    if (scrollRef.current) {
      const scrollArea = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const now = Date.now();
    const timeDiff = (now - lastMessageTime) / 1000;

    // فحص وقت الانتظار (Cooldown) لغير المدير
    if (!isAdmin && lastMessageTime !== 0 && timeDiff < COOLDOWN_SECONDS) {
      const remaining = Math.ceil(COOLDOWN_SECONDS - timeDiff);
      const waitMessage = `حقك على راسي ياغالي بس صار عندي ضغط شوي يا ريت تسألني بعد ${remaining} ثانية.`;
      setMessages(prev => [...prev, 
        { role: 'user', content: input },
        { role: 'assistant', content: waitMessage, isCooldown: true }
      ]);
      setInput("");
      return;
    }

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const result = await smartSupportAssistant({
        userQuery: userMsg,
        userBalance,
        userPhone,
        isAdmin: !!isAdmin
      });
      
      setMessages(prev => [...prev, { role: 'assistant', content: result.assistantResponse }]);
      setLastMessageTime(Date.now());
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // معالجة ذكية لخطأ تجاوز الحصة (429 / Quota)
      if (errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("quota")) {
        const quotaMsg = `حقك على راسي ياغالي، عم بمر بفترة ضغط اتصالات هائلة حالياً. ياريت تعطيني دقيقة بس لأرتاح وأرجع أجاوبك بكل حب.`;
        setMessages(prev => [...prev, { role: 'assistant', content: quotaMsg, isCooldown: true }]);
        setLastMessageTime(Date.now()); // تفعيل الكول داون تلقائياً
      } else {
        let cleanError = `⚠️ تنبيه تقني (أيهم): حدثت مشكلة في الصلاحيات.\n\n`;
        if (errorMessage.includes("403") || errorMessage.includes("blocked")) {
          cleanError += `السبب: مفتاح API محظور أو الخدمة غير مفعلة.`;
        } else {
          cleanError += `تفاصيل الخطأ:\n${errorMessage}`;
        }
        setMessages(prev => [...prev, { role: 'assistant', content: cleanError, isError: true }]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col border-none shadow-2xl bg-white/80 backdrop-blur-md rounded-[32px] overflow-hidden">
      <CardHeader className="border-b bg-primary p-6 text-white shrink-0">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-sm border border-white/10">
                <Bot className="h-6 w-6 text-white" />
             </div>
             <div className="text-right">
               <p className="text-lg font-black font-headline leading-tight">مساعد شبيك لبيك</p>
               <p className="text-[10px] opacity-70 font-bold flex items-center gap-1">
                 <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                 متصل الآن لخدمتك
               </p>
             </div>
          </div>
          <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 flex flex-col min-h-0 relative">
        <ScrollArea ref={scrollRef} className="flex-1 p-6 bg-slate-50/30">
          <div className="space-y-6 pb-24">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <Avatar className="h-9 w-9 border-2 border-white shadow-sm shrink-0">
                  <AvatarFallback className={m.role === 'assistant' ? "bg-primary text-white" : "bg-secondary text-white"}>
                    {m.role === 'assistant' ? 'AI' : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className={`p-4 rounded-[24px] max-w-[85%] text-[13px] leading-relaxed shadow-sm ${
                  m.role === 'assistant' 
                    ? m.isError 
                      ? 'bg-red-50 text-red-700 border border-red-200 rounded-tr-none font-mono text-[11px]'
                      : m.isCooldown
                        ? 'bg-amber-50 text-amber-800 border border-amber-200 rounded-tr-none'
                        : 'bg-white text-slate-800 rounded-tr-none border border-slate-100 whitespace-pre-wrap' 
                    : 'bg-primary text-white rounded-tl-none'
                }`}>
                  {m.isError && <AlertTriangle className="h-4 w-4 mb-2 text-red-600 inline-block ml-2" />}
                  {m.isCooldown && <Clock className="h-4 w-4 mb-2 text-amber-600 inline-block ml-2" />}
                  {m.content}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3 animate-pulse">
                <div className="p-4 rounded-[22px] bg-white border border-slate-100 flex items-center gap-1.5 h-10">
                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-duration:0.6s]"></span>
                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-4 bg-white/80 backdrop-blur-sm border-t sticky bottom-0 z-10">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2 items-center bg-white p-1.5 rounded-2xl border shadow-lg border-primary/10"
          >
            <Input 
              placeholder="اكتب سؤالك هنا..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="bg-transparent border-none text-right focus-visible:ring-0 shadow-none h-12 text-sm"
              dir="rtl"
            />
            <Button size="icon" disabled={loading || !input.trim()} type="submit" className="rounded-xl h-11 w-11 shadow-xl shadow-primary/20">
              <Send className="h-5 w-5 rotate-180" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
