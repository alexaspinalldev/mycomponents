import { ScrollArea, ScrollBar } from "./scroll-area";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

// Use this instead of the generic component. It flexes to fill space rather than require a fixed height 
// It must be used inside a flex container providing the vertical space for it to fill.

export function ScrollAreaFlex({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const scrollAreaContainer = useRef<HTMLDivElement | null>(null);
    const scrollArea = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!scrollAreaContainer.current || !scrollArea.current) return;

        const container = scrollAreaContainer.current;
        const scrollContent = scrollArea.current;

        let AnimationFrame: number | null = null;

        const updateHeight = () => {
            // Cancel any existing frame to avoid stacking calls
            if (AnimationFrame) cancelAnimationFrame(AnimationFrame);

            AnimationFrame = requestAnimationFrame(() => {
                container.style.height = "0px"; // Set outer container to 0 to allow it to resize smaller than the child

                const newHeight = container.clientHeight;
                scrollContent.style.height = `${newHeight}px`;
            });
        };

        // Set initial height
        updateHeight();

        const resizeObserver = new ResizeObserver(() => {
            updateHeight();
        });

        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
            if (AnimationFrame) cancelAnimationFrame(AnimationFrame);
        };
    }, []);

    return (
        <div className="grow overflow-hidden" ref={scrollAreaContainer}>
            <ScrollArea ref={scrollArea} className={cn(className, "h-full py-2")}>
                {children}
                <ScrollBar orientation="vertical" forceMount className="opacity-100" />
            </ScrollArea >
        </div>
    )
}
