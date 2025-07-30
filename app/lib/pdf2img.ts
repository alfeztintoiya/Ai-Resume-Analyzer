export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

let pdfjsLib: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

// Test function to verify PDF.js is working
export async function testPdfJsLibrary(): Promise<{ success: boolean; error?: string }> {
  try {
    const lib = await loadPdfJs();
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

async function loadPdfJs(): Promise<any> {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;

  isLoading = true;
  
  try {
    loadPromise = (async () => {
      try {
        // Try the standard import path first
        const lib = await import("pdfjs-dist");
        
        // Set the worker source to use local file
        lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        pdfjsLib = lib;
        isLoading = false;
        console.log('PDF.js library loaded successfully (standard import)');
        return lib;
      } catch (standardError) {
        console.warn('Standard import failed, trying build path:', standardError);
        
        try {
          // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module
          const lib = await import("pdfjs-dist/build/pdf.mjs");
          
          // Set the worker source to use local file
          lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
          pdfjsLib = lib;
          isLoading = false;
          console.log('PDF.js library loaded successfully (build path)');
          return lib;
        } catch (buildError) {
          console.error("Both PDF.js import methods failed:", { standardError, buildError });
          isLoading = false;
          loadPromise = null;
          throw new Error(`PDF.js library failed to load: ${buildError instanceof Error ? buildError.message : String(buildError)}`);
        }
      }
    })();

    return loadPromise;
  } catch (error) {
    isLoading = false;
    loadPromise = null;
    throw error;
  }
}

export async function convertPdfToImage(
  file: File
): Promise<PdfConversionResult> {
  try {
    console.log('PDF Conversion - Step 1: Starting conversion');
    
    // Validate input file
    if (!file || file.type !== 'application/pdf') {
      console.error('PDF Conversion - Step 1: Invalid file type', { file, type: file?.type });
      return {
        imageUrl: "",
        file: null,
        error: "Invalid file: Only PDF files are supported",
      };
    }

    console.log('PDF Conversion - Step 2: Loading PDF.js library');
    const lib = await loadPdfJs();
    
    console.log('PDF Conversion - Step 3: Reading file as array buffer');
    const arrayBuffer = await file.arrayBuffer();
    
    // Validate PDF data
    if (arrayBuffer.byteLength === 0) {
      console.error('PDF Conversion - Step 3: Empty file');
      return {
        imageUrl: "",
        file: null,
        error: "Empty PDF file",
      };
    }

    console.log('PDF Conversion - Step 4: Loading PDF document', { fileSize: arrayBuffer.byteLength });
    const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
    
    if (!pdf || pdf.numPages === 0) {
      console.error('PDF Conversion - Step 4: Invalid PDF document', { pdf, numPages: pdf?.numPages });
      return {
        imageUrl: "",
        file: null,
        error: "Invalid PDF: No pages found",
      };
    }

    console.log('PDF Conversion - Step 5: Getting first page', { numPages: pdf.numPages });
    const page = await pdf.getPage(1);

    console.log('PDF Conversion - Step 6: Setting up canvas');
    const viewport = page.getViewport({ scale: 4 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      console.error('PDF Conversion - Step 6: Failed to create canvas context');
      return {
        imageUrl: "",
        file: null,
        error: "Failed to create canvas 2D context",
      };
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    console.log('PDF Conversion - Step 7: Rendering page to canvas', { 
      canvasSize: { width: canvas.width, height: canvas.height },
      viewport: { width: viewport.width, height: viewport.height }
    });
    
    await page.render({ canvasContext: context, viewport }).promise;

    console.log('PDF Conversion - Step 8: Converting canvas to blob');
    
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('PDF Conversion - Step 8: Blob created successfully', { blobSize: blob.size });
            // Create a File from the blob with the same name as the pdf
            const originalName = file.name.replace(/\.pdf$/i, "");
            const imageFile = new File([blob], `${originalName}.png`, {
              type: "image/png",
            });

            console.log('PDF Conversion - SUCCESS: Image file created', { 
              originalName, 
              imageFileName: imageFile.name, 
              imageFileSize: imageFile.size 
            });

            resolve({
              imageUrl: URL.createObjectURL(blob),
              file: imageFile,
            });
          } else {
            console.error('PDF Conversion - Step 8: Failed to create blob');
            resolve({
              imageUrl: "",
              file: null,
              error: "Failed to create image blob from canvas",
            });
          }
        },
        "image/png",
        1.0
      ); // Set quality to maximum (1.0)
    });
  } catch (err) {
    console.error("PDF Conversion - EXCEPTION:", err);
    return {
      imageUrl: "",
      file: null,
      error: `Failed to convert PDF: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}