import { Injectable } from '@angular/core';
import { NGX_MONACO_EDITOR_CONFIG, NgxMonacoEditorConfig } from 'ngx-monaco-editor-v2';

export function monacoEditorConfigFactory(): NgxMonacoEditorConfig {
  return {
    baseUrl: 'assets/monaco', // configure base path for monaco editor (if not set, it will use the relative path to the app root)
    defaultOptions: { 
      scrollBeyondLastLine: false,
      automaticLayout: true,
    },
    onMonacoLoad: () => {
      console.log('Monaco editor loaded!');
      
      // Register yaml language if not already available
      const monaco = (window as any).monaco;
      if (!monaco.languages.getLanguages().some((lang: any) => lang.id === 'yaml')) {
        monaco.languages.register({ id: 'yaml' });
      }
    }
  };
}

@Injectable({
  providedIn: 'root'
})
export class MonacoConfigService {
  constructor() {}
}