import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Award, Users } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-elevated">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
            Welcome to EduLearn
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A modern Learning Management System designed for seamless education. Join as a student to explore courses or as a teacher to create and manage your own.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8">
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")} className="text-lg px-8">
              Learn More
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            <div className="p-6 rounded-xl bg-card border border-border/50 hover:shadow-card transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Rich Course Library</h3>
              <p className="text-muted-foreground text-sm">
                Access a wide variety of courses created by expert teachers
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border/50 hover:shadow-card transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 mx-auto">
                <Award className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Track Progress</h3>
              <p className="text-muted-foreground text-sm">
                Submit assignments and receive grades with detailed feedback
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border/50 hover:shadow-card transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center mb-4 mx-auto">
                <Users className="w-6 h-6 text-success" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Interactive Learning</h3>
              <p className="text-muted-foreground text-sm">
                Engage with teachers and fellow students in a collaborative environment
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
