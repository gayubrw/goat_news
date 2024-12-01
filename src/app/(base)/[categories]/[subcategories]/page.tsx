import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, ChevronRight } from "lucide-react";
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { getSubCategories } from '@/actions/subcategory';
import { getNews } from '@/actions/news';
import { formatDistanceToNow } from 'date-fns';
import type { News } from '@/types';

type StoryCardProps = {
 news: News;
 category: string;
 subcategory: string;
 featured?: boolean;
};

const StoryCard = ({ news, category, subcategory, featured = false }: StoryCardProps) => {
 if (featured) {
   return (
     <Link href={`/${category}/${subcategory}/${news.path}`}>
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
                 Latest News
               </Badge>
               <h2 className="text-4xl font-bold text-white mb-4 group-hover:text-primary transition-colors">
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
   <Link href={`/${category}/${subcategory}/${news.path}`}>
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
             <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors line-clamp-2">
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

async function getData(category: string, subcategory: string) {
 const subCategories = await getSubCategories();
 const decodedPath = decodeURIComponent(subcategory);
 const subCategory = subCategories.find(sub => sub.path === decodedPath);

 if (!subCategory) notFound();
 if (subCategory.category.path !== category.toLowerCase()) notFound();

 const allNews = await getNews(subCategory.id);

 return {
   subCategory,
   news: allNews
 };
}

export async function generateMetadata({
 params: paramsPromise,
}: {
 params: Promise<{
   categories: string;
   subcategories: string;
 }>;
}): Promise<Metadata> {
 try {
   const params = await paramsPromise;
   const { subCategory } = await getData(params.categories, params.subcategories);

   return {
     title: `${subCategory.title} News - ${subCategory.category.title} - GOAT`,
     description: subCategory.description,
   };
 } catch {
   return {
     title: 'Not Found - GOAT',
     description: 'The requested page could not be found.',
   };
 }
}

export default async function SubcategoryPage({
 params: paramsPromise,
}: {
 params: Promise<{
   categories: string;
   subcategories: string;
 }>;
}) {
 const params = await paramsPromise;
 const { subCategory, news } = await getData(params.categories, params.subcategories);
 const [featuredNews, ...otherNews] = news;

 return (
   <div className="min-h-screen py-24">
     <header className="container mx-auto mb-8">
       <Breadcrumb className="mb-4">
         <BreadcrumbList>
           <BreadcrumbItem>
             <BreadcrumbLink href="/">Home</BreadcrumbLink>
           </BreadcrumbItem>
           <BreadcrumbSeparator />
           <BreadcrumbItem>
             <BreadcrumbLink href={`/${subCategory.category.path}`}>
               {subCategory.category.title}
             </BreadcrumbLink>
           </BreadcrumbItem>
           <BreadcrumbSeparator />
           <BreadcrumbItem>
             <BreadcrumbPage>{subCategory.title}</BreadcrumbPage>
           </BreadcrumbItem>
         </BreadcrumbList>
       </Breadcrumb>

       <h1 className="text-4xl font-bold mb-2">
         {subCategory.title}
       </h1>
       <p className="text-lg text-muted-foreground">
         {subCategory.description}
       </p>
     </header>

     <main className="container mx-auto">
       {featuredNews && (
         <StoryCard
           news={featuredNews}
           category={subCategory.category.path}
           subcategory={subCategory.path}
           featured={true}
         />
       )}

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
         {otherNews.map((item) => (
           <StoryCard
             key={item.id}
             news={item}
             category={subCategory.category.path}
             subcategory={subCategory.path}
           />
         ))}
       </div>
     </main>
   </div>
 );
}
