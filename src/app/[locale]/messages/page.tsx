"use client";

import { useState, useRef, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { SEED_USERS } from "@/lib/seed-data";
import { Send, Search, Phone, Video, MoreVertical, Smile, Paperclip, Bot, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  type: "text" | "system" | "ai-suggestion";
}

const INITIAL_CONVERSATIONS = SEED_USERS.slice(0, 8).map((user, idx) => ({
  userId: user.id,
  lastMessage: [
    "Would love to discuss the project further!",
    "Thanks for connecting! Your work on climate tech is fascinating.",
    "Are you available for a call this week?",
    "I've been thinking about your proposal...",
    "The prototype is looking great so far.",
    "Let me know if you need help with the ML pipeline.",
    "Excited to collaborate on this!",
    "Just shared the design mockups with you.",
  ][idx],
  lastMessageTime: new Date(Date.now() - idx * 3600000 * (idx + 1)).toISOString(),
  unread: idx < 3 ? Math.max(0, 3 - idx) : 0,
}));

function generateAIResponse(userMessage: string, contactName: string): string {
  const responses = [
    `That sounds exciting! I'd love to explore this further. When are you free for a call?`,
    `Great point! I was actually thinking along similar lines. Let me put together some notes and share them.`,
    `I've been working on something related — let me send you the repo link. Could be useful for the project.`,
    `Absolutely, I'm in. Let me check my schedule and get back to you by tomorrow.`,
    `Interesting approach! Have you considered using a transformer architecture for that? I have some experience there.`,
    `Love the direction. Let me loop in a few people from my network who might be interested in contributing.`,
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

export default function MessagesPage() {
  const { user, isAuthenticated, loginAsDemo } = useAuth();
  const router = useRouter();
  const [selectedConvo, setSelectedConvo] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, selectedConvo]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4 text-center shadow-xl">
            <CardHeader>
              <CardTitle>Sign in to view messages</CardTitle>
              <CardDescription>Connect and collaborate with your network.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={() => loginAsDemo()} className="w-full">Try Demo Mode</Button>
              <Button variant="outline" className="w-full" onClick={() => router.push("/login")}>Log In</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const selectedContact = selectedConvo ? SEED_USERS.find(u => u.id === selectedConvo) : null;
  const currentMessages = selectedConvo ? (chatMessages[selectedConvo] || []) : [];

  const filteredConversations = conversations.filter(c => {
    const contact = SEED_USERS.find(u => u.id === c.userId);
    if (!contact) return false;
    if (!searchQuery.trim()) return true;
    return contact.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const sendMessage = () => {
    if (!messageInput.trim() || !selectedConvo) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: user.id,
      text: messageInput,
      timestamp: new Date().toISOString(),
      type: "text",
    };

    setChatMessages(prev => ({
      ...prev,
      [selectedConvo]: [...(prev[selectedConvo] || []), newMsg],
    }));

    setConversations(prev =>
      prev.map(c => c.userId === selectedConvo ? { ...c, lastMessage: messageInput, lastMessageTime: new Date().toISOString(), unread: 0 } : c)
    );

    setMessageInput("");

    // Simulate reply
    const contactName = selectedContact?.name || "User";
    setTimeout(() => {
      const reply: ChatMessage = {
        id: `msg-${Date.now()}-reply`,
        senderId: selectedConvo,
        text: generateAIResponse(messageInput, contactName),
        timestamp: new Date().toISOString(),
        type: "text",
      };

      setChatMessages(prev => ({
        ...prev,
        [selectedConvo]: [...(prev[selectedConvo] || []), reply],
      }));
    }, 1500 + Math.random() * 2000);
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diffH = Math.floor((now.getTime() - d.getTime()) / 3600000);
    if (diffH < 1) return "Just now";
    if (diffH < 24) return `${diffH}h ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
        {/* Sidebar */}
        <div className={`w-full md:w-80 lg:w-96 border-r flex flex-col bg-background ${selectedConvo ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b">
            <h2 className="text-lg font-bold mb-3">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-9"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map(convo => {
              const contact = SEED_USERS.find(u => u.id === convo.userId);
              if (!contact) return null;
              const isSelected = selectedConvo === convo.userId;

              return (
                <button
                  key={convo.userId}
                  onClick={() => {
                    setSelectedConvo(convo.userId);
                    setConversations(prev => prev.map(c => c.userId === convo.userId ? { ...c, unread: 0 } : c));
                  }}
                  className={`w-full flex items-start gap-3 p-4 border-b text-left transition-colors ${
                    isSelected ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-accent"
                  }`}
                >
                  <div className="relative">
                    <Avatar size="md" alt={contact.name} />
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${convo.unread > 0 ? 'font-bold' : 'font-medium'}`}>{contact.name}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">{formatTime(convo.lastMessageTime)}</span>
                    </div>
                    <p className={`text-xs mt-0.5 truncate ${convo.unread > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      {convo.lastMessage}
                    </p>
                  </div>
                  {convo.unread > 0 && (
                    <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
                      {convo.unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        {selectedContact ? (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="h-16 border-b flex items-center justify-between px-4 bg-background">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedConvo(null)}>
                  ←
                </Button>
                <Avatar size="sm" alt={selectedContact.name} />
                <div>
                  <p className="text-sm font-semibold">{selectedContact.name}</p>
                  <p className="text-xs text-green-500">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon"><Phone className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon"><Video className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* AI Suggestion */}
              {currentMessages.length === 0 && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 mb-6">
                  <Bot className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-primary">AI Conversation Starter</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      You both share an interest in {selectedContact.interests[0]?.name || "technology"}.
                      {selectedContact.intents.includes("collaborator") && " They're actively looking for collaborators."}
                      Try asking about their work on {selectedContact.skills[0]?.name || "their latest project"}!
                    </p>
                  </div>
                </div>
              )}

              {currentMessages.map(msg => {
                const isOwn = msg.senderId === user.id;
                return (
                  <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                      isOwn
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted rounded-bl-md"
                    }`}>
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-[10px] mt-1 ${isOwn ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-background">
              <form
                onSubmit={e => { e.preventDefault(); sendMessage(); }}
                className="flex items-center gap-2"
              >
                <Button type="button" variant="ghost" size="icon"><Paperclip className="h-4 w-4" /></Button>
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  className="flex-1 h-11"
                />
                <Button type="button" variant="ghost" size="icon"><Smile className="h-4 w-4" /></Button>
                <Button type="submit" size="icon" disabled={!messageInput.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 hidden md:flex items-center justify-center bg-muted/20">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-lg">Select a conversation</h3>
              <p className="text-sm text-muted-foreground mt-1">Choose from your connections to start chatting</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
