import React from "react";
import StrategyCard from "../components/StrategyCard";
import RaceStatus from "../components/RaceStatus";

const Dashboard = ({ raceData, strategy, loading, generateStrategy, getTireColor }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <StrategyCard strategy={strategy} getTireColor={getTireColor} />
      <RaceStatus raceData={raceData} getTireColor={getTireColor} />
      <button
        onClick={generateStrategy}
        className="!rounded-button bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg shadow-lg transition-all w-full max-w-2xl cursor-pointer"
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white mr-3"></div>
            Generating Strategy...
          </div>
        ) : (
          <>Generate Pit Strategy</>
        )}
      </button>
    </div>
  );
};

export default Dashboard;
