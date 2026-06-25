import React, { useState, useEffect } from 'react';
import type { WizardState } from './PublishWizard';
import { Cropper } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import imageCompression from 'browser-image-compression';

interface Props {
  state: WizardState;
  setState: React.Dispatch<React.SetStateAction<WizardState>>;
}

export const Step2Editor: React.FC<Props> = ({ state, setState }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentFileUrl, setCurrentFileUrl] = useState<string | null>(null);
  const [cropper, setCropper] = useState<any>();

  useEffect(() => {
    const processFile = async () => {
      setLoading(true);
      const file = state.files[currentIndex];
      if (!file) return;

      if (file.type.startsWith('image/')) {
        let fileToEdit = file;
        // Compress if over 10MB
        if (file.size > 10 * 1024 * 1024) {
          try {
            fileToEdit = await imageCompression(file, {
              maxSizeMB: 9.9,
              maxWidthOrHeight: 4000,
              useWebWorker: true
            });
          } catch (error) {
            console.error('Compression error:', error);
          }
        }
        setCurrentFileUrl(URL.createObjectURL(fileToEdit));
      } else {
        // Non-image file
        setCurrentFileUrl(null);
      }
      setLoading(false);
    };
    processFile();
  }, [currentIndex, state.files]);

  const handleSaveCrop = () => {
    if (cropper && currentFileUrl) {
      cropper.getCroppedCanvas().toBlob((blob: Blob | null) => {
        if (blob) {
          const newFile = new File([blob], state.files[currentIndex].name, { type: 'image/jpeg' });
          updateProcessedFiles(newFile);
        }
      }, 'image/jpeg');
    } else {
      updateProcessedFiles(state.files[currentIndex]);
    }
  };

  const updateProcessedFiles = (file: File) => {
    const newProcessed = [...state.processedFiles];
    newProcessed[currentIndex] = file;
    setState(s => ({ ...s, processedFiles: newProcessed }));
    if (currentIndex < state.files.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <img src="https://assets-v2.lottiefiles.com/a/fd37a886-9bba-459d-a45d-ad106cd1e882/3Ytsmfmjml.gif" alt="Loading..." />
        <p>Processing artifact...</p>
      </div>
    );
  }

  const file = state.files[currentIndex];
  if (!file) return null;

  const isImage = file.type.startsWith('image/');

  return (
    <div>
      <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>
        Step 2: Edit {file.name} ({currentIndex + 1} of {state.files.length})
      </h3>
      {isImage && currentFileUrl ? (
        <div style={{ width: '100%', height: '400px', backgroundColor: '#f0f0f0' }}>
          <Cropper
            src={currentFileUrl}
            style={{ height: '100%', width: '100%' }}
            initialAspectRatio={1}
            guides={true}
            onInitialized={(instance: any) => setCropper(instance)}
          />
        </div>
      ) : (
        <div style={{ padding: '3rem', border: '1px solid #000', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ fontWeight: 600 }}>{file.name}</p>
          <p style={{ color: '#666', marginTop: '0.5rem' }}>This document type does not support in-browser editing.</p>
        </div>
      )}

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <button 
          className="wizard-btn wizard-btn-primary" 
          onClick={handleSaveCrop}
        >
          {currentIndex < state.files.length - 1 ? 'Save & Next Image' : 'Save & Finish Editing'}
        </button>
      </div>
    </div>
  );
};
