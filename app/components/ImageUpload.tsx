import React, { useState } from "react";
 
function UploadImage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
 
  // get API URL from .env.local
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
 
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };
 
  const handleUpload = async () => {
    if (!selectedFile) return;
 
    const formData = new FormData();
    formData.append("file", selectedFile);
 
    try {
      const response = await fetch(`${apiUrl}/upload/`, {
        method: "POST",
        body: formData,
      });
 
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
 
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };
 
  return (
<div>
<h2>Upload Stock Image</h2>
<input type="file" onChange={handleFileChange} />
<button onClick={handleUpload}>Upload</button>
 
      {result && (
<div>
<p>Stock Level: {result.stock_percentage}</p>
<p>Type: {result.type}</p>
</div>
      )}
</div>
  );
}
 
export default UploadImage;