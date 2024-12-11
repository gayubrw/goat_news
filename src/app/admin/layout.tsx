'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar, Sidebar, Footer } from '@/components/admin/navigation';
import { getCurrentUserData } from '@/actions/user';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<AdminLayoutProps> = ({ children }) => {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check admin access
        const checkAdminAccess = async () => {
            try {
                const user = await getCurrentUserData();
                console.log('user', user);
                if (!user || user.role !== 'admin') {
                    router.push('/');
                }
            } catch (error) {
                console.error('Error checking admin access:', error);
                router.push('/');
            } finally {
                setIsLoading(false);
            }
        };

        checkAdminAccess();
    }, [router]);

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

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

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
