import React from "react";
import { Settings } from "lucide-react";


const Header = ({ connected, onSettingsClick }) => {
  return (
    <div className="fixed top-0 left-0 w-full bg-gray-800 border-b border-gray-700 px-4 py-3 flex justify-between items-center z-10">
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full mr-2 ${connected ? "bg-green-500" : "bg-red-500"}`}></div>
        <span className="text-sm">{connected ? "Connected" : "Disconnected"}</span>
      </div>
      <button onClick={onSettingsClick}>
        <Settings className="w-6 h-6 text-white hover:text-gray-400 transition" />
      </button>
    </div>
  );
};

export default Header;
