/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, GitBranch, CheckCircle2, RefreshCw, Unplug, PlusCircle } from "lucide-react";
import { 
  checkGithubConnectionAction, 
  connectGithubMockAction, 
  disconnectGithubAction, 
  fetchGithubRepositoriesAction,
  addGithubEvidenceAction 
} from "@/app/actions/github";
import { Badge } from "@/components/ui/badge";

export function GithubConnection({ onComplete }: { onComplete: () => void }) {
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState("");
  const [inputUsername, setInputUsername] = useState("");
  const [isOAuthConfigured, setIsOAuthConfigured] = useState(false);
  const [isVerifiedConnection, setIsVerifiedConnection] = useState(false);
  
  const [repos, setRepos] = useState<any[]>([]);
  const [fetchingRepos, setFetchingRepos] = useState(false);
  const [selectedRepos, setSelectedRepos] = useState<Set<string>>(new Set());
  const [addingEvidence, setAddingEvidence] = useState(false);
  
  useEffect(() => {
    async function checkConnection() {
      const res = await checkGithubConnectionAction();
      setIsOAuthConfigured(res.isOAuthConfigured || false);
      if (res.connected) {
        setConnected(true);
        setUsername(res.username || "");
        setIsVerifiedConnection(res.isVerifiedConnection || false);
        loadRepos();
      }
      setLoading(false);
    }
    checkConnection();
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await connectGithubMockAction(inputUsername || 'oauth-trigger');
    
    if (res.redirectUrl) {
      window.location.href = res.redirectUrl;
      return;
    }

    if (res.success) {
      setConnected(true);
      setUsername(res.username || "");
      setIsVerifiedConnection(false); // mock action always means unverified fallback
      loadRepos();
    } else {
      alert("Failed to connect GitHub: " + res.error);
    }
    setLoading(false);
  };

  const handleDisconnect = async () => {
    if (!confirm("Disconnect GitHub? Your previously added evidence will remain on your profile, but it will not be synced automatically.")) return;
    setLoading(true);
    const res = await disconnectGithubAction();
    if (res.success) {
      setConnected(false);
      setUsername("");
      setRepos([]);
      setSelectedRepos(new Set());
    }
    setLoading(false);
  };

  async function loadRepos() {
    setFetchingRepos(true);
    const res = await fetchGithubRepositoriesAction();
    if (res.success && res.repositories) {
      setRepos(res.repositories);
    }
    setFetchingRepos(false);
  };

  const toggleRepo = (id: string) => {
    const newSelected = new Set(selectedRepos);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRepos(newSelected);
  };
  
  const toggleAll = () => {
    if (selectedRepos.size === repos.length) {
      setSelectedRepos(new Set());
    } else {
      setSelectedRepos(new Set(repos.map(r => r.id)));
    }
  };

  const handleAddSelected = async () => {
    if (selectedRepos.size === 0) return;
    setAddingEvidence(true);
    
    const reposToAdd = repos.filter(r => selectedRepos.has(r.id));
    const res = await addGithubEvidenceAction(reposToAdd);
    
    setAddingEvidence(false);
    if (res.success) {
      onComplete();
    } else {
      alert("Error adding evidence: " + res.error);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>;

  if (!connected) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border">
          <GitBranch className="h-8 w-8" />
          <div>
            <h3 className="font-semibold">Connect GitHub</h3>
            <p className="text-sm text-muted-foreground">Import repositories as verified Proof of Work evidence.</p>
          </div>
        </div>
        
        <form onSubmit={handleConnect} className="space-y-3 pt-4 border-t">
          {isOAuthConfigured ? (
            <div className="space-y-2">
              <p className="text-sm text-zinc-400">Securely connect your GitHub account using OAuth to verify ownership.</p>
              <Button type="submit" className="w-full sm:w-auto">Connect with GitHub OAuth</Button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-amber-500/90 bg-amber-500/10 p-2 rounded">
                OAuth is not configured in this environment. This is an unverified fallback. Enter a GitHub username to simulate connection.
              </p>
              <div className="flex gap-2">
                <Input required value={inputUsername} onChange={e => setInputUsername(e.target.value)} placeholder="GitHub username" />
                <Button type="submit">Lookup</Button>
              </div>
            </div>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`flex items-center justify-between p-4 rounded-lg border ${isVerifiedConnection ? 'bg-green-500/10 border-green-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
        <div className="flex items-center gap-3">
          <GitBranch className={`h-6 w-6 ${isVerifiedConnection ? 'text-green-500' : 'text-amber-500'}`} />
          <div>
            <h3 className={`font-semibold flex items-center gap-2 ${isVerifiedConnection ? 'text-green-500' : 'text-amber-500'}`}>
              GitHub connected <CheckCircle2 className="h-4 w-4" />
            </h3>
            <p className="text-xs text-muted-foreground">@{username} {isVerifiedConnection ? '(Verified)' : '(Unverified Fallback)'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadRepos} disabled={fetchingRepos} title="Refresh Evidence">
            <RefreshCw className={`h-4 w-4 \${fetchingRepos ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDisconnect} className="text-destructive" title="Disconnect">
            <Unplug className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {fetchingRepos ? (
        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
      ) : repos.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">YOUR GITHUB PROJECTS</h4>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <button type="button" onClick={toggleAll} className="hover:text-primary">
                {selectedRepos.size === repos.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>
          </div>
          
          <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
            {repos.map(repo => (
              <div 
                key={repo.id} 
                onClick={() => toggleRepo(repo.id)}
                className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors \${selectedRepos.has(repo.id) ? 'border-primary bg-primary/5' : 'hover:border-primary/50 bg-background'}`}
              >
                <input 
                  type="checkbox" 
                  checked={selectedRepos.has(repo.id)}
                  onChange={() => toggleRepo(repo.id)}
                  className="mt-1 accent-primary" 
                />
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-sm truncate pr-2">{repo.name}</h5>
                    {repo.isFork && <Badge variant="secondary" className="text-[10px]">Fork</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{repo.description}</p>
                  <div className="flex gap-2 mt-2 text-[10px] text-muted-foreground">
                    {repo.language && <span>{repo.language}</span>}
                    {repo.stars > 0 && <span>⭐ {repo.stars}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-4 border-t flex justify-end">
            <Button onClick={handleAddSelected} disabled={selectedRepos.size === 0 || addingEvidence}>
              {addingEvidence ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PlusCircle className="h-4 w-4 mr-2" />}
              Add {selectedRepos.size} to Proof of Work
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-center text-muted-foreground py-8">No public repositories found.</p>
      )}
    </div>
  );
}
