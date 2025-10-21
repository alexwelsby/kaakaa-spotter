import styles from "./uploadpage.module.css";
import React, { useState, useEffect } from "react";

function UploadForm() {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [maskUrls, setMaskUrls] = useState([]);
  const [GetData, setGetData] = useState(null);
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
    const path = window.location.pathname;
    const api_path = path.endsWith("/search")
      ? "http://127.0.0.1:8000/api/search/"
      : path.endsWith("/upload")
      ? "http://127.0.0.1:8000/api/upload/"
      : "";
    console.log(path);
    console.log(formData);
    try {
      const res = await fetch(api_path, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (path.endsWith("/upload")) {
        setMaskUrls(data["mask_urls"]);
      }
      setGetData(data);
      console.log("data ", data); //this is a mess but it's fine.
      console.log("maskUrls ", maskUrls);
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
          <p></p>
        ) : maskUrls === undefined || maskUrls.length == 0 ? (
          GetData === undefined ? (
            <p>Loading bird prediction...</p>
          ) : GetData[0]["new_bird_flag"] == false ? (
            <p>
              I think this bird may be {GetData[0]["winner"]}!{" "}
              {GetData[0]["count"]} of the image vector's nearest neighbors had
              this label. The median distance of its k-neighbors was greater
              than 0.8 using cosine similarity, suggesting this image represents
              a known bird.
            </p>
          ) : (
            <p>
              I think this may be a new bird... {GetData[0]["count"]} of the
              image vector's nearest neighbors had the label{" "}
              {GetData[0]["winner"]}. The median distance of its k-neighbors was
              greater than 0.8, suggesting this is a bird I haven't seen before.
            </p>
          )
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
