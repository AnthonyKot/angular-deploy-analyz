import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LlmMockService } from './llm-mock.service';
import { GeminiService } from './gemini.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnalysisService {
  private useGemini = environment.geminiApiKey && environment.geminiApiKey !== 'YOUR_GEMINI_API_KEY';

  constructor(
    private mockService: LlmMockService,
    private geminiService: GeminiService
  ) { }

  analyzeYaml(yaml: string): Observable<any> {
    if (this.useGemini) {
      return this.geminiService.analyzeYaml(yaml);
    }
    // Fall back to mock service when no API key is provided
    return this.mockService.analyzeYaml(yaml);
  }

  getFixRecommendation(issueId: string, yaml: string): Observable<any> {
    if (this.useGemini) {
      return this.geminiService.getFixRecommendation(issueId, yaml);
    }
    // Fall back to mock service when no API key is provided
    return this.mockService.getFixRecommendation(issueId, yaml);
  }

  applyFixToYaml(issueId: string, yaml: string): Observable<string> {
    if (this.useGemini) {
      return this.geminiService.applyFixToYaml(issueId, yaml);
    }
    // Fall back to mock service when no API key is provided
    return this.mockService.applyFixToYaml(issueId, yaml);
  }

  applyAllFixes(issueIds: string[], yaml: string): Observable<string> {
    // For now, just use the mock service for this functionality
    return this.mockService.applyAllFixes(issueIds, yaml);
  }
}