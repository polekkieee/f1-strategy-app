import React from "react";
import { ArrowLeftFromLine } from "lucide-react";

const Settings = ({onGoToDashBoardClick}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl shadow-lg">
        <div className="flex items-center mb-4">
            <button onClick={onGoToDashBoardClick}>
                <ArrowLeftFromLine className="w-6 h-6 text-gray-400 mb-4 mr-4" />
            </button>
            <h2 className="text-xl font-bold mb-4">Settings</h2>
        </div>
        <p className="text-gray-400">Settings page is under development.</p>
        <button className="!rounded-button bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg shadow-lg transition-all w-full max-w-2xl cursor-pointer mt-4" onClick={onGoToDashBoardClick}>
            <span className=" text-sm text-white-400">Save Changes</span>
        </button>
      </div>
    </div>
  );
};

export default Settings;
