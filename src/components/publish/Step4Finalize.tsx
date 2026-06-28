import React, { useState } from 'react';
import type { WizardState } from './PublishWizard';
import HCaptcha from '@hcaptcha/react-hcaptcha';

interface Props {
  state: WizardState;
  setState: React.Dispatch<React.SetStateAction<WizardState>>;
}

export const Step4Finalize: React.FC<Props> = ({ state }) => {
  const [certs, setCerts] = useState([false, false, false, false]);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleCert = (index: number) => {
    const newCerts = [...certs];
    newCerts[index] = !newCerts[index];
    setCerts(newCerts);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Successfully submitted to Open Rockets Press!');
    }, 2000);
  };

  const allChecked = certs.every(Boolean);
  const canSubmit = allChecked && captchaToken && !isSubmitting;

  if (isSubmitting) {
    return (
      <div className="loading-container">
        <img src="https://assets-v2.lottiefiles.com/a/fd37a886-9bba-459d-a45d-ad106cd1e882/3Ytsmfmjml.gif" alt="Loading..." />
        <p>Publishing your artifact to Open Rockets Press...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h3 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '1rem' }}>Review Your Artifact</h3>
        <div style={{ padding: '1.5rem', backgroundColor: '#f9f9f9', border: '1px solid #000', borderRadius: '8px' }}>
          <p><strong>Name:</strong> {state.name}</p>
          <p><strong>Category:</strong> {state.category}</p>
          <p><strong>License:</strong> {state.license}</p>
          <p style={{ marginTop: '1rem' }}><strong>Short Description:</strong> {state.shortDescription}</p>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
            {state.processedFiles.map((file, i) => (
              <div key={i} style={{ width: '100px', height: '100px', flexShrink: 0, backgroundColor: '#ddd' }}>
                {file.type.startsWith('image/') ? (
                  <img src={URL.createObjectURL(file)} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ padding: '0.5rem', fontSize: '0.75rem', wordBreak: 'break-all' }}>{file.name}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '1rem' }}>Certifications</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label className="checkbox-group">
            <input type="checkbox" checked={certs[0]} onChange={() => toggleCert(0)} />
            <span>I certify that this does not imply a copyright violation, stolen artifact, or illegal material.</span>
          </label>
          <label className="checkbox-group">
            <input type="checkbox" checked={certs[1]} onChange={() => toggleCert(1)} />
            <span>This is a creation of myself and not anyone else's or the organization that I represent.</span>
          </label>
          <label className="checkbox-group">
            <input type="checkbox" checked={certs[2]} onChange={() => toggleCert(2)} />
            <span>I give Open Rockets Press the ability to display this to the world and attach the relevant license.</span>
          </label>
          <label className="checkbox-group">
            <input type="checkbox" checked={certs[3]} onChange={() => toggleCert(3)} />
            <span>I understand this is a permanent record unless I delete it myself.</span>
          </label>
        </div>
      </div>

      <div style={{ alignSelf: 'flex-start' }}>
        <HCaptcha
          sitekey="3e60ef44-d6a0-4192-bcee-9f92f38a085c"
          onVerify={(token: string) => setCaptchaToken(token)}
        />
      </div>

      <button 
        className="wizard-btn wizard-btn-primary" 
        style={{ alignSelf: 'flex-start' }}
        disabled={!canSubmit}
        onClick={handleSubmit}
      >
        Submit to Open Rockets Press
      </button>
    </div>
  );
};
