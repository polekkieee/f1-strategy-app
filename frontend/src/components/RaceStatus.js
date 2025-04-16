import React from "react";

const RaceStatus = ({ raceData, getTireColor }) => (
  <>
    <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl mb-6 shadow-lg">
      <div className="flex justify-center items-center">
        <p className="text-3xl font-bold">P{raceData.position}</p>
      </div>
    </div>
    <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl mb-6 shadow-lg">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div
            className={`w-10 h-10 ${getTireColor(raceData.tireCompound)} rounded-full mr-3`}
          ></div>
          <p className="text-sm text-gray-400">{raceData.tireWear}%</p>
        </div>
        <div className="flex items-center">
          <i className="fas fa-gas-pump text-2xl mr-3 text-yellow-400"></i>
          <p className="text-sm text-gray-400">
            {raceData.fuelRemaining.toFixed(1)}
          </p>
        </div>
      </div>
    </div>
  </>
);

export default RaceStatus;
