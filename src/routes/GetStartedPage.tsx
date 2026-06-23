import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ChevronRight, ChevronLeft, CheckCircle2, ArrowRight } from 'lucide-react';
import { DivisionArtifact, Division3D, DivisionCode } from '@/components/icons';
import { LicenseComparisonTable } from '@/components/licenses/LicenseComparisonTable';

export function GetStartedPage() {
  const [step, setStep] = useState(1);
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);

  const totalSteps = 6;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-surface-1 flex items-center justify-center p-4 py-20">
      <div className="max-w-4xl w-full">
        
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-300 ${
                i + 1 === step 
                  ? 'w-12 bg-gold' 
                  : i + 1 < step 
                    ? 'w-8 bg-gold/50' 
                    : 'w-4 bg-cream-border'
              }`} 
            />
          ))}
        </div>

        {/* Card Container */}
        <div className="bg-surface-0 border border-cream-border rounded-2xl shadow-xl overflow-hidden min-h-[500px] flex flex-col relative">
          
          {/* Content Area */}
          <div className="flex-1 p-8 sm:p-12 overflow-y-auto">
            
            {/* Step 1: Welcome */}
            {step === 1 && (
              <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="text-5xl sm:text-6xl font-serif text-ink mb-6">Welcome to<br/>Open Rockets Press.</h1>
                <p className="text-xl text-ink-light max-w-lg">The archive for the next generation of creators.</p>
              </div>
            )}

            {/* Step 2: What is this? */}
            {step === 2 && (
              <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex gap-6 mb-10">
                  <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                    <DivisionArtifact size={40} className="text-blue-600" />
                  </div>
                  <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Division3D size={40} className="text-emerald-600" />
                  </div>
                  <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center">
                    <DivisionCode size={40} className="text-purple-600" />
                  </div>
                </div>
                <h2 className="text-3xl font-serif text-ink mb-6">What is this platform?</h2>
                <p className="text-lg text-ink-light max-w-2xl leading-relaxed">
                  Open Rockets Press is a moderated publishing platform where young creators can protect and share their original work — whether it's physical artifacts, 3D models, or software code.
                </p>
              </div>
            )}

            {/* Step 3: Choose Your Division */}
            {step === 3 && (
              <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-3xl font-serif text-ink mb-2 text-center">Choose Your Division</h2>
                <p className="text-ink-light mb-8 text-center">Which of these best describes what you want to publish?</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <button 
                    onClick={() => setSelectedDivision('artifact')}
                    className={`p-6 rounded-xl border-2 text-left transition-all ${selectedDivision === 'artifact' ? 'border-blue-500 bg-blue-50' : 'border-cream-border hover:border-blue-300'}`}
                  >
                    <DivisionArtifact size={32} className="text-blue-600 mb-4" />
                    <h3 className="font-bold text-lg text-ink mb-2">Artifacts</h3>
                    <p className="text-sm text-ink-light">Academic papers, research logs, and standard documentation.</p>
                  </button>

                  <button 
                    onClick={() => setSelectedDivision('3d')}
                    className={`p-6 rounded-xl border-2 text-left transition-all ${selectedDivision === '3d' ? 'border-emerald-500 bg-emerald-50' : 'border-cream-border hover:border-emerald-300'}`}
                  >
                    <Division3D size={32} className="text-emerald-600 mb-4" />
                    <h3 className="font-bold text-lg text-ink mb-2">3D Models</h3>
                    <p className="text-sm text-ink-light">Print-ready STLs and editable CAD files.</p>
                  </button>

                  <button 
                    onClick={() => setSelectedDivision('code')}
                    className={`p-6 rounded-xl border-2 text-left transition-all ${selectedDivision === 'code' ? 'border-purple-500 bg-purple-50' : 'border-cream-border hover:border-purple-300'}`}
                  >
                    <DivisionCode size={32} className="text-purple-600 mb-4" />
                    <h3 className="font-bold text-lg text-ink mb-2">Code</h3>
                    <p className="text-sm text-ink-light">Simulation software and flight controllers.</p>
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Licensing */}
            {step === 4 && (
              <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-3xl font-serif text-ink mb-2 text-center">Understand Licensing</h2>
                <p className="text-ink-light mb-8 text-center max-w-2xl mx-auto">Every artifact is protected by one of our four proprietary open-source licenses to ensure clear boundaries for reuse.</p>
                
                <div className="max-w-full overflow-hidden">
                  <LicenseComparisonTable />
                </div>
              </div>
            )}

            {/* Step 5: Moderation Timeline */}
            {step === 5 && (
              <div className="h-full flex flex-col items-center justify-center animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-3xl font-serif text-ink mb-12 text-center">How Moderation Works</h2>
                
                <div className="w-full max-w-2xl relative">
                  {/* Timeline Line */}
                  <div className="absolute top-6 left-0 w-full h-1 bg-cream-border rounded-full" />
                  
                  <div className="flex justify-between relative z-10">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-surface-0 border-4 border-gold flex items-center justify-center text-xl font-bold text-ink mb-4 shadow-sm">1</div>
                      <div className="text-center">
                        <h4 className="font-bold text-ink">Submit</h4>
                        <p className="text-sm text-ink-light">Fill out metadata</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-surface-0 border-4 border-blue-400 flex items-center justify-center text-xl font-bold text-ink mb-4 shadow-sm">2</div>
                      <div className="text-center">
                        <h4 className="font-bold text-ink">Review</h4>
                        <p className="text-sm text-ink-light">2-3 days manual check</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-surface-0 border-4 border-emerald-500 flex items-center justify-center mb-4 shadow-sm">
                        <CheckCircle2 size={24} className="text-emerald-500" />
                      </div>
                      <div className="text-center">
                        <h4 className="font-bold text-emerald-600">Published!</h4>
                        <p className="text-sm text-ink-light">Live to the public</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: CTA */}
            {step === 6 && (
              <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-4xl font-serif text-ink mb-6">You're ready.</h2>
                <p className="text-lg text-ink-light max-w-md mb-8">
                  Create an account to start publishing your work or exploring the full library.
                </p>
                <div className="flex gap-4">
                  <Link to="/login" className="btn-primary px-8 py-4 text-lg">
                    Sign In / Sign Up
                  </Link>
                </div>
              </div>
            )}

          </div>

          {/* Navigation Footer */}
          <div className="bg-surface-1 border-t border-cream-border p-6 flex justify-between items-center">
            {step > 1 ? (
              <button 
                onClick={handleBack}
                className="btn-secondary px-6 py-2 flex items-center gap-2"
              >
                <ChevronLeft size={18} /> Back
              </button>
            ) : (
              <div /> // Spacer
            )}

            {step < totalSteps ? (
              <button 
                onClick={handleNext}
                className="btn-primary px-6 py-2 flex items-center gap-2"
              >
                {step === 1 ? 'Get Started' : 'Next'} <ChevronRight size={18} />
              </button>
            ) : (
              <Link to="/login" className="text-gold font-medium hover:underline flex items-center gap-1">
                Skip to Login <ArrowRight size={16} />
              </Link>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
