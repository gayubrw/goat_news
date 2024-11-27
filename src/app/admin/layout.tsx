'use client';

import React, { useState, useEffect } from 'react';
import { Navbar, Sidebar, Footer } from '@/components/admin/navigation';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<AdminLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // Handle screen resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth < 1024) {
                setSidebarOpen(false);
            }
        };

        // Check on initial load
        checkMobile();

        // Add resize listener
        window.addEventListener('resize', checkMobile);

        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    return (
        <div className="min-h-screen bg-background">
            {/* Overlay for mobile when sidebar is open */}
            {isMobile && sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                isMobile={isMobile}
            />
            <Navbar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                isMobile={isMobile}
            />

            <main
                className={`transition-all duration-200 mb-16 p-6
                    ${isMobile ? '' : sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}
            >
                <div className="mx-auto max-w-7xl">{children}</div>
            </main>

            <Footer
                sidebarOpen={sidebarOpen}
                isMobile={isMobile}
            />
        </div>
    );
};

export default Layout;
