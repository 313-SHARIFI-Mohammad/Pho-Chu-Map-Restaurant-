export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function compressImage(file, maxSize = 900, quality = 0.8) {
  const dataUrl = await fileToDataUrl(file);

  const img = document.createElement("img");
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = () => reject(new Error("Could not read the selected image file."));
    img.src = dataUrl;
  });

  const width = img.naturalWidth || 0;
  const height = img.naturalHeight || 0;
  if (!width || !height) {
    throw new Error("Could not determine the image dimensions.");
  }

  const scale = Math.min(1, maxSize / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  if (typeof canvas.toDataURL === "function") {
    return canvas.toDataURL("image/jpeg", quality);
  }

  if (typeof canvas.toBlob === "function") {
    const blob = await canvas.toBlob();
    return fileToDataUrl(new File([blob], "image.jpg", { type: "image/jpeg" }));
  }

  throw new Error("This browser does not support canvas image export.");
}