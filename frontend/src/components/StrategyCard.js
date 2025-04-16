import React from "react";

const StrategyCard = ({ strategy, getTireColor }) => (
  <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl mb-6 shadow-lg">
    <h2 className="text-xl font-bold mb-4">Current Strategy</h2>
    <div className="flex items-center mb-6">
      <div className="flex-1">
        <p className="text-5xl font-bold">{strategy.suggestedLap}</p>
      </div>
      <div className="flex-1 flex items-center">
        <div
          className={`w-12 h-12 ${getTireColor(strategy.newCompound)} rounded-full mr-4`}
        ></div>
        <div>
          <p className="text-2xl font-semibold">{strategy.newCompound}</p>
        </div>
      </div>
    </div>
    <div className="bg-gray-700 p-4 rounded-lg">
      <p className="text-sm text-gray-300 font-medium">Strategy Note:</p>
      <p className="text-base">{strategy.strategyNote}</p>
    </div>
  </div>
);

export default StrategyCard;
