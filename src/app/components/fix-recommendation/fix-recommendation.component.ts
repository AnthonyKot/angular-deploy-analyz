import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedbackService } from '../../services/feedback.service';

@Component({
  selector: 'app-fix-recommendation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-lg border shadow-sm overflow-hidden animate-fade-in">
      <div class="p-4 border-b bg-gray-50">
        <h3 class="text-lg font-medium">Detailed Recommendation</h3>
      </div>
      
      <div class="p-4">
        <h4 class="font-medium text-gray-900 mb-2">Why This Matters</h4>
        <p class="text-gray-700 mb-4">{{ recommendation.detailedRecommendation }}</p>
        
        <h4 class="font-medium text-gray-900 mb-2">Implementation Example</h4>
        <pre class="bg-gray-50 p-3 rounded-md text-sm font-mono overflow-x-auto mb-4">{{ recommendation.fixExample }}</pre>
        
        <h4 class="font-medium text-gray-900 mb-2">Additional Notes</h4>
        <p class="text-gray-700 mb-4">{{ recommendation.additionalNotes }}</p>
        
        <!-- Feedback Section -->
        <div class="mt-6 border-t pt-4">
          <h4 class="font-medium text-gray-900 mb-2">Was this recommendation helpful?</h4>
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="px-3 py-1.5 rounded-md border flex items-center gap-1.5 transition-colors"
              [class.border-green-500]="feedbackValue === 'helpful'"
              [class.bg-green-50]="feedbackValue === 'helpful'"
              [class.text-green-700]="feedbackValue === 'helpful'"
              [class.border-gray-200]="feedbackValue !== 'helpful'"
              [class.hover:bg-gray-50]="feedbackValue !== 'helpful'"
              (click)="submitFeedback('helpful')"
              [disabled]="isFeedbackSubmitted"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              Helpful
            </button>
            <button
              type="button"
              class="px-3 py-1.5 rounded-md border flex items-center gap-1.5 transition-colors"
              [class.border-red-500]="feedbackValue === 'not-helpful'"
              [class.bg-red-50]="feedbackValue === 'not-helpful'"
              [class.text-red-700]="feedbackValue === 'not-helpful'"
              [class.border-gray-200]="feedbackValue !== 'not-helpful'"
              [class.hover:bg-gray-50]="feedbackValue !== 'not-helpful'"
              (click)="submitFeedback('not-helpful')"
              [disabled]="isFeedbackSubmitted"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
              </svg>
              Not Helpful
            </button>
          </div>
          <div *ngIf="isFeedbackSubmitted" class="mt-2 text-sm text-gray-600">
            Thanks for your feedback! It helps us improve our recommendations.
          </div>
        </div>
        
        <div class="mt-6 flex justify-end">
          <button
            *ngIf="recommendation.canApplyFix !== false"
            type="button"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none flex items-center gap-2"
            (click)="applyFix()"
            [disabled]="isApplying"
          >
            <svg *ngIf="isApplying" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isApplying ? 'Applying Fix...' : 'Apply Fix' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class FixRecommendationComponent {
  @Input() recommendation: any = {
    detailedRecommendation: '',
    fixExample: '',
    additionalNotes: '',
    canApplyFix: true,
    id: ''
  };
  @Output() applyFixClicked = new EventEmitter<void>();
  @Output() feedbackSubmitted = new EventEmitter<{issueId: string, feedback: 'helpful' | 'not-helpful'}>();
  
  isApplying = false;
  feedbackValue: 'helpful' | 'not-helpful' | null = null;
  isFeedbackSubmitted = false;
  
  constructor(private feedbackService: FeedbackService) {}
  
  applyFix(): void {
    this.isApplying = true;
    this.applyFixClicked.emit();
    
    // Reset the applying state after a short delay to provide visual feedback
    setTimeout(() => {
      this.isApplying = false;
    }, 1000);
  }
  
  submitFeedback(value: 'helpful' | 'not-helpful'): void {
    if (this.isFeedbackSubmitted) {
      return;
    }
    
    this.feedbackValue = value;
    this.isFeedbackSubmitted = true;
    
    // Emit the feedback event
    this.feedbackSubmitted.emit({
      issueId: this.recommendation.id || 'unknown',
      feedback: value
    });
    
    // Send the feedback to the service
    if (this.recommendation.id) {
      this.feedbackService.submitFeedback(
        this.recommendation.id,
        value
      ).subscribe();
    }
  }
}