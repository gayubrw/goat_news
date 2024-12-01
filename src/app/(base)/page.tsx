import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getNews } from '@/actions/news';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, ChevronRight, Eye, BookmarkPlus, MessageSquare } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function Page() {
  const news = await getNews();
  const [featuredNews, ...latestNews] = news;
  const trendingNews = latestNews.slice(0, 3);
  const topStories = latestNews.slice(3);

  return (
    <main className="container mx-auto py-24 min-h-screen">
      {/* Featured Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {featuredNews && (
          <Link 
            href={`/${featuredNews.subCategory.category.path}/${featuredNews.subCategory.path}/${featuredNews.path}`}
            className="lg:col-span-2"
          >
            <Card className="group relative h-[600px] overflow-hidden">
              <CardContent className="p-0 h-full">
                <div className="relative h-full">
                  <Image
                    src={featuredNews.thumbnailUrl || '/api/placeholder/1200/600'}
                    alt={featuredNews.title}
                    className="object-cover w-full h-full group-hover:brightness-90 transition-all duration-700"
                    width={1200}
                    height={600}
                    priority={true}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-50 transition-opacity duration-300" />
                  
                  <div className="absolute top-6 left-6 flex items-center gap-3 z-10">
                    <Badge className="bg-primary/90 backdrop-blur-sm text-primary-foreground px-3 py-1">
                      {featuredNews.subCategory.category.title}
                    </Badge>
                    <Badge className="bg-red-500/90 backdrop-blur-sm text-white px-3 py-1">
                      Featured
                    </Badge>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-8 z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <Badge className="bg-white/90 backdrop-blur-sm text-black px-3 py-1">
                        {featuredNews.subCategory.title}
                      </Badge>
                      <span className="text-white flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {formatDistanceToNow(new Date(featuredNews.createdAt), { addSuffix: true })}
                      </span>
                    </div>

                    <h2 className="text-4xl font-bold text-white mb-4">
                      {featuredNews.title}
                    </h2>
                    <p className="text-white/90 text-lg mb-6 line-clamp-2">
                      {featuredNews.description}
                    </p>

                    <div className="flex items-center gap-6 text-white/80">
                      <span className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        {Math.floor(Math.random() * 1000)} views
                      </span>
                      <span className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        {featuredNews.newsInteractions[0]?.comments.length || 0} comments
                      </span>
                      <span className="flex items-center gap-2">
                        <BookmarkPlus className="w-4 h-4" />
                        {featuredNews.newsInteractions[0]?.bookmarks.length || 0} saves
                      </span>
                    </div>

                    <div className="absolute bottom-8 right-8 text-white flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      Read Full Story
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        <div className="space-y-4">
          {trendingNews.map((item, i) => (
            <Link 
              key={item.id}
              href={`/${item.subCategory.category.path}/${item.subCategory.path}/${item.path}`}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="flex gap-4 p-4">
                  <Image
                    src={item.thumbnailUrl || "/api/placeholder/200/200"}
                    alt={item.title}
                    className="w-24 h-24 rounded-md object-cover"
                    width={1000}
                    height={1000}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100">
                        {item.subCategory.title}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-muted-foreground">#{i + 1}</span>
                      </div>
                    </div>
                    <h3 className="font-bold mb-1 line-clamp-2">{item.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {item.newsInteractions[0]?.comments.length || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Top Stories Section */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold">Top Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {topStories.map((item) => (
            <Link 
              key={item.id}
              href={`/${item.subCategory.category.path}/${item.subCategory.path}/${item.path}`}
            >
              <Card className="group overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    <Image
                      src={item.thumbnailUrl || "/api/placeholder/400/200"}
                      alt={item.title}
                      className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                      width={1000}
                      height={1000}
                    />
                    <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                      {item.subCategory.title}
                    </Badge>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {item.newsInteractions[0]?.comments.length || 0}
                      </span>
                    </div>
                    <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center text-sm text-primary font-medium opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
                      Read More
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}