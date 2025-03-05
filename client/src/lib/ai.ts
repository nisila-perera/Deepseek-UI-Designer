import { type StylePreferences } from "@shared/schema";

interface StreamCallback {
  onReasoning?: (content: string) => void;
  onCode?: (content: string) => void;
  onError?: (error: string) => void;
}

export async function generateDesign(
  prompt: string, 
  negativePrompt: string,
  styles: StylePreferences,
  callbacks: StreamCallback
): Promise<void> {
  const response = await fetch('/api/design/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, negativePrompt, styles })
  });

  if (!response.ok) {
    const error = await response.text();
    callbacks.onError?.(error || 'Failed to generate design');
    return;
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    callbacks.onError?.('Failed to initialize stream reader');
    return;
  }

  let buffer = '';
  let currentJson = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() && line.startsWith('data: ')) {
          try {
            currentJson = '';
            const data = JSON.parse(line.slice(5));

            switch (data.type) {
              case 'reasoning':
                callbacks.onReasoning?.(data.content);
                break;
              case 'code':
                // Clean the code to ensure it starts with <!DOCTYPE html>
                const cleanCode = data.content
                  .replace(/^```html\s*/, '')
                  .replace(/```\s*$/, '')
                  .replace(/^.*?<!DOCTYPE html>/i, '<!DOCTYPE html>')
                  .trim();
                callbacks.onCode?.(cleanCode);
                break;
              case 'error':
                callbacks.onError?.(data.content);
                break;
            }
          } catch (e) {
            // If we have a partial JSON string, append it
            if (e instanceof SyntaxError) {
              currentJson += line.slice(5);
              try {
                const data = JSON.parse(currentJson);
                processStreamData(data, callbacks);
              } catch {
                // Still not complete JSON, continue accumulating
              }
            } else {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    }
  } catch (error) {
    callbacks.onError?.('Failed to process design stream');
  }
}

function processStreamData(data: any, callbacks: StreamCallback) {
  switch (data.type) {
    case 'reasoning':
      callbacks.onReasoning?.(data.content);
      break;
    case 'code':
      const cleanCode = data.content
        .replace(/^```html\s*/, '')
        .replace(/```\s*$/, '')
        .replace(/^.*?<!DOCTYPE html>/i, '<!DOCTYPE html>')
        .trim();
      callbacks.onCode?.(cleanCode);
      break;
    case 'error':
      callbacks.onError?.(data.content);
      break;
  }
}