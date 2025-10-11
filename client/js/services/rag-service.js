/**
 * RAG streaming via backend Python
 * Exposé : window.ragService
 */
(function() {
  const RAG_URL = '/backend-api/v2/conversation';

  class RagService {
    async streamQuestion(question, onChunk, onComplete, onError) {
      const payload = {
        meta: {
          content: {
            parts: [{ content: question }]
          }
        }
      };

      try {
        const response = await fetch(RAG_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            onComplete();
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop();

          for (const line of lines) {
            if (line.trim()) {
              onChunk(line);
            }
          }
        }
      } catch (error) {
        console.error('RAG error:', error);
        onError(error);
      }
    }
  }

  window.ragService = new RagService();
  console.log('✅ RagService loaded');
})();
