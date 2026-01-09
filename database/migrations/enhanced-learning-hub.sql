-- Enhanced Learning Hub System
-- Migration: Complete Learning Platform
-- Date: December 10, 2025

-- Enhanced learning modules with comprehensive features
ALTER TABLE learning_modules ADD COLUMN IF NOT EXISTS prerequisites JSONB DEFAULT '[]';
ALTER TABLE learning_modules ADD COLUMN IF NOT EXISTS learning_objectives JSONB DEFAULT '[]';
ALTER TABLE learning_modules ADD COLUMN IF NOT EXISTS assessment_required BOOLEAN DEFAULT FALSE;
ALTER TABLE learning_modules ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(20) DEFAULT 'beginner'; -- 'beginner', 'intermediate', 'advanced'
ALTER TABLE learning_modules ADD COLUMN IF NOT EXISTS estimated_duration INTEGER DEFAULT 60; -- minutes
ALTER TABLE learning_modules ADD COLUMN IF NOT EXISTS certificate_template TEXT;
ALTER TABLE learning_modules ADD COLUMN IF NOT EXISTS instructor_notes TEXT;
ALTER TABLE learning_modules ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'pending'; -- 'pending', 'approved', 'rejected', 'revision_required'
ALTER TABLE learning_modules ADD COLUMN IF NOT EXISTS approved_by INTEGER REFERENCES users(id);
ALTER TABLE learning_modules ADD COLUMN IF NOT EXISTS approval_date TIMESTAMP;
ALTER TABLE learning_modules ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE learning_modules ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';
ALTER TABLE learning_modules ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;
ALTER TABLE learning_modules ADD COLUMN IF NOT EXISTS enrollment_count INTEGER DEFAULT 0;
ALTER TABLE learning_modules ADD COLUMN IF NOT EXISTS completion_count INTEGER DEFAULT 0;
ALTER TABLE learning_modules ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE learning_modules ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0;

-- Course categories and subcategories
CREATE TABLE IF NOT EXISTS course_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  parent_id INTEGER REFERENCES course_categories(id),
  icon_name VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Course lessons/chapters
CREATE TABLE IF NOT EXISTS course_lessons (
  id SERIAL PRIMARY KEY,
  module_id INTEGER REFERENCES learning_modules(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  content TEXT,
  video_url TEXT,
  video_duration INTEGER, -- seconds
  lesson_order INTEGER NOT NULL,
  is_preview BOOLEAN DEFAULT FALSE, -- Can be viewed without enrollment
  estimated_duration INTEGER DEFAULT 15, -- minutes
  resources JSONB DEFAULT '[]', -- downloadable resources
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Quizzes and assessments
CREATE TABLE IF NOT EXISTS quizzes (
  id SERIAL PRIMARY KEY,
  module_id INTEGER REFERENCES learning_modules(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES course_lessons(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  quiz_type VARCHAR(20) DEFAULT 'lesson', -- 'lesson', 'module', 'final'
  passing_score INTEGER DEFAULT 70,
  time_limit_minutes INTEGER,
  max_attempts INTEGER DEFAULT 3,
  randomize_questions BOOLEAN DEFAULT FALSE,
  show_correct_answers BOOLEAN DEFAULT TRUE,
  is_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Quiz questions
CREATE TABLE IF NOT EXISTS quiz_questions (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(20) NOT NULL, -- 'multiple_choice', 'true_false', 'short_answer', 'essay'
  options JSONB, -- For multiple choice questions
  correct_answer TEXT NOT NULL,
  explanation TEXT, -- Explanation for the correct answer
  points INTEGER DEFAULT 1,
  order_index INTEGER NOT NULL,
  difficulty VARCHAR(20) DEFAULT 'medium', -- 'easy', 'medium', 'hard'
  created_at TIMESTAMP DEFAULT NOW()
);

-- User quiz attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL,
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  passed BOOLEAN NOT NULL,
  time_taken INTEGER, -- seconds
  answers JSONB NOT NULL, -- User's answers
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  UNIQUE(quiz_id, user_id, attempt_number)
);

-- Enhanced user progress tracking
CREATE TABLE IF NOT EXISTS user_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  module_id INTEGER REFERENCES learning_modules(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES course_lessons(id) ON DELETE CASCADE,
  progress_type VARCHAR(20) NOT NULL, -- 'lesson_started', 'lesson_completed', 'quiz_attempted', 'quiz_passed'
  progress_percentage INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- seconds
  completed_at TIMESTAMP,
  last_accessed TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, module_id, lesson_id, progress_type)
);

-- Course enrollments with enhanced features
ALTER TABLE course_enrollments ADD COLUMN IF NOT EXISTS enrollment_type VARCHAR(20) DEFAULT 'individual'; -- 'individual', 'group', 'corporate'
ALTER TABLE course_enrollments ADD COLUMN IF NOT EXISTS discount_applied DECIMAL(5,2) DEFAULT 0.00;
ALTER TABLE course_enrollments ADD COLUMN IF NOT EXISTS final_amount DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE course_enrollments ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0;
ALTER TABLE course_enrollments ADD COLUMN IF NOT EXISTS completion_date TIMESTAMP;
ALTER TABLE course_enrollments ADD COLUMN IF NOT EXISTS certificate_issued BOOLEAN DEFAULT FALSE;
ALTER TABLE course_enrollments ADD COLUMN IF NOT EXISTS certificate_url TEXT;
ALTER TABLE course_enrollments ADD COLUMN IF NOT EXISTS access_expires_at TIMESTAMP;
ALTER TABLE course_enrollments ADD COLUMN IF NOT EXISTS notes TEXT;

-- Certifications and achievements
CREATE TABLE IF NOT EXISTS certifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  module_id INTEGER REFERENCES learning_modules(id) ON DELETE CASCADE,
  enrollment_id INTEGER REFERENCES course_enrollments(id) ON DELETE CASCADE,
  certificate_number VARCHAR(50) UNIQUE NOT NULL,
  certificate_url TEXT,
  certificate_data JSONB, -- Certificate details for generation
  issued_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  verification_code VARCHAR(50) UNIQUE,
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Course reviews and ratings
CREATE TABLE IF NOT EXISTS course_reviews (
  id SERIAL PRIMARY KEY,
  module_id INTEGER REFERENCES learning_modules(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  enrollment_id INTEGER REFERENCES course_enrollments(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  pros TEXT,
  cons TEXT,
  would_recommend BOOLEAN,
  instructor_rating INTEGER CHECK (instructor_rating >= 1 AND instructor_rating <= 5),
  content_rating INTEGER CHECK (content_rating >= 1 AND content_rating <= 5),
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  is_verified_purchase BOOLEAN DEFAULT TRUE,
  helpful_votes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(module_id, user_id)
);

-- Instructor applications and profiles
CREATE TABLE IF NOT EXISTS instructor_applications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  application_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'revision_required'
  bio TEXT NOT NULL,
  expertise_areas JSONB DEFAULT '[]',
  experience_years INTEGER,
  education_background TEXT,
  certifications TEXT,
  portfolio_url TEXT,
  sample_content_url TEXT,
  motivation TEXT,
  teaching_philosophy TEXT,
  reviewed_by INTEGER REFERENCES users(id),
  review_notes TEXT,
  applied_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  UNIQUE(user_id)
);

-- Instructor profiles (for approved instructors)
CREATE TABLE IF NOT EXISTS instructor_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  expertise_areas JSONB DEFAULT '[]',
  experience_years INTEGER,
  education_background TEXT,
  certifications TEXT,
  portfolio_url TEXT,
  teaching_philosophy TEXT,
  hourly_rate DECIMAL(10,2),
  availability JSONB DEFAULT '{}',
  total_students INTEGER DEFAULT 0,
  total_courses INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  total_ratings INTEGER DEFAULT 0,
  featured_instructor BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- AI tutoring sessions and interactions
CREATE TABLE IF NOT EXISTS ai_tutoring_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  module_id INTEGER REFERENCES learning_modules(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES course_lessons(id) ON DELETE CASCADE,
  session_type VARCHAR(20) DEFAULT 'help', -- 'help', 'explanation', 'practice', 'review'
  user_question TEXT,
  ai_response TEXT,
  context_data JSONB, -- Lesson content, user progress, etc.
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  was_helpful BOOLEAN,
  follow_up_needed BOOLEAN DEFAULT FALSE,
  language VARCHAR(5) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Learning paths and recommendations
CREATE TABLE IF NOT EXISTS learning_paths (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  target_audience TEXT,
  difficulty_level VARCHAR(20) DEFAULT 'beginner',
  estimated_duration INTEGER, -- total minutes
  modules JSONB NOT NULL, -- Array of module IDs in order
  prerequisites JSONB DEFAULT '[]',
  created_by INTEGER REFERENCES users(id),
  is_featured BOOLEAN DEFAULT FALSE,
  enrollment_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User learning path enrollments
CREATE TABLE IF NOT EXISTS learning_path_enrollments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  learning_path_id INTEGER REFERENCES learning_paths(id) ON DELETE CASCADE,
  current_module_index INTEGER DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0,
  started_at TIMESTAMP DEFAULT NOW(),
  estimated_completion TIMESTAMP,
  completed_at TIMESTAMP,
  UNIQUE(user_id, learning_path_id)
);

-- Discussion forums for courses
CREATE TABLE IF NOT EXISTS course_discussions (
  id SERIAL PRIMARY KEY,
  module_id INTEGER REFERENCES learning_modules(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES course_lessons(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  parent_id INTEGER REFERENCES course_discussions(id) ON DELETE CASCADE,
  title VARCHAR(200),
  content TEXT NOT NULL,
  is_question BOOLEAN DEFAULT FALSE,
  is_answered BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default course categories
INSERT INTO course_categories (name, description, icon_name, sort_order) VALUES
('Agricultural Techniques', 'Modern farming methods, crop management, and agricultural best practices', 'Wheat', 1),
('Business & Marketing', 'Agricultural business, marketing strategies, and financial management', 'TrendingUp', 2),
('Technology & Innovation', 'Agricultural technology, IoT devices, and digital farming tools', 'Smartphone', 3),
('Sustainability', 'Sustainable farming practices, environmental conservation, and organic methods', 'Leaf', 4),
('Livestock Management', 'Animal husbandry, veterinary care, and livestock business', 'Cow', 5),
('Food Processing', 'Post-harvest processing, food safety, and value addition', 'Package', 6),
('Cooperative Management', 'Cooperative formation, management, and group farming strategies', 'Users', 7),
('Financial Literacy', 'Agricultural finance, loans, insurance, and investment strategies', 'DollarSign', 8);

-- Insert subcategories
INSERT INTO course_categories (name, description, parent_id, sort_order) VALUES
-- Agricultural Techniques subcategories
('Crop Production', 'Seed selection, planting, and crop management', 1, 1),
('Soil Management', 'Soil health, fertilization, and conservation', 1, 2),
('Pest & Disease Control', 'Integrated pest management and disease prevention', 1, 3),
('Irrigation Systems', 'Water management and irrigation techniques', 1, 4),

-- Business & Marketing subcategories
('Market Analysis', 'Understanding markets and price trends', 2, 1),
('Product Marketing', 'Branding, promotion, and sales strategies', 2, 2),
('Financial Planning', 'Budgeting, accounting, and financial management', 2, 3),
('Supply Chain', 'Logistics, distribution, and supply chain management', 2, 4),

-- Technology & Innovation subcategories
('Precision Agriculture', 'GPS, sensors, and precision farming tools', 3, 1),
('Mobile Applications', 'Agricultural apps and digital tools', 3, 2),
('Data Analytics', 'Farm data analysis and decision making', 3, 3);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_course_lessons_module_id ON course_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_order ON course_lessons(lesson_order);
CREATE INDEX IF NOT EXISTS idx_quizzes_module_id ON quizzes(module_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_module_id ON user_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_certifications_user_id ON certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_certifications_verification_code ON certifications(verification_code);
CREATE INDEX IF NOT EXISTS idx_course_reviews_module_id ON course_reviews(module_id);
CREATE INDEX IF NOT EXISTS idx_instructor_applications_user_id ON instructor_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_instructor_profiles_user_id ON instructor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_tutoring_sessions_user_id ON ai_tutoring_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_modules_approval_status ON learning_modules(approval_status);
CREATE INDEX IF NOT EXISTS idx_learning_modules_featured ON learning_modules(featured);
CREATE INDEX IF NOT EXISTS idx_course_discussions_module_id ON course_discussions(module_id);

-- Create triggers for automatic updates
CREATE OR REPLACE FUNCTION update_module_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update enrollment count
  UPDATE learning_modules SET
    enrollment_count = (
      SELECT COUNT(*) FROM course_enrollments 
      WHERE module_id = COALESCE(NEW.module_id, OLD.module_id)
    ),
    completion_count = (
      SELECT COUNT(*) FROM course_enrollments 
      WHERE module_id = COALESCE(NEW.module_id, OLD.module_id) 
      AND completion_date IS NOT NULL
    )
  WHERE id = COALESCE(NEW.module_id, OLD.module_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_module_ratings()
RETURNS TRIGGER AS $$
BEGIN
  -- Update average rating and total ratings
  UPDATE learning_modules SET
    average_rating = (
      SELECT COALESCE(AVG(rating), 0) FROM course_reviews 
      WHERE module_id = COALESCE(NEW.module_id, OLD.module_id)
    ),
    total_ratings = (
      SELECT COUNT(*) FROM course_reviews 
      WHERE module_id = COALESCE(NEW.module_id, OLD.module_id)
    )
  WHERE id = COALESCE(NEW.module_id, OLD.module_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_module_stats ON course_enrollments;
CREATE TRIGGER trigger_update_module_stats
  AFTER INSERT OR UPDATE OR DELETE ON course_enrollments
  FOR EACH ROW EXECUTE FUNCTION update_module_stats();

DROP TRIGGER IF EXISTS trigger_update_module_ratings ON course_reviews;
CREATE TRIGGER trigger_update_module_ratings
  AFTER INSERT OR UPDATE OR DELETE ON course_reviews
  FOR EACH ROW EXECUTE FUNCTION update_module_ratings();

COMMIT;