'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Bookmark, ChartBar, Newspaper, Users, Eye, MoreVertical, XCircle, Loader2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getBookmarks, removeBookmark } from '@/actions/bookmark'
import { getClerkUser } from '@/actions/user'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

type BookmarkWithProfile = Awaited<ReturnType<typeof getBookmarks>>[number] & {
  userProfile?: {
    firstName: string | null
    lastName: string | null
    imageUrl: string | null
    email: string | null
  } | null
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkWithProfile[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const { toast } = useToast()

  const fetchBookmarks = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getBookmarks(searchTerm || undefined, dateFilter)

      const enrichedBookmarks = await Promise.all(
        data.map(async (bookmark) => ({
          ...bookmark,
          userProfile: await getClerkUser(bookmark.user.clerkId)
        }))
      )

      setBookmarks(enrichedBookmarks)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to fetch bookmarks',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
      setIsInitialLoading(false)
    }
  }, [searchTerm, dateFilter, toast])

  useEffect(() => {
    const debounce = setTimeout(fetchBookmarks, 200)
    return () => clearTimeout(debounce)
  }, [searchTerm, dateFilter, fetchBookmarks])

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

  const stats = {
    totalBookmarks: bookmarks.length,
    popularPosts: bookmarks.filter(b => b.newsInteraction.popularityScore > 90).length,
    uniqueUsers: new Set(bookmarks.map(b => b.user.id)).size,
  }

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading bookmarks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 pt-16 pb-8 space-y-8 max-w-7xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bookmark Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track your bookmarks
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border bg-card hover:bg-accent/5 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Total Bookmarks</CardTitle>
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalBookmarks}</div>
            <p className="text-xs text-muted-foreground">Total bookmarks</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card hover:bg-accent/5 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Popular Articles</CardTitle>
            <ChartBar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.popularPosts}</div>
            <p className="text-xs text-muted-foreground">Popularity score &gt; 90</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card hover:bg-accent/5 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Unique Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.uniqueUsers}</div>
            <p className="text-xs text-muted-foreground">Saved bookmarks</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            className="pl-10 bg-muted/50 border-input text-foreground placeholder:text-muted-foreground"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[180px] bg-muted/50 border-input">
            <SelectValue placeholder="Time Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">User</TableHead>
              <TableHead className="text-muted-foreground">Article</TableHead>
              <TableHead className="text-muted-foreground">Path</TableHead>
              <TableHead className="text-muted-foreground">Date</TableHead>
              <TableHead className="text-muted-foreground">Popularity</TableHead>
              <TableHead className="text-right text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                </TableCell>
              </TableRow>
            ) : bookmarks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-muted-foreground">No bookmarks found</p>
                </TableCell>
              </TableRow>
            ) : (
              bookmarks.map((bookmark) => (
                <TableRow key={bookmark.id} className="group border-border hover:bg-muted/50">
                  <TableCell className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={bookmark.userProfile?.imageUrl || undefined} />
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        {getInitials(bookmark)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{getDisplayName(bookmark)}</p>
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
                    <p className="text-sm text-muted-foreground">{bookmark.news.path}</p>
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
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                          disabled={loading}
                        >
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border-border">
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
