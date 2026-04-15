import { useState } from "react";
import MapView from "../components/MapView";
import RidePanel from "../components/RidePanel";

const RiderPage = () => {
  const [assignedDriver, setAssignedDriver] = useState(null);
  const [pickup, setPickup] = useState(null);
  const [drop, setDrop] = useState(null);

  return (
     <div
    style={{
      display: "flex",
      height: "calc(100vh - 60px)", 
      marginTop: "60px", 
    }}
  >
      
      {/* LEFT PANEL */}
      <div style={{ width: "300px", background: "#111", color: "white" }}>
        <RidePanel
          pickup={pickup}
          drop={drop}
          setAssignedDriver={setAssignedDriver}
        />
      </div>

      {/* MAP */}
      <div style={{ flex: 1 }}>
        <MapView
          pickup={pickup}
          drop={drop}
          assignedDriver={assignedDriver}
          setPickup={setPickup}
          setDrop={setDrop}
        />
      </div>

    </div>
  );
};

export default RiderPage;