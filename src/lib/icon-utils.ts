import * as Icons from 'lucide-react';

export function getIcon(iconName?: string) {
    if (!iconName) return null;
    
    const icons: Record<string, any> = Icons;
    return icons[iconName] || null;
}
