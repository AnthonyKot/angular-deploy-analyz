import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { MonacoEditorModule, NGX_MONACO_EDITOR_CONFIG } from 'ngx-monaco-editor-v2';
import { monacoEditorConfigFactory } from './monaco-config/monaco-config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(),
    { 
      provide: NGX_MONACO_EDITOR_CONFIG, 
      useFactory: monacoEditorConfigFactory 
    },
    importProvidersFrom(MonacoEditorModule.forRoot())
  ]
};