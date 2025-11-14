"use client"
import * as React from "react"
import { motion } from "framer-motion"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import treeData from '../data/tree.json'
import { DrilldownNavMotion } from "./DrillDownNavigation"


export default function MobileMenu() {
    const [open, setOpen] = React.useState(false)
    const [shouldRenderContent, setShouldRenderContent] = React.useState(false)
    const startY = React.useRef<number | null>(null)
    const [dragY, setDragY] = React.useState(0)
    const contentRef = React.useRef<HTMLDivElement | null>(null)
    const [contentHeight, setContentHeight] = React.useState("auto")
    const updateTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
    const isDraggingRef = React.useRef(false)
    const isClosingFromDragRef = React.useRef(false)

    const updateHeight = React.useCallback(() => {
        if (contentRef.current) {
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current)
            }

            updateTimeoutRef.current = setTimeout(() => {
                const navElement = contentRef.current?.querySelector('[data-nav-container]')
                if (navElement) {
                    requestAnimationFrame(() => {
                        const height = navElement.scrollHeight
                        const totalHeight = height + 60
                        const maxHeight = window.innerHeight * 0.85
                        setContentHeight(`${Math.min(totalHeight, maxHeight)}px`)
                    })
                }
            }, 0)
        }
    }, [])

    // Keep content rendered while animating out
    React.useEffect(() => {
        if (open) {
            setShouldRenderContent(true)
        }
    }, [open])

    React.useEffect(() => {
        if (contentRef.current && shouldRenderContent) {
            updateHeight()

            const observer = new MutationObserver(() => {
                updateHeight()
            })
            const navElement = contentRef.current.querySelector('[data-nav-container]')

            if (navElement) {
                observer.observe(navElement, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    characterData: true
                })
            }

            window.addEventListener('resize', updateHeight)

            return () => {
                observer.disconnect()
                window.removeEventListener('resize', updateHeight)
                if (updateTimeoutRef.current) {
                    clearTimeout(updateTimeoutRef.current)
                }
            }
        }
    }, [shouldRenderContent, updateHeight])

    const onTouchStart = (e: React.TouchEvent) => {
        startY.current = e.touches[0].clientY
        isDraggingRef.current = false
    }

    const onTouchMove = (e: React.TouchEvent) => {
        if (startY.current == null) return
        const dy = e.touches[0].clientY - startY.current
        if (dy > 0) {
            isDraggingRef.current = true
            setDragY(dy)
        }
    }

    const onTouchEnd = () => {
        const h = contentRef.current?.offsetHeight || window.innerHeight
        const closeThreshold = Math.max(80, h * 0.15)

        if (dragY > closeThreshold) {
            isClosingFromDragRef.current = true

            // Disable Radix's animation immediately
            if (contentRef.current) {
                const sheetContent = contentRef.current.closest('[data-slot="sheet-content"]')
                if (sheetContent instanceof HTMLElement) {
                    sheetContent.setAttribute('data-disable-animation', 'true')
                }
            }

            // Animate to bottom
            const finalY = window.innerHeight
            setDragY(finalY)

            // Close after drag animation
            setTimeout(() => {
                setOpen(false)
                // Clean up after close
                setTimeout(() => {
                    setShouldRenderContent(false)
                    setDragY(0)
                    isClosingFromDragRef.current = false
                    if (contentRef.current) {
                        const sheetContent = contentRef.current.closest('[data-slot="sheet-content"]')
                        if (sheetContent instanceof HTMLElement) {
                            sheetContent.removeAttribute('data-disable-animation')
                        }
                    }
                }, 50)
                startY.current = null
                isDraggingRef.current = false
            }, 250)
        } else {
            // Bounce back
            setDragY(0)
            startY.current = null
            isDraggingRef.current = false
        }
    }

    return (
        <Sheet open={open} onOpenChange={(newOpen: boolean) => {
            setOpen(newOpen)
            if (!newOpen && !isClosingFromDragRef.current) {
                // If closing normally (not from drag), clean up after animation
                setTimeout(() => {
                    setShouldRenderContent(false)
                    setDragY(0)
                    startY.current = null
                }, 250)
            }
        }}>
            <SheetTrigger asChild>
                <button
                    className="md:hidden bg-blue-500 border-blue-200 px-4 py-2 rounded-full  text-white shadow-lg hover:bg-blue-600 transition-colors"
                    aria-haspopup="dialog"
                    aria-expanded={open}
                    aria-controls="mobile-menu-sheet"
                >
                    Open menu
                </button>
            </SheetTrigger>

            <SheetContent
                id="mobile-menu-sheet"
                side="bottom"
                className="p-0! rounded-2xl [&>button[data-slot=sheet-close]]:hidden mx-5 overflow-hidden h-auto! data-disable-animation:transition-none! data-disable-animation:animate-none! data-disable-animation:duration-0!"
                ref={contentRef}
                style={{
                    transform: dragY ? `translateY(${dragY}px)` : undefined,
                    transition: dragY && !isDraggingRef.current ? "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
                }}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <motion.div
                    animate={{
                        height: contentHeight
                    }}
                    transition={{
                        height: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
                    }}
                >
                    <div className="flex items-center justify-center p-2">
                        <div aria-hidden="true" className="h-1.5 w-12 rounded-full bg-gray-300" />
                    </div>

                    <div data-nav-container>
                        {shouldRenderContent && (
                            <DrilldownNavMotion
                                data={treeData}
                                ariaLabel="Site sections"
                                onSelectLeaf={() => setOpen(false)}
                                onHeightChange={updateHeight}
                            />
                        )}
                    </div>

                    <div aria-hidden="true" className="h-[env(safe-area-inset-bottom)]" />
                </motion.div>
            </SheetContent>
        </Sheet>
    )
}