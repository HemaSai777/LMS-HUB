import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, FileText, Calendar } from "lucide-react";
import { format } from "date-fns";
import GradeSubmissionDialog from "./GradeSubmissionDialog";

interface Submission {
  id: string;
  content: string;
  submitted_at: string;
  assignments?: { title: string; courses?: { title: string } };
  profiles?: { full_name: string };
  grades?: { grade: number; feedback: string }[];
}

interface SubmissionCardProps {
  submission: Submission;
  onUpdate: () => void;
}

const SubmissionCard = ({ submission, onUpdate }: SubmissionCardProps) => {
  const [showGrade, setShowGrade] = useState(false);
  const isGraded = submission.grades && submission.grades.length > 0;

  return (
    <>
      <Card className="hover:shadow-card transition-all duration-200">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">{submission.assignments?.courses?.title}</span>
              </div>
              <CardTitle className="text-lg">{submission.assignments?.title}</CardTitle>
            </div>
            {isGraded && (
              <Badge className="ml-2">
                Grade: {submission.grades[0].grade}%
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>{submission.profiles?.full_name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Submitted: {format(new Date(submission.submitted_at), "MMM dd, yyyy")}</span>
            </div>
            <p className="text-sm line-clamp-3 p-3 bg-muted/50 rounded-md">{submission.content}</p>
            <Button 
              size="sm" 
              onClick={() => setShowGrade(true)}
              variant={isGraded ? "outline" : "default"}
            >
              {isGraded ? "Update Grade" : "Grade Submission"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <GradeSubmissionDialog
        open={showGrade}
        onOpenChange={setShowGrade}
        submission={submission}
        onSuccess={() => {
          onUpdate();
          setShowGrade(false);
        }}
      />
    </>
  );
};

export default SubmissionCard;
