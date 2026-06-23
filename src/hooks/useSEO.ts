import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  type?: "website" | "article";
  imagePath?: string;
}

export function useSEO({ title, description, type = "website", imagePath }: SEOProps) {
  useEffect(() => {
    // 1. Update Document Title
    const fullTitle = `${title} | Open Rockets Press`;
    document.title = fullTitle;

    const updateMeta = (name: string, content: string, property = false) => {
      let element = document.querySelector(`meta[${property ? 'property' : 'name'}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        if (property) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    updateMeta('og:title', fullTitle, true);
    updateMeta('og:type', type, true);

    if (description) {
      updateMeta('description', description);
      updateMeta('og:description', description, true);
    }

    if (imagePath) {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://press.openrockets.com';
      updateMeta('og:image', `${origin}${imagePath}`, true);
    }

    return () => {
      document.title = 'Open Rockets Press';
    };
  }, [title, description, type, imagePath]);
}
