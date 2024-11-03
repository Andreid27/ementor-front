import apiClient from "./axiosEmentor";

// Image cache to store image URLs based on user ID
const imageCache = new Map();

const profilePictureDownloader = async (url, userId) => {
  // If an image URL is already cached for this user ID, return it
  if (imageCache.has(userId)) {
    const cachedUrl = imageCache.get(userId);
    if (cachedUrl) {
      return cachedUrl; // Return cached image URL
    }
  }

  try {
    // Fetch the image as a blob from the API
    const response = await apiClient.get(url, {
      responseType: 'blob' // Set the responseType to 'blob'
    });

    // Check if the response is a valid blob
    if (response && response.data) {
      const blobUrl = URL.createObjectURL(response.data); // Create an object URL from the blob

      // Cache the image URL by user ID
      imageCache.set(userId, blobUrl);

      return blobUrl; // Return the blob URL
    } else {
      throw new Error("Invalid blob response");
    }
  } catch (error) {
    console.error(`Error downloading profile picture for user ID: ${userId}`, error);

    return null;
  }
};

export default profilePictureDownloader;
