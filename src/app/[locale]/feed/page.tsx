"use client";
/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SEED_USERS, SEED_PROJECTS } from "@/lib/seed-data";
import { Heart, MessageSquare, Share2, Sparkles, Image as ImageIcon, Link as LinkIcon, Send } from "lucide-react";
import Link from "next/link";
import { formatDate, formatRelativeTime } from "@/lib/utils";

// Mock Feed Data
const MOCK_POSTS = [
  {
    id: "post-1",
    authorId: "user-1", // Elena Vasquez
    content: "Just published our latest findings on autonomous robotic inspection for solar farms! We reduced maintenance overhead by 40% in our latest trials. Looking for hardware engineers interested in scaling this. 🚀🌿 #ClimateTech #Robotics",
    timestamp: "2024-03-10T14:30:00Z",
    likes: 124,
    comments: 18,
    projectRef: "proj-1",
  },
  {
    id: "post-2",
    authorId: "user-2", // Marcus Chen
    content: "Building in public: We just integrated the new semantic search engine into the platform. The ability to find co-founders based on intent rather than just keywords is a game changer.",
    timestamp: "2024-03-09T09:15:00Z",
    likes: 89,
    comments: 5,
  },
  {
    id: "post-3",
    authorId: "user-6", // Sarah Jenkins
    content: "Excited to announce that I'm opening up 3 slots for mentorship this quarter! If you're an early-stage founder struggling with go-to-market strategy or B2B sales, apply through my profile. Happy to help the next generation of builders.",
    timestamp: "2024-03-01T16:45:00Z",
    likes: 342,
    comments: 45,
  }
];

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [newPost, setNewPost] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePost = () => {
    if (!newPost.trim() || !user) return;
    const post = {
      id: `post-${Date.now()}`,
      authorId: user.id,
      content: newPost,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
    };
    setPosts([post, ...posts]);
    setNewPost("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 flex gap-8 justify-center">
        
        {/* Left Sidebar (Profile summary) */}
        <div className="hidden lg:block w-72 space-y-6">
          {user ? (
            <Card className="overflow-hidden">
              <div className="h-16 bg-gradient-to-r from-primary/20 to-primary/5" />
              <CardContent className="p-4 pt-0 relative">
                <Avatar size="lg" alt={user.name} className="h-16 w-16 border-4 border-card absolute -top-8 left-4" />
                <div className="mt-10">
                  <h3 className="font-bold text-lg">{user.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{user.headline}</p>
                </div>
                <div className="mt-6 pt-4 border-t space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Profile views</span>
                    <span className="font-semibold text-primary">142</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Network</span>
                    <span className="font-semibold text-primary">89</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="font-bold mb-2">Join the conversation</h3>
                <p className="text-sm text-muted-foreground mb-4">Sign in to post and interact with the network.</p>
                <Link href="/login">
                  <Button className="w-full">Sign In</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Trending Topics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {["#AIStartups", "#ClimateTech", "#FounderMatching", "#OpenSource", "#Robotics"].map((tag, i) => (
                <div key={tag} className="flex justify-between items-center text-sm">
                  <span className="font-medium hover:text-primary cursor-pointer transition-colors">{tag}</span>
                  <span className="text-xs text-muted-foreground">{1200 - i * 150} posts</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Feed */}
        <div className="flex-1 max-w-2xl space-y-6">
          
          {/* Create Post */}
          {user && (
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex gap-4 mb-4">
                  <Avatar alt={user.name} />
                  <textarea 
                    value={newPost}
                    onChange={e => setNewPost(e.target.value)}
                    placeholder="Share an update, project milestone, or ask for feedback..."
                    className="flex-1 resize-none bg-transparent outline-none pt-2 text-sm placeholder:text-muted-foreground"
                    rows={3}
                  />
                </div>
                <div className="flex justify-between items-center pt-3 border-t">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><ImageIcon className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><LinkIcon className="h-4 w-4" /></Button>
                  </div>
                  <Button onClick={handlePost} disabled={!newPost.trim()} className="h-8 px-4 rounded-full gap-2">
                    <Send className="h-3 w-3" /> Post
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sort / Filter */}
          <div className="flex items-center gap-2 pb-2 border-b">
            <span className="text-sm text-muted-foreground font-medium">Sort by:</span>
            <select className="bg-transparent text-sm font-semibold focus:outline-none cursor-pointer">
              <option>Top Matches</option>
              <option>Recent</option>
              <option>My Network</option>
            </select>
          </div>

          {/* Posts */}
          <div className="space-y-6">
            {posts.map(post => {
              const author = SEED_USERS.find(u => u.id === post.authorId);
              const project = post.projectRef ? SEED_PROJECTS.find(p => p.id === post.projectRef) : null;
              if (!author) return null;

              return (
                <Card key={post.id} className="hover:border-primary/20 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-3">
                        <Avatar alt={author.name} />
                        <div>
                          <Link href={`/profile/${author.id}`} className="font-bold text-[15px] hover:text-primary transition-colors">
                            {author.name}
                          </Link>
                          <p className="text-xs text-muted-foreground line-clamp-1">{author.headline}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {mounted ? formatRelativeTime(post.timestamp) : formatDate(post.timestamp)}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2">...</Button>
                    </div>

                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                      {post.content.split(' ').map((word, i) => 
                        word.startsWith('#') 
                          ? <span key={i} className="text-primary font-medium hover:underline cursor-pointer">{word} </span>
                          : `${word} `
                      )}
                    </div>

                    {project && (
                      <Link href={`/projects/${project.id}`}>
                        <div className="mt-4 p-4 rounded-xl border bg-muted/30 hover:bg-muted/50 transition-colors group cursor-pointer">
                          <div className="flex items-center justify-between mb-2">
                            <Badge className="bg-background text-xs">{project.category.replace('_', ' ')}</Badge>
                            <span className="text-primary text-xs font-medium group-hover:underline flex items-center gap-1">
                              View Project <Sparkles className="h-3 w-3" />
                            </span>
                          </div>
                          <h4 className="font-bold text-base">{project.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{project.pitch}</p>
                        </div>
                      </Link>
                    )}
                  </CardContent>

                  <CardFooter className="px-5 py-3 border-t bg-muted/10 flex gap-6">
                    <button className="flex items-center gap-2 text-muted-foreground hover:text-pink-500 transition-colors text-sm font-medium">
                      <Heart className="h-4 w-4" /> {post.likes}
                    </button>
                    <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                      <MessageSquare className="h-4 w-4" /> {post.comments}
                    </button>
                    <button className="flex items-center gap-2 text-muted-foreground hover:text-green-500 transition-colors text-sm font-medium ml-auto">
                      <Share2 className="h-4 w-4" /> Share
                    </button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar (Suggestions) */}
        <div className="hidden xl:block w-80 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> People to follow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {SEED_USERS.slice(3, 6).map(person => (
                <div key={person.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar size="sm" alt={person.name} />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{person.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{person.headline}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="h-7 px-3 text-xs rounded-full">Follow</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

      </main>
    </div>
  );
}
