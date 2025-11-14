import { useState, useCallback } from 'react';

interface NavItem {
    id: string;
    label: string;
    icon?: string;
    description?: string;
    disabled?: boolean;
    children?: NavItem[];
}

interface NavigationLevel {
    title: string;
    items: NavItem[];
}

export function useNavigationLogic(data: NavItem[], rootTitle: string = 'Menu') {
    const [levels, setLevels] = useState<NavigationLevel[]>([
        {
            title: rootTitle,
            items: data
        }
    ]);

    const current = levels[levels.length - 1];

    const goForward = useCallback((item: NavItem, onSelectLeaf?: (item: NavItem) => void) => {
        if (item.children && item.children.length > 0) {
            setLevels(prev => [...prev, {
                title: item.label,
                items: item.children!
            }]);
        } else if (onSelectLeaf) {
            onSelectLeaf(item);
        }
    }, []);

    const goBack = useCallback(() => {
        setLevels(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
    }, []);

    return {
        levels,
        current,
        goForward,
        goBack
    };
}
