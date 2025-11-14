import './App.css'
import DesktopNavigation from './components/DesktopNavigation'
import MobileMenu from './components/MobileMenu'

function App() {

  return (
  
       <div className=" flex items-center justify-center p-4">
        <div className="max-w-7xl mx-auto w-full ">
          {/* Desktop Navigation */}
          <div className="hidden md:grid items-center">
            <DesktopNavigation />
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center justify-center h-[80vh]">
            <MobileMenu />
          </div>
        </div>
      </div>
  )
}

export default App
