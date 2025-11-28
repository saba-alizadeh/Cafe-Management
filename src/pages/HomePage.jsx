import React from 'react';
import { Box } from '@mui/material';
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
    return (
        <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', width: '100%', margin: 0, padding: 0 }}>
            <HeaderBar />
            <HeroSection />
            <BookingOptions />
            <CategoriesNavigation />
            <MenuSection />
            <DrinkCustomizer/>
            <SpecialDiscounts />
            {/* {<ChefRecommendations />}  */}
            <ServicesSection />
            <CustomerReviews />
            {/* <BranchesSection /> */}
            <ContactSection />
            <SocialLinks />
        </Box>
    );
};

export default HomePage;


