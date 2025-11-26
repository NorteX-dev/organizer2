import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import type { Document as DocumentType, Project } from "@/types";
import { router } from "@inertiajs/react";
import { FileText, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface DocumentsPageProps {
    project: Project;
    documents: DocumentType[];
}

export default function DocumentsPage({ project, documents: initialDocuments }: DocumentsPageProps) {
    const [documents, setDocuments] = useState(initialDocuments);
    const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [form, setForm] = useState({
        title: "",
        content: "",
    });
    const [saving, setSaving] = useState(false);

    function handleCreateNew() {
        setIsCreating(true);
        setSelectedDocument(null);
        setForm({ title: "", content: "" });
    }

    function handleSelectDocument(document: DocumentType) {
        setSelectedDocument(document);
        setIsCreating(false);
        setForm({
            title: document.title,
            content: document.content,
        });
    }

    function handleSave() {
        if (!form.title.trim()) {
            alert("Wprowadź tytuł");
            return;
        }

        setSaving(true);
        if (isCreating) {
            router.post(`/projects/${project.id}/documents`, form, {
                preserveScroll: true,
                onSuccess: (page) => {
                    const newDocuments = page.props.documents as DocumentType[];
                    setDocuments(newDocuments);
                    const newDoc = newDocuments.find((d) => d.title === form.title);
                    if (newDoc) {
                        setSelectedDocument(newDoc);
                        setIsCreating(false);
                    }
                    setSaving(false);
                },
                onError: () => {
                    setSaving(false);
                },
            });
        } else if (selectedDocument) {
            router.put(`/projects/${project.id}/documents/${selectedDocument.id}`, form, {
                preserveScroll: true,
                onSuccess: (page) => {
                    const updatedDocuments = page.props.documents as DocumentType[];
                    setDocuments(updatedDocuments);
                    const updated = updatedDocuments.find((d) => d.id === selectedDocument.id);
                    if (updated) {
                        setSelectedDocument(updated);
                        setForm({
                            title: updated.title,
                            content: updated.content,
                        });
                    }
                    setSaving(false);
                },
                onError: () => {
                    setSaving(false);
                },
            });
        }
    }

    function handleDelete(document: DocumentType) {
        if (!confirm(`Usunąć "${document.title}"?`)) return;

        router.delete(`/projects/${project.id}/documents/${document.id}`, {
            preserveScroll: true,
            onSuccess: (page) => {
                const updatedDocuments = page.props.documents as DocumentType[];
                setDocuments(updatedDocuments);
                if (selectedDocument?.id === document.id) {
                    setSelectedDocument(null);
                    setIsCreating(false);
                    setForm({ title: "", content: "" });
                }
            },
        });
    }

    return (
        <AppLayout
            breadcrumbs={[
                { title: "Projekty", href: "/projects" },
                { title: project.name, href: `/projects/${project.id}/edit` },
                { title: "Dokumenty", href: `/projects/${project.id}/documents` },
            ]}
        >
            <div className="flex h-[calc(100vh-12rem)]">
                <aside className="w-64 border-r border-sidebar-border/80 pr-4">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Dokumenty</h2>
                        <Button size="sm" variant="outline" onClick={handleCreateNew}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="space-y-1 overflow-y-auto">
                        {documents.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Brak dokumentów</p>
                        ) : (
                            documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    className={`group flex items-center justify-between rounded-md p-2 text-sm hover:bg-accent ${
                                        selectedDocument?.id === doc.id ? "bg-accent" : ""
                                    }`}
                                >
                                    <button
                                        className="flex flex-1 items-center gap-2 truncate text-left"
                                        onClick={() => handleSelectDocument(doc)}
                                    >
                                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        <span className="truncate">{doc.title}</span>
                                    </button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(doc);
                                        }}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </aside>
                <div className="flex-1 overflow-y-auto pl-6">
                    {isCreating || selectedDocument ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Tytuł</Label>
                                <Input
                                    id="title"
                                    value={form.title}
                                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                    placeholder="Tytuł dokumentu"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="content">Treść</Label>
                                <Textarea
                                    id="content"
                                    value={form.content}
                                    onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                                    placeholder="Treść dokumentu..."
                                    className="min-h-[300px] font-mono text-sm"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleSave} disabled={saving}>
                                    {saving ? "Zapisywanie..." : isCreating ? "Utwórz" : "Zapisz"}
                                </Button>
                                {!isCreating && (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSelectedDocument(null);
                                            setIsCreating(false);
                                            setForm({ title: "", content: "" });
                                        }}
                                    >
                                        Anuluj
                                    </Button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            <div className="text-center">
                                <FileText className="mx-auto mb-4 h-12 w-12" />
                                <p>Wybierz dokument z paska bocznego lub utwórz nowy</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
