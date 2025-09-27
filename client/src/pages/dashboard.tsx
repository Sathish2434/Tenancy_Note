import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api, ApiError } from "@/lib/api";
import { clearAuth, getUser, getTenant } from "@/lib/auth";
import { Note, Tenant } from "@/types";
import NoteEditor from "@/components/note-editor";
import SubscriptionLimitModal from "@/components/subscription-limit-modal";
import InviteUserModal from "@/components/invite-user-modal";
import { Trash2, Edit3, Plus, Search, LogOut, Settings, Zap } from "lucide-react";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const user = getUser();
  const tenant = getTenant();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user || !tenant) {
      setLocation("/");
    }
  }, [user, tenant, setLocation]);

  // Fetch notes
  const { data: notes = [], isLoading: notesLoading } = useQuery<Note[]>({
    queryKey: ["/api/notes"],
    enabled: !!user,
  });

  // Fetch current user/tenant data
  const { data: currentData } = useQuery<{ user: any; tenant: Tenant }>({
    queryKey: ["/api/auth/me"],
    enabled: !!user,
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: (id: string) => api.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({ title: "Note deleted successfully" });
    },
    onError: (error: ApiError) => {
      toast({
        title: "Failed to delete note",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Upgrade tenant mutation
  const upgradeMutation = useMutation({
    mutationFn: () => api.upgradeTenant(tenant?.slug || ""),
    onSuccess: () => {
      // Invalidate both auth and notes queries to prevent stale cache and 401 errors
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({ title: "Successfully upgraded to Pro plan!" });
    },
    onError: (error: ApiError) => {
      toast({
        title: "Failed to upgrade",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    clearAuth();
    setLocation("/");
    toast({ title: "Logged out successfully" });
  };

  const handleCreateNote = () => {
    setEditingNote(null);
    setIsNoteEditorOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsNoteEditorOpen(true);
  };

  const handleDeleteNote = (id: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      deleteNoteMutation.mutate(id);
    }
  };

  const handleNoteError = (error: ApiError) => {
    if (error.code === "LIMIT_REACHED") {
      setIsLimitModalOpen(true);
    }
  };

  const filteredNotes = notes.filter((note: Note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentTenant = currentData?.tenant || tenant;
  const noteCount = notes.length;
  const isFreePlan = currentTenant?.plan === "free";

  if (!user || !tenant) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </div>
                <h1 className="text-xl font-semibold">NotesApp</h1>
              </div>
              
              <div className="flex items-center space-x-2 ml-8">
                <span className="text-sm text-muted-foreground">Tenant:</span>
                <Badge variant="secondary" data-testid="text-tenant-name">
                  {currentTenant?.name}
                </Badge>
                <Badge 
                  variant={isFreePlan ? "outline" : "default"} 
                  className={isFreePlan ? "animate-pulse" : ""}
                  data-testid="text-tenant-plan"
                >
                  {currentTenant?.plan.toUpperCase()}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium" data-testid="text-user-email">{user.email}</div>
                    <div className="text-muted-foreground" data-testid="text-user-role">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Notes</p>
                  <p className="text-3xl font-bold text-foreground" data-testid="text-note-count">{noteCount}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Plan Status</p>
                  <p className="text-lg font-semibold text-primary" data-testid="text-plan-status">
                    {currentTenant?.plan ? currentTenant.plan.charAt(0).toUpperCase() + currentTenant.plan.slice(1) : "Unknown"} Plan
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isFreePlan ? `${noteCount}/3 notes used` : "Unlimited notes"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <Button 
                className="w-full h-full flex flex-col items-center justify-center space-y-2" 
                onClick={handleCreateNote}
                data-testid="button-create-note"
              >
                <div className="w-12 h-12 bg-primary-foreground rounded-lg flex items-center justify-center">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Create New Note</p>
                  <p className="text-sm opacity-75">Start writing</p>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Admin Controls */}
        {user.role === "admin" && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Settings className="w-5 h-5 text-primary" />
                <span>Admin Controls</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => setIsInviteModalOpen(true)}
                  data-testid="button-invite-user"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Invite User
                </Button>
                {isFreePlan && (
                  <Button
                    onClick={() => upgradeMutation.mutate()}
                    disabled={upgradeMutation.isPending}
                    data-testid="button-upgrade-subscription"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {upgradeMutation.isPending ? "Upgrading..." : "Upgrade to Pro"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes Section */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Your Notes</h2>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <Input
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>
                <Button onClick={handleCreateNote} data-testid="button-new-note">
                  <Plus className="w-4 h-4 mr-2" />
                  New Note
                </Button>
              </div>
            </div>
            
            {notesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-accent/50 rounded-lg border border-border p-4 animate-pulse">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded mb-4"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : filteredNotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNotes.map((note: Note) => (
                  <Card 
                    key={note.id} 
                    className="note-card bg-accent/50 cursor-pointer transition-all hover:shadow-md hover:-translate-y-1"
                    data-testid={`card-note-${note.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-foreground line-clamp-2" data-testid={`text-note-title-${note.id}`}>
                          {note.title}
                        </h3>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditNote(note);
                            }}
                            data-testid={`button-edit-note-${note.id}`}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNote(note.id);
                            }}
                            className="text-destructive hover:text-destructive"
                            data-testid={`button-delete-note-${note.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-3" data-testid={`text-note-content-${note.id}`}>
                        {note.content}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span data-testid={`text-note-date-${note.id}`}>
                          {new Date(note.updatedAt).toLocaleDateString()}
                        </span>
                        <span data-testid={`text-note-words-${note.id}`}>
                          {note.content.split(/\s+/).length} words
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No notes yet</h3>
                <p className="text-muted-foreground mb-6">Create your first note to get started</p>
                <Button onClick={handleCreateNote} data-testid="button-create-first-note">
                  Create Your First Note
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <NoteEditor
        isOpen={isNoteEditorOpen}
        onClose={() => setIsNoteEditorOpen(false)}
        note={editingNote}
        onError={handleNoteError}
      />
      
      <SubscriptionLimitModal
        isOpen={isLimitModalOpen}
        onClose={() => setIsLimitModalOpen(false)}
        onUpgrade={() => {
          setIsLimitModalOpen(false);
          if (user.role === "admin") {
            upgradeMutation.mutate();
          }
        }}
        canUpgrade={user.role === "admin"}
      />
      
      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
}
