import Sidebar from './Sidebar';
import AIAdvisorChat from './AIAdvisorChat';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
      <AIAdvisorChat />
    </div>
  );
};

export default Layout;

