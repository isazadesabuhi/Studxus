// components/ui/Heading.tsx

import { cn } from "@/lib/utils";

type HeadingProps = {
    as?: "h1" | "h2" | "h3" | "h4";
    color?: "primary" | "secondary" | "white" | "gray";
    align?: "left" | "center" | "right";
    underlined?: boolean;
    className?: string;
    children: React.ReactNode;
};

export default function Heading({
    as: Tag = "h2",
    color = "primary",
    align = "left",
    underlined = false,
    className,
    children,
}: HeadingProps) {
    const baseStyles =
        "font-semibold tracking-tight mt-2 w-full mr-5"; // cohérence générale

    const sizes = {
        h1: "text-3xl sm:text-4xl mb-4",
        h2: "text-2xl sm:text-3xl mb-3",
        h3: "text-xl sm:text-2xl mb-2",
        h4: "text-l sm:text-xl mb-1",
    };

    const colors = {
        primary: "text-primary",
        secondary: "text-secondary",
        white: "text-white",
        gray: "text-gray-600",
    };

    const aligns = {
        left: "text-left",
        center: "text-center",
        right: "text-right",
    };

    return (
        <Tag
            className={cn(
                baseStyles,
                sizes[Tag],
                colors[color],
                aligns[align],
                underlined && "border-b-2 ",
                className
            )}
        >
            {children}
        </Tag>
    );
}
