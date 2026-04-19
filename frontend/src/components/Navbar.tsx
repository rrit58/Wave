import { Link } from "react-router-dom";
import { ModeToggle } from "./mode-toggle";

const Navbar = () => {
  return (
    <div className="absolute top-0 left-0 right-0 z-50 px-4 sm:px-10 py-4 flex justify-between items-center">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 group transition-all duration-300">
        {/* W */}
        <span className="text-2xl sm:text-3xl font-bold tracking-wide text-[#00f5ff] group-hover:drop-shadow-[0_0_10px_#00f5ff] transition-all">
          W
        </span>

        {/* Logo Icon */}
        <div className="p-1 rounded-lg bg-[#00f5ff]/10 border border-[#00f5ff]/20 group-hover:scale-110 transition-transform">
          <img src="/logo.svg" alt="Logo" className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>

        {/* e */}
        <span className="text-2xl sm:text-3xl font-bold tracking-wide text-[#00f5ff] group-hover:drop-shadow-[0_0_10px_#00f5ff] transition-all">
          e
        </span>
      </Link>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        <ModeToggle />
      </div>

    </div>
  );
};

export default Navbar;