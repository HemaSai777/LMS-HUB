import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
}

interface TeacherCourseCardProps {
  course: Course;
  onUpdate: () => void;
}

const TeacherCourseCard = ({ course, onUpdate }: TeacherCourseCardProps) => {
  const [enrollmentCount, setEnrollmentCount] = useState(0);

  useEffect(() => {
    fetchEnrollmentCount();
  }, [course.id]);

  const fetchEnrollmentCount = async () => {
    const { count } = await supabase.from("enrollments").select("*", { count: "exact", head: true }).eq("course_id", course.id);
    setEnrollmentCount(count || 0);
  };

  return (
    <Card className="hover:shadow-elevated transition-all duration-300">
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
          <Users className="w-4 h-4" />
          <span>{enrollmentCount} student{enrollmentCount !== 1 ? "s" : ""} enrolled</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeacherCourseCard;
