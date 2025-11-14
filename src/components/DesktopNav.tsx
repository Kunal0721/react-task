import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ChevronLeft } from "lucide-react"
import * as Icons from "lucide-react"
import type { NavProps, Level, NavItem } from "@/types/navigation"


export default function DesktopDrilldownNav({
    data,
    ariaLabel = "Menu navigation",
    rootTitle = "Menu",
    onSelectLeaf,
    className = "",
}: NavProps) {
    const topLevel: Level = React.useMemo(
        () => ({
            title: rootTitle,
            items: data,
        }),
        [data, rootTitle],
    )

    const [levels, setLevels] = React.useState<Level[]>([topLevel])
    const [breadcrumbs, setBreadcrumbs] = React.useState<string[]>([rootTitle])
    const [direction, setDirection] = React.useState<'forward' | 'back'>('forward')
    const [hasNavigated, setHasNavigated] = React.useState(false)

    React.useEffect(() => {
        setLevels([topLevel])
        setBreadcrumbs([rootTitle])
    }, [topLevel])

    const current = levels[levels.length - 1]
    const previous = levels.length > 1 ? levels[levels.length - 2] : null

    const goForward = (node: NavItem) => {
        if (node.disabled) return

        if (node.children?.length) {
            setHasNavigated(true)
            setDirection('forward')
            setLevels((prev) => [...prev, { title: node.label, items: node.children! }])
            setBreadcrumbs((prev) => [...prev, node.label])
        } else {
            onSelectLeaf?.(node)
        }
    }

    const goBack = () => {
        if (levels.length > 1) {
            setHasNavigated(true)
            setDirection('back')
            setLevels((prev) => prev.slice(0, -1))
            setBreadcrumbs((prev) => prev.slice(0, -1))
        }
    }

    const goToLevel = (index: number) => {
        if (index < levels.length - 1) {
            setHasNavigated(true)
            setDirection('back')
            setLevels((prev) => prev.slice(0, index + 1))
            setBreadcrumbs((prev) => prev.slice(0, index + 1))
        }
    }

    const getIcon = (iconName?: string) => {
        if (!iconName) return null
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (Icons as any)[iconName] || null
    }

    const slideVariants = {
        enter: (direction: 'forward' | 'back') => ({
            x: direction === 'forward' ? '100%' : '-100%',
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: 'forward' | 'back') => ({
            x: direction === 'forward' ? '-100%' : '100%',
            opacity: 0,
        }),
    }

    const listItemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.03,
                duration: 0.2,
                ease: [0.4, 0, 0.2, 1] as const,
            },
        }),
    }

    return (
        <nav aria-label={ariaLabel} className={`w-full ${className}`}>
            <div className="flex flex-col h-[600px] bg-background rounded-lg overflow-hidden shadow-lg">
                {/* Breadcrumb Navigation */}
                <div className="flex items-center gap-2 px-4 py-3 bg-muted/30">
                    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm overflow-x-auto">
                        <AnimatePresence mode="popLayout">
                            {breadcrumbs.map((crumb, index) => (
                                <motion.div
                                    key={`${crumb}-${index}`}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.1 }}
                                    className="flex items-center gap-1"
                                >
                                    {index > 0 && (
                                        <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                                    )}
                                    <button
                                        onClick={() => goToLevel(index)}
                                        disabled={index === breadcrumbs.length - 1}
                                        className={`px-2 py-1 rounded hover:bg-muted transition-colors whitespace-nowrap
                      ${index === breadcrumbs.length - 1
                                                ? "font-semibold text-foreground cursor-default"
                                                : "text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        {crumb}
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </nav>
                </div>

                {/* Two-panel layout */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Panel - Previous/Parent Level */}
                    <AnimatePresence mode="wait">
                        {previous && (
                            <motion.div
                                key="left-panel"
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: '33.333333%', opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{ duration: 0.1, ease: [0.4, 0, 0.2, 1] }}
                                className="flex flex-col overflow-hidden"
                            >
                                <div className="px-4 py-2 bg-muted/20">
                                    <button
                                        onClick={goBack}
                                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <ChevronLeft className="size-4" />
                                        <span className="font-medium">{previous.title}</span>
                                    </button>
                                </div>
                                <div className="flex-1 overflow-auto p-2">
                                    <ul role="list" className="space-y-1">
                                        {previous.items.map((item: NavItem, i: number) => {
                                            const IconComponent = getIcon(item.icon)
                                            const isActive = item.label === current.title

                                            return (
                                                <motion.li
                                                    key={item.id}
                                                    custom={i}
                                                    initial={hasNavigated ? "hidden" : false}
                                                    animate="visible"
                                                    variants={listItemVariants}
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            goBack()
                                                            setTimeout(() => goForward(item), 0)
                                                        }}
                                                        className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors text-sm
                              ${isActive
                                                                ? "bg-primary/10 text-primary font-medium"
                                                                : "hover:bg-muted/60 text-foreground"
                                                            }`}
                                                    >
                                                        {IconComponent && (
                                                            <IconComponent
                                                                className={`size-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                                                                aria-hidden="true"
                                                            />
                                                        )}
                                                        <span className="truncate">{item.label}</span>
                                                    </button>
                                                </motion.li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Right Panel - Current Level */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {
                            levels.length != 1 && (
                                <motion.div
                                    key={`header-${current.title}`}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.1 }}
                                    className="px-4 py-3"
                                >
                                    {
                                        levels.length != 1 && (
                                            <h2 className="font-semibold text-base">{current.title}</h2>
                                        )
                                    }

                                </motion.div>
                            )
                        }
                        <div className="flex-1 overflow-hidden relative">
                            <AnimatePresence mode="wait" custom={direction}>
                                <motion.div
                                    key={current.title}
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                    className="absolute inset-0 overflow-auto p-3"
                                >
                                    <ul role="list" className="space-y-1">
                                        {current.items.map((item: NavItem, i: number) => {
                                            const IconComponent = getIcon(item.icon)

                                            return (
                                                <motion.li
                                                    key={item.id}
                                                    custom={i}
                                                    initial={hasNavigated ? "hidden" : false}
                                                    animate="visible"
                                                    variants={listItemVariants}
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => goForward(item)}
                                                        disabled={item.disabled}
                                                        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors
                              hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                              disabled:opacity-50 disabled:cursor-not-allowed group"
                                                    >
                                                        {IconComponent && (
                                                            <IconComponent
                                                                className="size-5 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors"
                                                                aria-hidden="true"
                                                            />
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium text-sm truncate">
                                                                {item.label}
                                                            </div>
                                                            {item.description && (
                                                                <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                                                    {item.description}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {item.children?.length && (
                                                            <ChevronRight
                                                                className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors"
                                                                aria-hidden="true"
                                                            />
                                                        )}
                                                    </button>
                                                </motion.li>
                                            )
                                        })}
                                        {!current.items.length && (
                                            <motion.li
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.2 }}
                                                className="px-4 py-8 text-center text-sm text-muted-foreground"
                                            >
                                                No items available
                                            </motion.li>
                                        )}
                                    </ul>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}