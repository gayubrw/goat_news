import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, ChevronRight } from "lucide-react";
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { prisma } from '@/lib/prisma';
import { getNews } from '@/actions/news';
import { formatDistanceToNow } from 'date-fns';
import type { Category, News, SubCategory } from '@/types';

type StoryCardProps = {
 news: News;
 categoryPath: string;
 featured?: boolean;
};

type CategoryWithSubCategories = Omit<Category, 'subCategories'> & {
    subCategories: Array<Omit<SubCategory, 'category'> & {
      category: Omit<Category, 'subCategories'>;
      news: News[];
    }>;
  };


const StoryCard = ({ news, categoryPath, featured = false }: StoryCardProps) => {
 if (featured) {
   return (
     <Link href={`/${categoryPath}/${news.subCategory.path}/${news.path}`}>
       <Card className="group relative h-[600px] overflow-hidden">
         <CardContent className="p-0 h-full">
           <div className="relative h-full">
             <Image
               src={news.thumbnailUrl || '/api/placeholder/1200/600'}
               alt={news.title}
               className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
               width={1200}
               height={600}
               priority={true}
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
             <div className="absolute inset-x-0 bottom-0 p-8">
               <Badge className="mb-4 bg-primary/90 backdrop-blur-sm text-primary-foreground">
                 {news.subCategory.title}
               </Badge>
               <h2 className="text-4xl font-bold text-white mb-4 transition-colors">
                 {news.title}
               </h2>
               <p className="text-zinc-200 text-lg mb-4 line-clamp-2">
                 {news.description}
               </p>
               <div className="flex items-center gap-2 text-zinc-300">
                 <Clock className="w-4 h-4" />
                 <span className="text-sm">
                   {formatDistanceToNow(new Date(news.createdAt), { addSuffix: true })}
                 </span>
               </div>
             </div>
           </div>
         </CardContent>
       </Card>
     </Link>
   );
 }

 return (
   <Link href={`/${categoryPath}/${news.subCategory.path}/${news.path}`}>
     <Card className="group overflow-hidden">
       <CardContent className="p-0">
         <div className="relative h-[400px]">
           <Image
             src={news.thumbnailUrl || '/api/placeholder/400/400'}
             alt={news.title}
             className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
             width={400}
             height={400}
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
           <div className="absolute inset-x-0 bottom-0 p-6">
             <Badge className="mb-3 bg-primary/90 backdrop-blur-sm text-primary-foreground">
               {news.subCategory.title}
             </Badge>
             <h3 className="text-xl font-bold text-white mb-2 transition-colors line-clamp-2">
               {news.title}
             </h3>
             <p className="text-zinc-200 text-sm mb-3 line-clamp-2">
               {news.description}
             </p>
             <div className="flex items-center justify-between text-zinc-300">
               <div className="flex items-center gap-2">
                 <Clock className="w-4 h-4" />
                 <span className="text-sm">
                   {formatDistanceToNow(new Date(news.createdAt), { addSuffix: true })}
                 </span>
               </div>
               <ChevronRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
             </div>
           </div>
         </div>
       </CardContent>
     </Card>
   </Link>
 );
};

async function validateCategory(categoryPath: string): Promise<CategoryWithSubCategories> {
    const category = await prisma.category.findUnique({
      where: { path: categoryPath },
      include: {
        subCategories: {
          include: {
            category: true,
            news: true
          }
        }
      }
    }) as CategoryWithSubCategories;

    if (!category) notFound();
    return category;
  }

async function getData(categoryPath: string) {
 const category = await validateCategory(categoryPath);
 const allNews = await getNews();

 // Filter news by category
 const categoryNews = allNews.filter(
   news => news.subCategory.category.path === categoryPath
 );

 return {
   category: category.title,
   categoryPath: category.path,
   featuredNews: categoryNews[0],
   latestNews: categoryNews.slice(1),
   subcategories: category.subCategories,
 };
}

export async function generateMetadata({
 params: paramsPromise,
}: {
 params: Promise<{ categories: string }>;
}): Promise<Metadata> {
 try {
   const params = await paramsPromise;
   const category = await validateCategory(params.categories);

   return {
     title: `${category.title} News - Latest Updates | GOAT`,
     description: `Stay updated with the latest ${category.title.toLowerCase()} news, breaking stories, and in-depth coverage.`,
   };
 } catch {
   return {
     title: 'Not Found - GOAT',
     description: 'The requested page could not be found.',
   };
 }
}

export default async function CategoryPage({
 params: paramsPromise,
}: {
 params: Promise<{ categories: string }>;
}) {
 const params = await paramsPromise;
 const data = await getData(params.categories);

 return (
   <div className="min-h-screen py-24">
     <header className="container mx-auto mb-4">
       <Breadcrumb className="mb-4">
         <BreadcrumbList>
           <BreadcrumbItem>
             <BreadcrumbLink href="/">Home</BreadcrumbLink>
           </BreadcrumbItem>
           <BreadcrumbSeparator />
           <BreadcrumbItem>
             <BreadcrumbPage>{data.category}</BreadcrumbPage>
           </BreadcrumbItem>
         </BreadcrumbList>
       </Breadcrumb>

       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-3">
         <h1 className="text-4xl font-bold">
           {data.category}
         </h1>
       </div>

       <ScrollArea className="w-full whitespace-nowrap pb-3">
         <div className="flex gap-2">
           {data.subcategories.map((subcategory) => (
             <Link
               key={subcategory.id}
               href={`/${data.categoryPath}/${subcategory.path}`}
             >
               <Badge
                 variant="outline"
                 className="px-4 py-2 font-medium text-xm tracking-wide hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
               >
                 {subcategory.title}
               </Badge>
             </Link>
           ))}
         </div>
         <ScrollBar orientation="horizontal" />
       </ScrollArea>
     </header>

     <main className="container mx-auto">
       {data.featuredNews && (
         <StoryCard
           news={data.featuredNews}
           categoryPath={data.categoryPath}
           featured={true}
         />
       )}

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
         {data.latestNews.map((news) => (
           <StoryCard
             key={news.id}
             news={news}
             categoryPath={data.categoryPath}
           />
         ))}
       </div>
     </main>
   </div>
 );
}
