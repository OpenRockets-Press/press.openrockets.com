import React, { useRef, useState, useEffect } from 'react';
import type { WizardState } from './PublishWizard';

interface Props {
  state: WizardState;
  setState: React.Dispatch<React.SetStateAction<WizardState>>;
}

export const Step1Upload: React.FC<Props> = ({ state, setState }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [typewriterText, setTypewriterText] = useState('Upload a photograph...');
  const [textIndex, setTextIndex] = useState(0);

  const texts = [
    'Upload a photograph...',
    'Upload a PDF...',
    'Upload a Word document...',
    'Upload your artifact...'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % texts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [texts.length]);

  useEffect(() => {
    setTypewriterText(texts[textIndex]);
  }, [textIndex]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const processFiles = (newFiles: File[]) => {
    const validFiles = newFiles.slice(0, 5); // Limit to 5
    setState(s => ({ ...s, files: validFiles, processedFiles: [] }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  return (
    <div>
      <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>Select Files (Max 5, 10MB per file)</h3>
      <div 
        className={`dropzone ${isDragActive ? 'active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <p>{typewriterText}</p>
        <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '1rem' }}>
          Drag & drop here, or click to browse.
        </p>
      </div>
      <input 
        type="file" 
        multiple 
        ref={fileInputRef}
        style={{ display: 'none' }} 
        onChange={handleFileChange} 
      />
      
      {state.files.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h4 style={{ fontWeight: 600 }}>Selected Files:</h4>
          <ul style={{ marginTop: '0.5rem', listStyleType: 'none', padding: 0 }}>
            {state.files.map((file, i) => (
              <li key={i} style={{ padding: '0.5rem', border: '1px solid #ccc', marginBottom: '0.5rem', borderRadius: '4px' }}>
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
