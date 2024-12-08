import apiClient from "./axiosEmentor";

// Image cache to store image URLs based on user ID and size
const imageCache = new Map();

const profilePictureDownloader = async (url, userId, fullSize = false) => {
  // Check if the user ID is in the cache
  if (imageCache.has(userId)) {
    const userCache = imageCache.get(userId);

    // If fullSize image is requested and cached, return it
    if (fullSize && userCache.fullSize) {
      return userCache.fullSize;
    }

    // If regular image is requested and cached, return it
    if (!fullSize && userCache.regular) {
      return userCache.regular;
    }
  }

  try {
    // Fetch the image as a blob from the API
    const response = await apiClient.get(url, {
      responseType: 'blob', // Set the responseType to 'blob'
    });

    // Check if the response is a valid blob
    if (response && response.data) {
      const blobUrl = URL.createObjectURL(response.data); // Create an object URL from the blob

      // Cache the image based on size
      const userCache = imageCache.get(userId) || {};
      if (fullSize) {
        userCache.fullSize = blobUrl;
      } else {
        userCache.regular = blobUrl;
      }
      imageCache.set(userId, userCache);

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
