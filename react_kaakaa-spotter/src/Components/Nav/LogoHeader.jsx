//import styles from "./logoHeader.module.css";
import headerLogo from "../../assets/react.png";
import styles from "./nav.module.css";
export default function LogoHeader() {
  return (
    <header className={styles.logoHeader}>
      <img src={headerLogo} />
      <h2>
        Kākā
        <br />
        Spotter
      </h2>
    </header>
  );
}
