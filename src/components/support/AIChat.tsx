"use client";

import { useState, useRef, useEffect } from "react";
import { smartSupportAssistant } from "@/ai/flows/smart-support-assistant-flow";
import { useUser } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Send, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Message = {
  role: 'assistant' | 'user';
  content: string;
  isError?: boolean;
};

export function AIChat() {
  const { userBalance, userPhone, userName, isAdmin } = useUser();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: isAdmin 
      ? `مرحباً بك السيد أيهم. أنا المساعد الذكي الخاص بك، يمكنني تزويدك ببيانات المستخدمين وحالة أرصدتهم عند تزويدي بأرقام هواتفهم.` 
      : `مرحباً بك ${userName || 'عزيزي المستخدم'}. أنا المساعد الذكي لمنصة شبك لبيك، كيف يمكنني مساعدتك اليوم؟` 
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: "مرحباً بك. نأسف، النظام قيد التحديث حالياً لضمان تقديم أفضل خدمة، يرجى المحاولة لاحقاً.", isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col border-none shadow-2xl bg-white/50 backdrop-blur-md rounded-[32px] overflow-hidden">
      <CardHeader className="border-b bg-primary p-6 text-white shrink-0">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <Bot className="h-6 w-6 text-white" />
             </div>
             <div className="text-right">
               <p className="text-lg font-black font-headline leading-tight">المساعد الذكي</p>
               <p className="text-[10px] opacity-70 font-bold">{isAdmin ? "نظام الإدارة نشط" : "متصل الآن"}</p>
             </div>
          </div>
          <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 flex flex-col min-h-0">
        <ScrollArea ref={scrollRef} className="flex-1 p-6 bg-slate-50/50">
          <div className="space-y-6 pb-20">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <Avatar className="h-9 w-9 border-2 border-white shadow-sm shrink-0">
                  {m.role === 'assistant' ? (
                    <>
                      <AvatarImage src={`https://picsum.photos/seed/assistant/100`} />
                      <AvatarFallback className="bg-primary text-white font-bold text-xs">م</AvatarFallback>
                    </>
                  ) : (
                    <>
                      <AvatarImage src={`https://picsum.photos/seed/${userPhone}/100`} />
                      <AvatarFallback className="bg-secondary text-white font-bold text-xs">U</AvatarFallback>
                    </>
                  )}
                </Avatar>
                <div className={`p-4 rounded-[22px] max-w-[85%] text-sm leading-relaxed shadow-sm ${
                  m.role === 'assistant' 
                    ? m.isError 
                      ? 'bg-red-50 text-red-700 border border-red-100 rounded-tr-none text-right'
                      : 'bg-white text-slate-800 rounded-tr-none border border-slate-100 text-right whitespace-pre-wrap' 
                    : 'bg-primary text-white rounded-tl-none text-right font-medium'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 animate-pulse">
                <Avatar className="h-9 w-9 border-2 border-white shadow-sm shrink-0">
                  <AvatarFallback className="bg-primary text-white font-bold text-xs">م</AvatarFallback>
                </Avatar>
                <div className="p-4 rounded-[22px] bg-white border border-slate-100 rounded-tr-none flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-4 pb-60 bg-white border-t shrink-0">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2 items-center bg-muted/30 p-1.5 rounded-2xl border border-muted shadow-inner"
          >
            <Input 
              placeholder={isAdmin ? "يرجى إدخال رقم هاتف المستخدم..." : "يرجى كتابة استفسارك هنا..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="bg-transparent border-none text-right focus-visible:ring-0 shadow-none h-12"
              dir="rtl"
            />
            <Button 
              size="icon" 
              disabled={loading || !input.trim()} 
              type="submit"
              className="rounded-xl h-12 w-12 shadow-lg shadow-primary/20 shrink-0"
            >
              <Send className="h-5 w-5 rotate-180" />
            </Button>
          </form>
          <p className="text-[9px] text-center text-muted-foreground mt-2 font-bold opacity-50 tracking-widest uppercase">Shabik Labik AI Assistant v12.0</p>
        </div>
      </CardContent>
    </Card>
  );
}
