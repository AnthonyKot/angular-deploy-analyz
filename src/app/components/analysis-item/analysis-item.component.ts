import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisItem } from '../../models/analysis.model';
import { SeverityBadgeComponent } from '../severity-badge/severity-badge.component';
import { CategoryBadgeComponent } from '../category-badge/category-badge.component';

@Component({
  selector: 'app-analysis-item',
  standalone: true,
  imports: [CommonModule, SeverityBadgeComponent, CategoryBadgeComponent],
  template: `
    <div class="bg-white rounded-lg border border-border/60 shadow-sm p-4 transition-all hover:shadow-md cursor-pointer"
         [ngClass]="{'animate-slide-up': true}"
         [ngStyle]="style"
         (click)="itemClicked.emit(item)">
      <div class="flex items-start gap-3">
        <div [ngClass]="{
          'status-icon-success': item.type === 'success',
          'status-icon-warning': item.type === 'warning',
          'status-icon-danger': item.type === 'danger'
        }">
          <span class="h-3.5 w-3.5 flex items-center justify-center">
            <ng-container [ngSwitch]="item.type">
              <ng-container *ngSwitchCase="'success'">✓</ng-container>
              <ng-container *ngSwitchCase="'warning'">i</ng-container>
              <ng-container *ngSwitchCase="'danger'">!</ng-container>
            </ng-container>
          </span>
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <h3 class="font-medium">{{ item.title }}</h3>
            <app-severity-badge *ngIf="item.severity" [severity]="item.severity"></app-severity-badge>
            <app-category-badge *ngIf="item.category" [category]="item.category"></app-category-badge>
          </div>
          <p class="mt-1 text-sm text-gray-600" *ngIf="item.details">
            {{ item.details }}
          </p>
          <p class="mt-2 text-sm text-blue-600" *ngIf="item.recommendation">
            <strong>Recommendation:</strong> {{ item.recommendation }}
          </p>
          <div class="mt-2 text-xs text-gray-500">
            Click for detailed recommendation and fix example
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AnalysisItemComponent {
  @Input() item!: AnalysisItem;
  @Input() style: { [klass: string]: any } = {};
  @Output() itemClicked = new EventEmitter<AnalysisItem>();
}