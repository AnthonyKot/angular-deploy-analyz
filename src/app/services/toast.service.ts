import { Injectable } from '@angular/core';

export interface ToastOptions {
  title?: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts: ToastOptions[] = [];

  constructor() { }

  show(options: ToastOptions): void {
    const toast = {
      ...options,
      duration: options.duration || 5000
    };
    
    this.toasts.push(toast);
    
    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t !== toast);
    }, toast.duration);
  }

  success(message: string, title?: string): void {
    this.show({
      title,
      message,
      type: 'success'
    });
  }

  error(message: string, title?: string): void {
    this.show({
      title,
      message,
      type: 'error'
    });
  }

  info(message: string, title?: string): void {
    this.show({
      title,
      message,
      type: 'info'
    });
  }

  warning(message: string, title?: string): void {
    this.show({
      title,
      message,
      type: 'warning'
    });
  }
}