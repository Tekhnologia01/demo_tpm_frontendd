export const NavbarButton = ({ children, onClick, item, hidden }: any) => (
    <button
      className={`sm:w-[40px] w-[30px] sm:h-[40px] h-[30px] rounded-full bg-[#E6EEFE] flex justify-center items-center group relative opacity-90 hover:opacity-100 transition-all duration-200 ease-in-out group-hover:text-[#0858F7] ${hidden && 'xl:flex hidden'} bg-[#E6EEFE]`}
      onClick={onClick}
    >
      {children}
      {item && (
        <div className="absolute -top-[5px] -right-[5px] px-[4px] py-[1px] bg-[#0858F7] rounded-full font-inter text-[10px] text-white font-bold">
          {item}
        </div>
      )}
    </button>
  );