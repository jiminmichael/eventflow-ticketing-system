import sys

with open(r'c:\Users\YUWA\Documents\eventflow-ticketing-system\eventflow-ticketing-system\server\routes.ts', 'rb') as f:
    content = f.read().decode('utf-8')

PVC_ENDPOINT = r"""
// ── PVC IMAGE UPLOAD (Free in-house manual review, no 3rd-party API) ──────────
// Saves the uploaded PVC image to disk (or tmp on Vercel) and returns a unique ref.
// Organizers can review stored images via the admin portal before granting entry.
apiRouter.post('/pvc-upload', async (req: Request, res: Response) => {
  try {
    const { imageDataUrl, fileName, fileType } = req.body as {
      imageDataUrl?: string;
      fileName?: string;
      fileType?: string;
    };

    if (!imageDataUrl || !fileName || !fileType) {
      return res.status(400).json({ message: 'imageDataUrl, fileName and fileType are required.' });
    }

    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!ALLOWED_TYPES.includes(fileType)) {
      return res.status(400).json({ message: 'Only JPEG, PNG and WebP images are accepted.' });
    }

    const matches = imageDataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (!matches || matches.length < 3) {
      return res.status(400).json({ message: 'Invalid image data format.' });
    }
    const base64Data = matches[2];

    if (base64Data.length > 7_000_000) {
      return res.status(400).json({ message: 'Image is too large. Maximum is 5 MB.' });
    }

    const buffer = Buffer.from(base64Data, 'base64');

    const os = await import('os');
    const path = await import('path');
    const fs = await import('fs');
    const cryptoMod = await import('crypto');

    const storageDir = process.env.VERCEL
      ? path.join(os.tmpdir(), 'pvc_uploads')
      : path.join(process.cwd(), 'data', 'pvc_uploads');
    fs.mkdirSync(storageDir, { recursive: true });

    const ref = 'PVC-' + cryptoMod.randomUUID().slice(0, 8).toUpperCase();
    const ext = fileType === 'image/png' ? '.png' : fileType === 'image/webp' ? '.webp' : '.jpg';
    const filePath = path.join(storageDir, ref + ext);
    fs.writeFileSync(filePath, buffer);

    console.log('[PVC Upload] Stored:', filePath, 'ref=' + ref);

    res.json({
      success: true,
      ref,
      message: 'PVC image received. The organizer team will review before entry is granted.',
    });
  } catch (err: any) {
    console.error('[PVC Upload Error]', err);
    res.status(500).json({ message: 'Upload failed. Please try again.' });
  }
});

"""

OLD = "export const apiRouter = Router();\r\n"
if OLD not in content:
    OLD = "export const apiRouter = Router();\n"

if OLD in content:
    content = content.replace(OLD, OLD + PVC_ENDPOINT, 1)
    with open(r'c:\Users\YUWA\Documents\eventflow-ticketing-system\eventflow-ticketing-system\server\routes.ts', 'wb') as f:
        f.write(content.encode('utf-8'))
    print('routes.ts PVC endpoint inserted OK')
else:
    print('TARGET NOT FOUND')
    sys.exit(1)

