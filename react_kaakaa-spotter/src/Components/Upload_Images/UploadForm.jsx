import styles from "./uploadpage.module.css";
import React, { useState, useEffect } from "react";

function UploadForm() {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [maskUrls, setMaskUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [checked, setChecked] = useState(false);
  const [bands, setBands] = useState("");

  const handleText = (event) => {
    setMessage(event.target.value);
  };

  const handle_labelCheckbox = (event) => {
    setChecked(!checked);
    if (!checked) {
      //if they've unchecked that they know bands, forget the bands
      setBands("");
    }
  };

  const handleFile = (event) => {
    const files = Array.from(event.target.files);

    const url = URL.createObjectURL(files[0]);
    setPreview(url);
    setFile(files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("image", file);
    formData.append("label", bands);
    console.log(formData);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/upload/", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setMaskUrls(data["mask_urls"]);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to send/fetch to upload api ", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.container}>
        <label className={styles.customUpload}>
          {preview ? (
            <img src={preview} alt="Preview" />
          ) : (
            <>
              <div style={styles.icon}>☁️</div>
              <div style={styles.labelText}>Upload an image</div>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            id="file-input"
            name="filename"
            onChange={handleFile}
          />
        </label>
        <div className={styles.BandCheck}>
          <label for="toggle_label">Do you know the bands for this bird?</label>
          <input
            type="checkbox"
            name="toggle_label"
            onChange={handle_labelCheckbox}
          />
          {checked ? (
            <>
              <label for="b_label">Band code:</label>
              <input
                type="text"
                id="b_label"
                name="b_label"
                onChange={handleText}
              />
            </>
          ) : (
            <></>
          )}{" "}
        </div>
        {isLoading ? (
          <></>
        ) : (
          <>
            {maskUrls.map((url, i) => (
              <img key={i} src={url} alt={`mask-${i}`} />
            ))}
          </>
        )}
        <img className={styles.previewImg} />
        <input type="submit" />
      </div>
    </form>
  );
}

export default UploadForm;
