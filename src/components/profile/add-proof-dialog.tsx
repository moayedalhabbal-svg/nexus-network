"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Zap, GitBranch, FileText } from "lucide-react";
import { addProofOfWorkAction, extractSkillsFromEvidenceAction } from "@/app/actions/evidence";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { GithubConnection } from "./github-connection";

export function AddProofDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [activeTab, setActiveTab] = useState<"github" | "manual">("github");
  
  const [type, setType] = useState("portfolio");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  
  const handleExtract = async () => {
    if (!title || !description) return;
    setExtracting(true);
    const result = await extractSkillsFromEvidenceAction(title, description, url);
    if (result.success && result.skills) {
      setSkills(Array.from(new Set([...skills, ...result.skills])));
    }
    setExtracting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData();
    formData.append("type", type);
    formData.append("title", title);
    formData.append("url", url);
    formData.append("description", description);
    formData.append("skills", JSON.stringify(skills));
    
    const res = await addProofOfWorkAction(formData);
    setLoading(false);
    
    if (res.success) {
      setOpen(false);
      window.location.reload(); // simple refresh to show updated mock profile
    } else {
      alert(res.error);
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" className="gap-2" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Add Evidence
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-lg rounded-xl shadow-2xl border flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-semibold">Add Proof of Work</h2>
                <p className="text-sm text-muted-foreground mt-1">Connect evidence to back your skills.</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>&times;</Button>
            </div>
            
            <div className="flex border-b">
              <button 
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors \${activeTab === 'github' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                onClick={() => setActiveTab("github")}
              >
                <GitBranch className="h-4 w-4" /> Connect GitHub
              </button>
              <button 
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors \${activeTab === 'manual' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                onClick={() => setActiveTab("manual")}
              >
                <FileText className="h-4 w-4" /> Add Manually
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {activeTab === "github" ? (
                <GithubConnection onComplete={() => { setOpen(false); window.location.reload(); }} />
              ) : (
                <form id="pow-form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Evidence Type</label>
                    <select 
                      className="w-full h-10 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      value={type} 
                      onChange={e => setType(e.target.value)}
                    >
                      <option value="portfolio">Portfolio Project</option>
                      <option value="paper">Research Publication</option>
                      <option value="website">Live Website</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Autonomous Navigation System" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">URL</label>
                    <Input required type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea 
                      required 
                      className="w-full h-24 p-3 rounded-md border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                      value={description} 
                      onChange={e => setDescription(e.target.value)} 
                      placeholder="Briefly describe what this is and your role..." 
                    />
                  </div>

                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Skills Demonstrated</label>
                      <Button type="button" variant="secondary" size="sm" onClick={handleExtract} disabled={extracting || !title || !description}>
                        {extracting ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Zap className="h-3 w-3 mr-1 text-yellow-500" />}
                        Auto-Extract
                      </Button>
                    </div>
                    {skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {skills.map(s => (
                          <Badge key={s} variant="secondary" className="gap-1 bg-primary/5">
                            {s}
                            <button type="button" onClick={() => setSkills(skills.filter(xs => xs !== s))} className="text-muted-foreground hover:text-foreground">
                              &times;
                            </button>
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground pt-1">No skills added yet. Auto-extract from description.</p>
                    )}
                  </div>
                </form>
              )}
            </div>
            
            <div className="p-6 border-t bg-muted/30 shrink-0 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Close</Button>
              {activeTab === "manual" && (
                <Button type="submit" form="pow-form" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Evidence
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
