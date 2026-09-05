export type PreparedPhoto = { blob: Blob; width: number; height: number };

export async function preparePhoto(source: Blob): Promise<PreparedPhoto> {
  if (!source.size) throw new Error('This photo is empty. Choose another photo.');
  if (source.size > 20 * 1024 * 1024) throw new Error('Choose a photo smaller than 20 MB.');
  if (source.type && !['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'].includes(source.type)) {
    throw new Error('Choose a JPEG, PNG, or WebP photo.');
  }
  let bitmap: ImageBitmap;
  try { bitmap = await createImageBitmap(source, { imageOrientation: 'from-image' }); }
  catch { throw new Error('This browser cannot open that photo. Try a JPEG or PNG version.'); }
  const canvas = document.createElement('canvas');
  try {
    if (!bitmap.width || !bitmap.height || bitmap.width * bitmap.height > 40_000_000) throw new Error('This photo is too large to preview. Choose a smaller version.');
    const scale = Math.min(1, 1536 / Math.max(bitmap.width, bitmap.height));
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Photo preview is unavailable in this browser.');
    context.fillStyle = '#fffdfa';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    // Re-encoding pixels removes source EXIF/GPS metadata.
    for (const quality of [0.86, 0.7, 0.5]) {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
      if (blob && blob.size <= 2 * 1024 * 1024) return { blob, width: canvas.width, height: canvas.height };
    }
    throw new Error('This photo could not be prepared. Choose a smaller version.');
  } finally {
    bitmap.close();
    canvas.width = canvas.height = 0;
  }
}
