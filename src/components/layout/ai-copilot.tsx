"use client";

import { useState } from "react";
import { Bot, X, Sparkles, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";

export function GlobalAICopilot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{role: 'user'|'assistant', text: string}[]>([
    {
      role: 'assistant',
      text: "Hi! I'm your NEXUS Copilot. I can help you find projects, matching co-founders, or suggest ways to improve your profile. What are you looking for today?"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userQuery = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userQuery }]);
    setInput("");
    setIsTyping(true);

    // Simulate AI semantic search / chat response
    setTimeout(() => {
      let response = "I found 3 projects that match those requirements. I've highlighted the top one for you.";
      
      const q = userQuery.toLowerCase();
      if (q.includes("co-founder") || q.includes("cofounder")) {
        response = `Based on your profile, I recommend reaching out to Marcus Chen. He's a Full-Stack Engineer actively looking for a co-founder in your space, and you have an 88% complementarity score.`;
      } else if (q.includes("profile") || q.includes("improve")) {
        response = `Your profile is looking great at ${user?.completionPercentage || 80}%! To boost your visibility, I suggest adding a link to your GitHub or a portfolio site in the 'Proof of Work' section.`;
      } else if (q.includes("investor") || q.includes("funding")) {
        response = `I found 4 investors in the NEXUS network who recently funded Climate Tech startups. Would you like me to draft an introduction message?`;
      }

      setMessages(prev => [...prev, { role: 'assistant', text: response }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 h-14 w-14 bg-primary text-primary-foreground rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-40 ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <Bot className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-background"></span>
        </span>
      </button>

      {/* Copilot Modal/Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[380px] h-[550px] bg-background border border-border/50 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="h-14 bg-muted/40 border-b flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <span className="font-semibold text-sm">NEXUS Copilot</span>
              <Badge variant="outline" className="text-[9px] h-4 bg-primary/5 text-primary border-primary/20 ml-1">AI</Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-br-sm' 
                    : 'bg-muted/50 rounded-bl-sm border border-border/50'
                }`}>
                  {msg.role === 'assistant' && i === 0 && (
                    <Sparkles className="h-4 w-4 text-primary mb-2" />
                  )}
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted/50 rounded-2xl rounded-bl-sm p-4 border border-border/50 flex gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Suggestion Chips */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
              <button onClick={() => setInput("Find me a technical co-founder")} className="shrink-0 text-xs bg-muted hover:bg-muted/80 rounded-full px-3 py-1.5 border transition-colors">
                Find co-founder
              </button>
              <button onClick={() => setInput("Review my profile")} className="shrink-0 text-xs bg-muted hover:bg-muted/80 rounded-full px-3 py-1.5 border transition-colors">
                Review profile
              </button>
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 bg-background border-t">
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask Copilot..."
                className="pl-9 pr-10 rounded-full bg-muted/30 border-transparent focus-visible:ring-1 focus-visible:bg-background h-10"
              />
              <button 
                type="submit" 
                disabled={!input.trim()}
                className="absolute right-1.5 h-7 w-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center disabled:opacity-50 transition-opacity"
              >
                <ArrowRight className="h-3 w-3" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
