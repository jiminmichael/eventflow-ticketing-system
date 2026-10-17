/**
 * Reliable Client-Side File Downloader
 * Avoids window.open / popup blocker issues inside iframes.
 * Attaches Authorization Bearer token automatically if provided.
 */
export async function downloadFile(
  url: string,
  filenameFallback: string,
  token?: string | null
): Promise<{ success: boolean; message?: string }> {
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      const errJson = await response.json().catch(() => null);
      throw new Error(errJson?.message || `Failed to download file (HTTP ${response.status})`);
    }

    // Try to extract filename from Content-Disposition header
    let filename = filenameFallback;
    const disposition = response.headers.get('content-disposition');
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    }, 200);

    return { success: true };
  } catch (error: any) {
    console.error('[Download Helper Error]:', error);
    return { success: false, message: error.message || 'Download failed' };
  }
}
