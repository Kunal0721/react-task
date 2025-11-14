import { motion, AnimatePresence } from "framer-motion"
import React from "react"
import { useNavigationLogic } from "@/hooks/use-navigation-logic"
import { ChevronRight } from "lucide-react"
import { getIcon } from "@/lib/icon-utils"
import type { NavProps } from "@/types/navigation"

interface NavItem {
    id: string;
    label: string;
    icon?: string;
    description?: string;
    disabled?: boolean;
    children?: NavItem[];
}

export function DrilldownNavMotion({
    data,
    ariaLabel = "Menu navigation",
    rootTitle = "Menu",
    onSelectLeaf,
    className = "",
    onHeightChange
}: NavProps & { onHeightChange?: () => void }) {
    const { levels, current, goForward, goBack } = useNavigationLogic(data, rootTitle);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [direction, setDirection] = React.useState(1);

    const focusItemBy = (delta: number) => {
        const buttons = containerRef.current?.querySelectorAll<HTMLButtonElement>('[data-nav-item]');
        if (!buttons?.length) return;

        const activeIndex = Array.from(buttons).findIndex(b => b === document.activeElement);
        const targetIndex = activeIndex === -1
            ? (delta > 0 ? 0 : buttons.length - 1)
            : Math.max(0, Math.min(activeIndex + delta, buttons.length - 1));

        buttons[targetIndex]?.focus();
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            focusItemBy(1);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            focusItemBy(-1);
        } else if (e.key === "Escape") {
            e.preventDefault();
            setDirection(-1);
            goBack();
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleGoForward = (item: any) => {
        setDirection(1);
        // Trigger height calculation before navigation
        if (onHeightChange) {
            onHeightChange();
        }
        goForward(item, onSelectLeaf);
    };

    const handleGoBack = () => {
        setDirection(-1);
        // Trigger height calculation before navigation
        if (onHeightChange) {
            onHeightChange();
        }
        goBack();
    };

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? '100%' : '-100%'
        }),
        center: {
            x: 0
        },
        exit: (direction: number) => ({
            x: direction > 0 ? '-100%' : '100%'
        })
    };

    return (
        <nav aria-label={ariaLabel} className={`w-full ${className}`}>
            <DrilldownNavMotionInner
                containerRef={containerRef}
                onKeyDown={onKeyDown}
                levels={levels}
                direction={direction}
                slideVariants={slideVariants}
                current={current}
                handleGoForward={handleGoForward}
                onHeightChangeCallback={onHeightChange}
            />
            <p className="sr-only" id="drill-instructions">
                Use arrow keys to navigate. Press Enter to select. Press Escape to go back.
            </p>
            <div className="flex relative items-center justify-center gap-2 border-t border-gray-200 px-4 py-3 bg-white">
                <div className="flex items-center justify-center">
                    <h2 className="flex-1 text-center text-base font-semibold">
                        {current.title}
                    </h2>
                </div>

                {levels.length > 1 ? (
                    <button
                        aria-label="Go back"
                        onClick={handleGoBack}
                        className="shrink-0 p-2 text-[14px]  hover:bg-gray-100 rounded transition-colors absolute inset-y-0 right-5"
                    >
                        Back
                    </button>
                ) : (
                    <div aria-hidden="true" />
                )}

            </div>
        </nav>
    );
}


function DrilldownNavMotionInner({
    containerRef,
    onKeyDown,
    levels,
    direction,
    slideVariants,
    current,
    handleGoForward,
    onHeightChangeCallback
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: any) {
    // Notify parent when content changes
    React.useEffect(() => {
        if (onHeightChangeCallback) {
            onHeightChangeCallback();
        }
    }, [levels.length, current.items.length, onHeightChangeCallback]);

    return (
        <div
            ref={containerRef}
            tabIndex={0}
            aria-describedby="drill-instructions"
            onKeyDown={onKeyDown}
            className="relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            style={{ minHeight: '200px' }}
        >
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                    key={levels.length - 1}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "tween", duration: 0.15, ease: "easeOut" }
                    }}
                    className="w-full py-3"
                    role="group"
                    aria-label={current.title}
                >
                    <ul role="list" className="px-2 py-3 space-y-1">

                        {current.items.map((item: NavItem) => {
                            const IconComponent = getIcon(item.icon);

                            return (
                                <motion.li
                                    key={item.id}
                                    className="px-1"
                                >
                                    <button
                                        type="button"
                                        data-nav-item
                                        onClick={() => handleGoForward(item)}
                                        disabled={item.disabled}
                                        className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {IconComponent && (
                                            <IconComponent className="w-5 h-5 shrink-0 text-gray-500" aria-hidden="true" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-base truncate">
                                                {item.label}
                                            </div>
                                            {item.description && (
                                                <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                                    {item.description}
                                                </div>
                                            )}
                                        </div>
                                        {item.children?.length && (
                                            <ChevronRight className="w-4 h-4 shrink-0 opacity-70" aria-hidden="true" />
                                        )}
                                    </button>
                                </motion.li>
                            );
                        })}
                        {!current.items.length && (
                            <li className="px-3 py-4 text-sm text-gray-500">No items</li>
                        )}
                    </ul>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
