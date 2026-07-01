import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Spinner } from '@/components/ui/Spinner';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

interface PDFCoverProps {
  url: string;
}

export function PDFCover({ url }: PDFCoverProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0', color: '#999' }}>
        Failed to load PDF
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
      <Document
        file={url}
        onLoadSuccess={() => setLoading(false)}
        onLoadError={(err) => {
          console.error("PDF preview error:", err);
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
    </div>
  );
}
