import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api, ApiError } from "@/lib/api";
import { Note } from "@/types";
import { Save, X } from "lucide-react";

interface NoteEditorProps {
  isOpen: boolean;
  onClose: () => void;
  note?: Note | null;
  onError?: (error: ApiError) => void;
}

export default function NoteEditor({ isOpen, onClose, note, onError }: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    } else {
      setTitle("");
      setContent("");
    }
  }, [note]);

  const createNoteMutation = useMutation({
    mutationFn: (data: { title: string; content: string }) => api.createNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({ title: "Note created successfully" });
      onClose();
    },
    onError: (error: ApiError) => {
      if (onError) {
        onError(error);
      } else {
        toast({
          title: "Failed to create note",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title?: string; content?: string } }) =>
      api.updateNote(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({ title: "Note updated successfully" });
      onClose();
    },
    onError: (error: ApiError) => {
      toast({
        title: "Failed to update note",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (note) {
      updateNoteMutation.mutate({
        id: note.id,
        data: { title: title.trim(), content: content.trim() },
      });
    } else {
      createNoteMutation.mutate({
        title: title.trim(),
        content: content.trim(),
      });
    }
  };

  const isLoading = createNoteMutation.isPending || updateNoteMutation.isPending;
  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle data-testid="text-modal-title">
              {note ? "Edit Note" : "Create New Note"}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                disabled={isLoading}
                data-testid="button-save-note"
              >
                <Save className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                data-testid="button-close-modal"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          <Input
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-semibold border-none shadow-none focus-visible:ring-0 px-0"
            data-testid="input-note-title"
          />
          
          <Textarea
            placeholder="Start writing your note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[400px] border-none shadow-none focus-visible:ring-0 resize-none px-0"
            data-testid="textarea-note-content"
          />
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-border bg-muted/30 -mx-6 -mb-6 px-6 py-4">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span data-testid="text-word-count">Words: {wordCount}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              data-testid="button-save"
            >
              {isLoading ? "Saving..." : "Save Note"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
