import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 w-80 max-w-full space-y-2">
      <div 
        *ngFor="let toast of toastService.toasts"
        class="bg-white border rounded-md shadow-lg overflow-hidden animate-fade-in"
        [ngClass]="{
          'border-green-500': toast.type === 'success',
          'border-red-500': toast.type === 'error',
          'border-blue-500': toast.type === 'info',
          'border-yellow-500': toast.type === 'warning'
        }"
      >
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0" [ngSwitch]="toast.type">
              <div *ngSwitchCase="'success'" class="status-icon-success">✓</div>
              <div *ngSwitchCase="'error'" class="status-icon-danger">✗</div>
              <div *ngSwitchCase="'info'" class="text-blue-500">i</div>
              <div *ngSwitchCase="'warning'" class="status-icon-warning">!</div>
            </div>
            <div class="ml-3 w-0 flex-1">
              <p *ngIf="toast.title" class="text-sm font-medium text-gray-900">
                {{ toast.title }}
              </p>
              <p class="text-sm text-gray-500">{{ toast.message }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}