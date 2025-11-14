export interface NavItem {
    id: string;
    label: string;
    icon?: string;
    description?: string;
    disabled?: boolean;
    children?: NavItem[];
}


export interface Level {
  title: string;
  items: NavItem[];
}

export interface NavProps {
    data: NavItem[];
    ariaLabel?: string;
    rootTitle?: string;
    onSelectLeaf?: (item: NavItem) => void;
    className?: string;
}
