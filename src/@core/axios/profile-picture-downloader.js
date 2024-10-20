import apiClient from "./axiosEmentor";

// Image cache to store image URLs based on user ID
const imageCache = new Map();

const profilePictureDownloader = async (url, userId) => {
  // Check if the image is already cached by user ID
  if (imageCache.has(userId)) {
    return imageCache.get(userId); // Return cached image URL
  }

  try {
    // Fetch the image as a blob from the API
    const response = await apiClient.get(url, {
      responseType: 'blob' // Set the responseType to 'blob'
    });

    const blobUrl = URL.createObjectURL(response.data); // Create an object URL from the blob

    // Cache the image URL by user ID
    imageCache.set(userId, blobUrl);

    return blobUrl; // Return the blob URL
  } catch (error) {
    console.error(`Error downloading profile picture for user ID: ${userId}`, error);

    return null;
  }
};

export default profilePictureDownloader;
