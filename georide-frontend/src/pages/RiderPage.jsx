import { useState } from "react";
import MapView from "../components/MapView";
import RidePanel from "../components/RidePanel";

const RiderPage = () => {
  const [assignedDriver, setAssignedDriver] = useState(null);
  const [pickup, setPickup] = useState(null);
  const [drop, setDrop] = useState(null);
  const [resetSignal, setResetSignal] = useState(0);

  const resetSelection = () => {
    setPickup(null);
    setDrop(null);
    setResetSignal((value) => value + 1);
  };

  return (
    <div
      style={{
        display: "flex",
        height: "calc(100vh - 60px)",
        marginTop: "60px",
      }}
    >
      <div style={{ width: "320px", background: "#0f172a", color: "white" }}>
        <RidePanel
          pickup={pickup}
          drop={drop}
          onResetSelection={resetSelection}
          setAssignedDriver={setAssignedDriver}
        />
      </div>

      <div style={{ flex: 1 }}>
        <MapView
          pickup={pickup}
          drop={drop}
          assignedDriver={assignedDriver}
          resetSignal={resetSignal}
          setPickup={setPickup}
          setDrop={setDrop}
        />
      </div>
    </div>
  );
};

export default RiderPage;
