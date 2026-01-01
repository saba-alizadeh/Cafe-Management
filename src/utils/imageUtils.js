/**
 * Utility function to construct full image URLs from relative paths returned by the backend.
 * The backend returns relative URLs like "/api/products/image/{image_id}" which need
 * to be prepended with the API base URL to form complete URLs.
 * 
 * @param {string} imageUrl - The image URL from the backend (can be relative or absolute)
 * @param {string} apiBaseUrl - The base URL of the API (e.g., "http://localhost:8000/api")
 * @returns {string|null} - The full image URL or null if imageUrl is empty/falsy
 */
export const getImageUrl = (imageUrl, apiBaseUrl) => {
    if (!imageUrl) return null;
    
    // If it's already an absolute URL (starts with http:// or https://), return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }
    
    // If it's a data URL (base64), return as is
    if (imageUrl.startsWith('data:')) {
        return imageUrl;
    }
    
    // If it's a relative path starting with '/', check if it already includes '/api'
    if (imageUrl.startsWith('/')) {
        // If the path already starts with '/api', we need to construct the full URL
        // apiBaseUrl is typically "http://localhost:8000/api"
        // imageUrl is typically "/api/products/image/{id}"
        // We need: "http://localhost:8000/api/products/image/{id}"
        
        // Remove the leading '/' and check if it starts with 'api'
        const pathWithoutLeadingSlash = imageUrl.substring(1);
        if (pathWithoutLeadingSlash.startsWith('api/')) {
            // Extract the base URL without '/api' (e.g., "http://localhost:8000")
            const baseUrl = apiBaseUrl.replace('/api', '');
            return `${baseUrl}${imageUrl}`;
        } else {
            // Path doesn't start with 'api/', so just prepend apiBaseUrl
            return `${apiBaseUrl}${imageUrl}`;
        }
    }
    
    // For any other case, prepend apiBaseUrl with a slash
    return `${apiBaseUrl}/${imageUrl}`;
};

