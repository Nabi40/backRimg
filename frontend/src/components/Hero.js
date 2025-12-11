"use client";
import { useState, useRef, useEffect, useCallback } from "react";

export default function Hero() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const mockThumbs = [
    { src: "/images/test1.png", filename: "test1.png", type: "image/png" },
    { src: "/images/test2.jpg", filename: "test2.jpg", type: "image/jpeg" },
    { src: "/images/bg1.png", filename: "bg1.png", type: "image/png" },
    { src: "/images/bg2.png", filename: "bg2.png", type: "image/png" },
  ];

  // Handle file selection
  const handleFileSelect = (file) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setError("Please select a valid image file");
    }
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle paste (CTRL+V)
  useEffect(() => {
    const handlePaste = async (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleFileSelect(file);
          }
          break;
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Upload image to API
  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch("http://backend.rubber-duck.solutions//api/remove-bg/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to process image");
      }

      // Check content type to handle both JSON and image responses
      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        // Handle JSON response
        const data = await response.json();
        console.log("API Response:", data);

        // Try different possible field names
        let imageData =
          data.image ||
          data.result ||
          data.processed_image ||
          data.output ||
          data.data ||
          data.url;

        // If no image field found, check if the entire response is a string (base64)
        if (!imageData && typeof data === "string") {
          imageData = data;
        }

        // If still no image data, check if response has a nested structure
        if (!imageData && data.data) {
          imageData = data.data.image || data.data.result || data.data;
        }

        if (imageData) {
          // Handle different image data formats
          if (typeof imageData === "string") {
            if (imageData.startsWith("data:image")) {
              // Already a data URL
              setResultImage(imageData);
            } else if (
              imageData.startsWith("http://") ||
              imageData.startsWith("https://")
            ) {
              // It's a URL
              setResultImage(imageData);
            } else {
              // Assume it's base64 without data URI prefix
              setResultImage(`data:image/png;base64,${imageData}`);
            }
          } else {
            throw new Error("Unexpected image data format in response");
          }
        } else {
          console.error("Response data:", data);
          throw new Error(
            "No image data found in response. Response keys: " +
              Object.keys(data).join(", ")
          );
        }
      } else if (contentType.includes("image/")) {
        // Direct image response
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setResultImage(imageUrl);
      } else {
        // Try to handle as blob (might be image without proper content-type)
        const blob = await response.blob();

        // Check if blob is actually an image by trying to create an object URL
        if (blob.size > 0) {
          // Try to determine if it's an image by reading it
          const reader = new FileReader();
          reader.onloadend = () => {
            // Check if it looks like an image
            const result = reader.result;
            if (
              typeof result === "string" &&
              result.startsWith("data:image/")
            ) {
              setResultImage(result);
            } else {
              // Try as blob URL anyway
              const imageUrl = URL.createObjectURL(blob);
              setResultImage(imageUrl);
            }
          };
          reader.onerror = () => {
            // Fallback: try as blob URL
            const imageUrl = URL.createObjectURL(blob);
            setResultImage(imageUrl);
          };
          reader.readAsDataURL(blob);
        } else {
          throw new Error("Received empty response from server");
        }
      }
    } catch (err) {
      setError(err.message || "An error occurred while processing the image");
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedFile]);

  // Auto-upload when file is selected
  useEffect(() => {
    if (selectedFile && preview) {
      handleUpload();
    }
  }, [selectedFile, preview, handleUpload]);

  // Download result image
  const handleDownload = async () => {
    if (!resultImage) return;

    try {
      let blob;

      // If resultImage is a data URL, convert it to blob
      if (resultImage.startsWith("data:")) {
        const response = await fetch(resultImage);
        blob = await response.blob();
      } else {
        // If it's a blob URL, fetch it
        const response = await fetch(resultImage);
        blob = await response.blob();
      }

      // Ensure it's a PNG blob
      if (!blob.type || !blob.type.startsWith("image/")) {
        // Convert to PNG if needed
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        await new Promise((resolve, reject) => {
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `removed-bg-${Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                resolve();
              } else {
                reject(new Error("Failed to convert image"));
              }
            }, "image/png");
          };
          img.onerror = reject;
          img.src = resultImage;
        });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `removed-bg-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError("Failed to download image: " + err.message);
      console.error("Download error:", err);
    }
  };

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (resultImage && resultImage.startsWith("blob:")) {
        URL.revokeObjectURL(resultImage);
      }
    };
  }, [resultImage]);

  // Reset all states
  const handleReset = () => {
    // Cleanup blob URL before resetting
    if (resultImage && resultImage.startsWith("blob:")) {
      URL.revokeObjectURL(resultImage);
    }
    setSelectedFile(null);
    setPreview(null);
    setResultImage(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <section className="relative mx-auto bg-blue-100 w-full flex justify-center items-center px-4 py-16 font-[Poppins] sm:px-6 lg:px-8">
      <div className="space-y-4 text-center"></div>
      <div className="mt-10 flex w-full flex-col items-center justify-center gap-10 lg:flex-row lg:items-start">
        {/* Upload card */}
        <div className="w-full max-w-2xl rounded-3xl border border-[#f0f0f0] bg-white p-6 shadow-[0_30px_60px_rgba(1,2,3,0.08)] lg:w-1/2">
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`rounded-3xl border border-[#f1f1f1] bg-white/90 p-8 text-center shadow-inner transition ${
              isDragging ? "border-blue-500 bg-blue-50" : ""
            }`}
          >
            {!preview && !resultImage ? (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="mx-auto flex w-full max-w-[240px] cursor-pointer items-center justify-center gap-2 rounded-full bg-blue-500 px-6 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-blue-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M12 5v14" />
                    <path d="m19 12-7-7-7 7" />
                  </svg>
                  Upload Image
                </label>
                <p className="mt-5 text-sm font-medium text-[#8b8b8b]">
                  or drop a file here
                  <br />
                  CTRL+V to paste image or URL
                </p>
              </>
            ) : (
              <div className="space-y-4">
                {/* Show preview while loading */}
                {preview && !resultImage && (
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Preview"
                      className="mx-auto max-h-64 w-auto rounded-lg object-contain"
                    />
                    {loading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                        <div className="text-center">
                          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                          <p className="mt-2 text-sm text-gray-600">
                            Processing...
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Show result image when available */}
                {resultImage && (
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-center">
                        {/* Original image */}
                        {preview && (
                          <div className="flex-1">
                            <p className="mb-2 text-center text-xs font-medium text-gray-500">
                              Original
                            </p>
                            <img
                              src={preview}
                              alt="Original"
                              className="mx-auto max-h-64 w-full max-w-full rounded-lg object-contain border border-gray-200"
                            />
                          </div>
                        )}
                        {/* Result image */}
                        <div className="flex-1">
                          <p className="mb-2 text-center text-xs font-medium text-gray-500">
                            Background Removed
                          </p>
                          <div
                            className="relative mx-auto max-h-64 w-full max-w-full rounded-lg border border-gray-200"
                            style={{
                              backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZGRkIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNkZGQiLz48L3N2Zz4=')`,
                              backgroundSize: "20px 20px",
                            }}
                          >
                            <img
                              src={resultImage}
                              alt="Result"
                              className="mx-auto max-h-64 w-full max-w-full rounded-lg object-contain"
                              onError={(e) => {
                                console.error("Image load error:", e);
                                setError(
                                  "Failed to load result image. Please try again."
                                );
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                      <button
                        onClick={handleDownload}
                        className="flex items-center justify-center gap-2 rounded-full bg-green-500 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-green-600"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Download Image
                      </button>
                      <button
                        onClick={handleReset}
                        className="flex items-center justify-center gap-2 rounded-full bg-gray-500 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-gray-600"
                      >
                        Upload Another
                      </button>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
                    {error}
                  </div>
                )}
              </div>
            )}

            {/* Sample thumbnails */}
            {!preview && !resultImage && (
              <div className="mt-8">
                <p className="mb-3 text-left text-sm font-medium text-[#8b8b8b]">
                  Need help for product photography? try one of these:
                </p>
                <div className="flex gap-2">
                  {mockThumbs.map((thumb, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        fetch(thumb.src)
                          .then((res) => res.blob())
                          .then((blob) => {
                            const file = new File([blob], thumb.filename, {
                              type: thumb.type,
                            });
                            handleFileSelect(file);
                          })
                          .catch((err) => {
                            console.error("Failed to load sample image:", err);
                            setError("Failed to load sample image");
                          });
                      }}
                      className="h-16 w-16 overflow-hidden rounded border border-gray-200 transition hover:scale-105"
                    >
                      <img
                        src={thumb.src}
                        alt={`Sample ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
