import ImageKit from "imagekit";

const imagekit = new ImageKit({
  urlEndpoint: process.env.VITE_IMAGEKIT_URL_ENDPOINT || "",
  publicKey: process.env.VITE_IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { fileUrls } = req.body;

  if (!fileUrls || !Array.isArray(fileUrls)) {
    return res.status(400).json({ error: 'Missing or invalid fileUrls array' });
  }

  try {
    const urlEndpoint = process.env.VITE_IMAGEKIT_URL_ENDPOINT;
    const fileIdsToDelete = [];

    for (const url of fileUrls) {
      if (!url.startsWith(urlEndpoint)) continue;
      
      // Extract the path from the URL
      // Example URL: https://ik.imagekit.io/your_id/events/uuid/filename.jpg
      const urlWithoutEndpoint = url.replace(urlEndpoint, '');
      const path = urlWithoutEndpoint.split('?')[0]; // Remove query params if any
      
      // We need to list files to get the fileId based on the path
      const files = await new Promise((resolve, reject) => {
        // ImageKit's listFiles accepts searchQuery or path. Let's search by name
        const name = path.split('/').pop();
        imagekit.listFiles({
          searchQuery: `name="${name}"`
        }, function(error, result) {
          if (error) reject(error);
          else resolve(result);
        });
      });

      if (files && files.length > 0) {
        // Find the exact match
        const exactFile = files.find(f => f.filePath === path || f.filePath === `/${path}`);
        if (exactFile) {
          fileIdsToDelete.push(exactFile.fileId);
        }
      }
    }

    if (fileIdsToDelete.length > 0) {
      await new Promise((resolve, reject) => {
        imagekit.bulkDeleteFiles(fileIdsToDelete, function(error, result) {
          if (error) reject(error);
          else resolve(result);
        });
      });
    }

    res.status(200).json({ success: true, deletedCount: fileIdsToDelete.length });
  } catch (error) {
    console.error("ImageKit Delete Error:", error);
    res.status(500).json({ error: "Failed to delete files from ImageKit." });
  }
}
