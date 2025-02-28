import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { AnalysisResult, AnalysisItem } from '../models/analysis.model';
import { AnalysisService } from './analysis.service';

@Injectable({
  providedIn: 'root'
})
export class AnalyzerService {

  constructor(private analysisService: AnalysisService) { }

  analyzeK8sYaml(yaml: string): Observable<AnalysisResult> {
    // Use the analysis service which will handle routing to Gemini or mock service
    return this.analysisService.analyzeYaml(yaml).pipe(
      map(response => {
        // Convert the LLM service response to our app's format
        const result: AnalysisResult = {
          good: [],
          ok: [],
          improvements: [],
          overallScore: response.overallScore,
          scoreBreakdown: response.scoreBreakdown
        };

        // Process each analysis item and categorize it
        response.analysisItems.forEach((item: AnalysisItem) => {
          if (item.type === 'success') {
            result.good.push(item);
          } else if (item.type === 'warning') {
            result.ok.push(item);
          } else if (item.type === 'danger') {
            result.improvements.push(item);
          }
        });

        // Add some default "good" items to match the original implementation
        if (yaml.includes("persistentVolumeReclaimPolicy") || yaml.includes("persistentVolumeClaim")) {
          result.good.push({
            title: "Appropriate PVC retention policy",
            type: "success",
            details: "Your deployment correctly configures the PVC retention policy, which helps prevent accidental data loss.",
            severity: "low",
            category: "reliability"
          });
        }

        if (yaml.includes("storageClass") || yaml.includes("storageClassName")) {
          result.good.push({
            title: "Proper PVC configuration with storage class", 
            type: "success",
            details: "Storage class is properly configured, ensuring appropriate storage provisioning for your workloads.",
            severity: "low",
            category: "performance"
          });
        }

        if (yaml.includes("kind: Secret") || yaml.includes("secretName:")) {
          result.good.push({
            title: "Sensitive information stored in Kubernetes Secrets",
            type: "success",
            details: "Proper usage of Kubernetes Secrets for storing sensitive information rather than environment variables or ConfigMaps.",
            severity: "low",
            category: "security"
          });
        }

        return result;
      })
    );
  }

  getFixRecommendation(issueId: string, yaml: string): Observable<any> {
    return this.analysisService.getFixRecommendation(issueId, yaml);
  }
  
  applyFixToYaml(issueId: string, yaml: string): Observable<string> {
    return this.analysisService.applyFixToYaml(issueId, yaml);
  }
  
  applyAllFixes(issueIds: string[], yaml: string): Observable<string> {
    return this.analysisService.applyAllFixes(issueIds, yaml);
  }
}