import jsPDF from "jspdf";

const SOGGETI_LOGO_PATH = "/Sogeti-Logo.wine.svg";

let logoDataUrlPromise: Promise<string | null> | null = null;

async function getLogoDataUrl(): Promise<string | null> {
  if (!logoDataUrlPromise) {
    logoDataUrlPromise = fetch(SOGGETI_LOGO_PATH)
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }

        const svgText = await response.text();
        const svgBlob = new Blob([svgText], { type: "image/svg+xml" });
        const objectUrl = URL.createObjectURL(svgBlob);

        try {
          const image = new Image();
          image.src = objectUrl;
          await image.decode();

          const canvas = document.createElement("canvas");
          canvas.width = image.width || 220;
          canvas.height = image.height || 72;

          const context = canvas.getContext("2d");
          if (!context) {
            return null;
          }

          context.drawImage(image, 0, 0);
          return canvas.toDataURL("image/png");
        } finally {
          URL.revokeObjectURL(objectUrl);
        }
      })
      .catch(() => null);
  }

  return logoDataUrlPromise;
}

export async function addSogetiLogo(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<void> {
  const dataUrl = await getLogoDataUrl();

  if (!dataUrl) {
    return;
  }

  doc.addImage(dataUrl, "PNG", x, y, width, height);
}
