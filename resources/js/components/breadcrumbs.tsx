import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { type BreadcrumbItem as BreadcrumbItemType } from "@/types";
import { Link } from "@inertiajs/react";
import { Fragment } from "react";

export function Breadcrumbs({ breadcrumbs, subpages = [] }: { breadcrumbs: BreadcrumbItemType[]; subpages?: { title: string; href: string; icon: any; active: boolean; }[] }) {
    return (
        <>
            {breadcrumbs.length > 0 && (
                <Breadcrumb>
                    <BreadcrumbList>
                        {breadcrumbs.map((item, index) => {
                            const isLast = index === breadcrumbs.length - 1;
                            return (
                                <Fragment key={index}>
                                    <BreadcrumbItem>
                                        {isLast ? (
                                            <div className="flex items-center gap-2">
                                                <BreadcrumbPage>{item.title}</BreadcrumbPage>
                                                {isLast && subpages.length > 0 && (
                                                    <div className="ml-2 flex gap-2">
                                                        {subpages.map((tab, idx) =>
                                                            tab.active ? (
                                                                <span key={idx} className="inline-flex items-center rounded-full bg-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100">
                                                                    <tab.icon className="mr-1 h-3 w-3" />{tab.title}
                                                                </span>
                                                            ) : (
                                                                <Link key={idx} href={tab.href} className="inline-flex items-center rounded-full border border-transparent hover:border-neutral-300 bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-neutral-700">
                                                                    <tab.icon className="mr-1 h-3 w-3" />{tab.title}
                                                                </Link>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <BreadcrumbLink asChild>
                                                <Link href={item.href}>{item.title}</Link>
                                            </BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                    {!isLast && <BreadcrumbSeparator />}
                                </Fragment>
                            );
                        })}
                    </BreadcrumbList>
                </Breadcrumb>
            )}
        </>
    );
}
