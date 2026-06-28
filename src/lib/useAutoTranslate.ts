import { useEffect, useRef } from 'react';
import { translateTextBatch } from './translator';
import { useTranslationContext } from './TranslationContext';

export function useAutoTranslate() {
  const { language, setIsTranslating } = useTranslationContext();
  const originalTextMap = useRef(new Map<Node, string>());
  const isTranslatingRef = useRef(false);

  useEffect(() => {
    const mainContainer = document.querySelector('#translate-root');
    if (!mainContainer) return;

    const runTranslation = async () => {
      if (isTranslatingRef.current) return;
      
      if (language === 'en') {
        // Restore to original english text
        for (const [node, text] of originalTextMap.current.entries()) {
          if (document.contains(node) && node.nodeValue !== text) {
            isTranslatingRef.current = true;
            node.nodeValue = text;
            isTranslatingRef.current = false;
          }
        }
        return;
      }

      isTranslatingRef.current = true;
      setIsTranslating(true);

      const textNodes: Node[] = [];
      const walker = document.createTreeWalker(mainContainer, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => {
          if (!node.nodeValue?.trim()) return NodeFilter.FILTER_REJECT;
          let parent = node.parentElement;
          while (parent && parent !== mainContainer) {
            if (
              parent.classList.contains('notranslate') || 
              parent.getAttribute('translate') === 'no' ||
              parent.tagName === 'SCRIPT' ||
              parent.tagName === 'STYLE' ||
              parent.tagName === 'NOSCRIPT' ||
              parent.tagName === 'CODE'
            ) {
              return NodeFilter.FILTER_REJECT;
            }
            parent = parent.parentElement;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      });

      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (!originalTextMap.current.has(node)) {
          originalTextMap.current.set(node, node.nodeValue || "");
        }
        textNodes.push(node);
      }

      const textsToTranslate: string[] = [];
      textNodes.forEach(node => {
        textsToTranslate.push(originalTextMap.current.get(node) || "");
      });

      if (textsToTranslate.length > 0) {
        try {
          const translatedTexts = await translateTextBatch(textsToTranslate, language);
          if (translatedTexts.length === textNodes.length) {
            textNodes.forEach((node, i) => {
              if (document.contains(node) && node.nodeValue !== translatedTexts[i]) {
                node.nodeValue = translatedTexts[i];
              }
            });
          }
        } catch (e) {
          console.error("AutoTranslate Error:", e);
        }
      }
      
      setIsTranslating(false);
      isTranslatingRef.current = false;
    };

    // Run translation immediately on language change
    runTranslation();

    // Use MutationObserver to catch staggered lazily-loaded content!
    const observer = new MutationObserver((mutations) => {
      if (isTranslatingRef.current || language === 'en') return;
      let shouldRun = false;
      mutations.forEach(m => {
        if (m.addedNodes.length > 0) {
          shouldRun = true;
        }
      });
      if (shouldRun) {
        // Debounce slightly to wait for DOM to settle
        setTimeout(runTranslation, 200);
      }
    });

    observer.observe(mainContainer, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [language, setIsTranslating]);
}
