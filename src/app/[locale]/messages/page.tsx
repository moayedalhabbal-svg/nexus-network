// @ts-nocheck
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */

import { useState, useRef, useEffect, startTransition } from "react";
import { Navbar } from "@/components/layout/navbar";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { trackEvent } from "@/lib/analytics";
import {
  Send, Search, MoreVertical, Paperclip, MessageSquare, Loader2,
  Users, ArrowLeft, Phone, Video, CheckCheck, Sparkles, Smile
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "next-intl";

interface DemoMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url?: string | null;
  };
}

interface DemoConversation {
  id: string;
  displayName: string;
  displayAvatar: string | null;
  headline?: string;
  is_group: boolean;
  context_message?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
  online?: boolean;
  otherUserId?: string | null;
  participants?: any[];
}

const DEMO_STORAGE_KEYS = {
  conversations: "nexus-demo-conversations",
  messages: "nexus-demo-messages",
};

function readStoredConversations(): DemoConversation[] {
  if (typeof window === "undefined") return DEMO_CONVERSATIONS;
  try {
    const stored = window.localStorage.getItem(DEMO_STORAGE_KEYS.conversations);
    if (!stored) return DEMO_CONVERSATIONS;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : DEMO_CONVERSATIONS;
  } catch {
    return DEMO_CONVERSATIONS;
  }
}

function readStoredMessagesMap(): Record<string, DemoMessage[]> {
  if (typeof window === "undefined") return INITIAL_DEMO_MESSAGES;
  try {
    const stored = window.localStorage.getItem(DEMO_STORAGE_KEYS.messages);
    if (!stored) return INITIAL_DEMO_MESSAGES;
    const parsed = JSON.parse(stored);
    return parsed && typeof parsed === "object" ? { ...INITIAL_DEMO_MESSAGES, ...parsed } : INITIAL_DEMO_MESSAGES;
  } catch {
    return INITIAL_DEMO_MESSAGES;
  }
}

const DEMO_CONVERSATIONS: DemoConversation[] = [
  {
    id: "demo-convo-1",
    displayName: "Elena Vasquez",
    displayAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256",
    headline: "MIT CSAIL | AI Research & Autonomous Robotics",
    is_group: false,
    context_message: "Matched via Autonomous Robotics Project (94% Fit)",
    last_message: "The inference speed improved by 40%! Would you like to co-author the conference paper?",
    last_message_time: "5m",
    unread_count: 2,
    online: true,
    otherUserId: "user-1",
  },
  {
    id: "demo-convo-2",
    displayName: "Marcus Chen",
    displayAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256",
    headline: "Founder @ GreenGrid | Ex-Tesla ML",
    is_group: false,
    context_message: "Applied for Co-Founder Role: GreenGrid AI",
    last_message: "Let's schedule a call this Thursday at 3 PM UTC to go through the grant pitch.",
    last_message_time: "45m",
    unread_count: 1,
    online: true,
    otherUserId: "user-2",
  },
  {
    id: "demo-convo-3",
    displayName: "GreenGrid AI - Core Team",
    displayAvatar: null,
    headline: "Project Workspace • 4 Members",
    is_group: true,
    context_message: "Active Workspace Sprint: Milestone 1",
    last_message: "Kai: The interactive telemetry dashboard prototype is uploaded to the workspace!",
    last_message_time: "2h",
    unread_count: 0,
    online: true,
    otherUserId: null,
  },
  {
    id: "demo-convo-4",
    displayName: "Aisha Okafor",
    displayAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256",
    headline: "Imperial College | Quantum Computing & Battery Storage",
    is_group: false,
    context_message: "Quantum Simulation Research Collaboration",
    last_message: "Sent you the arXiv preprint draft. Let me know your thoughts!",
    last_message_time: "1d",
    unread_count: 0,
    online: false,
    otherUserId: "user-3",
  },
  {
    id: "demo-convo-5",
    displayName: "Kai Nakamura",
    displayAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256",
    headline: "Product Designer & Frontend Architect",
    is_group: false,
    context_message: "UI Architecture & Design System",
    last_message: "Pushed the updated design tokens to Figma. Looks super clean.",
    last_message_time: "2d",
    unread_count: 0,
    online: true,
    otherUserId: "user-4",
  },
  {
    id: "demo-convo-6",
    displayName: "Priya Sharma",
    displayAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256",
    headline: "IIT Bombay | Deep Learning & Healthcare Systems",
    is_group: false,
    context_message: "Medical Imaging Collaboration",
    last_message: "Thanks for the feedback on the federated learning pipeline setup.",
    last_message_time: "3d",
    unread_count: 0,
    online: false,
    otherUserId: "user-5",
  },
];

const INITIAL_DEMO_MESSAGES: Record<string, DemoMessage[]> = {
  "demo-convo-1": [
    {
      id: "msg-1-1",
      conversation_id: "demo-convo-1",
      sender_id: "user-1",
      content: "Hi! I noticed your profile through NEXUS matching. Your background in high-performance computing is exactly what we need for our autonomous navigation pipeline.",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      profiles: { full_name: "Elena Vasquez", avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256" }
    },
    {
      id: "msg-1-2",
      conversation_id: "demo-convo-1",
      sender_id: "current-user",
      content: "Hey Elena! Thanks for reaching out. I've been following your work on sensor fusion benchmarks. What's the main bottleneck right now?",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
    },
    {
      id: "msg-1-3",
      conversation_id: "demo-convo-1",
      sender_id: "user-1",
      content: "We're struggling with latency during real-time point-cloud registration on edge hardware. We need to stay under 15ms per frame without sacrificing precision.",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
      profiles: { full_name: "Elena Vasquez", avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256" }
    },
    {
      id: "msg-1-4",
      conversation_id: "demo-convo-1",
      sender_id: "current-user",
      content: "I worked on quantization for TensorRT models recently—we could explore INT8 calibration and custom CUDA kernels for the voxelization step.",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    },
    {
      id: "msg-1-5",
      conversation_id: "demo-convo-1",
      sender_id: "user-1",
      content: "I benchmarked the INT8 pipeline you recommended. The inference speed improved by 40% with virtually zero loss in detection accuracy!",
      created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      profiles: { full_name: "Elena Vasquez", avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256" }
    },
    {
      id: "msg-1-6",
      conversation_id: "demo-convo-1",
      sender_id: "user-1",
      content: "Would you be interested in joining as a technical co-author for the upcoming conference submission? We'd love to have you on board.",
      created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      profiles: { full_name: "Elena Vasquez", avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256" }
    }
  ],
  "demo-convo-2": [
    {
      id: "msg-2-1",
      conversation_id: "demo-convo-2",
      sender_id: "user-2",
      content: "Hey! Loved your application for the lead engineer role on GreenGrid AI. We're pitching to the CleanTech syndicate next week.",
      created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      profiles: { full_name: "Marcus Chen", avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256" }
    },
    {
      id: "msg-2-2",
      conversation_id: "demo-convo-2",
      sender_id: "current-user",
      content: "Hey Marcus, very excited about what you're building. The grid optimization models and decentralization thesis look very solid.",
      created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    },
    {
      id: "msg-2-3",
      conversation_id: "demo-convo-2",
      sender_id: "user-2",
      content: "Let's schedule a call this Thursday at 3 PM UTC to go through the grant pitch and architecture roadmap.",
      created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      profiles: { full_name: "Marcus Chen", avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256" }
    }
  ],
  "demo-convo-3": [
    {
      id: "msg-3-1",
      conversation_id: "demo-convo-3",
      sender_id: "user-2",
      content: "Welcome everyone to the project chat! Milestone 1 kicks off this Monday.",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      profiles: { full_name: "Marcus Chen", avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256" }
    },
    {
      id: "msg-3-2",
      conversation_id: "demo-convo-3",
      sender_id: "user-1",
      content: "I've uploaded the initial synthetic sensor telemetry datasets to the files section.",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      profiles: { full_name: "Elena Vasquez", avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256" }
    },
    {
      id: "msg-3-3",
      conversation_id: "demo-convo-3",
      sender_id: "user-4",
      content: "The interactive telemetry dashboard prototype is uploaded to the workspace! Take a look at the Figma link.",
      created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      profiles: { full_name: "Kai Nakamura", avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256" }
    }
  ],
  "demo-convo-4": [
    {
      id: "msg-4-1",
      conversation_id: "demo-convo-4",
      sender_id: "user-3",
      content: "Hello! We're running simulations on molecular battery electrodes. Did you use variational quantum eigensolvers in your experiments?",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
      profiles: { full_name: "Aisha Okafor", avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256" }
    },
    {
      id: "msg-4-2",
      conversation_id: "demo-convo-4",
      sender_id: "current-user",
      content: "Yes, we paired VQE with error mitigation techniques on noisy hardware. Got decent convergence on the ground state energy.",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    },
    {
      id: "msg-4-3",
      conversation_id: "demo-convo-4",
      sender_id: "user-3",
      content: "Sent you the arXiv preprint draft. Let me know your thoughts!",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
      profiles: { full_name: "Aisha Okafor", avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256" }
    }
  ],
  "demo-convo-5": [
    {
      id: "msg-5-1",
      conversation_id: "demo-convo-5",
      sender_id: "user-4",
      content: "Pushed the updated design tokens to Figma. The high-contrast dark theme looks super clean.",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
      profiles: { full_name: "Kai Nakamura", avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256" }
    },
    {
      id: "msg-5-2",
      conversation_id: "demo-convo-5",
      sender_id: "current-user",
      content: "Checked them out—the typography scale and glassmorphism cards look great. Implementing the navbar changes now.",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 38).toISOString(),
    }
  ],
  "demo-convo-6": [
    {
      id: "msg-6-1",
      conversation_id: "demo-convo-6",
      sender_id: "user-5",
      content: "Hi there! Are you planning to attend the open science hackathon this weekend?",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString(),
      profiles: { full_name: "Priya Sharma", avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256" }
    },
    {
      id: "msg-6-2",
      conversation_id: "demo-convo-6",
      sender_id: "current-user",
      content: "Yes, I'll be participating in the distributed ML track. Are you focusing on healthcare imaging?",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 65).toISOString(),
    },
    {
      id: "msg-6-3",
      conversation_id: "demo-convo-6",
      sender_id: "user-5",
      content: "Thanks for the feedback on the federated learning pipeline setup. We managed to train across 4 simulated hospitals with zero patient leakage.",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
      profiles: { full_name: "Priya Sharma", avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256" }
    }
  ]
};

export default function MessagesPage() {
  const { user, isAuthenticated, loginAsDemo } = useAuth();
  const router = useRouter();
  const locale = useLocale();

  const [conversations, setConversations] = useState<DemoConversation[]>(() => readStoredConversations());
  const [selectedConvo, setSelectedConvo] = useState<DemoConversation | null>(() => {
    const stored = readStoredConversations();
    return stored[0] ?? DEMO_CONVERSATIONS[0] ?? null;
  });
  const [messagesMap, setMessagesMap] = useState<Record<string, DemoMessage[]>>(() => readStoredMessagesMap());
  const [messages, setMessages] = useState<DemoMessage[]>(() => {
    const storedMap = readStoredMessagesMap();
    const firstId = readStoredConversations()[0]?.id ?? "demo-convo-1";
    return storedMap[firstId] || INITIAL_DEMO_MESSAGES["demo-convo-1"] || [];
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    return supabaseRef.current;
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    async function loadConversations() {
      try {
        const { data: convMembers } = await getSupabase()
          .from("conversation_members")
          .select("conversation_id")
          .eq("user_id", user!.id);

        if (convMembers && convMembers.length > 0) {
          const convoIds = convMembers.map((m: any) => m.conversation_id);
          const { data: convos } = await getSupabase()
            .from("conversations")
            .select(`
              id, is_group, project_id, context_message, updated_at,
              projects(title),
              conversation_members(user_id, last_read_at, profiles(id, full_name, avatar_url))
            `)
            .in("id", convoIds)
            .order("updated_at", { ascending: false });

          if (convos && convos.length > 0) {
            const formatted: DemoConversation[] = convos.map((c: any) => {
              const others = c.conversation_members.filter((m: any) => m.user_id !== user!.id);
              const proj = c.projects as Record<string, any>;
              const otherProfile = (others[0] as Record<string, any>)?.profiles;
              const name = c.is_group
                ? (proj?.title ? `Project: ${proj.title}` : "Group Chat")
                : (otherProfile?.full_name || "Unknown User");
              const avatar = c.is_group ? null : otherProfile?.avatar_url;

              return {
                ...c,
                displayName: name,
                displayAvatar: avatar,
                headline: c.is_group ? "Project Team Chat" : "NEXUS Member",
                online: true,
                unread_count: 0,
                last_message_time: "Recent",
                participants: others,
              };
            });

            // Merge real convos with demo convos
            const merged = [...formatted, ...DEMO_CONVERSATIONS.filter(d => !formatted.some(f => f.id === d.id))];
            setConversations(merged);
            if (!selectedConvo) {
              setSelectedConvo(merged[0]);
            }
            return;
          }
        }
      } catch (err) {
        console.error("Error loading conversations from Supabase:", err);
      }

      // Default to demo conversations
      setConversations(DEMO_CONVERSATIONS);
      if (!selectedConvo) {
        setSelectedConvo(DEMO_CONVERSATIONS[0]);
      }
    }

    loadConversations();
  }, [user, isAuthenticated]);

  // Load messages when conversation is switched
  useEffect(() => {
    if (!selectedConvo) return;

    if (selectedConvo.id.startsWith("demo-")) {
      const demoMsgs = messagesMap[selectedConvo.id] || [];
      startTransition(() => {
        setMessages(demoMsgs);
        setConversations(prev => {
          const next = prev.map(c => (c.id === selectedConvo.id ? { ...c, unread_count: 0 } : c));
          localStorage.setItem(DEMO_STORAGE_KEYS.conversations, JSON.stringify(next));
          return next;
        });
      });
    } else {
      async function loadRealMessages() {
        const { data } = await getSupabase()
          .from("messages")
          .select("*, profiles(full_name, avatar_url)")
          .eq("conversation_id", selectedConvo.id)
          .order("created_at", { ascending: true });

        if (data) setMessages(data);
      }
      loadRealMessages();
    }
  }, [selectedConvo]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConvo || !user) return;

    const text = messageInput.trim();
    setMessageInput("");
    setSending(true);

    const newMsg: DemoMessage = {
      id: `msg-${Date.now()}`,
      conversation_id: selectedConvo.id,
      sender_id: user.id || "current-user",
      content: text,
      created_at: new Date().toISOString(),
      profiles: {
        full_name: user.name || "You",
        avatar_url: user.avatar,
      },
    };

    const updatedList = [...messages, newMsg];
    setMessages(updatedList);

    // Update conversation in sidebar snippet
    setConversations(prev =>
      prev.map(c =>
        c.id === selectedConvo.id
          ? {
              ...c,
              last_message: text,
              last_message_time: "Just now",
            }
          : c
      )
    );

    if (selectedConvo.id.startsWith("demo-")) {
      const nextMessagesMap = {
        ...messagesMap,
        [selectedConvo.id]: updatedList,
      };
      setMessagesMap(nextMessagesMap);
      localStorage.setItem(DEMO_STORAGE_KEYS.messages, JSON.stringify(nextMessagesMap));

      // Simulate a smart AI/User reply after 1.4 seconds
      if (!selectedConvo.is_group) {
        setTimeout(() => {
          setIsTyping(true);
        }, 600);

        setTimeout(() => {
          setIsTyping(false);
          const replyText =
            text.toLowerCase().includes("call") || text.toLowerCase().includes("zoom") || text.toLowerCase().includes("meet")
              ? "That works great for me! I'll send an invite link with the agenda."
              : text.toLowerCase().includes("code") || text.toLowerCase().includes("repo") || text.toLowerCase().includes("github")
              ? "Awesome, checking the repo commits now. The implementation looks very clean."
              : "Thanks for the update! Let's align on these deliverables for the next sprint.";

          const replyMsg: DemoMessage = {
            id: `reply-${Date.now()}`,
            conversation_id: selectedConvo.id,
            sender_id: selectedConvo.otherUserId || "other-user",
            content: replyText,
            created_at: new Date().toISOString(),
            profiles: {
              full_name: selectedConvo.displayName,
              avatar_url: selectedConvo.displayAvatar,
            },
          };

          setMessages(current => {
            const withReply = [...current, replyMsg];
            setMessagesMap(m => {
              const next = { ...m, [selectedConvo.id]: withReply };
              localStorage.setItem(DEMO_STORAGE_KEYS.messages, JSON.stringify(next));
              return next;
            });
            return withReply;
          });

          setConversations(prev => {
            const next = prev.map(c =>
              c.id === selectedConvo.id
                ? {
                    ...c,
                    last_message: replyText,
                    last_message_time: "Just now",
                  }
                : c
            );
            localStorage.setItem(DEMO_STORAGE_KEYS.conversations, JSON.stringify(next));
            return next;
          });
        }, 1800);
      }
    } else {
      // Real Supabase conversation
      await getSupabase().from("messages").insert({
        conversation_id: selectedConvo.id,
        sender_id: user.id,
        content: text,
      });
      await getSupabase()
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", selectedConvo.id);
    }

    trackEvent("message_sent", { conversation_id: selectedConvo.id });
    setSending(false);
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-zinc-100">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center shadow-2xl border-zinc-800 bg-zinc-900/90 backdrop-blur-xl">
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl font-bold">Sign in to view messages</CardTitle>
              <CardDescription className="text-zinc-400">
                Connect and collaborate with your network on active projects and opportunities.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={() => loginAsDemo()} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium">
                Try Demo Mode
              </Button>
              <Button variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800 text-zinc-300" onClick={() => router.push(`/${locale}/login`)}>
                Log In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const filteredConversations = conversations.filter(c =>
    c.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.headline && c.headline.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.last_message && c.last_message.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-zinc-100 selection:bg-blue-500/30">
      <Navbar />
      <main className="flex-1 flex overflow-hidden border-t border-zinc-800/60" style={{ height: "calc(100vh - 64px)" }}>
        
        {/* Left Column: Conversations Sidebar */}
        <div className={`w-full md:w-80 lg:w-[380px] border-r border-zinc-800/80 flex flex-col bg-zinc-950/70 backdrop-blur-md ${selectedConvo ? "hidden md:flex" : "flex"}`}>
          <div className="p-4 border-b border-zinc-800/80">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold tracking-tight text-zinc-100 flex items-center gap-2">
                Messages
                <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 text-[10px] px-1.5 py-0">
                  {conversations.length}
                </Badge>
              </h2>
              <span className="text-xs text-blue-400 font-medium cursor-pointer hover:underline">
                New Chat
              </span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search conversations..."
                className="ps-9 bg-zinc-900/80 border-zinc-800 focus-visible:ring-blue-500/50 text-sm placeholder:text-zinc-500"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/40">
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center p-8 text-zinc-500 text-sm">
                No conversations found matching &quot;{searchQuery}&quot;.
              </div>
            ) : (
              filteredConversations.map(convo => {
                const isSelected = selectedConvo?.id === convo.id;
                return (
                  <button
                    key={convo.id}
                    onClick={() => setSelectedConvo(convo)}
                    className={`w-full flex items-start gap-3 p-3.5 text-start transition-all relative ${
                      isSelected
                        ? "bg-blue-600/10 border-l-2 border-l-blue-500"
                        : "hover:bg-zinc-900/60"
                    }`}
                  >
                    {/* Avatar & Online status */}
                    <div className="relative shrink-0 mt-0.5">
                      {convo.is_group ? (
                        <div className="h-11 w-11 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-400" />
                        </div>
                      ) : (
                        <Avatar className="h-11 w-11 ring-1 ring-zinc-800" alt={convo.displayName} src={convo.displayAvatar} />
                      )}
                      {convo.online && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-zinc-950" />
                      )}
                    </div>

                    {/* Metadata & Preview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className={`text-sm truncate ${isSelected ? "font-semibold text-zinc-100" : "font-medium text-zinc-200"}`}>
                          {convo.displayName}
                        </span>
                        {convo.last_message_time && (
                          <span className="text-[11px] text-zinc-500 shrink-0 ms-2">
                            {convo.last_message_time}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-400 line-clamp-1 leading-relaxed">
                        {convo.last_message || convo.context_message || "Active conversation"}
                      </p>

                      <div className="flex items-center justify-between gap-2 mt-1.5">
                        {convo.context_message && (
                          <span className="text-[10px] text-blue-400/90 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 truncate max-w-[200px]">
                            {convo.context_message}
                          </span>
                        )}
                        {convo.unread_count && convo.unread_count > 0 ? (
                          <span className="h-4 min-w-4 px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                            {convo.unread_count}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat View */}
        {selectedConvo ? (
          <div className="flex-1 flex flex-col bg-[#0A0A0A]">
            
            {/* Chat Top Header */}
            <div className="h-16 border-b border-zinc-800/80 flex items-center justify-between px-4 sm:px-6 bg-zinc-950/80 backdrop-blur-md">
              <div className="flex items-center gap-3 min-w-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-zinc-400 hover:text-zinc-200 -ms-2"
                  onClick={() => setSelectedConvo(null)}
                >
                  <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
                </Button>
                
                <div className="relative shrink-0">
                  {selectedConvo.is_group ? (
                    <div className="h-10 w-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-400" />
                    </div>
                  ) : (
                    <Avatar className="h-10 w-10 ring-1 ring-zinc-800" alt={selectedConvo.displayName} src={selectedConvo.displayAvatar} />
                  )}
                  {selectedConvo.online && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-zinc-950" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-zinc-100 truncate">{selectedConvo.displayName}</p>
                    {selectedConvo.online && (
                      <span className="text-[11px] text-emerald-400 font-medium hidden sm:inline-flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 truncate">
                    {selectedConvo.headline || "Active NEXUS Member"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 sm:gap-2">
                <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-full hidden sm:inline-flex">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-full hidden sm:inline-flex">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-full">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Chat Messages List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Context Pill Banner */}
              {selectedConvo.context_message && (
                <div className="flex justify-center my-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/40 border border-blue-900/50 text-xs text-blue-300 shadow-sm">
                    <Sparkles className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    <span>{selectedConvo.context_message}</span>
                  </div>
                </div>
              )}

              {messages.map(msg => {
                const isOwn = msg.sender_id === (user?.id || "current-user") || msg.sender_id === "current-user";
                return (
                  <div key={msg.id} className={`flex gap-2.5 ${isOwn ? "justify-end" : "justify-start"} group`}>
                    {!isOwn && (
                      <Avatar
                        className="h-8 w-8 mt-1 shrink-0 ring-1 ring-zinc-800"
                        alt={msg.profiles?.full_name || selectedConvo.displayName}
                        src={msg.profiles?.avatar_url || selectedConvo.displayAvatar}
                      />
                    )}

                    <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[82%] sm:max-w-[70%]`}>
                      {!isOwn && selectedConvo.is_group && (
                        <span className="text-[11px] text-zinc-400 ms-1 mb-1 font-medium">
                          {msg.profiles?.full_name || "Team Member"}
                        </span>
                      )}

                      <div
                        className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                          isOwn
                            ? "bg-blue-600 text-white rounded-br-sm"
                            : "bg-zinc-900/90 border border-zinc-800/80 text-zinc-200 rounded-bl-sm"
                        }`}
                      >
                        <p className="text-[13.5px] sm:text-sm whitespace-pre-wrap leading-relaxed">
                          {msg.content}
                        </p>
                        <div className={`flex items-center gap-1.5 justify-end text-[10px] mt-1.5 ${isOwn ? "text-blue-100/70" : "text-zinc-500"}`}>
                          <span>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {isOwn && <CheckCheck className="h-3 w-3 text-blue-200" />}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-zinc-400 animate-pulse ms-2">
                  <Avatar className="h-6 w-6 ring-1 ring-zinc-800" src={selectedConvo.displayAvatar} alt={selectedConvo.displayName} />
                  <span>{selectedConvo.displayName} is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 sm:p-4 border-t border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
              <form onSubmit={sendMessage} className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-full shrink-0">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-full shrink-0 hidden sm:inline-flex">
                  <Smile className="h-4 w-4" />
                </Button>
                <Input
                  placeholder={`Message ${selectedConvo.displayName}...`}
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  className="flex-1 h-11 bg-zinc-900 border-zinc-800 focus-visible:ring-blue-500/50 text-sm text-zinc-100 placeholder:text-zinc-500 rounded-xl"
                  disabled={sending}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-11 w-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shrink-0 disabled:opacity-40 disabled:bg-zinc-800"
                  disabled={!messageInput.trim() || sending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 hidden md:flex items-center justify-center bg-zinc-950/40">
            <div className="text-center p-8 max-w-sm">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-center mb-4 text-zinc-400 shadow-xl">
                <MessageSquare className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="font-semibold text-lg text-zinc-100">Select a conversation</h3>
              <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
                Connect and collaborate with your matched peers, co-founders, and project teams.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
