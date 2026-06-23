import { useState } from "react";
import { Copy, CheckCircle, ExternalLink, Code } from "lucide-react";
import type { Publication } from "@shared/types";

interface SharePanelProps {
  publication: Publication;
}

export function SharePanel({ publication }: SharePanelProps) {
  const [copied, setCopied] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);
  
  // Note: In development, window.location.origin might be localhost. 
  // We use the current window location to generate the share URL.
  const url = typeof window !== 'undefined' ? `${window.location.origin}/p/${publication.id}` : `https://press.openrockets.com/p/${publication.id}`;
  const embedUrl = typeof window !== 'undefined' ? `${window.location.origin}/embed/artifact/${publication.id}` : `https://press.openrockets.com/embed/artifact/${publication.id}`;
  
  const title = encodeURIComponent(publication.title);
  const text = encodeURIComponent(`Check out "${publication.title}" on Open Rockets Press!`);
  const encodedUrl = encodeURIComponent(url);

  const embedCode = `<iframe src="${embedUrl}" width="100%" height="600" style="border:1px solid #E1D9C5; border-radius:12px;" allowfullscreen></iframe>`;

  const copyToClipboard = async (textToCopy: string, isEmbed: boolean = false) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      if (isEmbed) {
        setEmbedCopied(true);
        setTimeout(() => setEmbedCopied(false), 2000);
      } else {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const socialLinks = [
    {
      name: "X (Twitter)",
      href: `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`,
      color: "bg-ink text-surface-0 hover:bg-ink-light"
    },
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: "bg-[#0A66C2] text-white hover:bg-[#004182]"
    },
    {
      name: "WhatsApp",
      href: `https://api.whatsapp.com/send?text=${text} ${encodedUrl}`,
      color: "bg-[#25D366] text-white hover:bg-[#128C7E]"
    },
    {
      name: "Bluesky",
      href: `https://bsky.app/intent/compose?text=${text} ${encodedUrl}`,
      color: "bg-[#0085ff] text-white hover:bg-[#006bd6]"
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      
      {/* Quick Copy */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold uppercase tracking-wider text-ink-light">Copy Link</label>
        <div className="flex items-center gap-2">
          <input 
            type="text" 
            readOnly 
            value={url} 
            className="flex-1 p-3 bg-surface-1 border border-cream-border rounded-lg text-sm font-mono text-ink-light focus:outline-none"
            onClick={(e) => e.currentTarget.select()}
          />
          <button 
            onClick={() => copyToClipboard(url)}
            className="shrink-0 flex items-center justify-center w-12 h-12 bg-gold text-cream rounded-lg hover:bg-gold-light transition-colors"
            title="Copy to clipboard"
          >
            {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
          </button>
        </div>
      </div>

      {/* Social Networks */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold uppercase tracking-wider text-ink-light">Share</label>
        <div className="grid grid-cols-2 gap-3">
          {socialLinks.map(link => (
            <a 
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${link.color}`}
            >
              {link.name} <ExternalLink size={14} className="opacity-50" />
            </a>
          ))}
        </div>
      </div>

      {/* Embed Code */}
      <div className="flex flex-col gap-2 pt-4 border-t border-cream-border">
        <div className="flex justify-between items-center">
          <label className="text-sm font-bold uppercase tracking-wider text-ink-light flex items-center gap-2">
            <Code size={16} /> Embed on your site
          </label>
          <button 
            onClick={() => copyToClipboard(embedCode, true)}
            className="text-xs font-bold text-gold hover:text-gold-light uppercase tracking-wider flex items-center gap-1 transition-colors"
          >
            {embedCopied ? <><CheckCircle size={12} /> Copied</> : <><Copy size={12} /> Copy Code</>}
          </button>
        </div>
        <textarea 
          readOnly 
          value={embedCode} 
          className="w-full p-3 bg-surface-1 border border-cream-border rounded-lg text-xs font-mono text-ink-light h-24 focus:outline-none resize-none"
          onClick={(e) => e.currentTarget.select()}
        />
        <p className="text-xs text-ink-light">
          This will embed a minimal, read-only preview of the artifact suitable for external blogs and portfolios.
        </p>
      </div>

    </div>
  );
}
