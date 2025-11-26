import { HeaderSection } from "@/components/header-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import type { Project, Retrospective, Sprint } from "@/types";
import { router } from "@inertiajs/react";
import { ArrowLeft, ChevronDown, ChevronUp, Edit, Plus, ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";

interface RetrospectivePageProps {
    project: Project;
    sprint: Sprint;
    retrospective: Retrospective | null;
    userVotes: Record<string, { upvote: boolean; downvote: boolean }>;
}

export default function RetrospectivePage({ project, sprint, retrospective, userVotes = {} }: RetrospectivePageProps) {
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [form, setForm] = useState({
        went_well: retrospective?.went_well || "",
        went_wrong: retrospective?.went_wrong || "",
        to_improve: retrospective?.to_improve || "",
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (retrospective) {
            router.put(`/projects/${project.id}/sprints/${sprint.id}/retrospective/${retrospective.id}`, form, {
                preserveScroll: true,
                onSuccess: () => setEditDialogOpen(false),
            });
        } else {
            router.post(`/projects/${project.id}/sprints/${sprint.id}/retrospective`, form, {
                preserveScroll: true,
                onSuccess: () => setEditDialogOpen(false),
            });
        }
    };

    const handleVote = (voteType: "went_well" | "went_wrong" | "to_improve", upvote: boolean) => {
        if (!retrospective) return;

        router.post(
            `/retrospectives/${retrospective.id}/vote`,
            {
                vote_type: voteType,
                upvote: upvote,
            },
            {
                preserveScroll: true,
            },
        );
    };

    const getVoteCounts = (voteType: "went_well" | "went_wrong" | "to_improve") => {
        if (!retrospective?.votes) return { upvotes: 0, downvotes: 0 };

        const votes = retrospective.votes.filter((v) => v.vote_type === voteType);
        return {
            upvotes: votes.filter((v) => v.upvote).length,
            downvotes: votes.filter((v) => !v.upvote).length,
        };
    };

    const getUserVote = (voteType: "went_well" | "went_wrong" | "to_improve") => {
        return userVotes[voteType] || { upvote: false, downvote: false };
    };

    const renderSection = (
        title: string,
        content: string | null,
        voteType: "went_well" | "went_wrong" | "to_improve",
        icon: React.ReactNode,
    ) => {
        const counts = getVoteCounts(voteType);
        const userVote = getUserVote(voteType);

        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {icon}
                            <CardTitle>{title}</CardTitle>
                        </div>
                        {retrospective && (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={userVote.upvote ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleVote(voteType, true)}
                                    className="flex items-center gap-1"
                                >
                                    <ThumbsUp className="h-4 w-4" />
                                    {counts.upvotes}
                                </Button>
                                <Button
                                    variant={userVote.downvote ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleVote(voteType, false)}
                                    className="flex items-center gap-1"
                                >
                                    <ThumbsDown className="h-4 w-4" />
                                    {counts.downvotes}
                                </Button>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {content ? (
                        <div className="text-sm whitespace-pre-wrap">{content}</div>
                    ) : (
                        <p className="text-sm text-muted-foreground italic">Brak treści.</p>
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: "Projekty", href: "/projects" },
                { title: project.name, href: `/projects/${project.id}/edit` },
                { title: "Sprinty", href: `/projects/${project.id}/sprints` },
                { title: sprint.name, href: `/projects/${project.id}/sprints/${sprint.id}` },
                { title: "Retrospektywa", href: "" },
            ]}
        >
            <div className="mb-6">
                <Button variant="ghost" onClick={() => router.visit(`/projects/${project.id}/sprints/${sprint.id}`)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Powrót do sprintu
                </Button>
            </div>

            <HeaderSection
                title={`Retrospektywa: ${sprint.name}`}
                rightHandItem={
                    <Button onClick={() => setEditDialogOpen(true)}>
                        {retrospective ? (
                            <>
                                <Edit className="mr-2 h-4 w-4" />
                                Edytuj retrospektywę
                            </>
                        ) : (
                            <>
                                <Plus className="mr-2 h-4 w-4" />
                                Utwórz retrospektywę
                            </>
                        )}
                    </Button>
                }
            />

            {sprint.status !== "completed" && (
                <Card className="mb-6 border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-6">
                        <p className="text-sm text-yellow-800">
                            Ten sprint nie został jeszcze zakończony. Retrospektywy można tworzyć tylko dla zakończonych sprintów.
                        </p>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-6">
                {renderSection(
                    "Co poszło dobrze",
                    retrospective?.went_well || null,
                    "went_well",
                    <ChevronUp className="h-5 w-5 text-green-600" />,
                )}
                {renderSection(
                    "Co poszło źle",
                    retrospective?.went_wrong || null,
                    "went_wrong",
                    <ChevronDown className="h-5 w-5 text-red-600" />,
                )}
                {renderSection(
                    "Co poprawić",
                    retrospective?.to_improve || null,
                    "to_improve",
                    <Edit className="h-5 w-5 text-blue-600" />,
                )}
            </div>

            {editDialogOpen && (
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{retrospective ? "Edytuj retrospektywę" : "Utwórz retrospektywę"}</DialogTitle>
                            <DialogDescription>
                                {retrospective
                                    ? "Zaktualizuj punkty retrospektywy poniżej."
                                    : "Dodaj punkty dotyczące tego, co poszło dobrze, co poszło źle i co poprawić."}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-6 py-4">
                                <div>
                                    <Label htmlFor="went_well">Co poszło dobrze</Label>
                                    <Textarea
                                        id="went_well"
                                        className="mt-1"
                                        placeholder="Wymień pozytywne aspekty tego sprintu..."
                                        rows={6}
                                        value={form.went_well}
                                        onChange={(e) => setForm((f) => ({ ...f, went_well: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="went_wrong">Co poszło źle</Label>
                                    <Textarea
                                        id="went_wrong"
                                        className="mt-1"
                                        placeholder="Wymień wyzwania i problemy napotkane..."
                                        rows={6}
                                        value={form.went_wrong}
                                        onChange={(e) => setForm((f) => ({ ...f, went_wrong: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="to_improve">Co poprawić</Label>
                                    <Textarea
                                        id="to_improve"
                                        className="mt-1"
                                        placeholder="Wymień konkretne ulepszenia na następny sprint..."
                                        rows={6}
                                        value={form.to_improve}
                                        onChange={(e) => setForm((f) => ({ ...f, to_improve: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                                    Anuluj
                                </Button>
                                <Button type="submit">{retrospective ? "Zaktualizuj" : "Utwórz"}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </AppLayout>
    );
}
