import { dbQuery } from '@/lib/db/db';

export interface CourseCreationParams {
  title: string;
  description: string;
  category: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  price: number;
  isFree: boolean;
  prerequisites: string[];
  learningObjectives: string[];
  tags: string[];
  instructorNotes?: string;
}

export interface LessonCreationParams {
  moduleId: number;
  title: string;
  description: string;
  content: string;
  videoUrl?: string;
  videoDuration?: number;
  estimatedDuration: number;
  isPreview: boolean;
  resources: any[];
  lessonOrder: number;
}

export interface QuizCreationParams {
  moduleId: number;
  lessonId?: number;
  title: string;
  description: string;
  quizType: 'lesson' | 'module' | 'final';
  passingScore: number;
  timeLimit?: number;
  maxAttempts: number;
  randomizeQuestions: boolean;
  showCorrectAnswers: boolean;
  isRequired: boolean;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  questionText: string;
  questionType: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface EnrollmentParams {
  userId: number;
  moduleId: number;
  paymentMethod?: string;
  discountCode?: string;
  enrollmentType: 'individual' | 'group' | 'corporate';
}

export class LearningManager {

  /**
   * Create a new course module
   */
  async createCourse(instructorId: number, params: CourseCreationParams): Promise<{ success: boolean; courseId?: number; error?: string }> {
    try {
      // Verify instructor is approved
      const instructor = await dbQuery(
        'SELECT * FROM instructor_profiles WHERE user_id = $1',
        [instructorId]
      );

      if (!instructor.length) {
        return { success: false, error: 'Only approved instructors can create courses' };
      }

      // Create the course module
      const result = await dbQuery(
        `INSERT INTO learning_modules (
          educator_id, title, description, category, level, price, is_free,
          prerequisites, learning_objectives, tags, instructor_notes,
          difficulty_level, estimated_duration, approval_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id`,
        [
          instructorId,
          params.title,
          params.description,
          params.category,
          params.difficultyLevel,
          params.price,
          params.isFree,
          JSON.stringify(params.prerequisites),
          JSON.stringify(params.learningObjectives),
          JSON.stringify(params.tags),
          params.instructorNotes,
          params.difficultyLevel,
          params.estimatedDuration,
          'pending'
        ]
      );

      const courseId = result[0].id;

      // Create notification for admin review
      await this.createAdminNotification(
        'course_review_required',
        'New Course Awaiting Review',
        `Course "${params.title}" by instructor ${instructorId} requires approval.`,
        { courseId, instructorId }
      );

      return { success: true, courseId };

    } catch (error: any) {
      console.error('Create course error:', error);
      return { success: false, error: error.message || 'Failed to create course' };
    }
  }

  /**
   * Add lesson to a course
   */
  async addLesson(instructorId: number, params: LessonCreationParams): Promise<{ success: boolean; lessonId?: number; error?: string }> {
    try {
      // Verify instructor owns the course
      const course = await dbQuery(
        'SELECT * FROM learning_modules WHERE id = $1 AND educator_id = $2',
        [params.moduleId, instructorId]
      );

      if (!course.length) {
        return { success: false, error: 'Course not found or access denied' };
      }

      // Create the lesson
      const result = await dbQuery(
        `INSERT INTO course_lessons (
          module_id, title, description, content, video_url, video_duration,
          lesson_order, is_preview, estimated_duration, resources
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id`,
        [
          params.moduleId,
          params.title,
          params.description,
          params.content,
          params.videoUrl,
          params.videoDuration,
          params.lessonOrder,
          params.isPreview,
          params.estimatedDuration,
          JSON.stringify(params.resources)
        ]
      );

      return { success: true, lessonId: result[0].id };

    } catch (error: any) {
      console.error('Add lesson error:', error);
      return { success: false, error: error.message || 'Failed to add lesson' };
    }
  }

  /**
   * Create quiz for course or lesson
   */
  async createQuiz(instructorId: number, params: QuizCreationParams): Promise<{ success: boolean; quizId?: number; error?: string }> {
    try {
      // Verify instructor owns the course
      const course = await dbQuery(
        'SELECT * FROM learning_modules WHERE id = $1 AND educator_id = $2',
        [params.moduleId, instructorId]
      );

      if (!course.length) {
        return { success: false, error: 'Course not found or access denied' };
      }

      // Create the quiz
      const quizResult = await dbQuery(
        `INSERT INTO quizzes (
          module_id, lesson_id, title, description, quiz_type, passing_score,
          time_limit_minutes, max_attempts, randomize_questions, show_correct_answers, is_required
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id`,
        [
          params.moduleId,
          params.lessonId,
          params.title,
          params.description,
          params.quizType,
          params.passingScore,
          params.timeLimit,
          params.maxAttempts,
          params.randomizeQuestions,
          params.showCorrectAnswers,
          params.isRequired
        ]
      );

      const quizId = quizResult[0].id;

      // Add questions
      for (let i = 0; i < params.questions.length; i++) {
        const question = params.questions[i];
        await dbQuery(
          `INSERT INTO quiz_questions (
            quiz_id, question_text, question_type, options, correct_answer,
            explanation, points, order_index, difficulty
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            quizId,
            question.questionText,
            question.questionType,
            JSON.stringify(question.options),
            question.correctAnswer,
            question.explanation,
            question.points,
            i + 1,
            question.difficulty
          ]
        );
      }

      return { success: true, quizId };

    } catch (error: any) {
      console.error('Create quiz error:', error);
      return { success: false, error: error.message || 'Failed to create quiz' };
    }
  }

  /**
   * Check if user is enrolled in a course
   */
  async checkEnrollment(userId: number, moduleId: number): Promise<boolean> {
    try {
      const enrollment = await dbQuery(
        'SELECT id FROM course_enrollments WHERE user_id = $1 AND module_id = $2 AND payment_status = $3',
        [userId, moduleId, 'paid']
      );
      return enrollment.length > 0;
    } catch (error) {
      console.error('Check enrollment error:', error);
      return false;
    }
  }

  /**
   * Enroll user in a course
   */
  async enrollInCourse(params: EnrollmentParams): Promise<{ success: boolean; enrollmentId?: number; error?: string }> {
    try {
      // Get course details
      const course = await dbQuery(
        'SELECT * FROM learning_modules WHERE id = $1 AND approval_status = $2',
        [params.moduleId, 'approved']
      );

      if (!course.length) {
        return { success: false, error: 'Course not found or not approved' };
      }

      const courseData = course[0];

      // Check if already enrolled
      const existingEnrollment = await dbQuery(
        'SELECT id FROM course_enrollments WHERE user_id = $1 AND module_id = $2',
        [params.userId, params.moduleId]
      );

      if (existingEnrollment.length > 0) {
        return { success: false, error: 'Already enrolled in this course' };
      }

      // Calculate final amount (apply discounts if any)
      let finalAmount = courseData.is_free ? 0 : courseData.price;
      let discountApplied = 0;

      // Apply discount code if provided
      if (params.discountCode && !courseData.is_free) {
        const discount = await this.applyDiscountCode(params.discountCode, courseData.price);
        if (discount.success) {
          discountApplied = discount.discountPercentage || 0;
          finalAmount = discount.finalAmount || courseData.price;
        }
      }

      // Create enrollment
      const enrollmentResult = await dbQuery(
        `INSERT INTO course_enrollments (
          user_id, module_id, enrollment_type, payment_method, 
          amount_paid, discount_applied, final_amount, payment_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id`,
        [
          params.userId,
          params.moduleId,
          params.enrollmentType,
          params.paymentMethod,
          finalAmount,
          discountApplied,
          finalAmount,
          finalAmount === 0 ? 'paid' : 'pending'
        ]
      );

      const enrollmentId = enrollmentResult[0].id as number;

      // If free course, mark as paid immediately
      if (finalAmount === 0) {
        await this.completeEnrollmentPayment(enrollmentId);
      }

      return { success: true, enrollmentId };

    } catch (error: any) {
      console.error('Enroll in course error:', error);
      return { success: false, error: error.message || 'Failed to enroll in course' };
    }
  }

  /**
   * Complete enrollment payment
   */
  async completeEnrollmentPayment(enrollmentId: number): Promise<{ success: boolean; error?: string }> {
    try {
      // Update enrollment status
      await dbQuery(
        `UPDATE course_enrollments SET 
          payment_status = 'paid',
          payment_completed_at = NOW(),
          enrolled_at = NOW()
         WHERE id = $1`,
        [enrollmentId]
      );

      // Get enrollment details
      const enrollment = await dbQuery(
        `SELECT ce.*, lm.title as course_title, u.name as user_name
         FROM course_enrollments ce
         JOIN learning_modules lm ON ce.module_id = lm.id
         JOIN users u ON ce.user_id = u.id
         WHERE ce.id = $1`,
        [enrollmentId]
      );

      if (enrollment.length > 0) {
        const enrollmentData = enrollment[0];

        // Create welcome notification
        await dbQuery(
          `INSERT INTO notifications (user_id, type, title, message, icon_name)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            enrollmentData.user_id,
            'course_enrollment',
            'Course Enrollment Confirmed',
            `Welcome to "${enrollmentData.course_title}"! You can now access all course materials.`,
            'BookOpen'
          ]
        );

        // Track initial progress
        await this.trackProgress(
          enrollmentData.user_id,
          enrollmentData.module_id,
          null,
          'course_started',
          0
        );
      }

      return { success: true };

    } catch (error: any) {
      console.error('Complete enrollment payment error:', error);
      return { success: false, error: error.message || 'Failed to complete enrollment payment' };
    }
  }

  /**
   * Track user progress
   */
  async trackProgress(
    userId: number,
    moduleId: number,
    lessonId: number | null,
    progressType: string,
    progressPercentage: number,
    timeSpent: number = 0
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Update or insert progress record
      await dbQuery(
        `INSERT INTO user_progress (user_id, module_id, lesson_id, progress_type, progress_percentage, time_spent)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (user_id, module_id, lesson_id, progress_type)
         DO UPDATE SET 
           progress_percentage = $5,
           time_spent = user_progress.time_spent + $6,
           last_accessed = NOW(),
           completed_at = CASE WHEN $5 = 100 THEN NOW() ELSE user_progress.completed_at END`,
        [userId, moduleId, lessonId, progressType, progressPercentage, timeSpent]
      );

      // Update overall course progress
      await this.updateCourseProgress(userId, moduleId);

      return { success: true };

    } catch (error: any) {
      console.error('Track progress error:', error);
      return { success: false, error: error.message || 'Failed to track progress' };
    }
  }

  /**
   * Submit quiz attempt
   */
  async submitQuizAttempt(
    userId: number,
    quizId: number,
    answers: Record<string, string>,
    timeSpent: number
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    try {
      // Get quiz details and questions
      const quiz = await dbQuery(
        'SELECT * FROM quizzes WHERE id = $1',
        [quizId]
      );

      if (!quiz.length) {
        return { success: false, error: 'Quiz not found' };
      }

      const quizData = quiz[0];

      // Get current attempt number
      const attempts = await dbQuery(
        'SELECT COUNT(*) as count FROM quiz_attempts WHERE quiz_id = $1 AND user_id = $2',
        [quizId, userId]
      );

      const attemptNumber = parseInt(attempts[0].count) + 1;

      // Check if max attempts exceeded
      if (quizData.max_attempts && attemptNumber > quizData.max_attempts) {
        return { success: false, error: 'Maximum attempts exceeded' };
      }

      // Get questions and calculate score
      const questions = await dbQuery(
        'SELECT * FROM quiz_questions WHERE quiz_id = $1 ORDER BY order_index',
        [quizId]
      );

      let totalScore = 0;
      let maxScore = 0;
      const results = [];

      for (const question of questions) {
        maxScore += question.points;
        const userAnswer = answers[question.id.toString()];
        const isCorrect = this.checkAnswer(question, userAnswer);

        if (isCorrect) {
          totalScore += question.points;
        }

        results.push({
          questionId: question.id,
          userAnswer,
          correctAnswer: question.correct_answer,
          isCorrect,
          points: isCorrect ? question.points : 0,
          explanation: question.explanation
        });
      }

      const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
      const passed = percentage >= quizData.passing_score;

      // Save attempt
      const attemptResult = await dbQuery(
        `INSERT INTO quiz_attempts (
          quiz_id, user_id, attempt_number, score, max_score, percentage,
          passed, time_taken, answers, completed_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        RETURNING id`,
        [
          quizId,
          userId,
          attemptNumber,
          totalScore,
          maxScore,
          percentage,
          passed,
          timeSpent,
          JSON.stringify(answers)
        ]
      );

      // Track progress if passed
      if (passed) {
        await this.trackProgress(
          userId,
          quizData.module_id,
          quizData.lesson_id,
          'quiz_passed',
          100
        );
      }

      return {
        success: true,
        result: {
          attemptId: attemptResult[0].id,
          score: totalScore,
          maxScore,
          percentage,
          passed,
          results: quizData.show_correct_answers ? results : results.map(r => ({
            questionId: r.questionId,
            isCorrect: r.isCorrect,
            points: r.points
          }))
        }
      };

    } catch (error: any) {
      console.error('Submit quiz attempt error:', error);
      return { success: false, error: error.message || 'Failed to submit quiz attempt' };
    }
  }

  /**
   * Generate certificate for completed course
   */
  async generateCertificate(userId: number, moduleId: number): Promise<{ success: boolean; certificateId?: number; error?: string }> {
    try {
      // Check if course is completed
      const enrollment = await dbQuery(
        `SELECT * FROM course_enrollments 
         WHERE user_id = $1 AND module_id = $2 AND completion_date IS NOT NULL`,
        [userId, moduleId]
      );

      if (!enrollment.length) {
        return { success: false, error: 'Course not completed' };
      }

      // Check if certificate already exists
      const existingCert = await dbQuery(
        'SELECT id FROM certifications WHERE user_id = $1 AND module_id = $2',
        [userId, moduleId]
      );

      if (existingCert.length > 0) {
        return { success: false, error: 'Certificate already issued' };
      }

      // Generate certificate number and verification code
      const certificateNumber = `AZMERA-${Date.now()}-${userId}-${moduleId}`;
      const verificationCode = this.generateVerificationCode();

      // Get course and user details
      const details = await dbQuery(
        `SELECT lm.title, lm.estimated_duration, u.name as user_name, 
                inst.name as instructor_name
         FROM learning_modules lm
         JOIN users u ON u.id = $1
         JOIN users inst ON inst.id = lm.educator_id
         WHERE lm.id = $2`,
        [userId, moduleId]
      );

      const courseDetails = details[0];

      // Create certificate data
      const certificateData = {
        studentName: courseDetails.user_name,
        courseName: courseDetails.title,
        instructorName: courseDetails.instructor_name,
        completionDate: new Date().toISOString(),
        duration: courseDetails.estimated_duration,
        certificateNumber,
        verificationCode
      };

      // Insert certificate record
      const certResult = await dbQuery(
        `INSERT INTO certifications (
          user_id, module_id, enrollment_id, certificate_number,
          certificate_data, verification_code
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id`,
        [
          userId,
          moduleId,
          enrollment[0].id,
          certificateNumber,
          JSON.stringify(certificateData),
          verificationCode
        ]
      );

      // Update enrollment
      await dbQuery(
        'UPDATE course_enrollments SET certificate_issued = TRUE WHERE id = $1',
        [enrollment[0].id]
      );

      // Create notification
      await dbQuery(
        `INSERT INTO notifications (user_id, type, title, message, icon_name)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          userId,
          'certificate_issued',
          'Certificate Issued',
          `Congratulations! Your certificate for "${courseDetails.title}" is ready for download.`,
          'Award'
        ]
      );

      return { success: true, certificateId: certResult[0].id };

    } catch (error: any) {
      console.error('Generate certificate error:', error);
      return { success: false, error: error.message || 'Failed to generate certificate' };
    }
  }

  /**
   * AI-powered tutoring assistance
   */
  async getAITutoring(
    userId: number,
    moduleId: number,
    lessonId: number | null,
    question: string,
    sessionType: string = 'help',
    language: string = 'en'
  ): Promise<{ success: boolean; response?: string; sessionId?: number; error?: string }> {
    try {
      // Get context data
      const context = await this.getAIContext(userId, moduleId, lessonId);

      // Generate AI response (integrate with your AI service)
      const aiResponse = await this.generateAIResponse(question, context, language);

      // Save tutoring session
      const sessionResult = await dbQuery(
        `INSERT INTO ai_tutoring_sessions (
          user_id, module_id, lesson_id, session_type, user_question,
          ai_response, context_data, language
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id`,
        [
          userId,
          moduleId,
          lessonId,
          sessionType,
          question,
          aiResponse,
          JSON.stringify(context),
          language
        ]
      );

      return {
        success: true,
        response: aiResponse,
        sessionId: sessionResult[0].id
      };

    } catch (error: any) {
      console.error('AI tutoring error:', error);
      return { success: false, error: error.message || 'Failed to get AI assistance' };
    }
  }

  // Helper methods

  private async updateCourseProgress(userId: number, moduleId: number) {
    // Calculate overall course progress based on lessons and quizzes completed
    const progress = await dbQuery(
      `SELECT 
         COUNT(DISTINCT cl.id) as total_lessons,
         COUNT(DISTINCT CASE WHEN up.progress_type = 'lesson_completed' THEN cl.id END) as completed_lessons,
         COUNT(DISTINCT q.id) as total_quizzes,
         COUNT(DISTINCT CASE WHEN up.progress_type = 'quiz_passed' THEN q.id END) as passed_quizzes
       FROM course_lessons cl
       LEFT JOIN quizzes q ON q.module_id = cl.module_id
       LEFT JOIN user_progress up ON up.lesson_id = cl.id AND up.user_id = $1
       WHERE cl.module_id = $2`,
      [userId, moduleId]
    );

    const stats = progress[0];
    const totalItems = stats.total_lessons + stats.total_quizzes;
    const completedItems = stats.completed_lessons + stats.passed_quizzes;
    const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    // Update enrollment progress
    await dbQuery(
      `UPDATE course_enrollments SET 
         completion_percentage = $1,
         completion_date = CASE WHEN $1 = 100 THEN NOW() ELSE completion_date END
       WHERE user_id = $2 AND module_id = $3`,
      [progressPercentage, userId, moduleId]
    );

    // Generate certificate if course is completed
    if (progressPercentage === 100) {
      await this.generateCertificate(userId, moduleId);
    }
  }

  private checkAnswer(question: any, userAnswer: string): boolean {
    switch (question.question_type) {
      case 'multiple_choice':
      case 'true_false':
        return userAnswer === question.correct_answer;
      case 'short_answer':
        return userAnswer.toLowerCase().trim() === question.correct_answer.toLowerCase().trim();
      case 'essay':
        // For essays, manual grading would be required
        return false;
      default:
        return false;
    }
  }

  private generateVerificationCode(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private async getAIContext(userId: number, moduleId: number, lessonId: number | null) {
    // Get user progress, lesson content, and course information for AI context
    const context = await dbQuery(
      `SELECT 
         lm.title as course_title,
         lm.description as course_description,
         cl.title as lesson_title,
         cl.content as lesson_content,
         up.progress_percentage,
         ce.completion_percentage as course_progress
       FROM learning_modules lm
       LEFT JOIN course_lessons cl ON cl.id = $3
       LEFT JOIN user_progress up ON up.user_id = $1 AND up.module_id = $2 AND up.lesson_id = $3
       LEFT JOIN course_enrollments ce ON ce.user_id = $1 AND ce.module_id = $2
       WHERE lm.id = $2`,
      [userId, moduleId, lessonId]
    );

    return context[0] || {};
  }

  private async generateAIResponse(question: string, context: any, language: string): Promise<string> {
    // This would integrate with your AI service (Gemini, OpenAI, etc.)
    // For now, return a mock response
    const responses = {
      en: `I understand you're asking about "${question}". Based on the course content, here's what I can help you with...`,
      am: `"${question}" ላይ እየጠየቁ እንደሆነ ተረድቻለሁ። በኮርሱ ይዘት መሰረት፣ እዚህ ላይ ልረዳዎት የምችለው...`,
      om: `"${question}" jedhamuuf akka gaafattan hubadheera. Qabiyyee koorsii kanarratti hundaa'uun, kunoo kan isin gargaaruu danda'u...`
    };

    return responses[language as keyof typeof responses] || responses.en;
  }

  private async applyDiscountCode(discountCode: string, originalPrice: number): Promise<{ success: boolean; discountPercentage?: number; finalAmount?: number }> {
    // Mock discount code logic - implement actual discount system
    const discounts: Record<string, number> = {
      'WELCOME10': 10,
      'STUDENT20': 20,
      'EARLY50': 50
    };

    const discountPercentage = discounts[discountCode];
    if (!discountPercentage) {
      return { success: false };
    }

    const finalAmount = originalPrice * (1 - discountPercentage / 100);
    return { success: true, discountPercentage, finalAmount };
  }

  private async createAdminNotification(type: string, title: string, message: string, data: any) {
    // Get admin users
    const admins = await dbQuery('SELECT id FROM users WHERE role = $1', ['admin']);

    for (const admin of admins) {
      await dbQuery(
        `INSERT INTO notifications (user_id, type, title, message, icon_name)
         VALUES ($1, $2, $3, $4, $5)`,
        [admin.id, type, title, message, 'AlertCircle']
      );
    }
  }
}

export const learningManager = new LearningManager();