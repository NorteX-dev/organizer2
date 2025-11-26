import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { TaskComment, User } from "@/types";
import { format, parseISO } from "date-fns";
import { Edit2, Send, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

interface TaskCommentsProps {
    taskId: number;
    projectId: number;
    currentUser: User;
}

export function TaskComments({ taskId, projectId, currentUser }: TaskCommentsProps) {
    const [comments, setComments] = useState<TaskComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadComments();
    }, [taskId]);

    const loadComments = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/projects/${projectId}/tasks/${taskId}/comments`, {
                headers: {
                    Accept: "application/json",
                },
            });
            if (response.ok) {
                const data = await response.json();
                setComments(data);
            }
        } catch (error) {
            console.error("Failed to load comments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || submitting) return;

        setSubmitting(true);
        try {
            const response = await fetch(`/projects/${projectId}/tasks/${taskId}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN": document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || "",
                },
                body: JSON.stringify({ content: newComment }),
            });

            if (response.ok) {
                setNewComment("");
                await loadComments();
            } else {
                const error = await response.json();
                alert(error.error || "Nie udało się dodać komentarza");
            }
        } catch (error) {
            console.error("Failed to add comment:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (comment: TaskComment) => {
        setEditingId(comment.id);
        setEditContent(comment.content);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditContent("");
    };

    const handleUpdate = async (commentId: number) => {
        if (!editContent.trim() || submitting) return;

        setSubmitting(true);
        try {
            const response = await fetch(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN": document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || "",
                },
                body: JSON.stringify({ content: editContent }),
            });

            if (response.ok) {
                setEditingId(null);
                setEditContent("");
                await loadComments();
            } else {
                const error = await response.json();
                alert(error.error || "Nie udało się zaktualizować komentarza");
            }
        } catch (error) {
            console.error("Failed to update comment:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId: number) => {
        if (!confirm("Czy na pewno chcesz usunąć ten komentarz?") || submitting) return;

        setSubmitting(true);
        try {
            const response = await fetch(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`, {
                method: "DELETE",
                headers: {
                    Accept: "application/json",
                    "X-CSRF-TOKEN": document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || "",
                },
            });

            if (response.ok) {
                await loadComments();
            } else {
                const error = await response.json();
                alert(error.error || "Nie udało się usunąć komentarza");
            }
        } catch (error) {
            console.error("Failed to delete comment:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const getUserInitials = (user: User) => {
        return user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                {loading ? (
                    <div className="text-sm text-neutral-500">Ładowanie komentarzy...</div>
                ) : comments.length === 0 ? (
                    <div className="text-sm text-neutral-500">Brak komentarzy. Bądź pierwszy, który skomentuje!</div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                            <Avatar className="h-8 w-8 shrink-0">
                                <AvatarFallback className="text-xs">
                                    {comment.user ? getUserInitials(comment.user) : "?"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">
                                                {comment.user?.name || "Nieznany użytkownik"}
                                            </span>
                                            <span className="text-xs text-neutral-500">
                                                {format(parseISO(comment.created_at), "MMM d, yyyy 'at' h:mm a")}
                                            </span>
                                        </div>
                                    </div>
                                    {comment.user_id === currentUser.id && (
                                        <div className="flex gap-1">
                                            {editingId === comment.id ? (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-6 w-6 p-0"
                                                        onClick={() => handleUpdate(comment.id)}
                                                        disabled={submitting}
                                                    >
                                                        <Send className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-6 w-6 p-0"
                                                        onClick={handleCancelEdit}
                                                        disabled={submitting}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-6 w-6 p-0"
                                                        onClick={() => handleEdit(comment)}
                                                        disabled={submitting}
                                                    >
                                                        <Edit2 className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                                        onClick={() => handleDelete(comment.id)}
                                                        disabled={submitting}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {editingId === comment.id ? (
                                    <Textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="min-h-[80px] text-sm"
                                        placeholder="Edytuj swój komentarz..."
                                    />
                                ) : (
                                    <p className="text-sm whitespace-pre-wrap text-neutral-700">{comment.content}</p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-2">
                <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Dodaj komentarz..."
                    className="min-h-[100px] text-sm"
                    disabled={submitting}
                />
                <div className="flex justify-end">
                    <Button type="submit" size="sm" disabled={!newComment.trim() || submitting}>
                        {submitting ? "Publikowanie..." : "Opublikuj komentarz"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
