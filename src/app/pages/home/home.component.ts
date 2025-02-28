import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { YamlInputComponent } from '../../components/yaml-input/yaml-input.component';
import { AnalysisSectionComponent } from '../../components/analysis-section/analysis-section.component';
import { AnalysisItemComponent } from '../../components/analysis-item/analysis-item.component';
import { ToastComponent } from '../../components/toast/toast.component';
import { ScoreDisplayComponent } from '../../components/score-display/score-display.component';
import { FixRecommendationComponent } from '../../components/fix-recommendation/fix-recommendation.component';
import { AnalyzerService } from '../../services/analyzer.service';
import { ToastService } from '../../services/toast.service';
import { FeedbackService } from '../../services/feedback.service';
import { AnalysisItem, AnalysisResult } from '../../models/analysis.model';
import { sampleK8sYaml } from '../../constants/sample-yaml';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    YamlInputComponent,
    AnalysisSectionComponent,
    AnalysisItemComponent,
    ToastComponent,
    ScoreDisplayComponent,
    FixRecommendationComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-50 pb-10">
      <div class="w-full max-w-screen-lg mx-auto px-4 sm:px-6">
        <header class="pt-8 pb-12">
          <div class="max-w-2xl">
            <h1 class="text-3xl font-semibold tracking-tight transition-opacity duration-300">
              K8s Deployment Analyzer
            </h1>
            <p class="mt-2 text-gray-600 text-lg transition-opacity duration-300">
              Analyze your Kubernetes deployment YAML files for best practices and potential issues.
            </p>
          </div>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div class="md:col-span-5">
            <div class="sticky top-6">
              <app-yaml-input 
                [isAnalyzing]="isAnalyzing"
                [yamlContent]="currentYaml" 
                [selectedIssueId]="selectedItem?.id || null"
                (yamlSubmit)="handleYamlSubmit($event)"
              ></app-yaml-input>
              <div class="mt-2 flex justify-end">
                <button
                  type="button"
                  class="text-sm text-gray-500 hover:text-blue-600"
                  (click)="handleLoadSample()"
                >
                  Load sample deployment
                </button>
              </div>
            </div>
          </div>

          <div class="md:col-span-7">
            <ng-container *ngIf="showIntro">
              <div class="bg-white rounded-lg border p-6 animate-fade-in">
                <h2 class="text-xl font-semibold tracking-tight">Welcome to K8s Deployment Analyzer</h2>
                <p class="mt-2 text-gray-600">
                  This tool helps you identify potential issues and best practices in your Kubernetes deployment configurations.
                </p>
                <ul class="mt-4 space-y-2">
                  <li class="flex items-start gap-2">
                    <div class="status-icon-success mt-0.5">
                      <span class="h-3.5 w-3.5 flex items-center justify-center">✓</span>
                    </div>
                    <span class="text-sm">Identify good practices in your deployments</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="status-icon-warning mt-0.5">
                      <span class="h-3.5 w-3.5 flex items-center justify-center">i</span>
                    </div>
                    <span class="text-sm">Flag configurations that could be improved</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="status-icon-danger mt-0.5">
                      <span class="h-3.5 w-3.5 flex items-center justify-center">!</span>
                    </div>
                    <span class="text-sm">Highlight critical issues that need addressing</span>
                  </li>
                </ul>
                <p class="mt-4 text-sm text-gray-500">
                  Get started by pasting your YAML on the left or clicking "Load sample deployment".
                </p>
              </div>
            </ng-container>

            <ng-container *ngIf="!showIntro && result">
              <div class="space-y-10 animate-fade-in">
                <!-- Show score if available -->
                <ng-container *ngIf="result.overallScore && result.scoreBreakdown">
                  <app-score-display 
                    [score]="result.overallScore" 
                    [scoreBreakdown]="result.scoreBreakdown">
                  </app-score-display>
                </ng-container>
                
                <!-- Show selected issue fix recommendation if available -->
                <ng-container *ngIf="selectedItem && fixRecommendation">
                  <app-fix-recommendation 
                    [recommendation]="fixRecommendation"
                    (applyFixClicked)="applyFix()"
                    (feedbackSubmitted)="handleFeedback($event)">
                  </app-fix-recommendation>
                  <div class="mt-4 mb-8 text-center">
                    <button 
                      (click)="clearSelectedItem()"
                      class="text-sm text-blue-600 hover:text-blue-800">
                      ← Back to all analysis items
                    </button>
                  </div>
                </ng-container>

                <!-- Show analysis results only if no item is selected -->
                <ng-container *ngIf="!selectedItem">
                  <!-- Fix All button for issues that can be fixed -->
                  <ng-container *ngIf="result.improvements.length > 0 || result.ok.length > 0">
                    <div class="mb-6 flex justify-end">
                      <button
                        type="button"
                        class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none flex items-center gap-2"
                        (click)="fixAllIssues()"
                        [disabled]="isAnalyzing"
                      >
                        <svg *ngIf="isAnalyzing" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {{ isAnalyzing ? 'Applying Fixes...' : 'Fix All Issues' }}
                      </button>
                    </div>
                  </ng-container>

                  <ng-container *ngIf="result.good.length > 0">
                    <app-analysis-section title="What is good?" [delay]="100">
                      <app-analysis-item 
                        *ngFor="let item of result.good; let i = index" 
                        [item]="item"
                        [style]="{ 'animation-delay': ((i + 1) * 100) + 'ms' }"
                        (itemClicked)="handleItemClick($event)"
                      ></app-analysis-item>
                    </app-analysis-section>
                  </ng-container>

                  <ng-container *ngIf="result.ok.length > 0">
                    <app-analysis-section title="What is OK?" [delay]="300">
                      <app-analysis-item 
                        *ngFor="let item of result.ok; let i = index" 
                        [item]="item"
                        [style]="{ 'animation-delay': ((i + 1) * 100) + 'ms' }"
                        (itemClicked)="handleItemClick($event)"
                      ></app-analysis-item>
                    </app-analysis-section>
                  </ng-container>

                  <ng-container *ngIf="result.improvements.length > 0">
                    <app-analysis-section title="What can be improved?" [delay]="500">
                      <app-analysis-item 
                        *ngFor="let item of result.improvements; let i = index" 
                        [item]="item"
                        [style]="{ 'animation-delay': ((i + 1) * 100) + 'ms' }"
                        (itemClicked)="handleItemClick($event)"
                      ></app-analysis-item>
                    </app-analysis-section>
                  </ng-container>

                  <ng-container *ngIf="result.good.length === 0 && result.ok.length === 0 && result.improvements.length === 0">
                    <div class="text-center py-8">
                      <p class="text-gray-500">No analysis items found. Please check if your YAML is a valid Kubernetes deployment.</p>
                    </div>
                  </ng-container>
                </ng-container>
              </div>
            </ng-container>

            <ng-container *ngIf="isAnalyzing">
              <div class="h-[200px] flex items-center justify-center">
                <div class="animate-pulse text-gray-500">Analyzing your deployment...</div>
              </div>
            </ng-container>
          </div>
        </div>
      </div>
      <app-toast></app-toast>
      
      <!-- Simple footer with admin link -->
      <footer class="mt-10 py-4 border-t border-gray-200">
        <div class="flex justify-between items-center w-full max-w-screen-lg mx-auto px-4 sm:px-6">
          <div class="text-sm text-gray-500">
            K8s Deployment Analyzer
          </div>
          <a 
            routerLink="/admin" 
            class="text-sm text-gray-500 hover:text-blue-600"
          >
            Admin
          </a>
        </div>
      </footer>
    </div>
  `,
  styles: []
})
export class HomeComponent {
  isAnalyzing = false;
  result: AnalysisResult | null = null;
  showIntro = true;
  selectedItem: AnalysisItem | null = null;
  fixRecommendation: any = null;
  currentYaml: string = '';

  constructor(
    private analyzerService: AnalyzerService,
    private toastService: ToastService,
    private feedbackService: FeedbackService
  ) {}

  handleYamlSubmit(yaml: string): void {
    this.isAnalyzing = true;
    this.showIntro = false;
    this.selectedItem = null;
    this.fixRecommendation = null;
    this.currentYaml = yaml;
    
    this.analyzerService.analyzeK8sYaml(yaml).subscribe({
      next: (analysisResult) => {
        this.result = analysisResult;
        
        const totalIssues = analysisResult.improvements.length + analysisResult.ok.length;
        if (totalIssues > 0) {
          this.toastService.info(`Analysis complete: ${totalIssues} issues found`);
        } else {
          this.toastService.success("Analysis complete: No issues found!");
        }
      },
      error: (error) => {
        this.toastService.error(error instanceof Error ? error.message : "Failed to analyze YAML");
        this.result = null;
      },
      complete: () => {
        this.isAnalyzing = false;
      }
    });
  }

  handleLoadSample(): void {
    this.handleYamlSubmit(sampleK8sYaml);
  }

  handleItemClick(item: AnalysisItem): void {
    this.selectedItem = item;
    this.fixRecommendation = null;
    
    // Only fetch recommendations for items with IDs
    if (item.id) {
      this.isAnalyzing = true;
      this.analyzerService.getFixRecommendation(item.id, this.currentYaml).subscribe({
        next: (recommendation) => {
          // Add the issue ID to the recommendation
          this.fixRecommendation = {
            ...recommendation,
            id: item.id  // Make sure the issue ID is included for feedback
          };
          
          // Store the highlight anchor in a global variable so the YAML editor component can use it
          if (recommendation.highlightAnchor) {
            console.log('Setting global highlight anchor:', recommendation.highlightAnchor);
            (window as any).__highlightAnchor = recommendation.highlightAnchor;
          }
        },
        error: (error) => {
          this.toastService.error("Failed to load detailed recommendation");
          this.fixRecommendation = {
            detailedRecommendation: "Could not load detailed recommendation.",
            fixExample: "Example not available.",
            additionalNotes: "Please try again later.",
            id: item.id
          };
        },
        complete: () => {
          this.isAnalyzing = false;
        }
      });
    } else {
      // For items without IDs, show a generic recommendation
      this.fixRecommendation = {
        detailedRecommendation: "This is a general best practice in Kubernetes.",
        fixExample: "# No specific code example available for this item",
        additionalNotes: "Refer to Kubernetes documentation for more information.",
        id: 'general'
      };
    }
  }

  clearSelectedItem(): void {
    this.selectedItem = null;
    this.fixRecommendation = null;
    // Clear the highlight anchor when going back to the list
    (window as any).__highlightAnchor = null;
  }
  
  applyFix(): void {
    if (!this.selectedItem || !this.fixRecommendation) {
      return;
    }
    
    // Get the fix from the analyzer service
    this.isAnalyzing = true;
    this.analyzerService.applyFixToYaml(this.selectedItem.id!, this.currentYaml).subscribe({
      next: (updatedYaml) => {
        // Update the YAML in the editor
        this.currentYaml = updatedYaml;
        
        // Show success message
        this.toastService.success("Fix applied successfully!");
        
        // Re-analyze the updated YAML
        this.handleYamlSubmit(updatedYaml);
        
        // Clear the selected item
        this.clearSelectedItem();
      },
      error: (error) => {
        this.toastService.error("Failed to apply fix. Please try manually.");
      },
      complete: () => {
        this.isAnalyzing = false;
      }
    });
  }
  
  fixAllIssues(): void {
    if (!this.result) {
      return;
    }
    
    // Get all items with IDs that can be fixed
    const fixableItems = [
      ...this.result.improvements.filter(item => item.id),
      ...this.result.ok.filter(item => item.id)
    ];
    
    if (fixableItems.length === 0) {
      this.toastService.info("No fixable issues found");
      return;
    }
    
    this.isAnalyzing = true;
    this.analyzerService.applyAllFixes(fixableItems.map(item => item.id!), this.currentYaml).subscribe({
      next: (updatedYaml) => {
        // Update the YAML in the editor
        this.currentYaml = updatedYaml;
        
        // Show success message
        this.toastService.success(`Applied ${fixableItems.length} fixes successfully!`);
        
        // Re-analyze the updated YAML
        this.handleYamlSubmit(updatedYaml);
      },
      error: (error) => {
        this.toastService.error("Failed to apply some fixes. Please try individually.");
      },
      complete: () => {
        this.isAnalyzing = false;
      }
    });
  }
  
  /**
   * Handle feedback from the fix recommendation component
   */
  handleFeedback(event: {issueId: string, feedback: 'helpful' | 'not-helpful'}): void {
    console.log(`Received feedback for issue ${event.issueId}: ${event.feedback}`);
    
    // Show a toast message to acknowledge the feedback
    const message = event.feedback === 'helpful' 
      ? "Thanks for the positive feedback!"
      : "Thanks for your feedback. We'll work to improve this recommendation.";
    
    this.toastService.info(message);
    
    // In a real application, we would send this feedback to a backend API
    // For now, the feedback service handles it in-memory
  }
}