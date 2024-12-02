'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Bookmark,
  ChartBar,
  Newspaper,
  Users,
  Eye,
  MoreVertical,
  XCircle,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getBookmarks, removeBookmark } from '@/actions/bookmark'
import { getClerkUser } from '@/actions/user'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

// Enhanced type with user profile
type BookmarkWithProfile = Awaited<ReturnType<typeof getBookmarks>>[number] & {
  userProfile?: {
    firstName: string | null
    lastName: string | null
    imageUrl: string | null
    email: string | null
  } | null
}

const BookmarksPage = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkWithProfile[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetchBookmarks = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getBookmarks(searchTerm || undefined, dateFilter)
      
      // Fetch Clerk user data for each bookmark
      const enrichedBookmarks = await Promise.all(
        data.map(async (bookmark) => {
          const userProfile = await getClerkUser(bookmark.user.clerkId)
          return {
            ...bookmark,
            userProfile
          }
        })
      )
      
      setBookmarks(enrichedBookmarks)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to fetch bookmarks',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm, dateFilter, toast])

  useEffect(() => {
    fetchBookmarks()
  }, [searchTerm, dateFilter, fetchBookmarks])

  const stats = {
    totalBookmarks: bookmarks.length,
    popularPosts: bookmarks.filter(
      (bookmark) => bookmark.newsInteraction.popularityScore > 90
    ).length,
    uniqueUsers: new Set(bookmarks.map((bookmark) => bookmark.user.id)).size,
  }

  const handleRemoveBookmark = async (bookmarkId: string) => {
    try {
      await removeBookmark(bookmarkId)
      await fetchBookmarks()
      toast({
        title: 'Success',
        description: 'Bookmark removed successfully',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to remove bookmark',
        variant: 'destructive',
      })
    }
  }

  const getDisplayName = (bookmark: BookmarkWithProfile) => {
    if (bookmark.userProfile?.firstName || bookmark.userProfile?.lastName) {
      return `${bookmark.userProfile.firstName || ''} ${bookmark.userProfile.lastName || ''}`.trim()
    }
    return 'Anonymous User'
  }

  const getInitials = (bookmark: BookmarkWithProfile) => {
    const name = getDisplayName(bookmark)
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="pt-16 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">
          Bookmark Management
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              Total Bookmarks
            </CardTitle>
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats.totalBookmarks}
            </div>
            <p className="text-xs text-muted-foreground">
              Total bookmarks
            </p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              Popular Articles
            </CardTitle>
            <ChartBar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats.popularPosts}
            </div>
            <p className="text-xs text-muted-foreground">
              Popularity score &gt; 90
            </p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              Unique Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats.uniqueUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              Saved bookmarks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            className="pl-10 bg-muted border-input text-foreground placeholder:text-muted-foreground"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[180px] bg-muted border-input">
              <SelectValue placeholder="Time Filter" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bookmarks Table */}
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">User</TableHead>
              <TableHead className="text-muted-foreground">Article</TableHead>
              <TableHead className="text-muted-foreground">Path</TableHead>
              <TableHead className="text-muted-foreground">Date</TableHead>
              <TableHead className="text-muted-foreground">Popularity</TableHead>
              <TableHead className="text-right text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : bookmarks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No bookmarks found
                </TableCell>
              </TableRow>
            ) : (
              bookmarks.map((bookmark) => (
                <TableRow
                  key={bookmark.id}
                  className="border-border hover:bg-muted/50"
                >
                  <TableCell className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={bookmark.userProfile?.imageUrl || undefined} />
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        {getInitials(bookmark)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">
                        {getDisplayName(bookmark)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Newspaper className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground hover:text-foreground line-clamp-1">
                        {bookmark.news.title}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground">
                      {bookmark.news.path}
                    </p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {bookmark.createdAt.toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${bookmark.newsInteraction.popularityScore}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {bookmark.newsInteraction.popularityScore}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-popover border-border"
                      >
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/news/${bookmark.news.path}`}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground focus:text-foreground"
                          >
                            <Eye className="h-4 w-4" />
                            View Article
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 text-destructive hover:text-destructive focus:text-destructive"
                          onClick={() => handleRemoveBookmark(bookmark.id)}
                        >
                          <XCircle className="h-4 w-4" />
                          Remove Bookmark
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default BookmarksPage