import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, FolderTree, Newspaper } from 'lucide-react';
import { getCategories } from '@/actions/category';
import { getSubCategories } from '@/actions/subcategory';
import { getNews } from '@/actions/news';

interface StatisticCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: React.ReactNode;
}

interface LayoutProps {
    heading: string;
    action?: React.ReactNode;
    children: React.ReactNode;
}

const StatisticCard = ({ title, value, description, icon }: StatisticCardProps) => (
    <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2">
                {icon && <span className="md:hidden">{icon}</span>}
                {title}
            </CardTitle>
            <span className="hidden md:block">{icon}</span>
        </CardHeader>
        <CardContent className="p-4 pt-2">
            <div className="text-lg sm:text-xl md:text-2xl font-bold">{value}</div>
            {description && (
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                    {description}
                </p>
            )}
        </CardContent>
    </Card>
);

async function Layout({ heading, action, children }: LayoutProps) {
    // Fetch all data concurrently
    const [categories, subCategories, news] = await Promise.all([
        getCategories(),
        getSubCategories(),
        getNews()
    ]);

    // Calculate totals
    const totalCategories = categories?.length ?? 0;
    const totalSubCategories = subCategories?.length ?? 0;
    const totalNews = news?.length ?? 0;

    const cards = [
        {
            title: 'Main Categories',
            value: totalCategories,
            description: 'Active categories',
            icon: <FolderTree className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        },
        {
            title: 'Sub Categories',
            value: totalSubCategories,
            description: `In ${totalCategories} categories`,
            icon: <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        },
        {
            title: 'News',
            value: totalNews,
            description: 'Total articles',
            icon: <Newspaper className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        },
    ];

    return (
        <div className="pt-12">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 md:mb-6">
                <h1 className="text-xl sm:text-2xl font-bold">{heading}</h1>
                {action && (
                    <div className="w-full sm:w-auto">
                        {action}
                    </div>
                )}
            </div>

            <div className="pt-0 grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 md:mb-6">
                {cards.map((card, index) => (
                    <div key={index} className={index === 2 ? "col-span-2 md:col-span-1" : ""}>
                        <StatisticCard {...card} />
                    </div>
                ))}
            </div>

            {children}
        </div>
    );
}

export default Layout;
