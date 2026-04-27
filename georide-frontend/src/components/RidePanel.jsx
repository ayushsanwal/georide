import { useEffect, useState } from "react";
import { cancelRide, requestRide, getRide } from "../services/api";

const panel = {
  root: {
    padding: "20px",
    background: "rgba(15,23,42,0.96)",
    borderRight: "1px solid rgba(148,163,184,0.2)",
    height: "100%",
    width: "320px",
    color: "#e2e8f0",
    overflowY: "auto",
  },
  label: {
    fontSize: "12px",
    color: "#94a3b8",
    margin: "0 0 6px",
  },
  value: {
    margin: "0 0 14px",
    fontSize: "14px",
    overflowWrap: "anywhere",
  },
  section: {
    padding: "14px 0",
    borderTop: "1px solid rgba(148,163,184,0.18)",
  },
  primary: {
    width: "100%",
    padding: "12px",
    background: "#00a67d",
    border: "none",
    borderRadius: "8px",
    color: "white",
    fontWeight: "700",
    cursor: "pointer",
  },
  secondary: {
    width: "100%",
    padding: "10px",
    background: "transparent",
    border: "1px solid #475569",
    borderRadius: "8px",
    color: "#e2e8f0",
    cursor: "pointer",
  },
};

const getRideError = (error) => {
  const code = error?.response?.data?.error;

  if (code === "NO_DRIVERS") return "No drivers available nearby";
  if (code === "RIDE_EXISTS") return "You already have an active ride";
  if (code === "INVALID_LOCATION") return "Select a valid pickup and drop";
  if (code === "NO_ACTIVE_RIDE") return "No active ride found";

  return "Something went wrong";
};

const formatPoint = (point) => {
  if (!point) return "Not selected";
  return `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`;
};

const getStatusLabel = (ride) => {
  if (!ride) return "Ready to book";
  if (ride.status === "ASSIGNED") return "Driver assigned";
  if (ride.status === "ONGOING") return "Ride ongoing";
  if (ride.status === "ENDED") return "Ride ended";
  if (ride.status === "CANCELLED") return "Ride cancelled";
  return ride.status;
};

const RidePanel = ({
  pickup,
  drop,
  onResetSelection,
  setAssignedDriver,
}) => {
  const [ride, setRide] = useState(null);
  const [error, setError] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);
  const riderId = localStorage.getItem("riderId");

  useEffect(() => {
    const loadRide = async () => {
      try {
        const data = await getRide();

        setRide(data);
        setAssignedDriver(data?.driverId ? { id: data.driverId } : null);
      } catch (err) {
        setError(getRideError(err));
      }
    };

    loadRide();
    const interval = setInterval(loadRide, 2000);

    return () => clearInterval(interval);
  }, [setAssignedDriver]);

  const handleRequestRide = async () => {
    if (!pickup || !drop) {
      setError("Select pickup and drop on the map first");
      return;
    }

    setError("");
    setIsRequesting(true);

    try {
      const data = await requestRide(
        pickup.lat,
        pickup.lng,
        drop.lat,
        drop.lng
      );

      setRide(data);
      setAssignedDriver(data?.driverId ? { id: data.driverId } : null);
    } catch (err) {
      setError(getRideError(err));
    } finally {
      setIsRequesting(false);
    }
  };

  const handleCancelRide = async () => {
    try {
      await cancelRide();
      setRide(null);
      setAssignedDriver(null);
    } catch (err) {
      setError(getRideError(err));
    }
  };

  const isAssigned = ride?.status === "ASSIGNED";
  const isOngoing = ride?.status === "ONGOING";
  const canRequest = pickup && drop && !ride && !isRequesting;

  return (
    <aside style={panel.root}>
      <h2 style={{ margin: "0 0 4px", fontSize: "22px" }}>Book a ride</h2>
      <p style={{ ...panel.label, marginBottom: "18px" }}>
        Rider: {riderId || "new rider"}
      </p>

      <div style={panel.section}>
        <p style={panel.label}>Status</p>
        <p style={{ ...panel.value, fontWeight: "700", color: "#67e8f9" }}>
          {getStatusLabel(ride)}
        </p>

        <p style={panel.label}>Pickup</p>
        <p style={panel.value}>{formatPoint(pickup)}</p>

        <p style={panel.label}>Destination</p>
        <p style={panel.value}>{formatPoint(drop)}</p>

        {!ride && (
          <div style={{ display: "grid", gap: "10px" }}>
            <button
              onClick={handleRequestRide}
              disabled={!canRequest}
              style={{
                ...panel.primary,
                opacity: canRequest ? 1 : 0.55,
                cursor: canRequest ? "pointer" : "not-allowed",
              }}
            >
              {isRequesting ? "Finding driver..." : "Request Ride"}
            </button>

            {(pickup || drop) && (
              <button onClick={onResetSelection} style={panel.secondary}>
                Reset pickup and drop
              </button>
            )}
          </div>
        )}
      </div>

      {error && (
        <p style={{ color: "#fca5a5", fontSize: "13px", margin: "12px 0 0" }}>
          {error}
        </p>
      )}

      {ride && (
        <div style={panel.section}>
          <p style={panel.label}>Driver</p>
          <p style={panel.value}>{ride.driverId}</p>

          <p style={panel.label}>Fare</p>
          <p style={panel.value}>Rs {ride.fare}</p>

          <p style={panel.label}>Distance</p>
          <p style={panel.value}>
            {(ride.distanceKm ?? ride.tripDistance ?? 0).toFixed(2)} km
          </p>

          <p style={panel.label}>ETA</p>
          <p style={panel.value}>
            {isAssigned
              ? `${ride.driverEtaMinutes} mins to pickup`
              : `${ride.destinationEtaMinutes} mins to destination`}
          </p>

          {isAssigned && (
            <>
              <p style={panel.label}>Start OTP</p>
              <p style={{
                margin: "0 0 14px",
                fontSize: "28px",
                fontWeight: "800",
                letterSpacing: "2px",
                color: "#67e8f9",
              }}>
                {ride.otp}
              </p>

              <button onClick={handleCancelRide} style={panel.secondary}>
                Cancel Ride
              </button>
            </>
          )}

          {isOngoing && (
            <p style={{ color: "#86efac", fontSize: "13px", margin: 0 }}>
              Your ride has started. The assigned driver remains visible on
              the map.
            </p>
          )}
        </div>
      )}
    </aside>
  );
};

export default RidePanel;
