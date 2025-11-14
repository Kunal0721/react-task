import DesktopDrilldownNav from './DesktopNav'
import treeData from '@/data/tree.json'

function DesktopNavigation() {
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSelect = (node: any) => {
        alert(`Selected: ${node.label}`);
    };
    return (
        <div className="hidden md:block">
            <DesktopDrilldownNav
                data={treeData}
                rootTitle="Main Menu"
                onSelectLeaf={handleSelect}
            />
        </div>
    )
}

export default DesktopNavigation
