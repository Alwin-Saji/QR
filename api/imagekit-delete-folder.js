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

  const { folderPath } = req.body;

  if (!folderPath) {
    return res.status(400).json({ error: 'Missing folderPath' });
  }

  try {
    await new Promise((resolve, reject) => {
      imagekit.deleteFolder(folderPath, function(error, result) {
        if (error) {
          // If the folder is already deleted or doesn't exist, ImageKit might return an error, but we can safely ignore it.
          if (error.message && error.message.includes('not found')) {
            resolve();
          } else {
            reject(error);
          }
        }
        else resolve(result);
      });
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("ImageKit Delete Folder Error:", error);
    res.status(500).json({ error: "Failed to delete folder from ImageKit." });
  }
}
