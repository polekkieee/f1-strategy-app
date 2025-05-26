import React, { useEffect, useState } from "react";

import Header from "./components/Header";
import Modal from "./components/Modal";
import PitBoardModal from "./components/PitBoardModal";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";

function App() {
  const [raceData, setRaceData] = useState({
    position: 1,
    tireCompound: "SOFT",
    tireWear: 12,
    fuelRemaining: 18.5,
  });

  const [strategy, setStrategy] = useState({
    suggestedLap: "...",
    newCompound: "...",
    strategyNote: "...",
  });

  const [newStrategy, setNewStrategy] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  useEffect(() => {
    let ws = null;
    let reconnectTimeout = null;
    let isIntentionalClose = false;

    const connectWebSocket = () => {
      // Clear any existing reconnect timeouts
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }

      // Close existing connection if any
      if (ws) {
        isIntentionalClose = true;
        ws.close();
      }

      // Create new WebSocket connection
      isIntentionalClose = false;
      ws = new WebSocket("ws://localhost:5000");

      const handleOpen = () => {
        console.log("Connected to WebSocket");
        setConnected(true);
      };

      const handleClose = () => {
        console.log("Disconnected from WebSocket");
        setConnected(false);

        // Only attempt to reconnect if the closure wasn't intentional
        if (!isIntentionalClose) {
          console.log("Attempting to reconnect in 3 seconds...");
          reconnectTimeout = setTimeout(connectWebSocket, 3000);
        }
      };

      const handleMessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "raceData") {
            setRaceData(data.payload);
          } else if (data.type === "strategyUpdate") {
            setNewStrategy(data.payload);
            setShowModal(true);
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }
      };

      const handleError = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.addEventListener("open", handleOpen);
      ws.addEventListener("close", handleClose);
      ws.addEventListener("message", handleMessage);
      ws.addEventListener("error", handleError);

      return () => {
        ws.removeEventListener("open", handleOpen);
        ws.removeEventListener("close", handleClose);
        ws.removeEventListener("message", handleMessage);
        ws.removeEventListener("error", handleError);

        isIntentionalClose = true;
        ws.close();

        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
        }
      };
    };

    // Initial connection
    connectWebSocket();

    // Cleanup function
    return () => {
      if (ws) {
        isIntentionalClose = true;
        ws.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []);

  const generateStrategy = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/generate-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raceData }),
      });
      const result = await response.json();
      setStrategy(result.strategy);
    } catch (error) {
      console.error("Error generating strategy:", error);
    } finally {
      setLoading(false);
    }
  };

  const acceptStrategy = () => {
    setStrategy(newStrategy);
    setShowModal(false);
    setNewStrategy(null);
  };

  const getTireColor = (compound) => {
    switch (compound.toUpperCase()) {
      case "SOFT": return "bg-red-600";
      case "MEDIUM": return "bg-yellow-400";
      case "HARD": return "bg-white";
      case "INTERMEDIATE": return "bg-green-500";
      case "WET": return "bg-blue-700";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen pt-20 px-4 pb-6">
      <Header connected={connected} onSettingsClick={() => setCurrentPage("settings")} />

      {currentPage === "dashboard" && (
        <Dashboard
          raceData={raceData}
          strategy={strategy}
          loading={loading}
          generateStrategy={generateStrategy}
          getTireColor={getTireColor}
        />
      )}

      {currentPage === "settings" && (
        <Settings
          onGoToDashBoardClick={() => setCurrentPage("dashboard")}
        />
      )}

      {showModal && newStrategy && (
        <PitBoardModal
          strategy={newStrategy}
          onAccept={acceptStrategy}
          onReject={() => {
            setShowModal(false);
            setNewStrategy(null);
          }}
        />
      )}

    </div>
  );
}

export default App;
