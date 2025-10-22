import styles from "../Upload_Images/uploadpage.module.css";
import React, { useState, useEffect } from "react";

function SearchForm() {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [maskUrls, setMaskUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [checked, setChecked] = useState(false);
  const [bands, setBands] = useState("");
  const [GetData, setGetData] = useState(null);
  const [kNNValue, setKNNValue] = useState(5);
  const [modelValue, setModelValue] = useState("DINO");

  console.log("CAN ANYONE HEAR ME");

  const handleText = (event) => {
    setBands(event.target.value);
  };

  const handleKNNChange = (event) => {
    setKNNValue(parseInt(event.target.value));
  };

  const handleModelChange = (event) => {
    setModelValue(event.target.value);
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
    formData.append("model", modelValue);
    formData.append("k_nn", kNNValue);
    console.log("model is stored as ", modelValue);
    console.log(formData);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/search/", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setGetData(data);
      console.log("GetData", GetData);
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
        <div>
          <label>Which model would you like to test?: </label>
          <select
            name="model"
            id="model"
            value={modelValue}
            onChange={handleModelChange}
          >
            <option value="DINO">DINOv2</option>
            <option value="CNN">CNN</option>
          </select>
        </div>
        <div>
          <label>K-NN for image search: </label>
          <select
            name="k-nn"
            id="k-nn"
            value={kNNValue}
            onChange={handleKNNChange}
          >
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="7">7</option>
            <option value="9">9</option>
            <option value="10">10</option>
            <option value="12">12</option>
            <option value="15">15</option>
            <option value="18">18</option>
            <option value="24">24</option>
            <option value="42">42</option>
          </select>
        </div>
        <div className={styles.predictionBox}>
          {isLoading ? (
            <p></p>
          ) : maskUrls === undefined || maskUrls.length == 0 ? (
            GetData === undefined ? (
              <p>Loading bird prediction...</p>
            ) : GetData["success"] === 0 ? (
              <p>
                Oops! The YOLO model can't see a kaakaa in your image. Are you
                sure this is an image of a kaakaa?
              </p>
            ) : GetData[0]["new_bird_flag"] == false ? (
              <p>
                I think this bird may be {GetData[0]["winner"]}!{" "}
                {GetData[0]["count"]} of the image vector's nearest neighbors
                had this label. The median distance of its k-neighbors was
                greater than 0.8 using cosine similarity, suggesting this image
                represents a known bird.
              </p>
            ) : (
              <p>
                I think this may be a new bird... {GetData[0]["count"]} of the
                image vector's nearest neighbors had the label{" "}
                {GetData[0]["winner"]}. The median distance of its k-neighbors
                was greater than 0.8, suggesting this is a bird I haven't seen
                before.
              </p>
            )
          ) : (
            <></>
          )}
        </div>
        <img className={styles.previewImg} />
        <input type="submit" />
      </div>
    </form>
  );
}

export default SearchForm;
