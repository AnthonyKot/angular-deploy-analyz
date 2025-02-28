import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  // Store the feedback for different issues
  private feedbackStore: Map<string, {helpful: number, notHelpful: number}> = new Map();

  constructor(private toastService: ToastService) {}

  /**
   * Submit feedback for a specific issue
   * @param issueId The ID of the issue
   * @param feedback The feedback value ('helpful' or 'not-helpful')
   */
  submitFeedback(
    issueId: string, 
    feedback: 'helpful' | 'not-helpful'
  ): Observable<boolean> {
    // In a real application, this would be an API call to store the feedback
    console.log(`Feedback submitted for issue ${issueId}: ${feedback}`);
    
    // Store the feedback in our local store for demo purposes
    const currentFeedback = this.feedbackStore.get(issueId) || { helpful: 0, notHelpful: 0 };
    
    if (feedback === 'helpful') {
      currentFeedback.helpful++;
    } else {
      currentFeedback.notHelpful++;
    }
    
    this.feedbackStore.set(issueId, currentFeedback);
    
    // Log the current feedback stats for this issue
    console.log(`Current feedback for ${issueId}:`, currentFeedback);
    
    // Simulate an API delay
    return of(true).pipe(delay(500));
  }

  /**
   * Get the feedback statistics for a specific issue
   * @param issueId The ID of the issue
   */
  getFeedbackStats(issueId: string): Observable<{helpful: number, notHelpful: number}> {
    // Return the feedback statistics for this issue
    const stats = this.feedbackStore.get(issueId) || { helpful: 0, notHelpful: 0 };
    
    // Simulate an API delay
    return of(stats).pipe(delay(300));
  }

  /**
   * Get the feedback statistics for all issues
   */
  getAllFeedbackStats(): Observable<{[issueId: string]: {helpful: number, notHelpful: number}}> {
    // Convert the Map to an object
    const statsObject: {[issueId: string]: {helpful: number, notHelpful: number}} = {};
    
    this.feedbackStore.forEach((value, key) => {
      statsObject[key] = value;
    });
    
    // Simulate an API delay
    return of(statsObject).pipe(delay(500));
  }
}