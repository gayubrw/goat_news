import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, FolderTree, Newspaper, Loader2 } from 'lucide-react';
import { getCategories } from '@/actions/category';
import { getSubCategories } from '@/actions/subcategory';
import { getNews } from '@/actions/news';
import { Suspense } from 'react';

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

const LoadingState = () => (
  <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Loading dashboard...</p>
    </div>
  </div>
);

async function Layout({ heading, action, children }: LayoutProps) {
  return (
    <Suspense fallback={<LoadingState />}>
      <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{heading}</h1>
          </div>
          {action && <div className="w-full md:w-auto">{action}</div>}
        </div>

        <DashboardContent />

        {children}
      </div>
    </Suspense>
  );
}

async function DashboardContent() {
  const [categories, subCategories, news] = await Promise.all([
    getCategories(),
    getSubCategories(),
    getNews()
  ]);

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
    <div className="grid gap-6 md:grid-cols-3">
      {cards.map((card, index) => (
        <StatisticCard key={index} {...card} />
      ))}
    </div>
  );
}

export default Layout;
