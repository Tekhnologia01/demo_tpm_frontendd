import { MdArrowRight } from 'react-icons/md';
import { useNavigate, useLocation } from 'react-router-dom';

const SideBarItem = ({ data: { Icon, title, details, note, path } }: any) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <div className="flex flex-col">
      <div
        className={`w-full h-[55px] flex justify-center items-center cursor-pointer transition-all duration-200 ease-in-out px-[px] relative border-r-0 hover:border-r-4 hover:border-blue-500 ${
          isActive ? 'bg-blue-100 shadow-md ' : 'bg-white  hover:bg-[#D9ECFF]'
        }`}
        onClick={() => {
          navigate(path);
          console.log('Navigating to:', path);
        }}
      >
        <div className="flex h-full gap-[7px] items-center">
          <Icon size={22} className={`${isActive ? 'text-blue-500' : 'text-gray-600'}`} />
          <h1 className={`font-inter text-sm font-medium ${isActive ? 'text-blue-500' : 'text-gray-600'}`}>
            {title}
          </h1>
        </div>
        <div className="flex gap-5 items-center">
          {note && (
            <div
              className={`px-[5px] py-[2px] text-[8px] text-white font-inter font-bold rounded-sm ${
                note === 'HOT' ? 'bg-[#0858F7]' : 'bg-red-600'
              }`}
            >
              {note}
            </div>
          )}
          {details.length > 0 && (
            <MdArrowRight
              size={25}
              className={`${isActive ? 'text-blue-500 rotate-90' : 'text-gray-600 rotate-0'} transition-all duration-200 ease-in-out`}
            />
          )}
        </div>
      </div>
      {isActive && details.length > 0 && (
        <div className="ml-[20px] border-l-[1px] border-blue-500">
          {details.map((detail: any, index: any) => (
            <div
              key={index}
              className="pl-[20px] h-[40px] flex items-center font-inter font-normal text-sm cursor-pointer transition-all duration-200 ease-in-out text-gray-600 hover:border-r-[3px] hover:border-blue-500 hover:bg-[#E6F2F2]"
              onClick={() => navigate(detail.path)}
            >
              {detail.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SideBarItem;