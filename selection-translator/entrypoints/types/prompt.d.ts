// Prompt APIの型定義

// ===== Core Types =====
export declare global {
  // Role types for chat completions
  type LanguageModelRole = 'system' | 'user' | 'assistant';

  // Availability status
  type LanguageModelAvailability = 'unavailable' | 'downloadable' | 'downloading' | 'available';

  // ===== Content Types =====
  interface LanguageModelTextContent {
    type: 'text';
    value: string;
  }

  interface LanguageModelImageContent {
    type: 'image';
    value: Blob | File;
  }

  type LanguageModelContent = LanguageModelTextContent | LanguageModelImageContent;

  // ===== Prompt Types =====
  interface LanguageModelPrompt {
    role: LanguageModelRole;
    content: string | LanguageModelContent[];
  }

  // ===== Expected Input/Output Types =====
  interface LanguageModelExpectedInput {
    type: 'text' | 'image';
  }

  interface LanguageModelExpectedOutput {
    type: 'text';
    language?: string;
  }

  // ===== Parameters =====
  interface LanguageModelParams {
    defaultTemperature: number;
    defaultTopK: number;
    maxTopK: number;
  }

  // ===== Session Creation Options =====
  interface LanguageModelCreateOptions {
    signal?: AbortSignal;
    monitor?: (monitor: LanguageModelMonitor) => void;
    initialPrompts?: LanguageModelPrompt[];
    temperature?: number;
    topK?: number;
    expectedInputs?: LanguageModelExpectedInput[];
    expectedOutputs?: LanguageModelExpectedOutput[];
  }

  // ===== Prompt Options =====
  interface LanguageModelPromptOptions {
    signal?: AbortSignal;
  }

  // ===== Monitor Interface =====
  interface LanguageModelMonitor {
    addEventListener(type: 'downloadprogress', listener: (event: ProgressEvent) => void): void;
    removeEventListener(type: 'downloadprogress', listener: (event: ProgressEvent) => void): void;
  }

  // ===== Session Interface =====
  interface LanguageModelSession extends EventTarget {
    // Properties
    readonly inputUsage: number;
    readonly inputQuota: number;

    // Methods
    prompt(input: string | LanguageModelPrompt[], options?: LanguageModelPromptOptions): Promise<string>;
    promptStreaming(input: string | LanguageModelPrompt[], options?: LanguageModelPromptOptions): AsyncIterable<string>;
    append(prompts: LanguageModelPrompt[]): Promise<void>;
    destroy(): void;

    // Events
    addEventListener(type: 'quotaoverflow', listener: (event: Event) => void): void;
    removeEventListener(type: 'quotaoverflow', listener: (event: Event) => void): void;
  }

  // ===== Main LanguageModel Class =====
  class LanguageModel {
    static create(options?: LanguageModelCreateOptions): Promise<LanguageModelSession>;
    static availability(options?: LanguageModelCreateOptions): Promise<LanguageModelAvailability>;
    static params(): Promise<LanguageModelParams | null>;
  }

  // ===== Window AI Interface =====
  interface WindowAI {
    languageModel: typeof LanguageModel;
  }

  interface Window {
    ai?: WindowAI;
  }
}