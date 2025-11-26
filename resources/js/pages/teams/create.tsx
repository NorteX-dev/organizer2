import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useForm } from "@inertiajs/react";
import { ArrowLeft, Users } from "lucide-react";

export default function TeamsCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post("/teams");
    };

    return (
        <div className="min-h-screen bg-background">
            <AppHeader />
            <div className="mx-auto max-w-2xl px-4 py-8">
                <div className="mb-8">
                    <Link
                        href="/teams"
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Powrót do zespołów
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Utwórz nowy zespół
                        </CardTitle>
                        <CardDescription>Utwórz nowy zespół, aby współpracować z innymi nad projektami.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nazwa zespołu</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData("name", e.target.value)}
                                    placeholder="Wprowadź nazwę zespołu"
                                    className={errors.name ? "border-destructive" : ""}
                                />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>

                            <div className="flex gap-3">
                                <Button type="submit" disabled={processing}>
                                    {processing ? "Tworzenie..." : "Utwórz zespół"}
                                </Button>
                                <Link href="/teams">
                                    <Button variant="outline">Anuluj</Button>
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
