import ProfileController from "@/actions/App/Http/Controllers/Settings/ProfileController";
import HeadingSmall from "@/components/heading-small";
import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form } from "@inertiajs/react";
import { useRef } from "react";

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);

    return (
        <div className="space-y-6">
            <HeadingSmall title="Usuń konto" description="Usuń swoje konto i wszystkie jego zasoby" />
            <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                    <p className="font-medium">Ostrzeżenie</p>
                    <p className="text-sm">Proszę postępować ostrożnie, tej akcji nie można cofnąć.</p>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="destructive" data-test="delete-user-button">
                            Usuń konto
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>Czy na pewno chcesz usunąć swoje konto?</DialogTitle>
                        <DialogDescription>
                            Po usunięciu konta wszystkie jego zasoby i dane zostaną również trwale usunięte. Wprowadź hasło, aby potwierdzić, że chcesz trwale usunąć swoje konto.
                        </DialogDescription>

                        <Form
                            {...ProfileController.destroy.form()}
                            options={{
                                preserveScroll: true,
                            }}
                            onError={() => passwordInput.current?.focus()}
                            resetOnSuccess
                            className="space-y-6"
                        >
                            {({ resetAndClearErrors, processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="password" className="sr-only">
                                            Hasło
                                        </Label>

                                        <Input
                                            id="password"
                                            type="password"
                                            name="password"
                                            ref={passwordInput}
                                            placeholder="Hasło"
                                            autoComplete="current-password"
                                        />

                                        <InputError message={errors.password} />
                                    </div>

                                    <DialogFooter className="gap-2">
                                        <DialogClose asChild>
                                            <Button variant="secondary" onClick={() => resetAndClearErrors()}>
                                                Anuluj
                                            </Button>
                                        </DialogClose>

                                        <Button variant="destructive" disabled={processing} asChild>
                                            <button type="submit" data-test="confirm-delete-user-button">
                                                Usuń konto
                                            </button>
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
