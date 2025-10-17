-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('student', 'teacher');

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create courses table
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration TEXT NOT NULL,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on courses
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Courses policies
CREATE POLICY "Anyone can view courses"
  ON courses FOR SELECT
  USING (true);

CREATE POLICY "Teachers can create courses"
  ON courses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

CREATE POLICY "Teachers can update their own courses"
  ON courses FOR UPDATE
  USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete their own courses"
  ON courses FOR DELETE
  USING (teacher_id = auth.uid());

-- Create enrollments table
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, student_id)
);

-- Enable RLS on enrollments
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Enrollments policies
CREATE POLICY "Students can view their own enrollments"
  ON enrollments FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Teachers can view enrollments for their courses"
  ON enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = enrollments.course_id
      AND courses.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can enroll in courses"
  ON enrollments FOR INSERT
  WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'student'
    )
  );

CREATE POLICY "Students can unenroll from courses"
  ON enrollments FOR DELETE
  USING (student_id = auth.uid());

-- Create assignments table
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on assignments
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Assignments policies
CREATE POLICY "Students can view assignments for enrolled courses"
  ON assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = assignments.course_id
      AND enrollments.student_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view assignments for their courses"
  ON assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = assignments.course_id
      AND courses.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can create assignments for their courses"
  ON assignments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_id
      AND courses.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update assignments for their courses"
  ON assignments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = assignments.course_id
      AND courses.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can delete assignments for their courses"
  ON assignments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = assignments.course_id
      AND courses.teacher_id = auth.uid()
    )
  );

-- Create submissions table
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  file_url TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assignment_id, student_id)
);

-- Enable RLS on submissions
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Submissions policies
CREATE POLICY "Students can view their own submissions"
  ON submissions FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Teachers can view submissions for their course assignments"
  ON submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assignments
      JOIN courses ON courses.id = assignments.course_id
      WHERE assignments.id = submissions.assignment_id
      AND courses.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can create submissions for enrolled courses"
  ON submissions FOR INSERT
  WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM assignments
      JOIN enrollments ON enrollments.course_id = assignments.course_id
      WHERE assignments.id = assignment_id
      AND enrollments.student_id = auth.uid()
    )
  );

CREATE POLICY "Students can update their own submissions"
  ON submissions FOR UPDATE
  USING (student_id = auth.uid());

-- Create grades table
CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE UNIQUE,
  grade INTEGER NOT NULL CHECK (grade >= 0 AND grade <= 100),
  feedback TEXT,
  graded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on grades
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- Grades policies
CREATE POLICY "Students can view their own grades"
  ON grades FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM submissions
      WHERE submissions.id = grades.submission_id
      AND submissions.student_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view grades for their course assignments"
  ON grades FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM submissions
      JOIN assignments ON assignments.id = submissions.assignment_id
      JOIN courses ON courses.id = assignments.course_id
      WHERE submissions.id = grades.submission_id
      AND courses.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can create grades for their course assignments"
  ON grades FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM submissions
      JOIN assignments ON assignments.id = submissions.assignment_id
      JOIN courses ON courses.id = assignments.course_id
      WHERE submissions.id = submission_id
      AND courses.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update grades for their course assignments"
  ON grades FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM submissions
      JOIN assignments ON assignments.id = submissions.assignment_id
      JOIN courses ON courses.id = assignments.course_id
      WHERE submissions.id = grades.submission_id
      AND courses.teacher_id = auth.uid()
    )
  );

-- Create trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'student')
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();