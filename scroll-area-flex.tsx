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

        const updateHeight = () => {
            const newHeight = container.clientHeight;
            scrollContent.style.height = `${newHeight}px`;
        };

        // Set initial height
        updateHeight();

        // Observe for size changes
        const resizeObserver = new ResizeObserver(() => {
            container.style.height = `0px`; // Allow shrinking
            updateHeight();
        });

        resizeObserver.observe(container);

        return () => resizeObserver.disconnect();
    }, []);


    return (
        <div className="grow overflow-hidden" ref={scrollAreaContainer}>
            {/* ^Used to explicity set the height of the ScrollArea */}
            <ScrollArea ref={scrollArea} className={cn(className, "h-full py-2")}>
                {children}
                <ScrollBar orientation="vertical" forceMount className="opacity-100" />
            </ScrollArea >
        </div>
    )
}
