import { Button } from "@/components/ui/button";
import AuthLayout from "@/layouts/auth-layout";
import { Head } from "@inertiajs/react";
import { Github } from "lucide-react";

interface LoginProps {
    error?: string;
}

export default function Login({ error }: LoginProps) {
    return (
        <AuthLayout
            title="Zaloguj się do swojego konta"
            description="Zaloguj się za pomocą konta GitHub, aby kontynuować"
        >
            <Head title="Logowanie" />

            <div className="flex flex-col gap-6">
                <Button asChild className="w-full" size="lg" data-test="login-button">
                    <a href="/auth/github">
                        <Github className="mr-2 h-5 w-5" />
                        Kontynuuj z GitHub
                    </a>
                </Button>

                {error && <div className="text-center text-sm font-medium text-destructive">{error}</div>}
            </div>
        </AuthLayout>
    );
}
