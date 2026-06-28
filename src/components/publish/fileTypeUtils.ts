import { BASE_TYPES } from "./TypeSelectorScreen";

// ─── Core Category Mapping ─────────────────────────────────────────────────────

export function getCoreCategory(typeId: string): string {
  const found = BASE_TYPES.find(t => t.id === typeId);
  return found?.coreCategory ?? "Images"; // Default fallback
}

// ─── File Type Definitions ──────────────────────────────────────────────────────

export interface FileTypeLabel {
  name: string;
  icon: "pdf" | "image" | "code" | "cube" | "word";
  color: string;
}

// MIME types for the HTML file input `accept` attribute
const RESEARCH_ACCEPT = ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const IMAGE_EXTENSIONS = [
  ".png", ".jpg", ".jpeg", ".bmp", ".webp", ".tiff", ".tif",
  ".heic", ".heif"
];
const IMAGE_ACCEPT = IMAGE_EXTENSIONS.join(",") + ",image/*";

const CLUB_EXTENSIONS = [...IMAGE_EXTENSIONS, ".pdf"];
const CLUB_ACCEPT = CLUB_EXTENSIONS.join(",") + ",image/*,application/pdf";

const THREE_D_EXTENSIONS = [".obj", ".stl", ".3mf", ".fbx", ".gltf", ".glb", ".step", ".stp", ".iges", ".igs", ".ply", ".dae"];
const THREE_D_ACCEPT = THREE_D_EXTENSIONS.join(",");

// For Software/Code: we use exclusion-based logic, so accept everything
const CODE_ACCEPT = "*";

// Blocked extensions for Software/Code (exclusion list)
const CODE_BLOCKED_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".svg", ".webp", ".heic", ".heif", ".tiff", ".tif",
  ".cr2", ".nef", ".arw", ".dng", ".orf", ".rw2", ".pef", ".sr2",
  ".mp4", ".avi", ".mov", ".mkv", ".webm", ".flv", ".wmv",
  ".pdf",
  ".doc", ".docx", ".pptx", ".xlsx",
]);

// Blocked extensions for Images (GIF is explicitly rejected)
const IMAGE_BLOCKED_EXTENSIONS = new Set([".gif"]);

// ─── Accept String for HTML Input ──────────────────────────────────────────────

export function getAcceptString(coreCategory: string): string {
  switch (coreCategory) {
    case "Research": return RESEARCH_ACCEPT;
    case "Images": return IMAGE_ACCEPT;
    case "Club Artifacts": return CLUB_ACCEPT;
    case "3D Models": return THREE_D_ACCEPT;
    case "Software and Code": return CODE_ACCEPT;
    default: return IMAGE_ACCEPT;
  }
}

// ─── File Validation ────────────────────────────────────────────────────────────

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) return "";
  return filename.substring(lastDot).toLowerCase();
}

export type FileKind = "image" | "pdf" | "word" | "code" | "3d" | "unknown";

export function getFileKind(file: File): FileKind {
  const ext = getFileExtension(file.name);
  
  if (file.type === "application/pdf" || ext === ".pdf") return "pdf";
  if (ext === ".doc" || ext === ".docx") return "word";
  if (file.type.startsWith("image/") || IMAGE_EXTENSIONS.includes(ext)) return "image";
  if (THREE_D_EXTENSIONS.includes(ext)) return "3d";
  
  // Everything else is code
  return "code";
}

export function validateFile(file: File, coreCategory: string): { valid: boolean; errorTitle?: string; errorMessage?: string; needsCompression?: boolean } {
  const isOversized = file.size > MAX_FILE_SIZE;
  const kind = getFileKind(file);
  const isCompressible = kind === "image" || kind === "pdf";
  const ext = getFileExtension(file.name) || "unknown";

  // Size check
  if (isOversized && !isCompressible) {
    return { 
      valid: false, 
      errorTitle: "Upload failure", 
      errorMessage: `File "${file.name}" exceeds the 10 MB limit and cannot be auto-compressed.` 
    };
  }

  switch (coreCategory) {
    case "Research": {
      const allowed = new Set([".pdf", ".doc", ".docx"]);
      if (!allowed.has(ext)) {
        return { 
          valid: false, 
          errorTitle: "Artifact type mismatch", 
          errorMessage: `Your chosen category, which is ${coreCategory}, does not support this file type of ${ext}.` 
        };
      }
      break;
    }

    case "Images": {
      if (IMAGE_BLOCKED_EXTENSIONS.has(ext)) {
        return { 
          valid: false, 
          errorTitle: "Artifact type mismatch", 
          errorMessage: `Your chosen category, which is ${coreCategory}, does not support this file type of ${ext}.` 
        };
      }
      const imageExts = new Set(IMAGE_EXTENSIONS);
      // Also allow by MIME type
      if (!imageExts.has(ext) && !file.type.startsWith("image/")) {
        return { 
          valid: false, 
          errorTitle: "Artifact type mismatch", 
          errorMessage: `Your chosen category, which is ${coreCategory}, does not support this file type of ${ext}.` 
        };
      }
      break;
    }

    case "Club Artifacts": {
      if (IMAGE_BLOCKED_EXTENSIONS.has(ext)) {
        return { 
          valid: false, 
          errorTitle: "Artifact type mismatch", 
          errorMessage: `Your chosen category, which is ${coreCategory}, does not support this file type of ${ext}.` 
        };
      }
      const clubExts = new Set(CLUB_EXTENSIONS);
      if (!clubExts.has(ext) && !file.type.startsWith("image/") && file.type !== "application/pdf") {
        return { 
          valid: false, 
          errorTitle: "Artifact type mismatch", 
          errorMessage: `Your chosen category, which is ${coreCategory}, does not support this file type of ${ext}.` 
        };
      }
      break;
    }

    case "3D Models": {
      const threeDExts = new Set(THREE_D_EXTENSIONS);
      if (!threeDExts.has(ext)) {
        return { 
          valid: false, 
          errorTitle: "Artifact type mismatch", 
          errorMessage: `Your chosen category, which is ${coreCategory}, does not support this file type of ${ext}.` 
        };
      }
      break;
    }

    case "Software and Code": {
      if (CODE_BLOCKED_EXTENSIONS.has(ext)) {
        return { 
          valid: false, 
          errorTitle: "Artifact type mismatch", 
          errorMessage: `Your chosen category, which is ${coreCategory}, does not support this file type of ${ext}.` 
        };
      }
      break;
    }
  }

  if (isOversized && isCompressible) {
    return { valid: true, needsCompression: true };
  }

  return { valid: true };
}

// ─── Supported File Type Labels (for UI display) ───────────────────────────────

export function getSupportedFileTypeLabels(coreCategory: string): FileTypeLabel[] {
  switch (coreCategory) {
    case "Research":
      return [
        { name: "PDF", icon: "pdf", color: "#d52b1e" },
        { name: "DOC", icon: "word", color: "#00a4e4" },
        { name: "DOCX", icon: "word", color: "#00a4e4" },
      ];

    case "Images":
      return [
        { name: "PNG", icon: "image", color: "#00a4e4" },
        { name: "JPEG", icon: "image", color: "#00a4e4" },
        { name: "BMP", icon: "image", color: "#f2a900" },
        { name: "WebP", icon: "image", color: "#82c341" },
        { name: "TIFF", icon: "image", color: "#613393" },
        { name: "HEIC", icon: "image", color: "#009ca6" },
      ];

    case "Club Artifacts":
      return [
        { name: "PNG", icon: "image", color: "#00a4e4" },
        { name: "JPEG", icon: "image", color: "#00a4e4" },
        { name: "BMP", icon: "image", color: "#f2a900" },
        { name: "WebP", icon: "image", color: "#82c341" },
        { name: "PDF", icon: "pdf", color: "#d52b1e" },
      ];

    case "3D Models":
      return [
        { name: "OBJ", icon: "cube", color: "#613393" },
        { name: "STL", icon: "cube", color: "#00a4e4" },
        { name: "3MF", icon: "cube", color: "#82c341" },
        { name: "FBX", icon: "cube", color: "#f2a900" },
        { name: "GLTF", icon: "cube", color: "#009ca6" },
        { name: "GLB", icon: "cube", color: "#009ca6" },
        { name: "STEP", icon: "cube", color: "#d52b1e" },
        { name: "PLY", icon: "cube", color: "#ff7300" },
        { name: "DAE", icon: "cube", color: "#613393" },
      ];

    case "Software and Code":
      return [
        { name: "All Code Files", icon: "code", color: "#82c341" },
      ];

    default:
      return [];
  }
}

// ─── File Category Detection (for thumbnails) ──────────────────────────────────

// (getFileKind moved above validateFile)

// Check if this is a Word file that needs conversion indication
export function isWordFile(file: File): boolean {
  const ext = getFileExtension(file.name);
  return ext === ".doc" || ext === ".docx";
}
