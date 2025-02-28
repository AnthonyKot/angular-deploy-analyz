import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  
  constructor(private http: HttpClient) { }

  analyzeYaml(yaml: string): Observable<any> {
    const prompt = this.createAnalysisPrompt(yaml);
    return this.callGeminiApi(prompt).pipe(
      map(response => {
        try {
          // Extract the JSON from the response
          const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
          if (jsonMatch && jsonMatch[1]) {
            return JSON.parse(jsonMatch[1]);
          }
          // Fallback if no JSON format is found
          return {
            analysisItems: [],
            scoreBreakdown: {
              security: 0,
              reliability: 0,
              performance: 0,
              scalability: 0,
              cost: 0
            },
            overallScore: 0,
            error: 'Failed to parse Gemini response'
          };
        } catch (error) {
          console.error('Error parsing response:', error);
          return {
            analysisItems: [],
            scoreBreakdown: {
              security: 0,
              reliability: 0,
              performance: 0,
              scalability: 0,
              cost: 0
            },
            overallScore: 0,
            error: 'Failed to parse Gemini response'
          };
        }
      }),
      catchError(error => {
        console.error('API error:', error);
        return of({
          analysisItems: [],
          scoreBreakdown: {
            security: 0,
            reliability: 0,
            performance: 0,
            scalability: 0,
            cost: 0
          },
          overallScore: 0,
          error: 'API error: ' + error.message
        });
      })
    );
  }

  getFixRecommendation(issueId: string, yaml: string): Observable<any> {
    const prompt = this.createFixRecommendationPrompt(issueId, yaml);
    return this.callGeminiApi(prompt).pipe(
      map(response => {
        try {
          // Extract the JSON from the response
          const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
          if (jsonMatch && jsonMatch[1]) {
            return JSON.parse(jsonMatch[1]);
          }
          // Fallback
          return {
            detailedRecommendation: 'No specific recommendations available.',
            fixExample: 'Example code not available.',
            additionalNotes: 'Please consult Kubernetes documentation for best practices.'
          };
        } catch (error) {
          console.error('Error parsing response:', error);
          return {
            detailedRecommendation: 'Failed to generate recommendation.',
            fixExample: 'Error parsing response from Gemini API.',
            additionalNotes: 'Please try again later.'
          };
        }
      }),
      catchError(error => {
        console.error('API error:', error);
        return of({
          detailedRecommendation: 'API error occurred.',
          fixExample: 'Error: ' + error.message,
          additionalNotes: 'Please check your connection and try again.'
        });
      })
    );
  }

  applyFixToYaml(issueId: string, yaml: string): Observable<string> {
    const prompt = this.createApplyFixPrompt(issueId, yaml);
    return this.callGeminiApi(prompt).pipe(
      map(response => {
        try {
          // Extract the YAML from the response
          const yamlMatch = response.match(/```yaml\n([\s\S]*?)\n```/);
          if (yamlMatch && yamlMatch[1]) {
            return yamlMatch[1];
          }
          return yaml; // Return original if can't extract fixed yaml
        } catch (error) {
          console.error('Error parsing response:', error);
          return yaml;
        }
      }),
      catchError(error => {
        console.error('API error:', error);
        return of(yaml);
      })
    );
  }

  private callGeminiApi(prompt: string): Observable<string> {
    const url = `${this.apiUrl}?key=${environment.geminiApiKey}`;
    const body = {
      contents: [{
        parts: [{ text: prompt }]
      }]
    };

    return this.http.post<any>(url, body).pipe(
      map(response => {
        if (response.candidates && response.candidates[0]?.content?.parts) {
          return response.candidates[0].content.parts[0].text || '';
        }
        return '';
      }),
      catchError(error => {
        console.error('Gemini API error:', error);
        throw error;
      })
    );
  }

  private createAnalysisPrompt(yaml: string): string {
    return `
You are a Kubernetes expert specializing in deployment analysis. Analyze the following Kubernetes YAML file:

\`\`\`yaml
${yaml}
\`\`\`

Perform a thorough analysis of the deployment manifest focusing on security, reliability, performance, scalability, and cost aspects. Identify best practices, potential issues, and areas for improvement.

Provide your analysis in a structured JSON format as follows:

\`\`\`json
{
  "analysisItems": [
    {
      "id": "unique-issue-id",
      "title": "Issue title",
      "type": "info|warning|danger",
      "severity": "low|medium|high",
      "category": "security|reliability|performance|scalability|cost",
      "details": "Detailed explanation of the issue",
      "recommendation": "Brief recommendation to fix the issue"
    }
  ],
  "scoreBreakdown": {
    "security": 75,
    "reliability": 80,
    "performance": 65,
    "scalability": 70,
    "cost": 60
  },
  "overallScore": 72
}
\`\`\`

Ensure to:
1. Give scores between 0-100 for each category
2. Calculate an overall weighted score with security and reliability weighted more heavily
3. Provide a unique ID for each issue that can be referenced later
4. Include at least one item in each severity and category if applicable
`;
  }

  private createFixRecommendationPrompt(issueId: string, yaml: string): string {
    return `
You are a Kubernetes expert specializing in deployment optimization. I need detailed recommendations to fix a specific issue in this Kubernetes YAML:

\`\`\`yaml
${yaml}
\`\`\`

The issue ID is: ${issueId}

Based on the issue ID, provide detailed recommendations in the following JSON format:

\`\`\`json
{
  "detailedRecommendation": "In-depth explanation of why this issue matters and how to fix it",
  "fixExample": "Code example that fixes the issue",
  "additionalNotes": "Additional context, considerations, or alternatives",
  "highlightAnchor": "A unique string from the YAML that should be highlighted to show where the issue is (pick a string that appears only once)"
}
\`\`\`

Important: The "highlightAnchor" field should contain a short, unique string from the YAML that indicates where the issue is located. This string will be used to highlight the relevant part of the YAML in the editor. Choose a string that appears only once in the YAML and is specific to the issue location.

Ensure your fix example is realistic and can be directly applied to the YAML above.
`;
  }

  private createApplyFixPrompt(issueId: string, yaml: string): string {
    return `
You are a Kubernetes expert. I need you to modify the following Kubernetes YAML to fix a specific issue:

\`\`\`yaml
${yaml}
\`\`\`

The issue ID is: ${issueId}

Apply the fix directly to the YAML and return the complete fixed YAML. Keep all other aspects of the original YAML unchanged.

Return only the complete fixed YAML inside a code block:

\`\`\`yaml
[The fixed YAML will be here]
\`\`\`
`;
  }
}