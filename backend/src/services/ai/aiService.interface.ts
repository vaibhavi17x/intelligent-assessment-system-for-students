/**
 * AI Evaluation Service Interface
 * 
 * This interface defines the contract for AI-based assignment evaluation.
 * Implementations can be swapped without affecting the core application.
 */

export interface EvaluationRequest {
  studentAnswer: string;
  modelAnswer: string;
  rubric: any; // Rubric structure
  assignmentInfo: {
    title: string;
    subject: string;
    maxMarks: number;
  };
  evaluationCriteria?: {
    checkConceptCoverage: boolean;
    checkRelevance: boolean;
    checkSimilarity: boolean;
    generateFeedback: boolean;
  };
}

export interface ConceptAnalysis {
  concepts: {
    name: string;
    covered: boolean;
    confidence: number;
  }[];
  overallCoverage: number;
}

export interface EvaluationResult {
  suggestedScore: number;
  maxScore: number;
  feedback: string;
  conceptAnalysis?: ConceptAnalysis;
  similarityScore?: number;
  relevanceScore?: number;
  metadata: {
    modelUsed: string;
    processingTime: number;
    timestamp: Date;
  };
}

export interface IAIEvaluationService {
  /**
   * Evaluate a student submission against a model answer
   */
  evaluate(request: EvaluationRequest): Promise<EvaluationResult>;

  /**
   * Check if the service is available and properly configured
   */
  isAvailable(): Promise<boolean>;

  /**
   * Get the name/version of the AI model being used
   */
  getModelInfo(): string;
}
