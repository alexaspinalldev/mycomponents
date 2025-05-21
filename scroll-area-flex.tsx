import { ScrollArea, ScrollBar } from "./scroll-area";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

// Use this instead of the generic component. It flexes to fill space rather than require a fixed height 
// Just make sure it's place with space arounf it to grow - h-full or grow on the parent

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
        const updateHeight = () => {
            const newHeight = scrollAreaContainer?.current!.clientHeight;
            if (scrollArea.current) {
                scrollArea.current.style.height = `${newHeight}px`; // Set the height of the scroll area
            }
        }
        updateHeight()

        // Update height on window resize - initialise the height back to 0 to allow for the parent to flex smaller than the child
        window.addEventListener("resize", () => {
            if (scrollAreaContainer.current) {
                scrollAreaContainer.current.style.height = `0px`;
            }
            updateHeight()
        });

        // Cleanup event listener on unmount
        return () => window.removeEventListener("resize", updateHeight);
    }, []
    );

    return (
        <div className="grow" ref={scrollAreaContainer}>
            {/* ^Used to explicity set the height of the ScrollArea */}
            <ScrollArea ref={scrollArea} className={cn(className, "py-2 rounded-lg")}>
                {children}
                <ScrollBar orientation="vertical" forceMount className="opacity-100" />
            </ScrollArea >
        </div>
    )
}
