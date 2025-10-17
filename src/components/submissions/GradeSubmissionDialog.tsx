import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Submission {
  id: string;
  content: string;
  grades?: { grade: number; feedback: string }[];
}

interface GradeSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: Submission;
  onSuccess: () => void;
}

const GradeSubmissionDialog = ({ open, onOpenChange, submission, onSuccess }: GradeSubmissionDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (submission.grades && submission.grades.length > 0) {
      setGrade(submission.grades[0].grade.toString());
      setFeedback(submission.grades[0].feedback || "");
    }
  }, [submission]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const gradeValue = parseInt(grade);
    if (gradeValue < 0 || gradeValue > 100) {
      toast.error("Grade must be between 0 and 100");
      setLoading(false);
      return;
    }

    // Check if grade exists
    if (submission.grades && submission.grades.length > 0) {
      // Update existing grade
      const { error } = await supabase
        .from("grades")
        .update({ grade: gradeValue, feedback })
        .eq("submission_id", submission.id);

      if (error) {
        toast.error("Failed to update grade");
      } else {
        toast.success("Grade updated successfully!");
        onSuccess();
      }
    } else {
      // Create new grade
      const { error } = await supabase.from("grades").insert({
        submission_id: submission.id,
        grade: gradeValue,
        feedback,
      });

      if (error) {
        toast.error("Failed to submit grade");
      } else {
        toast.success("Grade submitted successfully!");
        onSuccess();
      }
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Grade Submission</DialogTitle>
          <DialogDescription>Provide a grade and feedback for this submission</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-3 bg-muted/50 rounded-md max-h-32 overflow-y-auto">
            <p className="text-sm">{submission.content}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="grade">Grade (0-100)</Label>
              <Input
                id="grade"
                type="number"
                min="0"
                max="100"
                placeholder="85"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback (Optional)</Label>
              <Textarea
                id="feedback"
                placeholder="Great work! Consider..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit Grade"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GradeSubmissionDialog;
