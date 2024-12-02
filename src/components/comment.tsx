"use client"

"use client"

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Send, Trash2, MessageCircle } from 'lucide-react';
import { addComment, deleteComment, getNewsComments } from '@/actions/comment';
import { getCurrentUserData, getClerkUser } from '@/actions/user';

interface ClerkUserData {
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  email: string | null;
}

interface Comment {
  id: string;
  text: string;
  createdAt: Date;
  userInteraction: {
    user: {
      id: string;
      clerkId: string | null;
    };
  };
}

interface EnrichedComment extends Comment {
  clerkUser: ClerkUserData | null;
}

interface CurrentUser {
  id: string;
  clerkData: ClerkUserData | null;
}

export default function CommentSection({ newsId }: { newsId: string }) {
  const [comments, setComments] = useState<EnrichedComment[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      const [commentsData, userData] = await Promise.all([
        getNewsComments(newsId),
        getCurrentUserData()
      ]);

      if (userData) {
        const clerkData = await getClerkUser(userData.clerkId);
        setCurrentUser({ id: userData.id, clerkData });
      }

      const enrichedComments = await Promise.all(
        commentsData.map(async (comment): Promise<EnrichedComment> => {
          const clerkUser = await getClerkUser(comment.userInteraction.user.clerkId);
          return { ...comment, clerkUser };
        })
      );

      setComments(enrichedComments);
    };

    loadInitialData();
  }, [newsId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await addComment({ text: newComment, newsId });
      if (response.success) {
        setNewComment("");
        const commentsData = await getNewsComments(newsId);
        const enrichedComments = await Promise.all(
          commentsData.map(async (comment): Promise<EnrichedComment> => {
            const clerkUser = await getClerkUser(comment.userInteraction.user.clerkId);
            return { ...comment, clerkUser };
          })
        );
        setComments(enrichedComments);
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const getUserDisplayName = (clerkUser: ClerkUserData | null) => {
    if (!clerkUser) return 'Anonymous';
    return `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Anonymous';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200 dark:border-zinc-800">
      <CardHeader className="flex flex-row items-center gap-2 border-b border-zinc-200 dark:border-zinc-800">
        <MessageCircle className="w-5 h-5" />
        <h3 className="text-xl font-semibold">Comments ({comments.length})</h3>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {currentUser ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-start gap-4">
              <Avatar className="w-10 h-10 ring-2 ring-blue-500/10 transition-all">
                <AvatarImage src={currentUser.clerkData?.imageUrl || undefined} alt={getUserDisplayName(currentUser.clerkData)} className="object-cover" />
                <AvatarFallback className="bg-blue-500/10 text-blue-700 dark:text-blue-300">
                  {getUserDisplayName(currentUser.clerkData)[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-4">
                <Textarea
                  placeholder="Share your thoughts..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[100px] resize-none bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !newComment.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Post Comment
                  </Button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="text-center py-8 px-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-zinc-400" />
            <p className="text-zinc-600 dark:text-zinc-400 font-medium">
              Sign in to join the conversation
            </p>
          </div>
        )}

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {comments.map((comment) => (
              <Card
                key={comment.id}
                className="group bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 transition-all hover:shadow-md"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-8 h-8 ring-2 ring-blue-500/10">
                      <AvatarImage
                        src={comment.clerkUser?.imageUrl || undefined}
                        alt={getUserDisplayName(comment.clerkUser)}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-blue-500/10 text-blue-700 dark:text-blue-300">
                        {getUserDisplayName(comment.clerkUser)[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-x-4">
                        <div className="min-w-0">
                          <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                            {getUserDisplayName(comment.clerkUser)}
                          </p>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            {formatDistanceToNow(new Date(comment.createdAt), {
                              addSuffix: true
                            })}
                          </p>
                        </div>
                        {currentUser?.id === comment.userInteraction.user.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(comment.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 dark:hover:bg-red-900/50"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                      <p className="mt-2 text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-words">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
