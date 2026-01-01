import { useEffect } from 'react';
import { getImageUrl } from '../utils/imageUtils';

/**
 * Custom hook to dynamically update the favicon based on the selected cafe's logo
 * @param {Object} selectedCafe - The selected cafe object with logo_url
 * @param {string} apiBaseUrl - The API base URL
 */
export const useFavicon = (selectedCafe, apiBaseUrl) => {
    useEffect(() => {
        if (!selectedCafe?.logo_url) {
            // Reset to default favicon if no cafe logo
            const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
            link.type = 'image/svg+xml';
            link.rel = 'icon';
            link.href = '/vite.svg';
            if (!document.querySelector("link[rel*='icon']")) {
                document.getElementsByTagName('head')[0].appendChild(link);
            }
            document.title = 'کافه';
            return;
        }

        const logoUrl = getImageUrl(selectedCafe.logo_url, apiBaseUrl);
        if (!logoUrl) return;

        // Create or update favicon link
        let link = document.querySelector("link[rel*='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.getElementsByTagName('head')[0].appendChild(link);
        }

        // Convert logo to favicon using canvas for proper sizing
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Handle CORS if needed
        
        img.onload = () => {
            try {
                // Create canvas to resize logo for favicon (32x32 is standard)
                const canvas = document.createElement('canvas');
                canvas.width = 32;
                canvas.height = 32;
                const ctx = canvas.getContext('2d');
                
                // Draw logo on canvas with proper scaling
                ctx.drawImage(img, 0, 0, 32, 32);
                
                // Convert to data URL and set as favicon
                const dataUrl = canvas.toDataURL('image/png');
                link.href = dataUrl;
                link.type = 'image/png';
            } catch (error) {
                // Fallback: use logo URL directly if canvas conversion fails
                console.warn('Failed to convert logo to favicon, using direct URL:', error);
                link.href = logoUrl;
                link.type = 'image/png';
            }
        };
        
        img.onerror = () => {
            // Fallback to default if image fails to load
            link.href = '/vite.svg';
            link.type = 'image/svg+xml';
        };
        
        img.src = logoUrl;

        // Update the page title with cafe name
        if (selectedCafe.name) {
            document.title = `${selectedCafe.name} - کافه`;
        } else {
            document.title = 'کافه';
        }
    }, [selectedCafe?.logo_url, selectedCafe?.name, apiBaseUrl]);
};

