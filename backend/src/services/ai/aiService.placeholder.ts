import {
  IAIEvaluationService,
  EvaluationRequest,
  EvaluationResult
} from './aiService.interface';

/**
 * Placeholder AI Evaluation Service
 * 
 * This is a placeholder implementation to demonstrate the service boundary.
 * In future milestones, this will be replaced with actual AI implementation
 * (e.g., OpenAI, Hugging Face, or custom models).
 */
export class PlaceholderAIService implements IAIEvaluationService {
  async evaluate(request: EvaluationRequest): Promise<EvaluationResult> {
    const startTime = Date.now();

    // Placeholder logic - to be replaced with actual AI processing
    // This demonstrates the expected structure without actual AI implementation
    
    const processingTime = Date.now() - startTime;

    return {
      suggestedScore: 0, // Placeholder - will be calculated by actual AI
      maxScore: request.assignmentInfo.maxMarks,
      feedback: 'AI evaluation not yet implemented - this is a placeholder',
      conceptAnalysis: {
        concepts: [],
        overallCoverage: 0
      },
      similarityScore: 0,
      relevanceScore: 0,
      metadata: {
        modelUsed: 'placeholder-v1',
        processingTime,
        timestamp: new Date()
      }
    };
  }

  async isAvailable(): Promise<boolean> {
    // Placeholder - actual implementation will check API availability
    return false;
  }

  getModelInfo(): string {
    return 'Placeholder AI Service v1.0.0';
  }
}

// Export singleton instance
export const aiService = new PlaceholderAIService();
