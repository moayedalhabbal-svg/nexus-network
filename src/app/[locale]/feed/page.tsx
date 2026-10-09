/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/navbar";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SEED_USERS, SEED_PROJECTS } from "@/lib/seed-data";
import { Heart, MessageSquare, Share2, Sparkles, Image as ImageIcon, Link as LinkIcon, Bookmark, ChevronRight, MoreHorizontal, X, Repeat2, Send } from "lucide-react";
import Link from "next/link";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { fetchFeedAction, createPostAction, likePostAction, savePostAction, fetchCommentsAction, createCommentAction, likeCommentAction, uploadMediaAction, fetchMyProjectsAction, deletePostAction, editPostAction } from "@/app/actions/feed";
import Image from "next/image";

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
    media_urls: ["https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800"]
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
    media_urls: ["https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800"]
  },
  {
    id: "demo-3",
    author: SEED_USERS.find(u => u.id === "user-3"), // Aisha Okafor
    content: "Thrilled to share that our research on novel materials for efficient battery storage has been accepted! This marks a huge milestone for our lab. Special thanks to the entire team. #Research #EnergyTech",
    post_type: "achievement",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    likes_count: 242,
    comments_count: 31,
    media_urls: ["https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=800"]
  },
  {
    id: "demo-4",
    author: SEED_USERS.find(u => u.id === "user-4"), // Wei Chen
    content: "We're expanding our research team. If you're a post-doc with experience in quantum computing and material science, we'd love to chat. This is a fully funded 2-year position with a chance to work with state-of-the-art facilities.",
    post_type: "looking_for_collaborators",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    likes_count: 89,
    comments_count: 12,
    project: SEED_PROJECTS.find(p => p.id === "proj-2"),
    media_urls: ["https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800"]
  }
];

export default function FeedPage() {
  const { user } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState("");
  const [postType, setPostType] = useState("general");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [feedCategory, setFeedCategory] = useState("For You");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [linkedProject, setLinkedProject] = useState("");
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [menuOpenForId, setMenuOpenForId] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [expandedComments, setExpandedComments] = useState<Record<string, any[]>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});
  const [newComments, setNewComments] = useState<Record<string, string>>({});

  const loadPosts = async () => {
    setLoading(true);
    const { success, posts: fetchedPosts } = await fetchFeedAction();
    if (success && fetchedPosts && fetchedPosts.length > 0) {
      setPosts(fetchedPosts);
    } else {
      setPosts(DEMO_POSTS);
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    loadPosts();
    
    // Fetch user projects
    if (user) {
      fetchMyProjectsAction().then(res => {
        if (res.success && res.projects) {
          setMyProjects(res.projects);
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || mediaUrls.length >= 4) return;
    setIsUploading(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    const res = await uploadMediaAction(formData);
    if (res.success && res.url) {
      setMediaUrls(prev => [...prev, res.url!]);
    }
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePost = async () => {
    if (!newPost.trim() || !user || isPosting) return;
    setIsPosting(true);
    const projRef = linkedProject === "" ? null : linkedProject;
    const { success } = await createPostAction(newPost, postType, projRef, null, mediaUrls);
    if (success) {
      setNewPost("");
      setPostType("general");
      setMediaUrls([]);
      setLinkedProject("");
      loadPosts();
    }
    setIsPosting(false);
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    setMenuOpenForId(null);
    setPosts(prev => prev.filter(p => p.id !== postId));
    if (!postId.startsWith('demo-')) {
      await deletePostAction(postId);
    }
  };

  const handleEditPost = async (postId: string) => {
    if (!editContent.trim()) {
      setEditingPostId(null);
      return;
    }
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, content: editContent } : p));
    setEditingPostId(null);
    if (!postId.startsWith('demo-')) {
      await editPostAction(postId, editContent);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
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
    if (!postId.startsWith('demo-')) await likePostAction(postId);
  };

  const handleSave = async (postId: string) => {
    if (!user) return;
    setPosts(currentPosts => currentPosts.map(p => {
      if (p.id === postId) return { ...p, is_saved_by_me: !p.is_saved_by_me };
      return p;
    }));
    if (!postId.startsWith('demo-')) await savePostAction(postId);
  };

  const toggleComments = async (postId: string) => {
    if (expandedComments[postId]) {
      const newExp = { ...expandedComments };
      delete newExp[postId];
      setExpandedComments(newExp);
      return;
    }
    
    if (postId.startsWith('demo-')) {
      setExpandedComments(prev => ({ ...prev, [postId]: [] }));
      return;
    }

    setLoadingComments(prev => ({ ...prev, [postId]: true }));
    const res = await fetchCommentsAction(postId);
    if (res.success) {
      setExpandedComments(prev => ({ ...prev, [postId]: res.comments || [] }));
    }
    setLoadingComments(prev => ({ ...prev, [postId]: false }));
  };

  const handlePostComment = async (postId: string, parentId: string | null = null) => {
    const content = newComments[parentId || postId];
    if (!content?.trim() || !user) return;
    
    // Optimistic insert
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const optimisticComment: any = {
      id: `temp-${Date.now()}`,
      post_id: postId,
      parent_id: parentId,
      content,
      author: { id: user.id, name: user.name, full_name: user.name },
      created_at: new Date().toISOString(),
      likes_count: 0,
      is_liked_by_me: false
    };

    setExpandedComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), optimisticComment]
    }));
    setNewComments(prev => ({ ...prev, [parentId || postId]: "" }));

    if (!postId.startsWith('demo-')) {
      const res = await createCommentAction(postId, content, parentId);
      if (res.success) {
        // Swap temp with actual
        setExpandedComments(prev => ({
          ...prev,
          [postId]: prev[postId].map(c => c.id === optimisticComment.id ? res.comment : c)
        }));
      }
    }
  };

  const handleLikeComment = async (postId: string, commentId: string) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: prev[postId].map(c => {
        if (c.id === commentId) {
          const isLiked = c.is_liked_by_me;
          return { ...c, is_liked_by_me: !isLiked, likes_count: isLiked ? Math.max(0, c.likes_count - 1) : c.likes_count + 1 };
        }
        return c;
      })
    }));
    if (!commentId.startsWith('temp-')) await likeCommentAction(commentId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-zinc-100 selection:bg-primary/30">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 flex gap-8 justify-center">
        
        {/* Left Sidebar */}
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
                    <span className="text-zinc-400 group-hover:text-zinc-300 transition-colors">Connections</span>
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
                <Link href="/login"><Button className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200">Sign In</Button></Link>
              </CardContent>
            </Card>
          )}
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
                      rows={newPost.length > 50 || mediaUrls.length > 0 ? 4 : 2}
                    />
                    
                    {/* Media Gallery Preview */}
                    {mediaUrls.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {mediaUrls.map((url, i) => (
                          <div key={i} className="relative w-24 h-24 rounded-md overflow-hidden border border-zinc-700">
                            <Image src={url} alt="upload" fill className="object-cover" />
                            <button onClick={() => setMediaUrls(urls => urls.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-black/60 p-1 rounded-full text-white hover:bg-black">
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {newPost.length > 0 && (
                  <div className="px-16 pb-3 flex gap-2 flex-wrap">
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

                    {myProjects.length > 0 && (
                      <select 
                        className="text-xs border border-zinc-700 rounded-md px-3 py-1.5 bg-zinc-800 text-zinc-200 outline-none focus:ring-1 focus:ring-blue-500/50 transition-all cursor-pointer max-w-[200px]"
                        value={linkedProject}
                        onChange={e => setLinkedProject(e.target.value)}
                      >
                        <option value="">Link Project (Optional)</option>
                        {myProjects.map(proj => (
                          <option key={proj.id} value={proj.id}>{proj.title}</option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
                
                <div className="flex justify-between items-center px-4 py-3 bg-zinc-900/80 border-t border-zinc-800">
                  <div className="flex gap-2">
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                    <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isUploading || mediaUrls.length >= 4} className="h-9 w-9 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-full">
                      {isUploading ? <div className="h-4 w-4 rounded-full border-2 border-zinc-500 border-t-transparent animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button onClick={handlePost} disabled={!newPost.trim() || isPosting || isUploading} className="h-9 px-5 rounded-full font-medium bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500">
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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const mediaList: string[] = post.media_urls || [];
              const showComments = !!expandedComments[post.id];
              const commentsData = expandedComments[post.id] || [];
              const parentComments = commentsData.filter(c => !c.parent_id);

              return (
                <Card key={post.id} className="border-zinc-800 bg-zinc-900/40 transition-colors overflow-hidden">
                  <CardContent className="p-0">
                    
                    {/* Repost Header (Mock visual) */}
                    {post.parent_post_id && (
                      <div className="px-5 pt-3 pb-0 flex items-center gap-2 text-xs text-zinc-500 font-medium">
                        <Repeat2 className="h-3 w-3" /> {user?.name} reposted
                      </div>
                    )}

                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-3">
                          <Link href={`/profile/${author.id}`}><Avatar alt={author.full_name || author.name} className="ring-1 ring-zinc-800" /></Link>
                          <div>
                            <Link href={`/profile/${author.id}`} className="font-semibold text-[15px] text-zinc-100 hover:text-blue-400 transition-colors">{author.full_name || author.name}</Link>
                            <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">{author.headline}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-[11px] text-zinc-500">{mounted ? formatRelativeTime(post.created_at) : formatDate(post.created_at)}</p>
                              {isDemo && <span className="text-[10px] text-zinc-600 bg-zinc-800/50 px-1.5 py-0.5 rounded border border-zinc-700/50">Demo Data</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 relative">
                          {post.post_type && post.post_type !== 'general' && (
                            <Badge variant="outline" className="text-[10px] uppercase font-semibold border-zinc-700 text-zinc-400 tracking-wider bg-transparent">
                              {post.post_type.replace(/_/g, ' ')}
                            </Badge>
                          )}
                          {(user?.id === author.id && !isDemo) && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                                onClick={() => setMenuOpenForId(menuOpenForId === post.id ? null : post.id)}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                              
                              {menuOpenForId === post.id && (
                                <div className="absolute right-0 top-10 w-32 bg-zinc-800 border border-zinc-700 rounded-md shadow-xl py-1 z-10 overflow-hidden">
                                  <button 
                                    className="w-full text-left px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700"
                                    onClick={() => {
                                      setEditingPostId(post.id);
                                      setEditContent(post.content);
                                      setMenuOpenForId(null);
                                    }}
                                  >
                                    Edit Post
                                  </button>
                                  <button 
                                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                    onClick={() => handleDeletePost(post.id)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {editingPostId === post.id ? (
                        <div className="mb-4 space-y-3">
                          <textarea 
                            value={editContent}
                            onChange={e => setEditContent(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-3 text-[15px] text-zinc-100 outline-none focus:ring-1 focus:ring-blue-500/50 resize-none min-h-[100px]"
                          />
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setEditingPostId(null)} className="text-zinc-400 hover:text-zinc-300">Cancel</Button>
                            <Button size="sm" onClick={() => handleEditPost(post.id)} className="bg-blue-600 hover:bg-blue-500 text-white">Save Changes</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[15px] whitespace-pre-wrap leading-relaxed text-zinc-200 mb-4">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {post.content.split(' ').map((word: any, i: number) => word.startsWith('#') ? <span key={i} className="text-blue-400 hover:text-blue-300 font-medium cursor-pointer">{word} </span> : `${word} `)}
                        </div>
                      )}

                      {/* Image Gallery */}
                      {mediaList.length > 0 && (
                        <div className={`mt-3 grid gap-1 rounded-xl overflow-hidden border border-zinc-800 ${mediaList.length === 1 ? 'grid-cols-1' : mediaList.length === 2 ? 'grid-cols-2' : mediaList.length === 3 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                          {mediaList.map((url, i) => (
                            <div key={i} className={`relative bg-zinc-900 ${mediaList.length === 1 ? 'aspect-video' : mediaList.length === 3 && i === 0 ? 'col-span-2 aspect-[2/1]' : 'aspect-square'}`}>
                              <Image src={url} alt="Post media" fill className="object-cover" />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Project Embed */}
                      {project && (
                        <div className="mt-5 rounded-xl border border-zinc-700/50 overflow-hidden bg-zinc-950/50 hover:bg-zinc-900 transition-colors">
                          <div className="p-4">
                            <Badge className="bg-zinc-800 text-zinc-300 mb-3 hover:bg-zinc-700 text-xs font-medium border-0">{project.category?.replace('_', ' ') || 'Project'}</Badge>
                            <h4 className="font-bold text-lg text-zinc-100">{project.title}</h4>
                            <p className="text-[14px] text-zinc-400 mt-1.5 leading-relaxed">{project.pitch}</p>
                            {project.project_needs?.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-zinc-800/50">
                                <p className="text-xs font-semibold text-zinc-500 uppercase mb-2">Looking for:</p>
                                <div className="flex flex-wrap gap-2">
                                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                  {project.project_needs.slice(0,3).map((need: any) => <Badge key={need.id} variant="outline" className="text-[11px] border-zinc-700 text-zinc-300 bg-zinc-800/50">{need.role_title}</Badge>)}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="bg-zinc-900/80 px-4 py-3 flex gap-3 border-t border-zinc-800">
                            <Link href={`/projects/${project.id}`} className="flex-1"><Button variant="outline" className="w-full h-8 text-xs bg-transparent border-zinc-700 hover:bg-zinc-800 text-zinc-300">View Project</Button></Link>
                            <Link href={`/projects/${project.id}?intent=join`} className="flex-1"><Button className="w-full h-8 text-xs bg-zinc-100 text-zinc-900 hover:bg-white">Join Project</Button></Link>
                          </div>
                        </div>
                      )}
                      
                      {/* AI Match Embed (Mock) */}
                      {project && user && (
                        <div className="mt-3 px-4 py-3 bg-blue-900/10 border border-blue-900/30 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Sparkles className="h-4 w-4 text-blue-400" />
                            <div>
                              <p className="text-sm font-medium text-blue-100">Strong match (92%)</p>
                              <p className="text-xs text-blue-300/70">Your ML and Python skills align perfectly.</p>
                            </div>
                          </div>
                          <Button variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 text-xs h-7 px-3">Review Match</Button>
                        </div>
                      )}

                      {/* Opportunity Embed */}
                      {opportunity && (
                        <div className="mt-5 rounded-xl border border-zinc-700/50 overflow-hidden bg-zinc-950/50 hover:bg-zinc-900 transition-colors">
                          <div className="p-4">
                            <Badge className="bg-purple-900/40 text-purple-300 mb-3 hover:bg-purple-900/60 text-xs font-medium border-purple-800/50">Opportunity</Badge>
                            <h4 className="font-bold text-lg text-zinc-100">{opportunity.title}</h4>
                            <p className="text-[14px] text-zinc-400 mt-1.5 leading-relaxed line-clamp-2">{opportunity.description}</p>
                            <div className="flex gap-2 mt-4">
                              {opportunity.location && <Badge variant="outline" className="text-[10px] bg-zinc-800/50 border-zinc-700 text-zinc-300">{opportunity.location}</Badge>}
                              {opportunity.type && <Badge variant="outline" className="text-[10px] bg-zinc-800/50 border-zinc-700 text-zinc-300">{opportunity.type.replace('_', ' ')}</Badge>}
                            </div>
                          </div>
                          <div className="bg-zinc-900/80 px-4 py-3 flex gap-3 border-t border-zinc-800">
                            <Link href={`/opportunities/${opportunity.id}`} className="flex-1">
                              <Button className="w-full h-8 text-xs bg-zinc-100 text-zinc-900 hover:bg-white">View Details</Button>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="px-5 py-3 border-t border-zinc-800/50 flex items-center justify-between">
                      <div className="flex gap-1">
                        <Button variant="ghost" onClick={() => handleLike(post.id)} className={`h-9 px-3 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${post.is_liked_by_me ? 'text-pink-500 hover:text-pink-400 hover:bg-pink-500/10' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'}`}>
                          <Heart className={`h-4 w-4 ${post.is_liked_by_me ? 'fill-current' : ''}`} /> {post.likes_count || 0}
                        </Button>
                        <Button variant="ghost" onClick={() => toggleComments(post.id)} className="h-9 px-3 rounded-md flex items-center gap-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 text-sm font-medium">
                          <MessageSquare className="h-4 w-4" /> {post.comments_count || 0}
                        </Button>
                        <Button variant="ghost" className="h-9 px-3 rounded-md flex items-center gap-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 text-sm font-medium hidden sm:flex">
                          <Repeat2 className="h-4 w-4" /> Repost
                        </Button>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleSave(post.id)} className={`h-9 w-9 rounded-md transition-colors ${post.is_saved_by_me ? 'text-blue-400' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}`}>
                        <Bookmark className={`h-4 w-4 ${post.is_saved_by_me ? 'fill-current' : ''}`} />
                      </Button>
                    </div>

                    {/* Comments Section */}
                    {showComments && (
                      <div className="bg-zinc-950/50 border-t border-zinc-800/50 p-5 space-y-4">
                        
                        {/* New Comment */}
                        <div className="flex gap-3 items-start">
                          <Avatar className="h-8 w-8" />
                          <div className="flex-1 flex gap-2">
                            <input 
                              type="text" 
                              placeholder="Write a comment..." 
                              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50"
                              value={newComments[post.id] || ""}
                              onChange={e => setNewComments(prev => ({ ...prev, [post.id]: e.target.value }))}
                              onKeyDown={e => e.key === 'Enter' && handlePostComment(post.id)}
                            />
                            <Button size="icon" onClick={() => handlePostComment(post.id)} className="h-9 w-9 rounded-full bg-blue-600 hover:bg-blue-500"><Send className="h-4 w-4" /></Button>
                          </div>
                        </div>

                        {loadingComments[post.id] ? (
                          <div className="text-center py-4 text-xs text-zinc-500">Loading comments...</div>
                        ) : (
                          <div className="space-y-4 mt-4">
                            {parentComments.map(comment => {
                              const replies = commentsData.filter(c => c.parent_id === comment.id);
                              return (
                                <div key={comment.id} className="flex gap-3">
                                  <Avatar className="h-8 w-8 mt-1" alt={comment.author?.name} />
                                  <div className="flex-1">
                                    <div className="bg-zinc-900 border border-zinc-800/50 rounded-2xl px-4 py-3">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-sm text-zinc-200">{comment.author?.full_name || comment.author?.name}</span>
                                        <span className="text-[10px] text-zinc-500">{mounted ? formatRelativeTime(comment.created_at) : formatDate(comment.created_at)}</span>
                                      </div>
                                      <p className="text-sm text-zinc-300">{comment.content}</p>
                                    </div>
                                    <div className="flex items-center gap-4 mt-1 ml-2">
                                      <button onClick={() => handleLikeComment(post.id, comment.id)} className={`text-xs font-medium ${comment.is_liked_by_me ? 'text-pink-500' : 'text-zinc-500 hover:text-zinc-300'}`}>
                                        Like {comment.likes_count > 0 && `(${comment.likes_count})`}
                                      </button>
                                      <button className="text-xs font-medium text-zinc-500 hover:text-zinc-300">Reply</button>
                                    </div>

                                    {/* Replies */}
                                    {replies.length > 0 && (
                                      <div className="mt-3 space-y-3">
                                        {replies.map(reply => (
                                          <div key={reply.id} className="flex gap-2">
                                            <Avatar className="h-6 w-6 mt-1" />
                                            <div>
                                              <div className="bg-zinc-900/50 border border-zinc-800/30 rounded-2xl px-3 py-2">
                                                <span className="font-semibold text-xs text-zinc-300 mr-2">{reply.author?.full_name || reply.author?.name}</span>
                                                <span className="text-[13px] text-zinc-400">{reply.content}</span>
                                              </div>
                                              <div className="flex items-center gap-3 mt-1 ml-2">
                                                <button onClick={() => handleLikeComment(post.id, reply.id)} className={`text-[11px] font-medium ${reply.is_liked_by_me ? 'text-pink-500' : 'text-zinc-500 hover:text-zinc-300'}`}>
                                                  Like {reply.likes_count > 0 && `(${reply.likes_count})`}
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
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
