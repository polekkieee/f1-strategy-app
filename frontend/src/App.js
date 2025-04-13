import React, { useState, useEffect } from "react";

const App = () => {
  const [page, setPage] = useState("dashboard");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Race telemetry data
  const [raceData, setRaceData] = useState({
    trackName: "Silverstone Circuit",
    currentLap: 12,
    totalLaps: 52,
    tireCompound: "Soft",
    tireWear: 68,
    fuelRemaining: 4.3,
    position: 6,
    gapAhead: 1.2,
    gapBehind: 0.8,
  });

  // Strategy data
  const [strategy, setStrategy] = useState({
    suggestedLap: 19,
    newCompound: "Medium",
    strategyNote: "Pit on lap 19 to undercut cars ahead on worn Softs.",
  });

  const [newStrategy, setNewStrategy] = useState({
    suggestedLap: 15,
    newCompound: "Hard",
    strategyNote: "Weather forecast shows rain in 10 laps. Switch to Hard tires now to avoid an extra stop.",
  });

  // Simulate WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      console.log("Connecting to WebSocket...");
      setTimeout(() => {
        setConnected(true);
        console.log("WebSocket connected");
      }, 1500);
    };

    connectWebSocket();
    // Simulate new strategy suggestion after 5 seconds
    const strategyTimer = setTimeout(() => {
      setShowModal(true);
    }, 5000);
    return () => {
      clearTimeout(strategyTimer);
    };
  }, []);

  // Handle strategy generation
  const generateStrategy = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setStrategy({
        suggestedLap: 19,
        newCompound: "Medium",
        strategyNote: "Pit on lap 19 to undercut cars ahead on worn Softs.",
      });
      setLoading(false);
    }, 2000);
  };

  // Accept new strategy
  const acceptStrategy = () => {
    setStrategy(newStrategy);
    setShowModal(false);
  };

  // Get tire color based on compound
  const getTireColor = (compound) => {
    switch (compound.toLowerCase()) {
      case "soft":
        return "bg-red-600";
      case "medium":
        return "bg-yellow-400";
      case "hard":
        return "bg-gray-200";
      case "intermediate":
        return "bg-green-500";
      case "wet":
        return "bg-blue-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="relative bg-gray-900 text-white h-screen w-screen overflow-hidden">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full bg-gray-800 border-b border-gray-700 px-4 py-3 flex justify-end items-center z-10">
        <div className="flex items-center">
          <div
            className={`w-3 h-3 rounded-full mr-2 ${connected ? "bg-green-500" : "bg-red-500"}`}
          ></div>
          <span className="text-sm">
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>
      {/* Main Content */}
      <div className="pt-16 pb-16 px-4 h-full overflow-y-auto">
        {page === "dashboard" && (
          <div className="flex flex-col items-center justify-center h-full">
            {/* Current Strategy Card */}
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
                    <p className="text-2xl font-semibold">
                      {strategy.newCompound}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-300 font-medium">
                  Strategy Note:
                </p>
                <p className="text-base">{strategy.strategyNote}</p>
              </div>
            </div>
            {/* Race Position Card */}
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl mb-6 shadow-lg">
              <div className="flex justify-center items-center">
                <p className="text-3xl font-bold">P{raceData.position}</p>
              </div>
            </div>
            {/* Tire & Fuel Status */}
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
            {/* Generate Strategy Button */}
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
        )}
        {page === "settings" && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl shadow-lg">
              <h2 className="text-xl font-bold mb-4">Settings</h2>
              <p className="text-gray-400">
                Settings page is under development.
              </p>
            </div>
          </div>
        )}
      </div>
      {/* Tab Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-gray-800 border-t border-gray-700 grid grid-cols-2 z-10">
        <button
          onClick={() => setPage("dashboard")}
          className={`cursor-pointer flex flex-col items-center justify-center py-3 ${page === "dashboard" ? "text-blue-500" : "text-gray-400"}`}
        >
          <i className="fas fa-tachometer-alt text-xl mb-1"></i>
          <span className="text-xs">Dashboard</span>
        </button>
        <button
          onClick={() => setPage("settings")}
          className={`cursor-pointer flex flex-col items-center justify-center py-3 ${page === "settings" ? "text-blue-500" : "text-gray-400"}`}
        >
          <i className="fas fa-cog text-xl mb-1"></i>
          <span className="text-xs">Settings</span>
        </button>
      </div>
      {/* Strategy Suggestion Modal */}
      {showModal && (
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
                <p className="text-xl font-semibold">
                  {newStrategy.newCompound}
                </p>
              </div>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-300 font-medium">
                Strategy Note:
              </p>
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
      )}
    </div>
  );
};

export default App;
