import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Assignment {
  id: string;
  title: string;
}

interface SubmitAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: Assignment;
  userId: string;
  onSuccess: () => void;
}

const SubmitAssignmentDialog = ({ open, onOpenChange, assignment, userId, onSuccess }: SubmitAssignmentDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("submissions").insert({
      assignment_id: assignment.id,
      student_id: userId,
      content,
    });

    if (error) {
      toast.error("Failed to submit assignment");
    } else {
      toast.success("Assignment submitted successfully!");
      onSuccess();
      setContent("");
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Assignment</DialogTitle>
          <DialogDescription>{assignment.title}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Your Submission</Label>
            <Textarea
              id="content"
              placeholder="Enter your assignment content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={8}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Submit Assignment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitAssignmentDialog;
