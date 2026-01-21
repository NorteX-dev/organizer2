import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import type { Message, User } from "@/types";
import { router } from "@inertiajs/react";
import { Mail, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface MessagesPageProps {
    incomingMessages: Message[];
    outgoingMessages: Message[];
    unreadCount: number;
    users: User[];
}

export default function MessagesPage({
    incomingMessages: initialIncomingMessages,
    outgoingMessages: initialOutgoingMessages,
    unreadCount: initialUnreadCount,
    users,
}: MessagesPageProps) {
    const [incomingMessages, setIncomingMessages] = useState(initialIncomingMessages);
    const [outgoingMessages, setOutgoingMessages] = useState(initialOutgoingMessages);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [form, setForm] = useState({
        to_user_id: "",
        subject: "",
        body: "",
    });
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<"incoming" | "outgoing">("incoming");

    function handleCreateNew() {
        setIsCreating(true);
        setSelectedMessage(null);
        setForm({ to_user_id: "", subject: "", body: "" });
    }

    function handleSelectMessage(message: Message) {
        setSelectedMessage(message);
        setIsCreating(false);
        
        if (activeTab === "incoming" && !message.read) {
            router.get(`/messages/${message.id}`, {}, {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({
                        only: ["incomingMessages", "unreadCount"],
                        onSuccess: (page) => {
                            const updatedIncoming = page.props.incomingMessages as Message[];
                            setIncomingMessages(updatedIncoming);
                        },
                    });
                },
            });
        }
    }

    function handleSave() {
        if (!form.subject.trim()) {
            alert("Wprowadź temat");
            return;
        }
        if (!form.body.trim()) {
            alert("Wprowadź treść wiadomości");
            return;
        }
        if (!form.to_user_id) {
            alert("Wybierz odbiorcę");
            return;
        }

        setSaving(true);
        router.post("/messages", form, {
            preserveScroll: true,
            onSuccess: (page) => {
                const newIncoming = page.props.incomingMessages as Message[];
                const newOutgoing = page.props.outgoingMessages as Message[];
                setIncomingMessages(newIncoming);
                setOutgoingMessages(newOutgoing);
                setIsCreating(false);
                setForm({ to_user_id: "", subject: "", body: "" });
                setSaving(false);
            },
            onError: () => {
                setSaving(false);
            },
        });
    }

    function handleDelete(message: Message) {
        if (!confirm(`Usunąć tę wiadomość?`)) return;

        router.delete(`/messages/${message.id}`, {
            preserveScroll: true,
            onSuccess: (page) => {
                const updatedIncoming = page.props.incomingMessages as Message[];
                const updatedOutgoing = page.props.outgoingMessages as Message[];
                setIncomingMessages(updatedIncoming);
                setOutgoingMessages(updatedOutgoing);
                if (selectedMessage?.id === message.id) {
                    setSelectedMessage(null);
                    setIsCreating(false);
                }
            },
        });
    }

    function formatDate(dateString: string): string {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("pl-PL", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    }

    const messagesToShow = activeTab === "incoming" ? incomingMessages : outgoingMessages;

    return (
        <AppLayout
            breadcrumbs={[
                { title: "Wiadomości", href: "/messages" },
            ]}
        >
            <div className="flex h-[calc(100vh-12rem)]">
                <aside className="w-64 border-r border-sidebar-border/80 pr-4">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Wiadomości</h2>
                        <Button size="sm" variant="outline" onClick={handleCreateNew}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="mb-4 flex gap-2">
                        <Button
                            size="sm"
                            variant={activeTab === "incoming" ? "default" : "outline"}
                            onClick={() => setActiveTab("incoming")}
                            className="flex-1"
                        >
                            Odebrane
                            {incomingMessages.filter((m) => !m.read).length > 0 && (
                                <span className="ml-2 rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">
                                    {incomingMessages.filter((m) => !m.read).length}
                                </span>
                            )}
                        </Button>
                        <Button
                            size="sm"
                            variant={activeTab === "outgoing" ? "default" : "outline"}
                            onClick={() => setActiveTab("outgoing")}
                            className="flex-1"
                        >
                            Wysłane
                        </Button>
                    </div>
                    <div className="space-y-1 overflow-y-auto">
                        {messagesToShow.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Brak wiadomości</p>
                        ) : (
                            messagesToShow.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`group flex items-center justify-between rounded-md p-2 text-sm hover:bg-accent ${
                                        selectedMessage?.id === msg.id ? "bg-accent" : ""
                                    } ${!msg.read && activeTab === "incoming" ? "font-semibold" : ""}`}
                                >
                                    <button
                                        className="flex flex-1 items-center gap-2 truncate text-left"
                                        onClick={() => handleSelectMessage(msg)}
                                    >
                                        <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        <div className="flex-1 truncate">
                                            <div className="truncate">
                                                {activeTab === "incoming" ? msg.from_user?.name : msg.to_user?.name}
                                            </div>
                                            <div className="truncate text-xs text-muted-foreground">{msg.subject}</div>
                                        </div>
                                    </button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(msg);
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
                    {isCreating ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="to_user_id">Do</Label>
                                <Select
                                    value={form.to_user_id}
                                    onValueChange={(value) => setForm((f) => ({ ...f, to_user_id: value }))}
                                >
                                    <SelectTrigger id="to_user_id">
                                        <SelectValue placeholder="Wybierz użytkownika..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                {user.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subject">Temat</Label>
                                <Input
                                    id="subject"
                                    value={form.subject}
                                    onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                                    placeholder="Temat wiadomości"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="body">Treść</Label>
                                <Textarea
                                    id="body"
                                    value={form.body}
                                    onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                                    placeholder="Treść wiadomości..."
                                    className="min-h-[300px]"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleSave} disabled={saving}>
                                    {saving ? "Wysyłanie..." : "Wyślij"}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsCreating(false);
                                        setForm({ to_user_id: "", subject: "", body: "" });
                                    }}
                                >
                                    Anuluj
                                </Button>
                            </div>
                        </div>
                    ) : selectedMessage ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold">{selectedMessage.subject}</h2>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedMessage(null);
                                            setIsCreating(false);
                                        }}
                                    >
                                        Zamknij
                                    </Button>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    <div>
                                        Od: {selectedMessage.from_user?.name || "Nieznany użytkownik"}
                                    </div>
                                    <div>
                                        Do: {selectedMessage.to_user?.name || "Nieznany użytkownik"}
                                    </div>
                                    <div>Data: {formatDate(selectedMessage.created_at)}</div>
                                    {selectedMessage.read && selectedMessage.read_at && (
                                        <div>Przeczytano: {formatDate(selectedMessage.read_at)}</div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Treść</Label>
                                <div className="min-h-[200px] rounded-md border p-4 whitespace-pre-wrap">
                                    {selectedMessage.body}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <p>Wybierz wiadomość lub utwórz nową</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
