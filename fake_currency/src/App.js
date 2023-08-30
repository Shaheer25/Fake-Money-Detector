import logo from './logo.png';
import './App.css';
import React, { useEffect, useRef, useState, history } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { ReactSVG } from 'react-svg';

const App = () => {
  const [photo, setPhoto] = useState(null);
  const [result, setResult] = useState(null);
  const [res, setRes] = useState(false);
  const videoRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (selectedFile) {
      const formData = new FormData();
      formData.append('my_uploaded_file', selectedFile);
      try {
        const response = await axios.post('http://127.0.0.1:5000/', formData);
        if (response.data.result !== 'None') {
          setResult(response.data);
          setRes(true);
        }
      } catch (error) {
        // Handle error
        console.error(error);
      }
    }
  };

  const handleStartCamera = async () => {
    if (!cameraOn) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      setCameraOn(true);
    } else {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setCameraOn(false);
    }
  };

  const handleCapturePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.id = 'canvas';
    const context = canvas.getContext('2d');
    const video = videoRef.current;

    // Calculate the center coordinates
    const centerX = video.videoWidth / 2;
    const centerY = video.videoHeight / 2;

    // Set the desired crop size
    const cropWidth = 410;
    const cropHeight = 205;

    // Calculate the crop position
    const cropX = centerX - cropWidth / 2;
    const cropY = centerY - cropHeight / 2;

    // Set the canvas size to match the crop size
    canvas.width = cropWidth;
    canvas.height = cropHeight;

    context.drawImage(video, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
    const capturedPhoto = canvas.toDataURL('image/png');
    setPhoto(capturedPhoto);
  };

  const handleUploadPhoto = async () => {
    const formData = new FormData();
    formData.append('my_uploaded_file', dataURItoBlob(photo));
    const response = await axios.post('http://127.0.0.1:5000/', formData);
    const data = await response.json();
    if (response.data.result !== 'None') {
      setResult(data);
      setRes(true);
    }
  };

  const dataURItoBlob = (dataURI) => {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    return blob;
  };

  return (
    <div>
      {res ? (
        <div>
          <div className="row row-cols-1 row-cols-md-2 g-3 text-center my-custom-gap">
              <div className="col">
                <div className="card shadow-lg p-0 bg-white rounded custom-card">
                  <div className="card-body">
                    <h3 className="card-title">Original Image</h3>
                    <div className="image-container">
                        <ReactSVG
                          src={`data:image/svg+xml;base64,${btoa(result.original_image)}`}
                          className="custom-svg"
                        />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col">
                <div className="card shadow-lg p-0 bg-white rounded custom-card">
                  <div className="card-body">
                    <h3 className="card-title">Edged Image</h3>
                    <div className="image-container">
                        <ReactSVG
                          src={`data:image/svg+xml;base64,${btoa(result.edge_image)}`}
                          className="custom-svg"
                        />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          <div className="row row-cols-2 row-cols-md-4 g-3 text-center my-custom-gap">
            <div className="col">
              <div className="card shadow-lg p-0 bg-white rounded">
                <div className="card-body">
                  <h3 className="card-title">VARIANCE</h3>
                  <p className="card-text">{result.variance}</p>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card shadow-lg p-0 bg-white rounded">
                <div className="card-body">
                  <h3 className="card-title">SKEWNESS</h3>
                  <p className="card-text">{result.skew}</p>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card shadow-lg p-0 bg-white rounded">
                <div className="card-body">
                  <h3 className="card-title">KURTOSIS</h3>
                  <p className="card-text">{result.kurtosis}</p>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card shadow-lg p-0 bg-white rounded">
                <div className="card-body">
                  <h3 className="card-title">ENTROPY</h3>
                  <p className="card-text">{result.entropy}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="row row-cols-2 row-cols-md-2 g-3 text-center my-custom-gap">
            <div className="col">
              <div className="card shadow-lg p-2 bg-white rounded">
                <div className="card-body">
                  <h3 className="card-title">ACCURACY</h3>
                  <p className="card-text">{result.accuracy}</p>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card shadow-lg p-2 bg-white rounded">
                <div className="card-body">
                  <h3 className="card-title">RESULT : {result.result}</h3>
                  <p className="card-text">{result.out}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <section className="gradient-custom">
              <div className="container py-4">
                <div className="row row-cols-2">
                  <div className="col-6">
                    <div className="card bg-dark text-white" style={{ borderRadius: '1rem' }}>
                      <div className="card-body p-3 text-center">
                        <div className="mb-md-5 mt-md-4 ">
                          <h2 className="fw-bold mb-1 text-uppercase">Select Notes</h2>
                          <p className="text-white-50 mb-5">Please select note picture by clicking the button below!</p>
                          <form name="voterform" onSubmit={handleSubmit} encType="multipart/form-data">
                            <div className="form-outline form-white mb-4">
                              <input type="file" id="my_uploaded_file" name="my_uploaded_file" accept="image/*" onChange={handleFileChange} />
                            </div>
                            <br />
                            <button className="btn btn-outline-light btn-lg px-5" name="login" type="submit">Check Now</button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="card bg-dark text-white" style={{ width: '100%', borderRadius: '1rem' }}>
                      <div className="card-body p-3 text-center">
                        <div className="mb-md-5 mt-md-4 pb-5">
                          <h2 className="fw-bold mb-1 text-uppercase">Scan Notes</h2>
                          <p className="text-white-50 mb-5">Please take a picture using your device camera!</p>
                          <video id="video" ref={videoRef} />
                          <button className="btn btn-outline-light btn-lg px-5" onClick={handleStartCamera}>{cameraOn ? 'Stop Camera' : 'Start Camera'}</button>
                          <button className="btn btn-outline-light btn-lg px-5" onClick={handleCapturePhoto}>Capture Photo</button>
                          {photo && (
                            <div>
                              <img id="my_uploaded_file" name="my_uploaded_file" src={photo} alt="Captured" />
                              <br />
                              <button className="btn btn-outline-light btn-lg px-5" onClick={handleUploadPhoto}>Upload Photo</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
        </div>
      )}
    </div>
  );
}

export default App;
