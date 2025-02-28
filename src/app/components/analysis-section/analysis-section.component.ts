import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-analysis-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="animate-fade-in" [style.animation-delay.ms]="delay">
      <h2 class="text-xl font-semibold tracking-tight mb-4">{{ title }}</h2>
      <div class="space-y-3">
        <ng-content></ng-content>
      </div>
    </section>
  `,
  styles: []
})
export class AnalysisSectionComponent {
  @Input() title = '';
  @Input() delay = 0;
}