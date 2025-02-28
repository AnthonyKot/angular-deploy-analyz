import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryType } from '../../models/analysis.model';

@Component({
  selector: 'app-category-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
          [ngClass]="{
            'bg-purple-100 text-purple-800': category === 'security',
            'bg-green-100 text-green-800': category === 'reliability',
            'bg-blue-100 text-blue-800': category === 'performance',
            'bg-indigo-100 text-indigo-800': category === 'scalability',
            'bg-cyan-100 text-cyan-800': category === 'cost'
          }">
      {{ category | titlecase }}
    </span>
  `,
  styles: []
})
export class CategoryBadgeComponent {
  @Input() category: CategoryType = 'reliability';
}