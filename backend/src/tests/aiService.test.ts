import { PlaceholderAIService } from '../services/ai/aiService.placeholder';
import { EvaluationRequest } from '../services/ai/aiService.interface';

describe('PlaceholderAIService', () => {
  let aiService: PlaceholderAIService;

  beforeEach(() => {
    aiService = new PlaceholderAIService();
  });

  describe('evaluate', () => {
    it('should return placeholder evaluation result', async () => {
      const request: EvaluationRequest = {
        studentAnswer: 'This is my answer',
        modelAnswer: 'This is the model answer',
        rubric: { criteria: [] },
        assignmentInfo: {
          title: 'Test Assignment',
          subject: 'Math',
          maxMarks: 100,
        },
        evaluationCriteria: {
          checkConceptCoverage: true,
          checkRelevance: true,
          checkSimilarity: true,
          generateFeedback: true,
        },
      };

      const result = await aiService.evaluate(request);

      expect(result).toEqual({
        suggestedScore: 0,
        maxScore: 100,
        feedback: 'AI evaluation not yet implemented - this is a placeholder',
        conceptAnalysis: {
          concepts: [],
          overallCoverage: 0,
        },
        similarityScore: 0,
        relevanceScore: 0,
        metadata: {
          modelUsed: 'placeholder-v1',
          processingTime: expect.any(Number),
          timestamp: expect.any(Date),
        },
      });
    });

    it('should include processing time in metadata', async () => {
      const request: EvaluationRequest = {
        studentAnswer: 'Answer',
        modelAnswer: 'Model',
        rubric: {},
        assignmentInfo: {
          title: 'Test',
          subject: 'Science',
          maxMarks: 50,
        },
      };

      const result = await aiService.evaluate(request);

      expect(result.metadata.processingTime).toBeGreaterThanOrEqual(0);
      expect(result.metadata.processingTime).toBeLessThan(1000); // Should be very fast
    });

    it('should use assignment maxMarks from request', async () => {
      const request: EvaluationRequest = {
        studentAnswer: 'Answer',
        modelAnswer: 'Model',
        rubric: {},
        assignmentInfo: {
          title: 'Test',
          subject: 'Science',
          maxMarks: 75,
        },
      };

      const result = await aiService.evaluate(request);

      expect(result.maxScore).toBe(75);
    });
  });

  describe('isAvailable', () => {
    it('should return false for placeholder service', async () => {
      const result = await aiService.isAvailable();
      expect(result).toBe(false);
    });
  });

  describe('getModelInfo', () => {
    it('should return placeholder model info', () => {
      const result = aiService.getModelInfo();
      expect(result).toBe('Placeholder AI Service v1.0.0');
    });
  });
});
