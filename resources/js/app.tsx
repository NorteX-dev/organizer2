import "../css/app.css";

import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ProjectTeamProvider } from "./contexts/project-team-context";

const appName = import.meta.env.VITE_APP_NAME || "Laravel";

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob("./pages/**/*.tsx")),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <ProjectTeamProvider>
                    <App {...props} />
                </ProjectTeamProvider>
            </StrictMode>,
        );
    },
    progress: {
        color: "#4B5563",
    },
});
