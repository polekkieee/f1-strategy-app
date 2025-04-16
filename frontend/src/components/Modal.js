import React from "react";

const Modal = ({ newStrategy, acceptStrategy, setShowModal, getTireColor }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75 p-4">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl animate-fadeIn">
        <div className="bg-blue-600 -mt-6 -mx-6 px-6 py-4 rounded-t-xl mb-4">
          <h3 className="text-xl font-bold">New Strategy Suggestion</h3>
          <p className="text-sm text-blue-200">
            Weather conditions have changed
          </p>
        </div>
        <div className="flex items-center mb-4">
          <div className="flex-1">
            <p className="text-4xl font-bold">{newStrategy.suggestedLap}</p>
          </div>
          <div className="flex-1 flex items-center">
            <div
              className={`w-10 h-10 ${getTireColor(newStrategy.newCompound)} rounded-full mr-3`}
            ></div>
            <p className="text-xl font-semibold">{newStrategy.newCompound}</p>
          </div>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-300 font-medium">Strategy Note:</p>
          <p className="text-base">{newStrategy.strategyNote}</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowModal(false)}
            className="!rounded-button flex-1 bg-transparent border border-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg cursor-pointer"
          >
            Decline
          </button>
          <button
            onClick={acceptStrategy}
            className="!rounded-button flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg cursor-pointer"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
