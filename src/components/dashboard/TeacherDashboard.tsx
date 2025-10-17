import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, BookOpen, FileText, LogOut, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CreateCourseDialog from "@/components/courses/CreateCourseDialog";
import CreateAssignmentDialog from "@/components/assignments/CreateAssignmentDialog";
import TeacherCourseCard from "@/components/courses/TeacherCourseCard";
import SubmissionCard from "@/components/submissions/SubmissionCard";

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  teacher_id: string;
}

interface Submission {
  id: string;
  content: string;
  file_url: string | null;
  submitted_at: string;
  assignment_id: string;
  student_id: string;
  assignments?: { title: string; courses?: { title: string } };
  profiles?: { full_name: string };
  grades?: { grade: number; feedback: string }[];
}

const TeacherDashboard = ({ userId }: { userId: string }) => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [userName, setUserName] = useState("");
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    fetchCourses();
    fetchSubmissions();

    // Set up realtime for courses
    const coursesChannel = supabase
      .channel("teacher-courses-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "courses" }, () => {
        fetchCourses();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(coursesChannel);
    };
  }, [userId]);

  const fetchUserProfile = async () => {
    const { data } = await supabase.from("profiles").select("full_name").eq("id", userId).single();
    if (data) setUserName(data.full_name);
  };

  const fetchCourses = async () => {
    const { data } = await supabase
      .from("courses")
      .select("*")
      .eq("teacher_id", userId)
      .order("created_at", { ascending: false });
    if (data) setCourses(data);
  };

  const fetchSubmissions = async () => {
    const { data } = await supabase
      .from("submissions")
      .select("*, assignments(title, courses(title)), profiles(full_name), grades(grade, feedback)")
      .order("submitted_at", { ascending: false });
    if (data) setSubmissions(data as any);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">EduLearn</h1>
              <p className="text-sm text-muted-foreground">Welcome, {userName}!</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="px-3 py-1">Teacher</Badge>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
            <TabsTrigger value="courses" className="gap-2">
              <BookOpen className="w-4 h-4" />
              My Courses
            </TabsTrigger>
            <TabsTrigger value="submissions" className="gap-2">
              <FileText className="w-4 h-4" />
              Submissions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Courses</CardTitle>
                    <CardDescription>Manage your courses and assignments</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setShowCreateCourse(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Course
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreateAssignment(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Assignment
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map((course) => (
                    <TeacherCourseCard key={course.id} course={course} onUpdate={fetchCourses} />
                  ))}
                  {courses.length === 0 && (
                    <p className="text-muted-foreground col-span-full text-center py-8">
                      You haven't created any courses yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Student Submissions</CardTitle>
                <CardDescription>Review and grade student work</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {submissions.map((submission) => (
                    <SubmissionCard key={submission.id} submission={submission} onUpdate={fetchSubmissions} />
                  ))}
                  {submissions.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">No submissions yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <CreateCourseDialog
        open={showCreateCourse}
        onOpenChange={setShowCreateCourse}
        teacherId={userId}
        onSuccess={fetchCourses}
      />
      <CreateAssignmentDialog
        open={showCreateAssignment}
        onOpenChange={setShowCreateAssignment}
        courses={courses}
        onSuccess={() => {}}
      />
    </div>
  );
};

export default TeacherDashboard;
