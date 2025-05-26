import React from "react";

const PitBoardModal = ({ strategy, onAccept, onReject }) => {
  const lines = [
    "PIT IN",
    `LAP ${strategy.suggestedLap}`,
    strategy.newCompound,
    "CONFIRM?",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="flex flex-col items-center">
        <div className="flex flex-col bg-black text-yellow-400 font-mono text-3xl sm:text-4xl md:text-5xl w-48 sm:w-64 md:w-72 rounded-sm shadow-lg border-4 border-yellow-400">
          {lines.map((line, index) => (
            <div
              key={index}
              className="flex items-center justify-center border-t border-gray-700 h-16 sm:h-20 md:h-24"
            >
              {line}
            </div>
          ))}
        </div>

        <div className="mt-6 flex space-x-4">
          <button
            onClick={onAccept}
            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded shadow"
          >
            Accept
          </button>
          <button
            onClick={onReject}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded shadow"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default PitBoardModal;
