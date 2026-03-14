import Sidebar from './Sidebar';
import AIAdvisorChat from './AIAdvisorChat';
import ProfileDropdown from './ProfileDropdown';
import BusinessSelector from './BusinessSelector';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Sidebar />
      {/* Top-right floating profile bar */}
      <div className="layout-topbar">
        <BusinessSelector />
        <ProfileDropdown />
      </div>
      <main className="main-content">
        {children}
      </main>
      <AIAdvisorChat />
    </div>
  );
};

export default Layout;

