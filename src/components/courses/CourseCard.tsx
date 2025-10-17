import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, User } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  profiles?: { full_name: string };
}

interface CourseCardProps {
  course: Course;
  onEnroll: () => void;
}

const CourseCard = ({ course, onEnroll }: CourseCardProps) => {
  return (
    <Card className="hover:shadow-elevated transition-all duration-300 border-border/50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <Badge variant="secondary">{course.duration}</Badge>
          </div>
        </div>
        <CardTitle className="line-clamp-1">{course.title}</CardTitle>
        <CardDescription className="line-clamp-2">{course.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="w-4 h-4" />
          <span>{course.profiles?.full_name || "Unknown Teacher"}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onEnroll} className="w-full">
          Enroll Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
