import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeverityLevel } from '../../models/analysis.model';

@Component({
  selector: 'app-severity-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium" 
          [ngClass]="{
            'bg-red-100 text-red-800': severity === 'critical',
            'bg-orange-100 text-orange-800': severity === 'high',
            'bg-yellow-100 text-yellow-800': severity === 'medium',
            'bg-blue-100 text-blue-800': severity === 'low'
          }">
      {{ severity | titlecase }}
    </span>
  `,
  styles: []
})
export class SeverityBadgeComponent {
  @Input() severity: SeverityLevel = 'medium';
}