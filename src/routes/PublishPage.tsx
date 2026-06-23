import { useState, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Check, ChevronRight, ChevronLeft, UploadCloud, X, File, Settings, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { FloatInput } from "@/components/ui/FloatInput";
import { FloatTextarea } from "@/components/ui/FloatTextarea";
import { DivisionArtifact, Division3D, DivisionCode } from "@/components/icons";
import { Modal } from "@/components/ui/Modal";
import { LicenseComparisonTable } from "@/components/licenses/LicenseComparisonTable";
import { LicenseBadge } from "@/components/badges/LicenseBadge";
import { PhotogrammetryViewer } from "@/components/3d/PhotogrammetryViewer";
import { useToast } from "@/lib/toast";

const STEPS = [
  "Basic Info",
  "Division & Type",
  "License",
  "Files",
  "Tags & Metadata",
  "Review & Submit",
];

const DIVISION_TYPES: Record<string, string[]> = {
  artifact: [
    "Essay", "Research Paper / Preprint", "Artwork (sketch, painting, etc.)", 
    "Club Poster", "Book Cover / Banner", "Advertising Banner", "Graphic Design", 
    "Inventory Label / Product Design", "Clay/Sculpture (photo)", "Diary / Journal", 
    "Invention (photo)", "Other Physical Creation"
  ],
  "3d": [
    "3D Model (.obj)", "3D Printed File", "Physical Object (360° Photos)", "Architectural Model"
  ],
  code: [
    "Python Script", "JavaScript / TypeScript", "C / C++", "Rust", "Other Language", 
    "ZIP Project (Full Codebase)", "Digital Artwork", "Digital Design", "Other Digital"
  ]
};

export function PublishPage() {
  const navigate = useNavigate();
  const { success } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form State
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [division, setDivision] = useState<"artifact" | "3d" | "code" | null>(null);
  const [subType, setSubType] = useState("");
  const [license, setLicense] = useState<"fox" | "owl" | "sparrow" | "dolphin" | null>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Step 4 State
  const [primaryFiles, setPrimaryFiles] = useState<File[]>([]);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [photoAngles, setPhotoAngles] = useState<Record<string, string>>({});
  
  // Photogrammetry Simulation State
  const [isProcessing360, setIsProcessing360] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState("");
  const [is360Complete, setIs360Complete] = useState(false);
  
  const primaryFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  // Step 5 State
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [school, setSchool] = useState("");
  const [creatorNote, setCreatorNote] = useState("");

  // Step 6 State
  const [confirmOriginal, setConfirmOriginal] = useState(false);
  const [confirmTOS, setConfirmTOS] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isStep1Valid = title.trim().length > 0 && abstract.trim().length >= 50;
  const isStep2Valid = division !== null && subType !== "";
  const isStep3Valid = license !== null;
  
  let isStep4Valid = false;
  if (currentStep === 4) {
    if (division === "3d" && subType === "Physical Object (360° Photos)") {
      // Photogrammetry variant
      isStep4Valid = primaryFiles.length >= 4 && primaryFiles.every(f => photoAngles[f.name]) && is360Complete;
    } else if (division === "3d") {
      // 3D model variant
      isStep4Valid = primaryFiles.length > 0 && coverImage !== null;
    } else {
      // Standard variant
      isStep4Valid = primaryFiles.length > 0;
    }
  }

  const handleNext = () => {
    if (currentStep === 1 && !isStep1Valid) return;
    if (currentStep === 2 && !isStep2Valid) return;
    if (currentStep === 3 && !isStep3Valid) return;
    if (currentStep === 4 && !isStep4Valid) return;

    if (currentStep < 6) setCurrentStep(c => c + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(c => c - 1);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = tagInput.trim();
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagInput("");
      }
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = () => {
    if (!confirmOriginal || !confirmTOS) return;
    
    setIsSubmitting(true);
    // Simulate API submission
    setTimeout(() => {
      setIsSubmitting(false);
      success("Submission successful! Your artifact is now under review.");
      navigate({ to: "/dashboard" });
    }, 2000);
  };

  const handlePrimaryFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setPrimaryFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const handlePrimaryFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPrimaryFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleCoverFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCoverImage(e.target.files[0]);
    }
  };

  const removePrimaryFile = (name: string) => {
    setPrimaryFiles(prev => prev.filter(f => f.name !== name));
    setPhotoAngles(prev => {
      const newAngles = { ...prev };
      delete newAngles[name];
      return newAngles;
    });
    setIs360Complete(false); // Reset if they change files
  };

  const handleGenerate360 = () => {
    setIsProcessing360(true);
    setProcessingProgress(0);
    setProcessingStatus("Uploading photos to pipeline...");
    
    // Simulate complex pipeline
    setTimeout(() => {
      setProcessingProgress(25);
      setProcessingStatus("Analyzing camera parameters...");
      
      setTimeout(() => {
        setProcessingProgress(50);
        setProcessingStatus("Stitching 360° equirectangular projection...");
        
        setTimeout(() => {
          setProcessingProgress(80);
          setProcessingStatus("Optimizing rendering payload...");
          
          setTimeout(() => {
            setProcessingProgress(100);
            setProcessingStatus("Complete!");
            
            setTimeout(() => {
              setIsProcessing360(false);
              setIs360Complete(true);
            }, 500);
            
          }, 1500);
        }, 2000);
      }, 1500);
    }, 1000);
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-serif text-ink mb-4">New Submission</h1>
          
          {/* Step Indicator */}
          <div className="flex items-center justify-center w-full mt-8 relative">
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-cream-border -z-10 -translate-y-1/2" />
            
            {STEPS.map((stepLabel, idx) => {
              const stepNum = idx + 1;
              const isCompleted = stepNum < currentStep;
              const isCurrent = stepNum === currentStep;
              
              return (
                <div key={idx} className="flex-1 flex flex-col items-center relative">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-colors ${
                      isCompleted 
                        ? 'bg-gold text-ink' 
                        : isCurrent 
                          ? 'bg-ink text-cream' 
                          : 'bg-surface-0 border-2 border-cream-border text-ink-light'
                    }`}
                  >
                    {isCompleted ? <Check size={20} /> : stepNum}
                  </div>
                  <span className={`text-xs font-medium text-center hidden md:block ${isCurrent ? 'text-ink' : 'text-ink-light'}`}>
                    {stepLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content Card */}
        <div className="bg-surface-0 border border-cream-border rounded-xl shadow-sm min-h-[500px] flex flex-col">
          
          <div className="flex-1 p-8 sm:p-12">
            
            {/* STEP 1: Basic Info */}
            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-3xl font-serif text-ink mb-2">Basic Info</h2>
                <p className="text-ink-light mb-8">Start by giving your submission a clear title and a detailed abstract.</p>
                
                <div className="space-y-8 max-w-2xl">
                  <div>
                    <label className="block t-label text-ink mb-2">Title</label>
                    <FloatInput 
                      label="e.g. Human-Centered Propulsion Design" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <label className="block t-label text-ink">Abstract / Description</label>
                      <span className={`text-xs ${abstract.length < 50 ? 'text-red-500' : 'text-ink-light'}`}>
                        {abstract.length}/500 {abstract.length < 50 && '(min 50 chars)'}
                      </span>
                    </div>
                    <FloatTextarea 
                      label="Summarize your submission for editors and moderators."
                      value={abstract}
                      onChange={(e) => setAbstract(e.target.value)}
                      rows={6}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Division & Type */}
            {currentStep === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-3xl font-serif text-ink mb-2">Division & Type</h2>
                <p className="text-ink-light mb-8">Choose the primary category that fits your submission.</p>
                
                {/* Division Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  <button 
                    onClick={() => { setDivision("artifact"); setSubType(""); }}
                    className={`p-6 rounded-xl border-2 text-left transition-all ${
                      division === "artifact" 
                        ? 'border-blue-500 bg-blue-50/50' 
                        : 'border-cream-border bg-surface-0 hover:bg-surface-3'
                    }`}
                  >
                    <DivisionArtifact size={40} className="text-blue-600 mb-4" />
                    <h3 className="font-bold text-lg text-ink mb-2">Artifacts</h3>
                    <p className="text-sm text-ink-light">Essays, artworks, research</p>
                  </button>

                  <button 
                    onClick={() => { setDivision("3d"); setSubType(""); }}
                    className={`p-6 rounded-xl border-2 text-left transition-all ${
                      division === "3d" 
                        ? 'border-emerald-500 bg-emerald-50/50' 
                        : 'border-cream-border bg-surface-0 hover:bg-surface-3'
                    }`}
                  >
                    <Division3D size={40} className="text-emerald-600 mb-4" />
                    <h3 className="font-bold text-lg text-ink mb-2">3D Artifact</h3>
                    <p className="text-sm text-ink-light">3D models, printed objects, 360° photos</p>
                  </button>

                  <button 
                    onClick={() => { setDivision("code"); setSubType(""); }}
                    className={`p-6 rounded-xl border-2 text-left transition-all ${
                      division === "code" 
                        ? 'border-purple-500 bg-purple-50/50' 
                        : 'border-cream-border bg-surface-0 hover:bg-surface-3'
                    }`}
                  >
                    <DivisionCode size={40} className="text-purple-600 mb-4" />
                    <h3 className="font-bold text-lg text-ink mb-2">Code/Digital</h3>
                    <p className="text-sm text-ink-light">Code files, digital art, software</p>
                  </button>
                </div>

                {/* Sub-Type Dropdown */}
                {division && (
                  <div className="max-w-md animate-in fade-in duration-300">
                    <label className="block t-label text-ink mb-2">Specific Type</label>
                    <select 
                      className="w-full bg-surface-0 border border-cream-border rounded-lg p-3 text-ink focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                      value={subType}
                      onChange={(e) => setSubType(e.target.value)}
                    >
                      <option value="" disabled>Select a type...</option>
                      {DIVISION_TYPES[division].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                )}

              </div>
            )}

            {/* STEP 3: License Selection */}
            {currentStep === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-3xl font-serif text-ink mb-2">License Selection</h2>
                <p className="text-ink-light mb-8">Every artifact is protected by one of our four open-source licenses. Choose the one that best fits your intent.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Fox */}
                  <button 
                    onClick={() => setLicense("fox")}
                    className={`p-6 rounded-xl border-2 text-left transition-all relative ${
                      license === "fox" 
                        ? 'border-orange-500 bg-orange-50/30' 
                        : 'border-cream-border bg-surface-0 hover:bg-surface-3'
                    }`}
                  >
                    {license === "fox" && (
                      <div className="absolute top-4 right-4 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white">
                        <Check size={14} />
                      </div>
                    )}
                    <div className="mb-4"><LicenseBadge type="fox" /></div>
                    <h3 className="font-bold text-lg text-ink mb-1">Do Whatever</h3>
                    <p className="text-sm text-ink-light mb-4">View, build, and remix freely. Derivatives must use the OR-Fox license.</p>
                    <div className="text-xs text-ink flex gap-3">
                      <span className="flex items-center gap-1"><Check size={12} className="text-emerald-500" /> View</span>
                      <span className="flex items-center gap-1"><Check size={12} className="text-emerald-500" /> Build</span>
                      <span className="flex items-center gap-1"><Check size={12} className="text-emerald-500" /> Remix</span>
                    </div>
                  </button>

                  {/* Owl */}
                  <button 
                    onClick={() => setLicense("owl")}
                    className={`p-6 rounded-xl border-2 text-left transition-all relative ${
                      license === "owl" 
                        ? 'border-emerald-500 bg-emerald-50/30' 
                        : 'border-cream-border bg-surface-0 hover:bg-surface-3'
                    }`}
                  >
                    {license === "owl" && (
                      <div className="absolute top-4 right-4 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                        <Check size={14} />
                      </div>
                    )}
                    <div className="mb-4"><LicenseBadge type="owl" /></div>
                    <h3 className="font-bold text-lg text-ink mb-1">Attribution Required</h3>
                    <p className="text-sm text-ink-light mb-4">Others can build upon your work, provided they explicitly credit you.</p>
                    <div className="text-xs text-ink flex gap-3">
                      <span className="flex items-center gap-1"><Check size={12} className="text-emerald-500" /> View</span>
                      <span className="flex items-center gap-1"><Check size={12} className="text-emerald-500" /> Build</span>
                      <span className="flex items-center gap-1 text-ink-light/50 line-through">Remix</span>
                    </div>
                  </button>

                  {/* Sparrow */}
                  <button 
                    onClick={() => setLicense("sparrow")}
                    className={`p-6 rounded-xl border-2 text-left transition-all relative ${
                      license === "sparrow" 
                        ? 'border-blue-400 bg-blue-50/30' 
                        : 'border-cream-border bg-surface-0 hover:bg-surface-3'
                    }`}
                  >
                    {license === "sparrow" && (
                      <div className="absolute top-4 right-4 w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center text-white">
                        <Check size={14} />
                      </div>
                    )}
                    <div className="mb-4"><LicenseBadge type="sparrow" /></div>
                    <h3 className="font-bold text-lg text-ink mb-1">Share-Alike</h3>
                    <p className="text-sm text-ink-light mb-4">Free to view and download for personal study. No derivatives permitted.</p>
                    <div className="text-xs text-ink flex gap-3">
                      <span className="flex items-center gap-1"><Check size={12} className="text-emerald-500" /> View</span>
                      <span className="flex items-center gap-1"><Check size={12} className="text-emerald-500" /> Download</span>
                      <span className="flex items-center gap-1 text-ink-light/50 line-through">Modify</span>
                    </div>
                  </button>

                  {/* Dolphin */}
                  <button 
                    onClick={() => setLicense("dolphin")}
                    className={`p-6 rounded-xl border-2 text-left transition-all relative ${
                      license === "dolphin" 
                        ? 'border-blue-600 bg-blue-50/30' 
                        : 'border-cream-border bg-surface-0 hover:bg-surface-3'
                    }`}
                  >
                    {license === "dolphin" && (
                      <div className="absolute top-4 right-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white">
                        <Check size={14} />
                      </div>
                    )}
                    <div className="mb-4"><LicenseBadge type="dolphin" /></div>
                    <h3 className="font-bold text-lg text-ink mb-1">Non-Commercial</h3>
                    <p className="text-sm text-ink-light mb-4">Maximum protection. View only. No copies, no derivatives, no download.</p>
                    <div className="text-xs text-ink flex gap-3">
                      <span className="flex items-center gap-1"><Check size={12} className="text-emerald-500" /> View</span>
                      <span className="flex items-center gap-1 text-ink-light/50 line-through">Download</span>
                      <span className="flex items-center gap-1 text-ink-light/50 line-through">Modify</span>
                    </div>
                  </button>
                </div>

                <div className="text-center">
                  <button 
                    onClick={() => setIsCompareModalOpen(true)}
                    className="text-gold font-medium hover:underline"
                  >
                    Not sure which to choose? Compare licenses
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Files */}
            {currentStep === 4 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-3xl font-serif text-ink mb-2">Upload Files</h2>
                <p className="text-ink-light mb-8">
                  {division === "3d" && subType === "Physical Object (360° Photos)" 
                    ? "Upload 4 to 6 photographs of your object."
                    : "Upload your primary files and an optional cover image."}
                </p>

                <div className="space-y-8 max-w-3xl">
                  {/* Primary File Upload */}
                  <div>
                    <label className="block font-bold text-ink mb-1 uppercase text-sm tracking-wider">
                      {division === "3d" && subType === "Physical Object (360° Photos)" ? "Physical Object Photos *" : 
                       division === "3d" ? "3D Model File *" : 
                       division === "code" ? "Code File *" : 
                       "Publication File *"}
                    </label>
                    <p className="text-sm text-ink-light mb-4">
                      {division === "3d" && subType === "Physical Object (360° Photos)" 
                        ? "Required angles: Front, Back, Left Side, Right Side. Optional: Top (aerial), Bottom."
                        : division === "3d" ? "Accepted: .obj, .fbx, .gltf, .glb, .stl, .ply" :
                          division === "code" ? "Accepted: .py, .js, .ts, .cpp, .c, .rs, .html, .css, .zip" :
                          "Accepted: PDF, JPEG, PNG, GIF, TIFF, BMP, DOC, DOCX, any image"}
                    </p>

                    <div 
                      className="border-2 border-dashed border-cream-border bg-surface-2 rounded-xl p-8 text-center hover:bg-surface-3 transition-colors cursor-pointer"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handlePrimaryFileDrop}
                      onClick={() => primaryFileInputRef.current?.click()}
                    >
                      <input 
                        type="file" 
                        className="hidden" 
                        ref={primaryFileInputRef} 
                        onChange={handlePrimaryFileSelect}
                        multiple={division === "3d" && subType === "Physical Object (360° Photos)"}
                      />
                      <UploadCloud size={48} className="mx-auto text-ink-light/50 mb-4" />
                      <p className="text-ink font-medium">Click to choose files or drag and drop</p>
                      <p className="text-sm text-ink-light mt-1">Max file size: 100 MB</p>
                    </div>

                    {/* Uploaded Files Chips */}
                    {primaryFiles.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-ink mb-2">Already uploaded:</p>
                        <div className="flex flex-wrap gap-2">
                          {primaryFiles.map(f => (
                            <div key={f.name} className="flex items-center gap-2 bg-surface-1 border border-cream-border rounded-full px-3 py-1.5">
                              <File size={14} className="text-ink-light" />
                              <span className="text-sm text-ink truncate max-w-[200px]">{f.name}</span>
                              <button onClick={() => removePrimaryFile(f.name)} className="text-ink-light hover:text-red-500 transition-colors">
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Angle Assignment for Photogrammetry */}
                    {division === "3d" && subType === "Physical Object (360° Photos)" && primaryFiles.length > 0 && (
                      <div className="mt-6 bg-surface-1 p-6 rounded-xl border border-cream-border">
                        <h4 className="font-bold text-ink mb-4">Assign Angles</h4>
                        <div className="space-y-4">
                          {primaryFiles.map((f, idx) => (
                            <div key={f.name} className="flex items-center justify-between gap-4">
                              <div className="text-sm text-ink truncate flex-1">Photo {idx + 1}: {f.name}</div>
                              <select 
                                className="bg-surface-0 border border-cream-border rounded-lg px-3 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold"
                                value={photoAngles[f.name] || ""}
                                onChange={(e) => setPhotoAngles(prev => ({ ...prev, [f.name]: e.target.value }))}
                              >
                                <option value="" disabled>Select angle...</option>
                                <option value="Front">Front</option>
                                <option value="Back">Back</option>
                                <option value="Left Side">Left Side</option>
                                <option value="Right Side">Right Side</option>
                                <option value="Top">Top (aerial)</option>
                                <option value="Bottom">Bottom</option>
                              </select>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-cream-border flex flex-col gap-4">
                          {is360Complete ? (
                            <div className="space-y-4">
                              <div className="flex items-center gap-2 text-emerald-600 mb-2">
                                <Check size={20} />
                                <span className="font-medium">Generation Complete</span>
                              </div>
                              <PhotogrammetryViewer />
                              <div className="text-right">
                                <button 
                                  onClick={() => setIs360Complete(false)} 
                                  className="text-sm text-ink-light hover:underline"
                                >
                                  Reset & Regenerate
                                </button>
                              </div>
                            </div>
                          ) : isProcessing360 ? (
                            <div className="w-full bg-surface-0 rounded-xl border border-cream-border p-6">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-ink">{processingStatus}</span>
                                <span className="text-sm font-medium text-gold">{processingProgress}%</span>
                              </div>
                              <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gold transition-all duration-300 ease-out" 
                                  style={{ width: `${processingProgress}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <button 
                                disabled={primaryFiles.length < 4 || !primaryFiles.every(f => photoAngles[f.name])}
                                onClick={handleGenerate360}
                                className="btn-secondary px-4 py-2 flex items-center gap-2 disabled:opacity-50"
                              >
                                <Settings size={16} /> Generate 360° View
                              </button>
                              <span className="text-sm text-ink-light">
                                Required before proceeding
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Secondary/Cover File Upload (Not needed for photogrammetry) */}
                  {!(division === "3d" && subType === "Physical Object (360° Photos)") && (
                    <div className="pt-8 border-t border-cream-border">
                      <label className="block font-bold text-ink mb-1 uppercase text-sm tracking-wider">
                        {division === "code" ? "Thumbnail Image" : "Cover Image"} 
                        {division === "3d" ? " *" : " (Optional)"}
                      </label>
                      <p className="text-sm text-ink-light mb-4">
                        {division === "3d" 
                          ? "(Required for 3D artifacts — this shows in cards)" 
                          : "Upload a screenshot or diagram related to your code."}
                        <br/>Accepted: JPEG, PNG, WebP. Min 400×300px.
                      </p>

                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => coverFileInputRef.current?.click()}
                          className="btn-secondary px-4 py-2"
                        >
                          Choose file
                        </button>
                        <input 
                          type="file" 
                          className="hidden" 
                          ref={coverFileInputRef} 
                          onChange={handleCoverFileSelect}
                          accept="image/*"
                        />
                        <span className="text-sm text-ink-light">
                          {coverImage ? coverImage.name : "No file chosen"}
                        </span>
                        {coverImage && (
                          <button onClick={() => setCoverImage(null)} className="text-red-500 hover:text-red-600">
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* STEP 5: Tags & Metadata */}
            {currentStep === 5 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-3xl font-serif text-ink mb-2">Tags & Metadata</h2>
                <p className="text-ink-light mb-8">Add context to help others discover your work.</p>

                <div className="space-y-8 max-w-2xl">
                  {/* Tags Input */}
                  <div>
                    <label className="block t-label text-ink mb-2">Tags (Press Enter to add)</label>
                    <div className="bg-surface-0 border border-cream-border rounded-lg p-2 flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-gold focus-within:border-transparent transition-all">
                      {tags.map(tag => (
                        <span key={tag} className="flex items-center gap-1 bg-surface-2 text-ink px-2 py-1 rounded-md text-sm">
                          {tag}
                          <button onClick={() => removeTag(tag)} className="text-ink-light hover:text-red-500">
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                      <input 
                        type="text" 
                        className="flex-1 min-w-[150px] bg-transparent outline-none text-ink text-sm px-2 py-1"
                        placeholder={tags.length === 0 ? "e.g. Propulsion, Sketch, Prototype..." : ""}
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Year Dropdown */}
                    <div>
                      <label className="block t-label text-ink mb-2">Year Created</label>
                      <select 
                        className="w-full bg-surface-0 border border-cream-border rounded-lg p-3 text-ink focus:outline-none focus:ring-2 focus:ring-gold"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                      >
                        {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>

                    {/* School / Institution */}
                    <div>
                      <label className="block t-label text-ink mb-2">School / Institution <span className="text-ink-light font-normal">(Optional)</span></label>
                      <input 
                        type="text" 
                        className="w-full bg-surface-0 border border-cream-border rounded-lg p-3 text-ink focus:outline-none focus:ring-2 focus:ring-gold"
                        placeholder="e.g. MIT, Stanford..."
                        value={school}
                        onChange={(e) => setSchool(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Creator's Note */}
                  <div>
                    <label className="block t-label text-ink mb-2">Creator's Note <span className="text-ink-light font-normal">(Optional)</span></label>
                    <FloatTextarea 
                      label="Any additional context about the creation process, challenges, etc."
                      value={creatorNote}
                      onChange={(e) => setCreatorNote(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: Review & Submit */}
            {currentStep === 6 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-3xl font-serif text-ink mb-2">Review & Submit</h2>
                <p className="text-ink-light mb-8">Please review your submission details before sending it to the editors.</p>

                <div className="bg-surface-1 border border-cream-border rounded-xl p-8 mb-8 space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-ink-light uppercase tracking-wider mb-1">Title</h4>
                    <p className="text-xl font-serif text-ink">{title}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs font-bold text-ink-light uppercase tracking-wider mb-1">Classification</h4>
                      <p className="text-ink capitalize">{division} • {subType}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-ink-light uppercase tracking-wider mb-1">License</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <LicenseBadge type={license || "fox"} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-ink-light uppercase tracking-wider mb-1">Files Uploaded</h4>
                    <p className="text-ink">{primaryFiles.length} primary file(s) {coverImage ? "+ 1 cover image" : ""}</p>
                  </div>

                  {tags.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-ink-light uppercase tracking-wider mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {tags.map(t => (
                          <span key={t} className="bg-surface-2 text-ink-light px-2 py-1 rounded-md text-xs">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirmations */}
                <div className="space-y-4 max-w-2xl">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="mt-1 flex-shrink-0">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded border-cream-border text-gold focus:ring-gold"
                        checked={confirmOriginal}
                        onChange={(e) => setConfirmOriginal(e.target.checked)}
                      />
                    </div>
                    <span className="text-ink group-hover:text-gold-dark transition-colors">
                      I confirm that I am the original creator of this work, or I have explicit permission from the copyright holder to publish it under the selected license.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="mt-1 flex-shrink-0">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded border-cream-border text-gold focus:ring-gold"
                        checked={confirmTOS}
                        onChange={(e) => setConfirmTOS(e.target.checked)}
                      />
                    </div>
                    <span className="text-ink group-hover:text-gold-dark transition-colors">
                      I agree to the <Link to="/terms-of-service" className="text-gold hover:underline">Terms of Service</Link> and understand that my artifact will be distributed under the terms of the selected license once approved.
                    </span>
                  </label>
                </div>

              </div>
            )}

          </div>

          {/* Footer Navigation */}
          <div className="bg-surface-1 border-t border-cream-border p-6 flex justify-between items-center rounded-b-xl">
            {currentStep > 1 ? (
              <button 
                onClick={handleBack}
                disabled={isSubmitting}
                className="btn-secondary px-6 py-2 flex items-center gap-2 disabled:opacity-50"
              >
                <ChevronLeft size={18} /> Back
              </button>
            ) : (
              <div /> // Spacer
            )}

            {currentStep === 6 ? (
              <button 
                onClick={handleSubmit}
                disabled={!confirmOriginal || !confirmTOS || isSubmitting}
                className="btn-primary px-8 py-2 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <><Loader2 size={18} className="animate-spin" /> Submitting...</>
                ) : (
                  <><Check size={18} /> Submit for Review</>
                )}
              </button>
            ) : (
              <button 
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !isStep1Valid) ||
                  (currentStep === 2 && !isStep2Valid) ||
                  (currentStep === 3 && !isStep3Valid) ||
                  (currentStep === 4 && !isStep4Valid)
                }
                className="btn-primary px-8 py-2 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next Step <ChevronRight size={18} />
              </button>
            )}
          </div>

        </div>
      </div>

      <Modal 
        isOpen={isCompareModalOpen} 
        onClose={() => setIsCompareModalOpen(false)} 
        title="License Comparison"
        size="lg"
      >
        <p className="text-ink-light mb-6">Compare our standardized licenses to find the right level of protection for your work.</p>
        <LicenseComparisonTable />
        <div className="mt-6 text-right">
          <button onClick={() => setIsCompareModalOpen(false)} className="btn-secondary px-6 py-2">
            Close
          </button>
        </div>
      </Modal>
    </AppShell>
  );
}
