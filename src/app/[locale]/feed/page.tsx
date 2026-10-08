"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SEED_USERS, SEED_PROJECTS } from "@/lib/seed-data";
import { Heart, MessageSquare, Share2, Sparkles, Image as ImageIcon, Link as LinkIcon, Bookmark, ChevronRight, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { fetchFeedAction, createPostAction, likePostAction } from "@/app/actions/feed";

// High-quality Demo/Seed Content
const DEMO_POSTS = [
  {
    id: "demo-1",
    author: SEED_USERS.find(u => u.id === "user-2"), // Marcus Chen
    content: "Building an AI-powered energy optimization platform. Looking for an ML engineer interested in climate technology. We've just completed our baseline models and need help scaling the inference engine.",
    post_type: "looking_for_collaborators",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    likes_count: 34,
    comments_count: 5,
    project: SEED_PROJECTS.find(p => p.id === "proj-1"),
  },
  {
    id: "demo-2",
    author: SEED_USERS.find(u => u.id === "user-1"), // Elena Vasquez
    content: "Just completed our first computer vision prototype for autonomous navigation. 🚀\n\nThe most challenging part was dealing with edge cases in rapidly changing lighting conditions. Happy to share our findings with anyone working in a similar space.",
    post_type: "project_update",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    likes_count: 156,
    comments_count: 18,
    project: SEED_PROJECTS.find(p => p.id === "proj-3"),
  },
  {
    id: "demo-3",
    author: SEED_USERS.find(u => u.id === "user-6"), // Sarah Jenkins
    content: "Looking for collaborators interested in battery degradation modeling. We have access to a novel dataset from electric fleet vehicles and need someone with strong stochastic modeling experience.",
    post_type: "research_update",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    likes_count: 89,
    comments_count: 12,
    opportunity: {
      type: "research",
      title: "Battery Degradation Stochastic Modeling",
      description: "Analyzing 10,000+ hours of EV fleet battery telemetry to build predictive maintenance models."
    }
  },
  {
    id: "demo-4",
    author: SEED_USERS.find(u => u.id === "user-5"), // David Kim
    content: "Technical question: What approach would you use for predicting PV output under rapidly changing cloud conditions? We've tried standard time-series models but they lag significantly during sudden cloud cover.",
    post_type: "technical_discussion",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    likes_count: 45,
    comments_count: 22,
  }
];

export default function FeedPage() {
  const { user } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState("");
  const [postType, setPostType] = useState("general");
  const [feedCategory, setFeedCategory] = useState("For You");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  const loadPosts = async () => {
    setLoading(true);
    const { success, posts: fetchedPosts } = await fetchFeedAction();
    if (success && fetchedPosts && fetchedPosts.length > 0) {
      setPosts(fetchedPosts);
    } else {
      // Use demo posts if DB is empty to prevent dead platform feeling
      setPosts(DEMO_POSTS);
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    loadPosts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePost = async () => {
    if (!newPost.trim() || !user || isPosting) return;
    setIsPosting(true);
    const { success } = await createPostAction(newPost, postType);
    if (success) {
      setNewPost("");
      setPostType("general");
      loadPosts();
    }
    setIsPosting(false);
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    
    // Optimistic UI update
    setPosts(currentPosts => currentPosts.map(p => {
      if (p.id === postId) {
        const isLiked = p.is_liked_by_me;
        return { 
          ...p, 
          likes_count: isLiked ? Math.max(0, (p.likes_count || 1) - 1) : (p.likes_count || 0) + 1,
          is_liked_by_me: !isLiked
        };
      }
      return p;
    }));

    if (!postId.startsWith('demo-')) {
      await likePostAction(postId);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-zinc-100 selection:bg-primary/30">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 flex gap-8 justify-center">
        
        {/* Left Sidebar (Profile summary) */}
        <div className="hidden lg:block w-72 space-y-6">
          {user ? (
            <Card className="overflow-hidden border-zinc-800 bg-zinc-900/50 backdrop-blur-sm shadow-xl">
              <div className="h-20 bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-purple-900/40" />
              <CardContent className="p-5 pt-0 relative">
                <Avatar size="lg" alt={user.name} className="h-20 w-20 border-4 border-zinc-900 absolute -top-10 left-5 shadow-2xl" />
                <div className="mt-12">
                  <h3 className="font-bold text-lg text-zinc-100">{user.name}</h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 mt-1 font-medium">{user.headline}</p>
                </div>
                <div className="mt-6 pt-5 border-t border-zinc-800/50 space-y-4">
                  <Link href="/profile" className="flex justify-between text-sm group cursor-pointer">
                    <span className="text-zinc-400 group-hover:text-zinc-300 transition-colors">Profile views</span>
                    <span className="font-medium text-blue-400 group-hover:text-blue-300">142</span>
                  </Link>
                  <Link href="/network" className="flex justify-between text-sm group cursor-pointer">
                    <span className="text-zinc-400 group-hover:text-zinc-300 transition-colors">Network connections</span>
                    <span className="font-medium text-blue-400 group-hover:text-blue-300">89</span>
                  </Link>
                </div>
                
                <div className="mt-6 pt-5 border-t border-zinc-800/50 space-y-2">
                  <Link href="/projects/manage" className="flex items-center gap-3 text-sm text-zinc-400 hover:text-zinc-200 transition-colors py-1">
                    <Bookmark className="h-4 w-4" /> Saved Items
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardContent className="p-6 text-center">
                <h3 className="font-bold mb-2">Join NEXUS</h3>
                <p className="text-sm text-zinc-400 mb-4">Sign in to connect with builders and researchers.</p>
                <Link href="/login">
                  <Button className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200">Sign In</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <div className="text-xs text-zinc-500 flex flex-wrap gap-x-3 gap-y-2 px-2">
            <Link href="#" className="hover:text-zinc-300">About</Link>
            <Link href="#" className="hover:text-zinc-300">Accessibility</Link>
            <Link href="#" className="hover:text-zinc-300">Help Center</Link>
            <Link href="#" className="hover:text-zinc-300">Privacy & Terms</Link>
            <span className="w-full mt-2">NEXUS Corporation © 2026</span>
          </div>
        </div>

        {/* Main Feed */}
        <div className="flex-1 max-w-2xl w-full space-y-6">
          
          {/* Create Post */}
          {user && (
            <Card className="border-zinc-800 bg-zinc-900/50 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 flex gap-4">
                  <Avatar alt={user.name} className="h-10 w-10 mt-1 ring-2 ring-zinc-800" />
                  <div className="flex-1">
                    <textarea 
                      value={newPost}
                      onChange={e => setNewPost(e.target.value)}
                      placeholder="Share an update, project milestone, or ask for feedback..."
                      className="w-full resize-none bg-transparent outline-none pt-2 text-[15px] placeholder:text-zinc-500 text-zinc-100"
                      rows={newPost.length > 50 ? 4 : 2}
                    />
                  </div>
                </div>
                
                {newPost.length > 0 && (
                  <div className="px-16 pb-3">
                    <select 
                      className="text-xs border border-zinc-700 rounded-md px-3 py-1.5 bg-zinc-800 text-zinc-200 outline-none focus:ring-1 focus:ring-blue-500/50 transition-all cursor-pointer"
                      value={postType}
                      onChange={e => setPostType(e.target.value)}
                    >
                      <option value="general">Post</option>
                      <option value="project_update">Project Update</option>
                      <option value="looking_for_collaborators">Looking for Collaborators</option>
                      <option value="research_update">Research Update</option>
                      <option value="technical_discussion">Technical Discussion</option>
                      <option value="achievement">Achievement</option>
                    </select>
                  </div>
                )}
                
                <div className="flex justify-between items-center px-4 py-3 bg-zinc-900/80 border-t border-zinc-800">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-full">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-full">
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button 
                    onClick={handlePost} 
                    disabled={!newPost.trim() || isPosting} 
                    className="h-9 px-5 rounded-full font-medium bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500"
                  >
                    {isPosting ? "Posting..." : "Post"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Feed Navigation */}
          <div className="flex items-center gap-1 border-b border-zinc-800 pb-px mb-4 overflow-x-auto scrollbar-hide">
            {["For You", "Following", "Projects", "Research", "Opportunities"].map(cat => (
              <button
                key={cat}
                onClick={() => setFeedCategory(cat)}
                className={`px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${feedCategory === cat ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                {cat}
                {feedCategory === cat && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          {/* Posts */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              </div>
            ) : posts.map(post => {
              const author = post.author || { name: 'Unknown', id: post.author_id, headline: 'NEXUS Member' };
              const project = post.project;
              const opportunity = post.opportunity;
              
              const isDemo = post.id.startsWith('demo-');

              return (
                <Card key={post.id} className="border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-3">
                          <Link href={`/profile/${author.id}`}>
                            <Avatar alt={author.full_name || author.name} className="ring-1 ring-zinc-800" />
                          </Link>
                          <div>
                            <Link href={`/profile/${author.id}`} className="font-semibold text-[15px] text-zinc-100 hover:text-blue-400 transition-colors">
                              {author.full_name || author.name}
                            </Link>
                            <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">{author.headline}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-[11px] text-zinc-500">
                                {mounted ? formatRelativeTime(post.created_at) : formatDate(post.created_at)}
                              </p>
                              {isDemo && <span className="text-[10px] text-zinc-600 bg-zinc-800/50 px-1.5 py-0.5 rounded border border-zinc-700/50">Demo Data</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {post.post_type && post.post_type !== 'general' && (
                            <Badge variant="outline" className="text-[10px] uppercase font-semibold border-zinc-700 text-zinc-400 tracking-wider bg-transparent">
                              {post.post_type.replace(/_/g, ' ')}
                            </Badge>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="text-[15px] whitespace-pre-wrap leading-relaxed text-zinc-200">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {post.content.split(' ').map((word: any, i: number) => 
                          word.startsWith('#') 
                            ? <span key={i} className="text-blue-400 hover:text-blue-300 font-medium cursor-pointer">{word} </span>
                            : `${word} `
                        )}
                      </div>

                      {project && (
                        <div className="mt-5 rounded-xl border border-zinc-700/50 overflow-hidden bg-zinc-950/50 hover:bg-zinc-900 transition-colors">
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <Badge className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-medium border-0">
                                {project.category?.replace('_', ' ') || 'Project'}
                              </Badge>
                            </div>
                            <h4 className="font-bold text-lg text-zinc-100">{project.title}</h4>
                            <p className="text-[14px] text-zinc-400 mt-1.5 leading-relaxed">{project.pitch}</p>
                            
                            {project.project_needs && project.project_needs.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-zinc-800/50">
                                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Looking for:</p>
                                <div className="flex flex-wrap gap-2">
                                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                  {project.project_needs.slice(0,3).map((need: any) => (
                                    <Badge key={need.id} variant="outline" className="text-[11px] border-zinc-700 text-zinc-300 bg-zinc-800/50">
                                      {need.role_title}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="bg-zinc-900/80 px-4 py-3 flex gap-3 border-t border-zinc-800">
                            <Link href={`/projects/${project.id}`} className="flex-1">
                              <Button variant="outline" className="w-full h-8 text-xs bg-transparent border-zinc-700 hover:bg-zinc-800 text-zinc-300">
                                View Project
                              </Button>
                            </Link>
                            <Link href={`/projects/${project.id}?intent=collaborate`} className="flex-1">
                              <Button className="w-full h-8 text-xs bg-zinc-100 text-zinc-900 hover:bg-white">
                                Connect
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )}

                      {opportunity && (
                        <div className="mt-5 rounded-xl border border-indigo-500/30 overflow-hidden bg-indigo-950/10 hover:bg-indigo-950/20 transition-colors">
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <Badge className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border-0 text-[10px] uppercase font-bold tracking-wider">
                                {opportunity.type || 'OPPORTUNITY'}
                              </Badge>
                            </div>
                            <h4 className="font-bold text-lg text-zinc-100">{opportunity.title}</h4>
                            <p className="text-[14px] text-zinc-400 mt-1.5 leading-relaxed">{opportunity.description}</p>
                          </div>
                          <div className="bg-indigo-950/20 px-4 py-3 flex gap-3 border-t border-indigo-500/20">
                            <Link href={`/opportunities`} className="flex-1">
                              <Button variant="outline" className="w-full h-8 text-xs bg-transparent border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 hover:text-indigo-200">
                                View Details
                              </Button>
                            </Link>
                            <Link href={`/opportunities`} className="flex-1">
                              <Button className="w-full h-8 text-xs bg-indigo-500 hover:bg-indigo-400 text-white border-0">
                                Apply
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="px-5 py-3 border-t border-zinc-800/50 flex items-center justify-between">
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          onClick={() => handleLike(post.id)}
                          className={`h-9 px-3 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${post.is_liked_by_me ? 'text-pink-500 hover:text-pink-400 hover:bg-pink-500/10' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'}`}
                        >
                          <Heart className={`h-4 w-4 ${post.is_liked_by_me ? 'fill-current' : ''}`} /> {post.likes_count || 0}
                        </Button>
                        <Button variant="ghost" className="h-9 px-3 rounded-md flex items-center gap-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 text-sm font-medium">
                          <MessageSquare className="h-4 w-4" /> {post.comments_count || 0}
                        </Button>
                        <Button variant="ghost" className="h-9 px-3 rounded-md flex items-center gap-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 text-sm font-medium hidden sm:flex">
                          <Share2 className="h-4 w-4" /> Share
                        </Button>
                      </div>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-md">
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar (Intelligent Discovery) */}
        <div className="hidden xl:block w-[300px] space-y-6">
          <Card className="border-zinc-800 bg-zinc-900/50 shadow-sm">
            <CardHeader className="pb-4 border-b border-zinc-800/50">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-zinc-100">
                <Sparkles className="h-4 w-4 text-blue-400" /> People for you
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {SEED_USERS.slice(3, 6).map(person => (
                <div key={person.id} className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar size="sm" alt={person.name} className="h-10 w-10 ring-1 ring-zinc-800" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[14px] text-zinc-100 truncate hover:text-blue-400 cursor-pointer">{person.name}</p>
                      <p className="text-xs text-zinc-400 truncate">{person.headline}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full h-7 text-xs bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 rounded-full">
                    Connect
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card className="border-zinc-800 bg-zinc-900/50 shadow-sm">
            <CardHeader className="pb-4 border-b border-zinc-800/50">
              <CardTitle className="text-sm font-semibold text-zinc-100">
                Trending Topics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {[
                { tag: "ClimateTech", posts: 1204 },
                { tag: "Robotics", posts: 932 },
                { tag: "BioInformatics", posts: 840 },
                { tag: "OpenSource", posts: 650 }
              ].map((topic) => (
                <div key={topic.tag} className="flex flex-col group cursor-pointer">
                  <span className="font-medium text-[14px] text-zinc-300 group-hover:text-blue-400 transition-colors">#{topic.tag}</span>
                  <span className="text-xs text-zinc-500">{topic.posts.toLocaleString()} posts</span>
                </div>
              ))}
              <Link href="/discover" className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 mt-2">
                Explore more <ChevronRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        </div>

      </main>
    </div>
  );
}
