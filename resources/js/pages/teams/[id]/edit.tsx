import { HeaderSection } from "@/components/header-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from "@/layouts/app-layout";
import { type Team } from "@/types";
import { Link, useForm } from "@inertiajs/react";
import { ArrowLeft, Users } from "lucide-react";

interface TeamsEditProps {
    team: Team;
}

export default function TeamsEdit({ team }: TeamsEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: team.name,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/teams/${team.id}`);
    };

    return (
        <AppLayout>
            <div className="mt-6">
                <Link
                    href="/teams"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Teams
                </Link>
            </div>

            <HeaderSection title="Edit Team" description="Edit team details." className="mt-0" />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Edit Team
                    </CardTitle>
                    <CardDescription>Update your team information and settings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Team Name</Label>
                            <Input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData("name", e.target.value)}
                                placeholder="Enter team name"
                                className={errors.name ? "border-destructive" : ""}
                            />
                            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                        </div>

                        <div className="flex gap-3">
                            <Button type="submit" disabled={processing}>
                                {processing ? "Updating..." : "Update Team"}
                            </Button>
                            <Link href="/teams">
                                <Button variant="outline">Cancel</Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
