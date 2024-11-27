import React from 'react';
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, ChevronRight } from "lucide-react";
import Image from 'next/image';

export default function Page() {
  return (
    <main className="container mx-auto py-24 min-h-screen">
      {/* Featured Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <Card className="lg:col-span-2 hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <Image
              src="/api/placeholder/800/400"
              alt="Featured"
              className="w-full h-[400px] object-cover rounded-t-lg"
              width={1000}
              height={1000}
            />
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  BREAKING NEWS
                </Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 mr-1" />
                  10 minutes ago
                </div>
              </div>
              <CardTitle className="text-3xl mb-3">
                Featured Story Headline
              </CardTitle>
              <CardDescription className="text-lg">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </CardDescription>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="flex gap-4 p-4">
                <Image
                  src="/api/placeholder/200/200"
                  alt={`Top Story ${i}`}
                  className="w-24 h-24 rounded-md object-cover"
                  width={1000}
                  height={1000}
                />
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-muted-foreground">Trending #{i}</span>
                  </div>
                  <h3 className="font-bold mb-1">Top Story {i}</h3>
                  <p className="text-sm text-muted-foreground">
                    Quick summary of the trending story...
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Top Stories Section */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold">Top Stories</h2>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { category: 'Politics', stories: 4 },
            { category: 'Business', stories: 4 },
            { category: 'Technology', stories: 4 },
            { category: 'Sports', stories: 4 }
          ].flatMap(({ category, stories }) =>
            Array.from({ length: stories }, (_, i) => (
              <Card key={`${category}-${i}`} className="group overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    <Image
                      src="/api/placeholder/400/200"
                      alt={`${category} Story ${i + 1}`}
                      className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                      width={1000}
                      height={1000}
                    />
                    <Badge
                      className="absolute top-3 left-3 bg-primary text-primary-foreground"
                    >
                      {category}
                    </Badge>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        2 hours ago
                      </span>
                    </div>
                    <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">
                      {category} Story {i + 1}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Brief description of the news story goes here...
                    </p>
                    <div className="flex items-center text-sm text-primary font-medium opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
                      Read More
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
