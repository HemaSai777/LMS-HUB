import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, BookOpen, FileText, LogOut, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import CourseCard from "@/components/courses/CourseCard";
import EnrolledCourseCard from "@/components/courses/EnrolledCourseCard";
import AssignmentCard from "@/components/assignments/AssignmentCard";

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  teacher_id: string;
  profiles?: { full_name: string };
}

interface Enrollment {
  id: string;
  course_id: string;
  courses: Course;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  course_id: string;
  courses?: { title: string };
}

const StudentDashboard = ({ userId }: { userId: string }) => {
  const navigate = useNavigate();
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Enrollment[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetchUserProfile();
    fetchAllCourses();
    fetchEnrolledCourses();
    fetchAssignments();

    // Set up realtime for courses
    const coursesChannel = supabase
      .channel("courses-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "courses" }, () => {
        fetchAllCourses();
        fetchEnrolledCourses();
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

  const fetchAllCourses = async () => {
    const { data } = await supabase
      .from("courses")
      .select("*, profiles(full_name)")
      .order("created_at", { ascending: false });
    if (data) setAllCourses(data);
  };

  const fetchEnrolledCourses = async () => {
    const { data } = await supabase
      .from("enrollments")
      .select("*, courses(*, profiles(full_name))")
      .eq("student_id", userId);
    if (data) setEnrolledCourses(data as any);
  };

  const fetchAssignments = async () => {
    const { data } = await supabase
      .from("assignments")
      .select("*, courses(title)")
      .order("due_date", { ascending: true });
    if (data) setAssignments(data as any);
  };

  const handleEnroll = async (courseId: string) => {
    const { error } = await supabase.from("enrollments").insert({ course_id: courseId, student_id: userId });

    if (error) {
      toast.error("Failed to enroll in course");
    } else {
      toast.success("Successfully enrolled in course!");
      fetchEnrolledCourses();
    }
  };

  const handleUnenroll = async (enrollmentId: string) => {
    const { error } = await supabase.from("enrollments").delete().eq("id", enrollmentId);

    if (error) {
      toast.error("Failed to unenroll from course");
    } else {
      toast.success("Successfully unenrolled from course");
      fetchEnrolledCourses();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const enrolledCourseIds = enrolledCourses.map((e) => e.course_id);
  const availableCourses = allCourses.filter((course) => !enrolledCourseIds.includes(course.id));

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
            <Badge variant="secondary" className="px-3 py-1">
              Student
            </Badge>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="browse" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Browse Courses
            </TabsTrigger>
            <TabsTrigger value="enrolled" className="gap-2">
              <GraduationCap className="w-4 h-4" />
              My Courses
            </TabsTrigger>
            <TabsTrigger value="assignments" className="gap-2">
              <FileText className="w-4 h-4" />
              Assignments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Available Courses</CardTitle>
                <CardDescription>Browse and enroll in courses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableCourses.map((course) => (
                    <CourseCard key={course.id} course={course} onEnroll={() => handleEnroll(course.id)} />
                  ))}
                  {availableCourses.length === 0 && (
                    <p className="text-muted-foreground col-span-full text-center py-8">
                      No courses available at the moment.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="enrolled" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Enrolled Courses</CardTitle>
                <CardDescription>Courses you are currently enrolled in</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {enrolledCourses.map((enrollment) => (
                    <EnrolledCourseCard
                      key={enrollment.id}
                      enrollment={enrollment}
                      onUnenroll={() => handleUnenroll(enrollment.id)}
                    />
                  ))}
                  {enrolledCourses.length === 0 && (
                    <p className="text-muted-foreground col-span-full text-center py-8">
                      You haven't enrolled in any courses yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Assignments</CardTitle>
                <CardDescription>View and submit your assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assignments.map((assignment) => (
                    <AssignmentCard key={assignment.id} assignment={assignment} userId={userId} />
                  ))}
                  {assignments.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">No assignments available yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default StudentDashboard;
