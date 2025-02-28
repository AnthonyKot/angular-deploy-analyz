import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScoreBreakdown } from '../../models/analysis.model';

@Component({
  selector: 'app-score-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-lg border shadow-sm p-6 animate-fade-in">
      <div class="text-center mb-6">
        <h3 class="text-xl font-medium mb-1">Kubernetes Best Practices Score</h3>
        <div class="flex justify-center">
          <div class="relative w-36 h-36">
            <svg viewBox="0 0 36 36" class="w-full h-full">
              <!-- Background circle -->
              <path class="stroke-gray-200" stroke-width="3.8" fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <!-- Score progress -->
              <path 
                [ngClass]="getScoreColorClass(score)" 
                stroke-width="3.8" 
                stroke-linecap="round" 
                fill="none"
                [attr.d]="getProgressPath(score)"
              />
            </svg>
            <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center">
              <div class="text-center">
                <div class="text-3xl font-bold">{{ score }}</div>
                <div class="text-xs text-gray-500">/ 100</div>
              </div>
            </div>
          </div>
        </div>
        <p class="text-sm text-gray-500 mt-2">{{ getScoreDescription(score) }}</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
        <div *ngIf="scoreBreakdown" class="text-center p-3 bg-gray-50 rounded-lg">
          <div class="text-xs text-gray-500 uppercase font-semibold">Security</div>
          <div class="text-2xl font-bold" [ngClass]="getCategoryScoreColor(scoreBreakdown.security)">
            {{ scoreBreakdown.security }}
          </div>
        </div>
        <div *ngIf="scoreBreakdown" class="text-center p-3 bg-gray-50 rounded-lg">
          <div class="text-xs text-gray-500 uppercase font-semibold">Reliability</div>
          <div class="text-2xl font-bold" [ngClass]="getCategoryScoreColor(scoreBreakdown.reliability)">
            {{ scoreBreakdown.reliability }}
          </div>
        </div>
        <div *ngIf="scoreBreakdown" class="text-center p-3 bg-gray-50 rounded-lg">
          <div class="text-xs text-gray-500 uppercase font-semibold">Performance</div>
          <div class="text-2xl font-bold" [ngClass]="getCategoryScoreColor(scoreBreakdown.performance)">
            {{ scoreBreakdown.performance }}
          </div>
        </div>
        <div *ngIf="scoreBreakdown" class="text-center p-3 bg-gray-50 rounded-lg">
          <div class="text-xs text-gray-500 uppercase font-semibold">Scalability</div>
          <div class="text-2xl font-bold" [ngClass]="getCategoryScoreColor(scoreBreakdown.scalability)">
            {{ scoreBreakdown.scalability }}
          </div>
        </div>
        <div *ngIf="scoreBreakdown" class="text-center p-3 bg-gray-50 rounded-lg">
          <div class="text-xs text-gray-500 uppercase font-semibold">Cost</div>
          <div class="text-2xl font-bold" [ngClass]="getCategoryScoreColor(scoreBreakdown.cost)">
            {{ scoreBreakdown.cost }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ScoreDisplayComponent {
  @Input() score: number = 0;
  @Input() scoreBreakdown?: ScoreBreakdown;

  getProgressPath(score: number): string {
    const percentage = score / 100;
    const angle = percentage * 360;
    const startAngle = -90;
    const endAngle = startAngle + angle;
    
    const start = this.polarToCartesian(18, 18, 15.9155, startAngle);
    const end = this.polarToCartesian(18, 18, 15.9155, endAngle);
    
    const largeArcFlag = angle <= 180 ? "0" : "1";
    
    return `M ${start.x} ${start.y} A 15.9155 15.9155 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  }

  polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }

  getScoreColorClass(score: number): string {
    if (score >= 80) return 'stroke-green-500';
    if (score >= 60) return 'stroke-yellow-500';
    if (score >= 40) return 'stroke-orange-500';
    return 'stroke-red-500';
  }

  getCategoryScoreColor(score: number): string {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  }

  getScoreDescription(score: number): string {
    if (score >= 90) return 'Excellent! Your configuration follows best practices.';
    if (score >= 80) return 'Good! Some minor improvements possible.';
    if (score >= 70) return 'Decent. Several opportunities for improvement.';
    if (score >= 60) return 'Acceptable. Consider addressing issues soon.';
    if (score >= 50) return 'Needs improvement. Several issues to address.';
    if (score >= 40) return 'Problematic. Important issues need attention.';
    return 'Critical issues detected. Immediate attention recommended.';
  }
}