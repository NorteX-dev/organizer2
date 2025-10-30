import { Button } from "@/components/ui/button";
import AuthLayout from "@/layouts/auth-layout";
import { Head } from "@inertiajs/react";
import { Github } from "lucide-react";

interface LoginProps {
    error?: string;
}

export default function Login({ error }: LoginProps) {
    return (
        <AuthLayout title="Log in to your account" description="Sign in with your GitHub account to continue">
            <Head title="Log in" />

            <div className="flex flex-col gap-6">
                <Button asChild className="w-full" size="lg" data-test="login-button">
                    <a href="/auth/github">
                        <Github className="mr-2 h-5 w-5" />
                        Continue with GitHub
                    </a>
                </Button>

                {error && <div className="text-center text-sm font-medium text-destructive">{error}</div>}
            </div>
        </AuthLayout>
    );
}
