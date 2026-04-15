import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div style={styles.nav}>
      <div style={styles.logo}>GeoRide</div>

      <div style={styles.links}>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/rider" style={styles.link}>Ride</Link>
        <Link to="/driver" style={styles.link}>Drive</Link>
      </div>
    </div>
  );
};

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 30px",
    background: "#0f172a",
    color: "white",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  logo: {
    fontSize: "20px",
    fontWeight: "600",
  },
  links: {
    display: "flex",
    gap: "25px",
  },
  link: {
    color: "#cbd5f5",
    textDecoration: "none",
    fontWeight: "500",
  },
};

export default Navbar;