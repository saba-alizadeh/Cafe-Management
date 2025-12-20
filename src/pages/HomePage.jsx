import React, { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import HeaderBar from './home/components/HeaderBar';
import HeroSection from './home/components/HeroSection';
import CategoriesNavigation from './home/components/CategoriesNavigation';
import BookingOptions from './home/components/BookingOptions';
import MenuSection from './home/components/MenuSection';
import SpecialDiscounts from './home/components/SpecialDiscounts';
import ChefRecommendations from './home/components/ChefRecommendations';
import DrinkCustomizer from './home/components/DrinkCustomizer';
import ServicesSection from './home/components/ServicesSection';
import CustomerReviews from './home/components/CustomerReviews';
import BranchesSection from './home/components/BranchesSection';
import ContactSection from './home/components/ContactSection';
import SocialLinks from './home/components/SocialLinks';

const HomePage = () => {
    const [selectedCafe, setSelectedCafe] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const { cafeSlug } = useParams();

    // Convert cafe name to URL-friendly slug
    const createCafeSlug = (name) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    useEffect(() => {
        // Don't process if we're on select-cafe or other special routes
        const currentPath = location.pathname;
        const specialRoutes = ['/select-cafe', '/booking', '/admin', '/manager', '/barista', '/customer', '/admin-login'];
        
        if (specialRoutes.some(route => currentPath.startsWith(route))) {
            setLoading(false);
            return;
        }

        // Check if a cafe is selected
        const storedCafe = localStorage.getItem('selectedCafe');
        
        if (!storedCafe) {
            // No cafe selected, redirect to selection page
            navigate('/select-cafe', { replace: true });
            return;
        }

        try {
            const cafe = JSON.parse(storedCafe);
            
            // If URL has a cafe slug, verify it matches the stored cafe
            if (cafeSlug) {
                const expectedSlug = createCafeSlug(cafe.name);
                if (cafeSlug !== expectedSlug) {
                    // Slug doesn't match, redirect to correct URL
                    navigate(`/${expectedSlug}`, { replace: true });
                    return;
                }
            } else if (currentPath === '/') {
                // No slug in URL but we have a cafe, redirect to slug URL
                const slug = createCafeSlug(cafe.name);
                navigate(`/${slug}`, { replace: true });
                return;
            }
            
            setSelectedCafe(cafe);
        } catch (error) {
            console.error('Error parsing selected cafe:', error);
            // Invalid cafe data, redirect to selection
            localStorage.removeItem('selectedCafe');
            navigate('/select-cafe', { replace: true });
            return;
        }

        setLoading(false);
    }, [navigate, cafeSlug, location.pathname]);

    // Show loading while checking for selected cafe
    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh',
                bgcolor: 'var(--color-secondary)'
            }}>
                <CircularProgress />
            </Box>
        );
    }

    // If no cafe selected, don't render (will redirect)
    if (!selectedCafe) {
        return null;
    }

    return (
        <Box sx={{ bgcolor: 'var(--color-secondary)', minHeight: '100vh', width: '100%', margin: 0, padding: 0 }}>
            <HeaderBar selectedCafe={selectedCafe} />
            <HeroSection selectedCafe={selectedCafe} />
            <BookingOptions selectedCafe={selectedCafe} />
            <CategoriesNavigation selectedCafe={selectedCafe} />
            <MenuSection selectedCafe={selectedCafe} />
            <DrinkCustomizer selectedCafe={selectedCafe} />
            <SpecialDiscounts selectedCafe={selectedCafe} />
            {/* {<ChefRecommendations selectedCafe={selectedCafe} />}  */}
            <ServicesSection selectedCafe={selectedCafe} />
            <CustomerReviews selectedCafe={selectedCafe} />
            {/* <BranchesSection selectedCafe={selectedCafe} /> */}
            <ContactSection selectedCafe={selectedCafe} />
            <SocialLinks selectedCafe={selectedCafe} />
        </Box>
    );
};

export default HomePage;


