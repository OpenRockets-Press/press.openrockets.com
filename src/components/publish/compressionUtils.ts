import imageCompression from 'browser-image-compression';

/**
 * Compresses an image file client-side to ensure it is under 10MB.
 */
export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 9.5, // Target slightly below 10MB for safety
    maxWidthOrHeight: 4096, // Large enough for high quality, but restricts insanely huge images
    useWebWorker: true,
    initialQuality: 0.8,
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    // browser-image-compression returns a Blob, so we cast it back to a File
    return new File([compressedBlob], file.name, {
      type: compressedBlob.type,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error("Image compression failed:", error);
    return file; // If compression fails, return original and let validation catch it
  }
}

/**
 * Attempts to compress a PDF file client-side.
 * Since true client-side PDF compression is limited, this method relies on
 * pdf-lib's default serialization which can rebuild and strip unused objects,
 * potentially reducing file size.
 */
export async function compressPdf(file: File): Promise<File> {
  try {
    // Dynamically import from esm.sh to avoid local dependency issues
    const pdfLib = await import('https://esm.sh/pdf-lib');
    const PDFDocument = pdfLib.PDFDocument;

    const arrayBuffer = await file.arrayBuffer();
    // Load the PDF. Ignore encryption errors if present (we can't compress encrypted PDFs)
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

    // Save it. By default, useObjectStreams is true which compresses objects.
    const pdfBytes = await pdfDoc.save({ useObjectStreams: true });

    return new File([pdfBytes], file.name, {
      type: "application/pdf",
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error("PDF compression failed:", error);
    return file; // If it fails, return original file
  }
}
