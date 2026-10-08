// @ts-nocheck
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */

import { useState, useRef, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Send, Search, MoreVertical, Paperclip, MessageSquare, Loader2, Users, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function MessagesPage() {
  const { user, isAuthenticated, loginAsDemo } = useAuth();
  const router = useRouter();
  
  const [conversations, setConversations] = useState<unknown[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<unknown | null>(null);
  const [messages, setMessages] = useState<unknown[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    async function loadConversations() {
      // Fetch conversations the user is part of
      const { data: convMembers } = await supabase
        .from('conversation_members')
        .select('conversation_id')
        .eq('user_id', user!.id);
        
      if (!convMembers || convMembers.length === 0) {
        setLoading(false);
        return;
      }
      
      const convoIds = convMembers.map(m => m.conversation_id);
      
      // Fetch details
      const { data: convos } = await supabase
        .from('conversations')
        .select(`
          id, is_group, project_id, context_message, updated_at,
          projects(title),
          conversation_members(user_id, last_read_at, profiles(id, full_name, avatar_url))
        `)
        .in('id', convoIds)
        .order('updated_at', { ascending: false });
        
      if (convos) {
        // Format for UI
        const formatted = convos.map(c => {
          // Identify other participants
          const others = c.conversation_members.filter((m: Record<string, any>) => m.user_id !== user!.id);
          const proj = c.projects as Record<string, any>;
          const otherProfile = (others[0] as Record<string, any>)?.profiles;
          
          const name = c.is_group 
            ? (proj?.title ? `Project: ${proj.title}` : 'Group Chat')
            : (otherProfile?.full_name || 'Unknown User');
            
          const avatar = c.is_group ? null : otherProfile?.avatar_url;
          
          return {
            ...c,
            displayName: name,
            displayAvatar: avatar,
            participants: others
          };
        });
        setConversations(formatted);
      }
      setLoading(false);
    }
    
    loadConversations();
    
    // Subscribe to new messages affecting our conversations
    const channel = supabase.channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        // If message is for currently selected convo, append it
        if (selectedConvo && payload.new.conversation_id === selectedConvo.id) {
          setMessages(prev => [...prev, payload.new]);
        }
        // Also update conversations list order and last message snippet (simplification: just reload convos)
        loadConversations();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAuthenticated, selectedConvo]);

  useEffect(() => {
    if (!selectedConvo) return;
    
    async function loadMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*, profiles(full_name, avatar_url)')
        .eq('conversation_id', selectedConvo.id)
        .order('created_at', { ascending: true });
        
      if (data) setMessages(data);
      
      // Mark as read
      await supabase
        .from('conversation_members')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', selectedConvo.id)
        .eq('user_id', user!.id);
    }
    loadMessages();
  }, [selectedConvo, user]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConvo || !user) return;
    
    setSending(true);
    const text = messageInput;
    setMessageInput("");
    
    await supabase.from('messages').insert({
      conversation_id: selectedConvo.id,
      sender_id: user.id,
      content: text
    });
    
    // Update conversation timestamp
    await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', selectedConvo.id);
    setSending(false);
  };

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

  const filteredConversations = conversations.filter(c => 
    c.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            {loading ? (
              <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">No conversations found.</div>
            ) : (
              filteredConversations.map(convo => {
                const isSelected = selectedConvo?.id === convo.id;
                return (
                  <button
                    key={convo.id}
                    onClick={() => setSelectedConvo(convo)}
                    className={`w-full flex items-center gap-3 p-4 border-b text-left transition-colors ${
                      isSelected ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-accent"
                    }`}
                  >
                    {convo.is_group ? (
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                    ) : (
                      <Avatar className="h-10 w-10 shrink-0" alt={convo.displayName} src={convo.displayAvatar} />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium truncate">{convo.displayName}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {convo.context_message || "Active conversation"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        {selectedConvo ? (
          <div className="flex-1 flex flex-col bg-muted/10">
            {/* Chat Header */}
            <div className="h-16 border-b flex items-center justify-between px-4 bg-background">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedConvo(null)}>
                  <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
                </Button>
                {selectedConvo.is_group ? (
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                ) : (
                  <Avatar className="h-8 w-8" alt={selectedConvo.displayName} src={selectedConvo.displayAvatar} />
                )}
                <div>
                  <p className="text-sm font-semibold">{selectedConvo.displayName}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedConvo.context_message && (
                <div className="flex justify-center my-4">
                  <Badge variant="secondary" className="px-3 py-1 font-normal bg-primary/10 text-primary border-primary/20">
                    {selectedConvo.context_message}
                  </Badge>
                </div>
              )}

              {messages.map(msg => {
                const isOwn = msg.sender_id === user.id;
                return (
                  <div key={msg.id} className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                    {!isOwn && selectedConvo.is_group && (
                      <span className="text-xs text-muted-foreground ml-1 mb-1">{msg.profiles?.full_name}</span>
                    )}
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                      isOwn
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-background border shadow-sm rounded-bl-md"
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-[10px] mt-1 text-right ${isOwn ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-background">
              <form onSubmit={sendMessage} className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="icon"><Paperclip className="h-4 w-4" /></Button>
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  className="flex-1 h-11"
                  disabled={sending}
                />
                <Button type="submit" size="icon" disabled={!messageInput.trim() || sending}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 hidden md:flex items-center justify-center bg-muted/10">
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
