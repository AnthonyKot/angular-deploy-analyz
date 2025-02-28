import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedbackService } from '../../services/feedback.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 pb-10">
      <div class="w-full max-w-screen-lg mx-auto px-4 sm:px-6 pt-8">
        <header class="mb-8">
          <h1 class="text-3xl font-semibold tracking-tight">Admin Dashboard</h1>
          <p class="text-gray-600 mt-2">View feedback statistics for recommendations</p>
        </header>
        
        <div class="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div class="p-4 border-b">
            <h2 class="text-xl font-medium">Recommendation Feedback</h2>
          </div>
          
          <div class="divide-y">
            <div *ngIf="!hasAnyFeedback" class="p-8 text-center text-gray-500">
              No feedback has been submitted yet.
            </div>

            <div *ngFor="let item of feedbackItems" class="p-4">
              <div class="flex justify-between items-start mb-2">
                <h3 class="font-medium text-gray-900">{{ getIssueTitleById(item.issueId) }}</h3>
                <div class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                  ID: {{ item.issueId }}
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4 mt-4">
                <div class="bg-green-50 p-3 rounded-md">
                  <div class="flex justify-between items-center">
                    <span class="text-green-700 font-medium">Helpful</span>
                    <span class="text-lg font-bold text-green-600">{{ item.stats.helpful }}</span>
                  </div>
                </div>
                <div class="bg-red-50 p-3 rounded-md">
                  <div class="flex justify-between items-center">
                    <span class="text-red-700 font-medium">Not Helpful</span>
                    <span class="text-lg font-bold text-red-600">{{ item.stats.notHelpful }}</span>
                  </div>
                </div>
              </div>
              
              <div class="mt-4">
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    class="bg-blue-600 h-2.5 rounded-full" 
                    [style.width]="getHelpfulPercentage(item.stats) + '%'"
                  ></div>
                </div>
                <div class="flex justify-between mt-1 text-xs text-gray-500">
                  <span>0%</span>
                  <span>Helpful: {{ getHelpfulPercentage(item.stats) }}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AdminComponent implements OnInit {
  feedbackItems: { issueId: string, stats: { helpful: number, notHelpful: number } }[] = [];
  hasAnyFeedback = false;
  
  // Map of issue IDs to titles for display purposes
  private issueTitles: Record<string, string> = {
    'missing-resource-limits': 'Missing Resource Limits',
    'missing-network-policy': 'Missing Network Policy',
    'missing-liveness-probe': 'Missing Liveness Probe',
    'missing-readiness-probe': 'Missing Readiness Probe',
    'using-latest-tag': 'Using Latest Tag',
    'missing-pod-anti-affinity': 'Missing Pod Anti-Affinity',
    'missing-security-context': 'Missing Security Context',
    'general': 'General Recommendation'
  };
  
  constructor(private feedbackService: FeedbackService) {}
  
  ngOnInit(): void {
    // Load feedback statistics
    this.loadFeedbackStats();
  }
  
  loadFeedbackStats(): void {
    this.feedbackService.getAllFeedbackStats().subscribe(stats => {
      this.feedbackItems = Object.entries(stats).map(([issueId, values]) => ({
        issueId,
        stats: values
      }));
      
      this.hasAnyFeedback = this.feedbackItems.length > 0;
    });
  }
  
  getIssueTitleById(issueId: string): string {
    return this.issueTitles[issueId] || `Issue ${issueId}`;
  }
  
  getHelpfulPercentage(stats: { helpful: number, notHelpful: number }): number {
    const total = stats.helpful + stats.notHelpful;
    if (total === 0) return 0;
    
    return Math.round((stats.helpful / total) * 100);
  }
}