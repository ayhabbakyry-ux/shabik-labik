
"use client";

import { useState } from "react";
import { smartSupportAssistant } from "@/ai/flows/smart-support-assistant-flow";
import { useUser } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, Send, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Message = {
  role: 'assistant' | 'user';
  content: string;
};

export function AIChat() {
  const { userBalance, userPhone } = useUser();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your Shabik Labik Assistant. How can I help you with your transfers or app functionality today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

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
      });
      setMessages(prev => [...prev, { role: 'assistant', content: result.assistantResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col border-none shadow-none bg-transparent">
      <CardHeader className="border-b bg-white px-6">
        <CardTitle className="flex items-center gap-2">
          <Bot className="text-primary h-5 w-5" />
          Smart Support
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 flex flex-col min-h-0">
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <Avatar className="h-8 w-8 border">
                  <AvatarFallback className={m.role === 'assistant' ? 'bg-primary text-white' : 'bg-secondary'}>
                    {m.role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${
                  m.role === 'assistant' 
                    ? 'bg-white border rounded-tl-none' 
                    : 'bg-primary text-white rounded-tr-none shadow-md'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 border animate-pulse">
                  <AvatarFallback className="bg-primary text-white"><Bot className="h-4 w-4" /></AvatarFallback>
                </Avatar>
                <div className="p-3 rounded-2xl bg-white border rounded-tl-none">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 bg-white border-t">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2"
          >
            <Input 
              placeholder="Ask about your balance, deposits, or games..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="bg-muted/50 border-none"
            />
            <Button size="icon" disabled={loading} type="submit">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
