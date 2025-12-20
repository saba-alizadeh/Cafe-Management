import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

// Pages
import HomePage from "./pages/HomePage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import BaristaDashboard from "./pages/barista/BaristaDashboard";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import NotFound from "./pages/NotFound";
import AdminManagerLogin from "./pages/AdminManagerLogin";
import CinemaBooking from "./pages/booking/CinemaBooking";
import CafeBooking from "./pages/booking/CafeBooking";
import SharedSpaceBooking from "./pages/booking/SharedSpaceBooking";
import EventBooking from "./pages/booking/EventBooking";
import CafeSelection from "./pages/CafeSelection";

// Context
import { AuthProvider } from "./context/AuthContext";

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/select-cafe" element={<CafeSelection />} />
                    <Route path="/booking/cinema" element={<CinemaBooking />} />
                    <Route path="/booking/cafe" element={<CafeBooking />} />
                    <Route path="/booking/shared" element={<SharedSpaceBooking />} />
                    <Route path="/booking/event" element={<EventBooking />} />
                    <Route path="/admin-login" element={<AdminManagerLogin />} />
                    <Route path="/admin/*" element={<AdminDashboard />} />
                    <Route path="/manager/*" element={<ManagerDashboard />} />
                    <Route path="/barista/*" element={<BaristaDashboard />} />
                    <Route path="/customer/*" element={<CustomerDashboard />} />
                    <Route path="/:cafeSlug" element={<HomePage />} />
                    <Route path="/" element={<Navigate to="/select-cafe" replace />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
