import UploadForm from "./UploadForm";
import styles from "./uploadpage.module.css";
import styles2 from "../Dashboard/dashpost.module.css";
import SearchForm from "../Search_Image/SearchForm";
function UploadSection() {
  const path = window.location.pathname.endsWith("/search")
    ? "search"
    : window.location.pathname.endsWith("/upload")
    ? "upload"
    : "";
  return (
    <div className={styles.half}>
      <div className={styles2.postHeader}>Upload section</div>
      {path == "upload" ? <UploadForm /> : <SearchForm />}
    </div>
  );
}

export default UploadSection;
