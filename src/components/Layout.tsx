import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  const [showSideBar, setShowSideBar] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const headerHeight = 70;
  const searchBarHeight = 60;
  const paddingTop = showSearch ? headerHeight + searchBarHeight : headerHeight;

  return (
    <div className="flex flex-col h-auto overflow-x-auto bg-[#F8F8F8] min-h-screen">
      <Header
        showSideBar={showSideBar}
        setShowSideBar={setShowSideBar}
        showSearch={showSearch}
        setShowSearch={setShowSearch}
      />
      <div className="flex flex-1" style={{ paddingTop: `${paddingTop}px` }}>
        <Sidebar showSideBar={showSideBar} setShowSideBar={setShowSideBar} headerHeight={headerHeight} />
        <main className="flex-1 transition-all duration-200 ease-in-out top-[60px] h-[calc(100vh-70px)] overflow-y-scroll scrollbar-none">
          {children}
        </main>
      </div>                                                    
    </div>
  );
};

export default Layout;