import { useState } from "react";
import { navSupportsData } from "../utils/sidebarData";
import SideBarItem from "./SideBarItem";
import { Dispatch, SetStateAction } from "react";

interface SidebarProps {
  showSideBar: boolean;
  setShowSideBar: Dispatch<SetStateAction<boolean>>;
  headerHeight: number;
}

const Sidebar = ({ showSideBar, setShowSideBar, headerHeight }: SidebarProps) => {
  const [showScrollbar, setShowScrollbar] = useState(false);

  const handleItemClick = () => {
    setShowSideBar(false); // Close sidebar when an item is clicked
  };

  return (
    <div
      className={`${
        showSideBar
          ? "translate-x-0 sm:w-[280px] w-full"
          : "w-0 -translate-x-[300px]"
      } top-0 h-[calc(100vh-${headerHeight}px)] overflow-y-scroll scrollbar-none fixed lg:static lg:pt-[30px] pt-[100px] bg-white
      ${
        showScrollbar ? "hideScrollbar" : "hideScrollbar"
      } transition-all duration-200 ease-in-out z-10`}
      onMouseEnter={() => setShowScrollbar(true)}
      onMouseLeave={() => setShowScrollbar(false)}
    >
      <div className="w-full flex flex-col">
        <div className="w-full flex flex-col my-[10px] gap-[10px]">
          {navSupportsData.map((data, index) => (
            <SideBarItem key={index} data={data} onItemClick={handleItemClick} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;