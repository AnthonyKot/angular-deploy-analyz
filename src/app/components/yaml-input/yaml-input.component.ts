import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MonacoEditorModule, NGX_MONACO_EDITOR_CONFIG } from 'ngx-monaco-editor-v2';

// Define a type for the Monaco editor that will be available globally
declare const monaco: any;

@Component({
  selector: 'app-yaml-input',
  standalone: true,
  imports: [FormsModule, CommonModule, MonacoEditorModule],
  template: `
    <div class="bg-white rounded-lg border shadow-sm overflow-hidden">
      <div class="p-4 border-b">
        <h3 class="text-lg font-medium">Kubernetes YAML</h3>
        <p class="text-sm text-muted-foreground mt-1">
          Paste your Kubernetes deployment YAML file below to analyze it.
        </p>
      </div>
      <div class="p-0 w-full" style="height: 20rem; overflow: hidden;">
        <ngx-monaco-editor
          style="height: 100%; width: 100%; min-height: 20rem; display: block;"
          [options]="editorOptions"
          [(ngModel)]="yaml"
          (onInit)="onEditorInit($event)"
        ></ngx-monaco-editor>
      </div>
      <div class="p-4 border-t flex items-center justify-end space-x-2">
        <button
          type="button"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
          [disabled]="isAnalyzing || !yaml.trim()"
          (click)="submitYaml()"
        >
          {{ isAnalyzing ? 'Analyzing...' : 'Analyze' }}
        </button>
      </div>
    </div>
  `,
  styles: [],
  providers: []
})
export class YamlInputComponent implements OnChanges, OnInit, OnDestroy {
  @Input() isAnalyzing = false;
  @Input() yamlContent: string = '';
  @Input() selectedIssueId: string | null = null;
  @Output() yamlSubmit = new EventEmitter<string>();

  yaml: string = '';
  editor: any = null;
  decorations: string[] = [];
  
  editorOptions = {
    theme: 'vs',
    language: 'yaml',
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    wordWrap: 'on',             // Enable word wrapping
    wrappingIndent: 'same',     // Keep indentation when wrapping
    fontSize: 14,
    fontFamily: 'Menlo, Monaco, "Courier New", monospace',
    lineNumbers: 'on',
    roundedSelection: false,
    renderLineHighlight: 'line',
    readOnly: false,
    scrollbar: {
      horizontal: 'hidden',     // Hide horizontal scrollbar
      horizontalScrollbarSize: 0
    }
  };

  ngOnInit(): void {
    this.yaml = this.yamlContent || '';
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    // Update the YAML in the editor when the input yamlContent changes
    if (changes['yamlContent'] && changes['yamlContent'].currentValue) {
      this.yaml = changes['yamlContent'].currentValue;
    }
    
    // Handle issue highlighting - log changes for debugging
    if (changes['selectedIssueId']) {
      console.log('selectedIssueId changed:', 
        changes['selectedIssueId'].previousValue, 
        '→', 
        changes['selectedIssueId'].currentValue
      );
      
      // Only highlight if we have an editor instance
      if (this.editor) {
        // Add a small delay to allow the editor to update
        setTimeout(() => this.highlightIssueInEditor(), 300);
      } else {
        console.warn('Editor not yet available for highlighting');
      }
    }
  }

  ngOnDestroy(): void {
    this.editor = null;
  }

  onEditorInit(editorInstance: any): void {
    this.editor = editorInstance;
    
    // Apply highlighting if there's a selected issue
    if (this.selectedIssueId) {
      this.highlightIssueInEditor();
    }
  }

  submitYaml(): void {
    if (this.yaml.trim()) {
      this.yamlSubmit.emit(this.yaml);
    }
  }

  private highlightIssueInEditor(): void {
    console.log('Attempting to highlight issue:', this.selectedIssueId);
    
    if (!this.editor) {
      console.warn('Editor not initialized yet');
      return;
    }
    
    // Clear previous decorations
    this.decorations = this.editor.deltaDecorations(this.decorations, []);
    
    if (!this.selectedIssueId) {
      console.warn('No selected issue ID');
      return;
    }
    
    // Wait for monaco to be available
    setTimeout(() => {
      const monaco = (window as any).monaco;
      if (!monaco) {
        console.error('Monaco is not available yet');
        return;
      }
      
      console.log('Monaco available, continuing with highlighting');
      
      // Get the highlight anchor from the fixRecommendation
      let highlightAnchor: string | null = null;
      try {
        // Try to get the anchor from the parent component
        const itemElement = document.querySelector('.selected-issue-anchor');
        if (itemElement) {
          highlightAnchor = itemElement.getAttribute('data-anchor');
          console.log('Found highlight anchor in DOM:', highlightAnchor);
        }
      } catch (e) {
        console.error('Error finding highlight anchor:', e);
      }
      
      // Fallback if no anchor is found
      if (!highlightAnchor) {
        // Default anchors if none is provided
        const defaultAnchors: { [key: string]: string } = {
          'missing-resource-limits': 'containers:',
          'missing-network-policy': 'kind: Deployment',
          'missing-liveness-probe': 'containers:',
          'missing-readiness-probe': 'containers:',
          'using-latest-tag': 'image:',
          'missing-pod-anti-affinity': 'spec:',
          'missing-security-context': 'containers:'
        };
        
        highlightAnchor = defaultAnchors[this.selectedIssueId] || 'spec:';
        console.log('Using default anchor:', highlightAnchor);
      }
      
      const model = this.editor.getModel();
      if (!model) {
        console.warn('Editor model not available');
        return;
      }
      
      const text = model.getValue();
      console.log('YAML length:', text.length, 'characters');
      
      try {
        // Escape special regex characters in the anchor
        const escapedAnchor = highlightAnchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedAnchor, 'i'); // Case insensitive
        const match = regex.exec(text);
        
        if (match) {
          console.log('Anchor matched at position:', match.index);
          
          const startPosition = model.getPositionAt(match.index);
          console.log('Start position:', startPosition);
          
          // Highlight more lines for better visibility (context)
          const endLineNumber = Math.min(startPosition.lineNumber + 10, model.getLineCount());
          
          // Create the range object with more explicit error handling
          try {
            const range = new monaco.Range(
              startPosition.lineNumber,
              1,
              endLineNumber,
              model.getLineMaxColumn(endLineNumber)
            );
            
            console.log('Created range:', range);
            
            // Apply the decoration with bright highlighting
            this.decorations = this.editor.deltaDecorations([], [
              {
                range: range,
                options: {
                  isWholeLine: true,
                  className: 'bg-yellow-100',
                  inlineClassName: 'highlighted-line',
                  linesDecorationsClassName: 'highlighted-gutter',
                  marginClassName: 'highlighted-margin',
                  hoverMessage: { value: `Issue: ${this.selectedIssueId}` }
                }
              }
            ]);
            
            console.log('Applied decorations:', this.decorations);
            
            // Scroll to the highlighted section with some margin
            this.editor.revealLineInCenter(startPosition.lineNumber);
          } catch (rangeError) {
            console.error('Error creating range:', rangeError);
          }
        } else {
          console.warn('Anchor not found in YAML:', highlightAnchor);
          
          // Fallback: just highlight first few lines of containers/spec section
          const containerMatch = /containers:|spec:/i.exec(text);
          if (containerMatch) {
            console.log('Falling back to general section match');
            const containerPos = model.getPositionAt(containerMatch.index);
            const endLine = Math.min(containerPos.lineNumber + 10, model.getLineCount());
            
            this.decorations = this.editor.deltaDecorations([], [
              {
                range: new monaco.Range(
                  containerPos.lineNumber,
                  1,
                  endLine,
                  model.getLineMaxColumn(endLine)
                ),
                options: {
                  isWholeLine: true,
                  className: 'bg-yellow-100',
                  hoverMessage: { value: `Issue location: general area` }
                }
              }
            ]);
            
            this.editor.revealLineInCenter(containerPos.lineNumber);
          }
        }
      } catch (regexError) {
        console.error('Regex error:', regexError);
      }
    }, 300); // Longer delay to ensure monaco is available
  }
}