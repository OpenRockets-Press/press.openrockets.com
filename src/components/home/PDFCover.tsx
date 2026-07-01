import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Spinner } from '@/components/ui/Spinner';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFCoverProps {
  url: string;
}

export function PDFCover({ url }: PDFCoverProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);

  useEffect(() => {
    let active = true;
    
    // Silence pdf.js warnings about invalid characters to keep console clean
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes('getHexString - ignoring')) return;
      originalWarn(...args);
    };

    fetch(url)
      .then(async res => {
        if (!active) return;
        if (!res.ok) throw new Error('Failed to fetch PDF');
        
        const contentType = res.headers.get('content-type');
        if (contentType && !contentType.includes('pdf') && !contentType.includes('octet-stream')) {
           throw new Error('Not a PDF file');
        }

        const buffer = await res.arrayBuffer();
        
        const arr = new Uint8Array(buffer.slice(0, 5));
        const magic = String.fromCharCode(...arr);
        if (magic !== '%PDF-') {
           throw new Error('Invalid PDF format');
        }

        setPdfData(buffer);
      })
      .catch(err => {
        if (!active) return;
        setError(true);
        setLoading(false);
      })
      .finally(() => {
        console.warn = originalWarn;
      });

    return () => { 
      active = false; 
      console.warn = originalWarn;
    };
  }, [url]);

  if (error) {
    return (
      <div style={{ width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#f0f0f0' }}>
        <img src="/brand/imagifact.png" alt="Artifact Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0' }}>
      {loading && (
        <div style={{ position: 'absolute', zIndex: 1 }}>
          <Spinner />
        </div>
      )}
      {pdfData && (
        <Document
          file={{ data: pdfData }}
          onLoadSuccess={() => setLoading(false)}
          onLoadError={(err) => {
            setError(true);
            setLoading(false);
          }}
          loading={null}
        >
          <Page 
            pageNumber={1} 
            width={400} 
            renderTextLayer={false} 
            renderAnnotationLayer={false}
            loading={null}
          />
        </Document>
      )}
    </div>
  );
}
