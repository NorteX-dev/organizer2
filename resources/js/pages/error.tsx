import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import AppLayout from "@/layouts/app-layout";
import { AlertCircle } from "lucide-react";

export default function ErrorPage({ message }: { message: string }) {
    return (
        <AppLayout>
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
            </Alert>
        </AppLayout>
    );
}
