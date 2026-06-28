import { useState } from 'react';
import './wizard.css';
import { Step1Upload } from './Step1Upload';
import { Step2Editor } from './Step2Editor';
import { Step3Metadata } from './Step3Metadata';
import { Step4Finalize } from './Step4Finalize';

export type WizardState = {
  division: 'div1' | 'div2';
  files: File[];
  processedFiles: File[];
  name: string;
  additionalNames: string[];
  hashtags: string;
  category: string;
  links: string[];
  shortDescription: string;
  longDescription: string;
  aboutPage: string;
  license: string;
};

export const PublishWizard = () => {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<WizardState>({
    division: 'div1',
    files: [],
    processedFiles: [],
    name: '',
    additionalNames: [],
    hashtags: '',
    category: 'science',
    links: [],
    shortDescription: '',
    longDescription: '',
    aboutPage: '',
    license: 'ORP_KANGAROO'
  });

  const nextStep = () => setStep(s => Math.min(4, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  return (
    <div className="wizard-container">
      <div className="wizard-header">
        <h2 className="wizard-title">Publish Artifact</h2>
        <span className="wizard-step-indicator">Step {step} of 4</span>
      </div>
      <div className="wizard-content">
        {step === 1 && <Step1Upload state={state} setState={setState} />}
        {step === 2 && <Step2Editor state={state} setState={setState} onComplete={nextStep} />}
        {step === 3 && <Step3Metadata state={state} setState={setState} />}
        {step === 4 && <Step4Finalize state={state} setState={setState} />}
      </div>
      <div className="wizard-footer">
        <button 
          className="wizard-btn wizard-btn-secondary" 
          onClick={prevStep} 
          disabled={step === 1}
        >
          Back
        </button>
        {step < 4 ? (
          <button 
            className="wizard-btn wizard-btn-primary" 
            onClick={nextStep}
            disabled={
              (step === 1 && state.files.length === 0) ||
              (step === 2 && state.processedFiles.filter(Boolean).length !== state.files.length) ||
              (step === 3 && (!state.name || !state.shortDescription))
            }
          >
            Next
          </button>
        ) : null}
      </div>
    </div>
  );
};
