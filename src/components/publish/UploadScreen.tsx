import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAlt, faImage, faCode, faCube, faTimes, faInfoCircle, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { Document, Page, pdfjs } from "react-pdf";
import localforage from "localforage";
import {
  getCoreCategory,
  getAcceptString,
  validateFile,
  getSupportedFileTypeLabels,
  getFileKind,
  isWordFile,
} from "./fileTypeUtils";
import type { FileTypeLabel, FileKind } from "./fileTypeUtils";
import { compressImage, compressPdf } from "./compressionUtils";
import { useTranslationContext } from "@/lib/TranslationContext";
import { Spinner } from "@/components/ui/Spinner";
import { AlertModal } from "@/components/ui/AlertModal";
import { AdsInfoModal } from "@/components/ui/AdsInfoModal";

// Configure react-pdf worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// ─── Types ──────────────────────────────────────────────────────────────────────

type SlotStatus = "empty" | "converting" | "uploading" | "success" | "error";

interface UploadSlot {
  id: number;
  file: File | null;
  status: SlotStatus;
  previewUrl: string | null;
  fileKind: FileKind;
  error?: string;
}

const MAX_SLOTS = 5;
const MAX_FILE_SIZE_MB = 10;

function createEmptySlots(): UploadSlot[] {
  return Array.from({ length: MAX_SLOTS }, (_, i) => ({
    id: i,
    file: null,
    status: "empty" as SlotStatus,
    previewUrl: null,
    fileKind: "unknown" as FileKind,
  }));
}

function getFileExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? "" : filename.substring(dot).toUpperCase().replace(".", "");
}

// ─── FontAwesome Icon Map ───────────────────────────────────────────────────────

const FA_ICON_MAP = {
  pdf: faFileAlt,
  image: faImage,
  code: faCode,
  cube: faCube,
  file: faFileAlt,
};

// ─── PDF Thumbnail Sub-Component ────────────────────────────────────────────────

function PdfThumbnail({ file }: { file: File }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  if (!url) return null;

  return (
    <Document file={url} loading={null} error={null}>
      <Page
        pageNumber={1}
        width={116}
        renderTextLayer={false}
        renderAnnotationLayer={false}
      />
    </Document>
  );
}

// ─── Upload Slot Sub-Component ──────────────────────────────────────────────────

function UploadSlotBox({
  slot,
  onRemove,
}: {
  slot: UploadSlot;
  onRemove: (id: number) => void;
}) {
  const statusClass = slot.status === "empty" ? "empty" : slot.status;

  if (slot.status === "empty") {
    return <div className={`upload-slot ${statusClass}`} />;
  }

  const ext = slot.file ? getFileExtension(slot.file.name) : "";

  return (
    <div className={`upload-slot ${statusClass} fade-in`}>
      {/* Cancel / Remove button */}
      <button
        type="button"
        className="upload-slot-cancel"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(slot.id);
        }}
        aria-label="Remove file"
      >
        <FontAwesomeIcon icon={faTimes} style={{ width: 10, height: 10 }} />
      </button>

      {/* Spinner overlay during converting/uploading */}
      {(slot.status === "converting" || slot.status === "uploading") && (
        <div className="upload-slot-spinner-overlay">
          <Spinner />
        </div>
      )}

      {/* Thumbnail / Icon */}
      {slot.fileKind === "image" && slot.previewUrl ? (
        <img
          src={slot.previewUrl}
          alt={slot.file?.name || "Preview"}
          className="upload-slot-thumbnail"
        />
      ) : slot.fileKind === "pdf" && slot.file ? (
        <div
          style={{
            width: "100%",
            height: "100%",
            overflow: "hidden",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          <PdfThumbnail file={slot.file} />
        </div>
      ) : (
        <div className="upload-slot-icon-container">
          <FontAwesomeIcon
            icon={
              slot.fileKind === "code"
                ? faCode
                : slot.fileKind === "3d"
                  ? faCube
                  : slot.fileKind === "word"
                    ? faFileAlt
                    : faFileAlt
            }
            style={{ width: 28, height: 28 }}
          />
          <span className="upload-slot-ext">{ext}</span>
        </div>
      )}

      {/* Word → PDF badge */}
      {slot.fileKind === "word" && slot.status === "success" && (
        <span className="upload-word-badge">→ PDF on submit</span>
      )}

      {/* Type badge top-right */}
      <span className="upload-slot-type-badge">{ext}</span>

      {/* Filename bottom */}
      {slot.file && (
        <span className="upload-slot-filename">{slot.file.name}</span>
      )}
    </div>
  );
}

// ─── Main UploadScreen Component ────────────────────────────────────────────────

export function UploadScreen() {
  const [slideIn, setSlideIn] = useState(false);
  const [slots, setSlots] = useState<UploadSlot[]>(createEmptySlots);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [errorModal, setErrorModal] = useState<{ title: string; message: string } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // New 3D Checkbox State
  const [make3D, setMake3D] = useState(false);
  const [show3DInfo, setShow3DInfo] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setIsContentLoading } = useTranslationContext();

  // Initialize from localforage
  useEffect(() => {
    const loadSlots = async () => {
      try {
        const savedSlots = await localforage.getItem<UploadSlot[]>("openRockets_uploadSlots");
        if (savedSlots && savedSlots.length > 0) {
          setSlots(savedSlots);
        }
      } catch (err) {
        console.error("Failed to load upload slots", err);
      } finally {
        setIsLoaded(true);
      }
    };
    loadSlots();
  }, []);

  // Save to localforage on change
  useEffect(() => {
    if (!isLoaded) return;
    localforage.setItem("openRockets_uploadSlots", slots).catch(err => {
      console.error("Failed to save upload slots", err);
    });
  }, [slots, isLoaded]);

  useEffect(() => {
    const timer = setTimeout(() => setSlideIn(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Read the selected artifact type from localStorage
  const selectedType = localStorage.getItem("publish_artifact_type") || "painting";
  const coreCategory = getCoreCategory(selectedType);
  const acceptString = getAcceptString(coreCategory);
  const supportedLabels = getSupportedFileTypeLabels(coreCategory);

  // Count successful uploads
  const successCount = slots.filter((s) => s.status === "success").length;
  const remainingSlots = MAX_SLOTS - successCount;

  useEffect(() => {
    const timer = setTimeout(() => setSlideIn(true), 50);
    return () => clearTimeout(timer);
  }, []);



  const processFiles = useCallback(
    async (newFiles: File[]) => {
      setErrorModal(null);

      // Find empty slots
      const emptySlotIndices: number[] = [];
      for (let i = 0; i < slots.length; i++) {
        if (slots[i].status === "empty") emptySlotIndices.push(i);
      }

      if (emptySlotIndices.length === 0) {
        setErrorModal({ title: "Upload failure", message: "All 5 upload slots are full. Remove a file to upload more." });
        return;
      }

      // Limit files to available slots
      const filesToProcess = newFiles.slice(0, emptySlotIndices.length);

      for (let fi = 0; fi < filesToProcess.length; fi++) {
        const file = filesToProcess[fi];
        const slotIdx = emptySlotIndices[fi];

        // Validate
        let validation = validateFile(file, coreCategory);
        let finalFile = file;
        let kind = getFileKind(file);

        if (validation.needsCompression) {
          setSlots((prev) => {
            const next = [...prev];
            next[slotIdx] = {
              ...next[slotIdx],
              file,
              status: "converting",
              fileKind: kind,
            };
            return next;
          });
          
          setIsProcessing(true);
          setIsContentLoading(true);

          if (kind === "image") {
            finalFile = await compressImage(file);
          } else if (kind === "pdf") {
            finalFile = await compressPdf(file);
          }

          validation = validateFile(finalFile, coreCategory);
          
          if (!validation.valid || validation.needsCompression) {
             setErrorModal({ 
               title: "Upload failure", 
               message: `Could not compress "${file.name}" below 10MB. Please reduce its size manually.` 
             });
             setIsProcessing(false);
             setIsContentLoading(false);
             setSlots((prev) => {
               const next = [...prev];
               next[slotIdx] = { id: slotIdx, file: null, status: "empty", previewUrl: null, fileKind: "unknown" };
               return next;
             });
             continue;
          }
        } else if (!validation.valid) {
          setErrorModal({
            title: validation.errorTitle || "Upload failure",
            message: validation.errorMessage || "Invalid file."
          });
          continue;
        }

        kind = getFileKind(finalFile);
        const isWord = isWordFile(finalFile);

        // Set slot to converting/uploading
        setSlots((prev) => {
          const next = [...prev];
          next[slotIdx] = {
            ...next[slotIdx],
            file: finalFile,
            status: isWord ? "converting" : "uploading",
            fileKind: kind,
            previewUrl: kind === "image" ? URL.createObjectURL(finalFile) : null,
          };
          return next;
        });

        if (isWord) {
          setIsProcessing(true);
          setIsContentLoading(true);
        } else {
          setIsProcessing(true);
          setIsContentLoading(true);
        }

        // Simulate processing delay (Word conversion or upload processing)
        await new Promise((resolve) =>
          setTimeout(resolve, isWord ? 1200 : 600)
        );

        // Mark as success
        setSlots((prev) => {
          const next = [...prev];
          next[slotIdx] = {
            ...next[slotIdx],
            status: "success",
          };
          return next;
        });
      }

      setIsProcessing(false);
      setIsContentLoading(false);
    },
    [slots, coreCategory, setIsContentLoading]
  );

  const handleRemoveSlot = useCallback((slotId: number) => {
    setSlots((prev) => {
      const next = [...prev];
      const slot = next[slotId];
      // Revoke preview URL
      if (slot.previewUrl) URL.revokeObjectURL(slot.previewUrl);
      next[slotId] = {
        id: slotId,
        file: null,
        status: "empty",
        previewUrl: null,
        fileKind: "unknown",
      };
      return next;
    });
  }, []);

  // ─── Drag & Drop Handlers ─────────────────────────────────────────────────

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
      // Reset input so the same file can be re-selected
      e.target.value = "";
    }
  };

  const handleBrowseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleDropzoneClick = () => {
    if (!isProcessing) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "70vh",
        transform: slideIn ? "translateX(0)" : "translateX(20px)",
        opacity: slideIn ? 1 : 0,
        transition: "all 0.4s ease-out",
        padding: "1rem 0",
        width: "100%",
        alignItems: showTransition ? "center" : "flex-start",
        justifyContent: showTransition ? "center" : "flex-start",
      }}
    >
      {showTransition ? (
        <Spinner color="#0067b8" />
      ) : (
        <>
      {/* Title */}
      <h1
        style={{
          fontFamily: "Ubuntu, sans-serif",
          fontSize: "2rem",
          marginBottom: "0.25rem",
          color: "#111",
          margin: 0,
        }}
      >
        Upload your artifact files
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontFamily: "Ubuntu, sans-serif",
          fontSize: "1rem",
          color: "#111",
          marginBottom: "0.5rem",
          marginTop: "0.25rem",
        }}
      >
        You can upload up to <strong>5</strong> files, each not exceeding{" "}
        <strong>{MAX_FILE_SIZE_MB} MB</strong>.
      </p>
      <p
        style={{
          fontFamily: "Ubuntu, sans-serif",
          fontSize: "0.9rem",
          color: "#c7511f",
          marginBottom: "1.5rem",
          marginTop: 0,
        }}
      >
        For example, you could upload 3 artifact files worth of 30 MB maximum.
      </p>

      {/* Drag & Drop Zone */}
      <div style={{ width: "100%", maxWidth: "800px" }}>
        
        {/* Supported File Types Header */}
        <div className="upload-supported-header">
          <img src="/brand/hard-drive-storage.png" alt="Drive" className="upload-supported-header-icon" />
          <span className="upload-supported-label">Supported file types:</span>
          <div className="upload-supported-types">
            {supportedLabels.map((label: FileTypeLabel) => (
              <span
                key={label.name}
                className="upload-file-badge"
                style={{ backgroundColor: label.color }}
              >
                <FontAwesomeIcon
                  icon={FA_ICON_MAP[label.icon]}
                  style={{ width: 12, height: 12 }}
                />
                {label.name}
              </span>
            ))}
          </div>
        </div>

        <div
          className={`upload-dropzone ${isDragActive ? "drag-active" : ""}`}
          onClick={handleDropzoneClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Processing overlay */}
          {isProcessing && (
            <div className="upload-dropzone-overlay">
              <Spinner />
            </div>
          )}

          {/* Upload illustration */}
          <img
            src="/brand/upload-to-drive.png"
            alt="Upload"
            className="upload-dropzone-illustration"
          />

          {/* Main text */}
          <p className="upload-dropzone-title">
            Drag and Drop or browse your device to upload
          </p>

          {/* Dynamic remaining count */}
          <p className="upload-dropzone-subtitle">
            You can upload <strong>{remainingSlots}</strong> more artifact
            file{remainingSlots !== 1 ? "s" : ""}
          </p>

          {/* Browse button */}
          <button
            type="button"
            className="upload-browse-btn"
            onClick={handleBrowseClick}
          >
            Browse Files
          </button>
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          multiple
          accept={acceptString}
          onChange={handleFileInputChange}
        />

        {/* Upload Slots */}
        <div className="upload-slots-row">
          {slots.map((slot) => (
            <UploadSlotBox
              key={slot.id}
              slot={slot}
              onRemove={handleRemoveSlot}
            />
          ))}
        </div>
        
        {/* Make it 3D Checkbox (Only for Image Artifacts) */}
        {coreCategory === "Images" && (
          <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: successCount <= 3 ? "default" : "pointer", textAlign: "left" }}>
              <input 
                type="checkbox" 
                checked={make3D} 
                onChange={(e) => {
                  if (successCount > 3) setMake3D(e.target.checked);
                }}
                disabled={successCount <= 3}
                style={{ 
                  width: "20px", 
                  height: "20px", 
                  accentColor: "#c7511f",
                  cursor: successCount <= 3 ? "default" : "pointer",
                  flexShrink: 0
                }} 
              />
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ fontFamily: "Ubuntu, sans-serif", fontSize: "1.1rem", color: "#111", opacity: successCount <= 3 ? 0.5 : 1, fontWeight: 500 }}>
                  Make it 3D
                </span>
                <button 
                  type="button" 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShow3DInfo(true); }} 
                  style={{ marginLeft: "12px", background: "none", border: "none", color: "#0067b8", cursor: "pointer", fontSize: "0.95rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px", padding: 0 }}
                >
                  <FontAwesomeIcon icon={faInfoCircle} /> Why?
                </button>
              </div>
            </label>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "3rem",
          width: "100%",
          maxWidth: "800px",
        }}
      >
        <button
          onClick={() => (window.location.hash = "#publisher")}
          style={{
            padding: "8px 20px",
            backgroundColor: "transparent",
            color: "#000",
            border: "1px solid #000",
            borderRadius: "6px",
            fontSize: "0.95rem",
            fontWeight: "bold",
            cursor: "pointer",
            fontFamily: "Ubuntu, sans-serif",
          }}
        >
          Back
        </button>

        <button
          onClick={() => {
            setShowTransition(true);
            setTimeout(() => {
              // Store files info and advance (next stage TBD)
              localStorage.setItem(
                "publish_artifact_upload_count",
                String(successCount)
              );
              localStorage.setItem(
                "publish_artifact_make_3d",
                String(make3D)
              );
              window.location.hash = "#hashtags";
            }, 2000);
          }}
          disabled={successCount === 0 || showTransition}
          style={{
            padding: "8px 24px",
            backgroundColor: successCount === 0 ? "#ccc" : "#000",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "0.95rem",
            fontWeight: "bold",
            cursor: successCount === 0 ? "not-allowed" : "pointer",
            fontFamily: "Ubuntu, sans-serif",
            opacity: successCount === 0 ? 0.5 : 1,
          }}
        >
          Next
        </button>
      </div>

        </>
      )}

      {/* Error Modal (styled like AdsInfoModal, injected globally via Portal) */}
      <AlertModal
        isOpen={!!errorModal}
        onClose={() => setErrorModal(null)}
        title={errorModal?.title || "Information"}
        message={errorModal?.message || ""}
        showSupportLink={errorModal?.title === "Artifact type mismatch"}
      />

      {/* Image to 3D Custom Modal */}
      {show3DInfo && typeof document !== 'undefined' && createPortal(
        <AdsInfoModal 
          onClose={() => setShow3DInfo(false)}
          title="Image to 3D"
        >
          <p style={{ lineHeight: 1.6, fontSize: "1.05rem", marginBottom: "1.5rem", color: "#111" }}>
            Image to 3D is a technology used in OpenRockets Press that merges your images into a 3D object, allowing viewers to explore your project by rotating, moving, and zooming into it.
          </p>
          <p style={{ lineHeight: 1.6, fontSize: "1.05rem", color: "#111" }}>
            Use this feature only if your artifact falls into one of these categories: statues, 3-dimensional artworks, hardware inventions, or anything in general where you can capture all four sides. To enable this, you must upload at least 4 images capturing different sides of the object. For the best quality, we recommend uploading 6 images, including a top aerial view and a bottom view.
          </p>
        </AdsInfoModal>,
        document.body
      )}
    </div>
  );
}
