import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Clear existing data in reverse dependency order
  console.log('Clearing existing data...');
  
  try {
    await prisma.auditEvent.deleteMany();
    console.log('Cleared auditEvent');
  } catch (e) {
    console.log('auditEvent table might not exist yet');
  }
  
  try {
    await prisma.teacherReview.deleteMany();
    console.log('Cleared teacherReview');
  } catch (e) {
    console.log('teacherReview table might not exist yet');
  }
  
  try {
    await prisma.aiEvaluation.deleteMany();
    console.log('Cleared aiEvaluation');
  } catch (e) {
    console.log('aiEvaluation table might not exist yet');
  }
  
  try {
    await prisma.assignmentSubmission.deleteMany();
    console.log('Cleared assignmentSubmission');
  } catch (e) {
    console.log('assignmentSubmission table might not exist yet');
  }
  
  try {
    await prisma.rubric.deleteMany();
    console.log('Cleared rubric');
  } catch (e) {
    console.log('rubric table might not exist yet');
  }
  
  try {
    await prisma.modelAnswer.deleteMany();
    console.log('Cleared modelAnswer');
  } catch (e) {
    console.log('modelAnswer table might not exist yet');
  }
  
  try {
    await prisma.assignment.deleteMany();
    console.log('Cleared assignment');
  } catch (e) {
    console.log('assignment table might not exist yet');
  }
  
  try {
    await prisma.studentAnswer.deleteMany();
    console.log('Cleared studentAnswer');
  } catch (e) {
    console.log('studentAnswer table might not exist yet');
  }
  
  try {
    await prisma.mCQAttempt.deleteMany();
    console.log('Cleared mCQAttempt');
  } catch (e) {
    console.log('mCQAttempt table might not exist yet');
  }
  
  try {
    await prisma.assessmentQuestion.deleteMany();
    console.log('Cleared assessmentQuestion');
  } catch (e) {
    console.log('assessmentQuestion table might not exist yet');
  }
  
  try {
    await prisma.assessment.deleteMany();
    console.log('Cleared assessment');
  } catch (e) {
    console.log('assessment table might not exist yet');
  }
  
  try {
    await prisma.questionOption.deleteMany();
    console.log('Cleared questionOption');
  } catch (e) {
    console.log('questionOption table might not exist yet');
  }
  
  try {
    await prisma.question.deleteMany();
    console.log('Cleared question');
  } catch (e) {
    console.log('question table might not exist yet');
  }
  
  try {
    await prisma.topic.deleteMany();
    console.log('Cleared topic');
  } catch (e) {
    console.log('topic table might not exist yet');
  }
  
  try {
    await prisma.subject.deleteMany();
    console.log('Cleared subject');
  } catch (e) {
    console.log('subject table might not exist yet');
  }
  
  try {
    await prisma.user.deleteMany();
    console.log('Cleared user');
  } catch (e) {
    console.log('user table might not exist yet');
  }

  console.log('Creating users...');
  const hashedPassword = await bcrypt.hash('Test1234', 10);

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  // Create Teachers
  const teacher1 = await prisma.user.create({
    data: {
      email: 'teacher1@example.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Smith',
      role: 'TEACHER',
    },
  });

  const teacher2 = await prisma.user.create({
    data: {
      email: 'teacher2@example.com',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'TEACHER',
    },
  });

  // Create Students
  const student1 = await prisma.user.create({
    data: {
      email: 'student1@example.com',
      password: hashedPassword,
      firstName: 'Alice',
      lastName: 'Johnson',
      role: 'STUDENT',
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: 'student2@example.com',
      password: hashedPassword,
      firstName: 'Bob',
      lastName: 'Williams',
      role: 'STUDENT',
    },
  });

  const student3 = await prisma.user.create({
    data: {
      email: 'student3@example.com',
      password: hashedPassword,
      firstName: 'Charlie',
      lastName: 'Brown',
      role: 'STUDENT',
    },
  });

  console.log('Creating subjects...');
  const mathSubject = await prisma.subject.create({
    data: {
      name: 'Mathematics',
      code: 'MATH101',
      description: 'Introduction to Mathematics',
    },
  });

  const physicsSubject = await prisma.subject.create({
    data: {
      name: 'Physics',
      code: 'PHYS101',
      description: 'Introduction to Physics',
    },
  });

  const csSubject = await prisma.subject.create({
    data: {
      name: 'Computer Science',
      code: 'CS101',
      description: 'Introduction to Computer Science',
    },
  });

  console.log('Creating topics...');
  const algebraTopic = await prisma.topic.create({
    data: {
      name: 'Algebra',
      description: 'Basic algebra concepts',
      subjectId: mathSubject.id,
      order: 1,
    },
  });

  const calculusTopic = await prisma.topic.create({
    data: {
      name: 'Calculus',
      description: 'Introduction to calculus',
      subjectId: mathSubject.id,
      order: 2,
    },
  });

  const mechanicsTopic = await prisma.topic.create({
    data: {
      name: 'Mechanics',
      description: 'Classical mechanics',
      subjectId: physicsSubject.id,
      order: 1,
    },
  });

  const programmingTopic = await prisma.topic.create({
    data: {
      name: 'Programming',
      description: 'Introduction to programming',
      subjectId: csSubject.id,
      order: 1,
    },
  });

  console.log('Creating questions...');
  const mathQuestion1 = await prisma.question.create({
    data: {
      text: 'What is 2 + 2?',
      type: 'SINGLE_CHOICE',
      difficulty: 'EASY',
      topicId: algebraTopic.id,
      marks: 1,
      explanation: 'Basic addition',
      options: {
        create: [
          { text: '3', isCorrect: false, order: 1 },
          { text: '4', isCorrect: true, order: 2 },
          { text: '5', isCorrect: false, order: 3 },
          { text: '6', isCorrect: false, order: 4 },
        ],
      },
    },
  });

  const mathQuestion2 = await prisma.question.create({
    data: {
      text: 'What is the derivative of x^2?',
      type: 'SINGLE_CHOICE',
      difficulty: 'MEDIUM',
      topicId: calculusTopic.id,
      marks: 2,
      explanation: 'Power rule: d/dx(x^n) = nx^(n-1)',
      options: {
        create: [
          { text: 'x', isCorrect: false, order: 1 },
          { text: '2x', isCorrect: true, order: 2 },
          { text: 'x^2', isCorrect: false, order: 3 },
          { text: '2', isCorrect: false, order: 4 },
        ],
      },
    },
  });

  const physicsQuestion1 = await prisma.question.create({
    data: {
      text: 'What is Newton\'s second law?',
      type: 'SINGLE_CHOICE',
      difficulty: 'EASY',
      topicId: mechanicsTopic.id,
      marks: 1,
      explanation: 'F = ma',
      options: {
        create: [
          { text: 'F = ma', isCorrect: true, order: 1 },
          { text: 'E = mc^2', isCorrect: false, order: 2 },
          { text: 'F = mv', isCorrect: false, order: 3 },
          { text: 'a = F/m', isCorrect: false, order: 4 },
        ],
      },
    },
  });

  const csQuestion1 = await prisma.question.create({
    data: {
      text: 'Which of the following are programming paradigms?',
      type: 'MULTIPLE_CHOICE',
      difficulty: 'EASY',
      topicId: programmingTopic.id,
      marks: 2,
      explanation: 'Object-oriented, Functional, and Procedural are all programming paradigms',
      options: {
        create: [
          { text: 'Object-oriented', isCorrect: true, order: 1 },
          { text: 'Functional', isCorrect: true, order: 2 },
          { text: 'Procedural', isCorrect: true, order: 3 },
          { text: 'Imperative', isCorrect: true, order: 4 },
        ],
      },
    },
  });

  console.log('Creating assessments...');
  const mathAssessment = await prisma.assessment.create({
    data: {
      title: 'Mathematics Quiz 1',
      description: 'Basic mathematics assessment',
      subjectId: mathSubject.id,
      duration: 30,
      totalMarks: 5,
      passMarks: 3,
      status: 'PUBLISHED',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      questions: {
        create: [
          { questionId: mathQuestion1.id, order: 1, marks: 1 },
          { questionId: mathQuestion2.id, order: 2, marks: 2 },
        ],
      },
    },
  });

  const physicsAssessment = await prisma.assessment.create({
    data: {
      title: 'Physics Quiz 1',
      description: 'Basic physics assessment',
      subjectId: physicsSubject.id,
      duration: 30,
      totalMarks: 3,
      passMarks: 2,
      status: 'PUBLISHED',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      questions: {
        create: [
          { questionId: physicsQuestion1.id, order: 1, marks: 1 },
        ],
      },
    },
  });

  console.log('Creating assignments...');
  const mathAssignment = await prisma.assignment.create({
    data: {
      title: 'Algebra Problem Set',
      description: 'Solve the following algebra problems',
      subjectId: mathSubject.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      maxMarks: 10,
      status: 'PUBLISHED',
      modelAnswer: {
        create: {
          content: 'Step-by-step solutions to the algebra problems...',
        },
      },
      rubric: {
        create: {
          criteria: {
            correctness: { weight: 0.5, description: 'Correctness of solution' },
            methodology: { weight: 0.3, description: 'Proper use of methods' },
            presentation: { weight: 0.2, description: 'Clarity of presentation' },
          },
          maxMarks: 10,
        },
      },
    },
  });

  console.log('Creating sample MCQ attempts...');
  
  // Get the option IDs properly
  const mathQuestion1WithOptions = await prisma.question.findUnique({
    where: { id: mathQuestion1.id },
    include: { options: true }
  });
  
  const mathQuestion2WithOptions = await prisma.question.findUnique({
    where: { id: mathQuestion2.id },
    include: { options: true }
  });

  const attempt1 = await prisma.mCQAttempt.create({
    data: {
      assessmentId: mathAssessment.id,
      userId: student1.id,
      status: 'SUBMITTED',
      score: 3,
      obtainedMarks: 3,
      percentage: 60,
      submittedAt: new Date(),
      gradedAt: new Date(),
      answers: {
        create: [
          {
            questionId: mathQuestion1.id,
            selectedOptions: [mathQuestion1WithOptions?.options[1]?.id || ''], // Correct answer
            isCorrect: true,
            marksObtained: 1,
          },
          {
            questionId: mathQuestion2.id,
            selectedOptions: [mathQuestion2WithOptions?.options[0]?.id || ''], // Wrong answer
            isCorrect: false,
            marksObtained: 0,
          },
        ],
      },
    },
  });

  console.log('Creating sample assignment submissions...');
  const submission1 = await prisma.assignmentSubmission.create({
    data: {
      assignmentId: mathAssignment.id,
      userId: student1.id,
      content: 'Here is my solution to the algebra problems...',
      status: 'AI_EVALUATED',
      submittedAt: new Date(),
      aiEvaluation: {
        create: {
          suggestedScore: 8.5,
          maxScore: 10,
          feedback: 'Good work on most problems. Some minor calculation errors.',
          conceptAnalysis: {
            algebra: { score: 0.9, covered: true },
            equations: { score: 0.8, covered: true },
          },
          similarityScore: 0.95,
          relevanceScore: 0.9,
          status: 'COMPLETED',
          processedAt: new Date(),
        },
      },
      teacherReview: {
        create: {
          teacherId: teacher1.id,
          approvedScore: 8.5,
          teacherFeedback: 'Agreed with AI evaluation. Good effort.',
          isApproved: true,
          reviewedAt: new Date(),
        },
      },
    },
  });

  console.log('Creating audit events...');
  await prisma.auditEvent.create({
    data: {
      actorId: admin.id,
      action: 'CREATE',
      resource: 'User',
      resourceId: student1.id,
      details: { message: 'Created student user' },
    },
  });

  console.log('Database seed completed successfully!');
  console.log('\nCreated entities:');
  console.log(`- Users: 6 (1 admin, 2 teachers, 3 students)`);
  console.log(`- Subjects: 3`);
  console.log(`- Topics: 4`);
  console.log(`- Questions: 4`);
  console.log(`- Assessments: 2`);
  console.log(`- Assignments: 1`);
  console.log(`- MCQ Attempts: 1`);
  console.log(`- Assignment Submissions: 1`);
  console.log(`- Audit Events: 1`);
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
