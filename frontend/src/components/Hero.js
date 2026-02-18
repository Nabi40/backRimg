"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const TABS = ["Background", "Passport Size Image", "Stamp Size Image"];
const PASSPORT_SIZE_OPTIONS = ["4", "8", "12", "16", "20"];
const STAMP_SIZE_OPTIONS = ["9", "18", "27", "36", "45"];
const SWATCHES = [
  "transparent",
  "#f34141",
  "#9de12f",
  "#4ed37d",
  "#45b0e4",
  "#5f9de8",
  "#7b87e6",
];

function checkerboardStyle(size = 16) {
  return {
    backgroundImage: `
      linear-gradient(45deg, rgba(0,0,0,0.12) 25%, transparent 25%),
      linear-gradient(-45deg, rgba(0,0,0,0.12) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.12) 75%),
      linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.12) 75%)
    `,
    backgroundSize: `${size}px ${size}px`,
    backgroundPosition: `0 0, 0 ${size / 2}px, ${size / 2}px -${size / 2}px, -${size / 2}px 0px`,
  };
}

export default function Hero() {
  const [activeTab, setActiveTab] = useState("Background");
  const [busy, setBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState("Removing background...");
  const [origFile, setOrigFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [bgColor, setBgColor] = useState("#5f9de8");
  const [step, setStep] = useState("edit");
  const [sizeOption, setSizeOption] = useState("16");
  const [showLanding, setShowLanding] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [fakeRemovedReady, setFakeRemovedReady] = useState(false);

  // ✅ NEW (needed): store removed background result
  const [removedBlob, setRemovedBlob] = useState(null);

  const fileInputRef = useRef(null);
  const colorInputRef = useRef(null);
  const heroContainerRef = useRef(null);

  // ✅ prevent old async finishing after new image chosen
  const jobRef = useRef(0);

  const hasImage = Boolean(origFile);
  const isPassportTab = activeTab === "Passport Size Image";
  const showPalette = hasImage && activeTab !== "Background" && step === "edit";
  const showSizes = hasImage && activeTab !== "Background" && step === "sizes";
  const isStampTab = activeTab === "Stamp Size Image";
  const sizeOptions = isStampTab ? STAMP_SIZE_OPTIONS : PASSPORT_SIZE_OPTIONS;
  const photoAspectRatio = "1.7 / 2.1";

  const pageCols = isStampTab ? 9 : 4;
  const pageRows = 5;
  const selectedCount = Math.min(Number(sizeOption) || 16, pageCols * pageRows);
  const a4FillMap = useMemo(() => {
    const fullRows = Math.floor(selectedCount / pageCols);
    const remainder = selectedCount % pageCols;
    return Array.from({ length: pageRows * pageCols }, (_, idx) => {
      const row = Math.floor(idx / pageCols); // 0 = top
      const col = idx % pageCols; // 0 = left
      const rowFromBottom = pageRows - 1 - row; // 0 = bottom

      if (rowFromBottom < fullRows) return true;
      if (rowFromBottom === fullRows && remainder > 0) return col < remainder;
      return false;
    });
  }, [selectedCount, pageCols, pageRows]);

  useEffect(() => {
    if (isStampTab && !STAMP_SIZE_OPTIONS.includes(sizeOption)) {
      setSizeOption("45");
      return;
    }
    if (!isStampTab && !PASSPORT_SIZE_OPTIONS.includes(sizeOption)) {
      setSizeOption("16");
    }
  }, [isStampTab, sizeOption]);

  // ✅ removed image url
  const removedUrl = useMemo(() => {
    if (!removedBlob) return "";
    return URL.createObjectURL(removedBlob);
  }, [removedBlob]);

  useEffect(() => {
    return () => {
      if (removedUrl) URL.revokeObjectURL(removedUrl);
    };
  }, [removedUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function removeBgClient(file) {
    const currentJob = ++jobRef.current;

    setBusy(true);
    setBusyLabel("Removing background...");
    setError("");
    setFakeRemovedReady(false);
    setRemovedBlob(null);

    // minimum spinner time (feels smooth)
    const minDelay = new Promise((r) => setTimeout(r, 350));

    try {
      // dynamic import avoids SSR issues
      const { removeBackground } = await import("@imgly/background-removal");

      // do bg removal
      const blob = await removeBackground(file, {
        output: { format: "image/png" },
        // Tip: if you want it faster, you can resize the input file on backend
        // OR preprocess client-side before calling removeBackground.
      });

      await minDelay;

      // ignore if user already selected another file
      if (jobRef.current !== currentJob) return;

      setRemovedBlob(blob);
      setFakeRemovedReady(true);
    } catch (e) {
      console.error(e);
      if (jobRef.current !== currentJob) return;
      setError("Background removal failed. Please try a different image.");
      setFakeRemovedReady(false);
    } finally {
      if (jobRef.current === currentJob) {
        setBusy(false);
        setBusyLabel("Removing background...");
      }
    }
  }

  const onPickFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setOrigFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setShowLanding(false);
    setStep("edit");
    setDragging(false);
    setError("");

    // ✅ real removal (like state3)
    removeBgClient(file);
  };

  const resetImage = () => {
    jobRef.current += 1; // cancel pending async result
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setOrigFile(null);
    setPreviewUrl("");
    setShowLanding(true);
    setRemovedBlob(null);
    setFakeRemovedReady(false);
    setBusy(false);
    setStep("edit");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";

    requestAnimationFrame(() => {
      heroContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onPickFile(file);
  };

  const normalizedBgColor =
    bgColor === "transparent" || !bgColor?.startsWith("#") ? "#FFFFFF" : bgColor.toUpperCase();

  const triggerBlobDownload = (blob, fileName = "output.png") => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const downloadOutput = async () => {
    if (!origFile) return;

    try {
      setError("");
      setBusy(true);
      setBusyLabel("Processing...");

      const apiBase =
        process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API || "";
      let endpoint = apiBase ? `${apiBase.replace(/\/$/, "")}/process-image` : "/process-image";
      const form = new FormData();

      if (isPassportTab || isStampTab) {
        const selected = Number(sizeOption) || (isStampTab ? 45 : 16);
        const rows = isStampTab ? Math.max(1, Math.ceil(selected / 9)) : Math.max(1, Math.ceil(selected / 4));

        endpoint = apiBase
          ? `${apiBase.replace(/\/$/, "")}/api/passport-stamp/`
          : "/api/passport-stamp/";

        form.append("image", origFile, origFile.name || "your_photo.jpg");
        form.append("bg_color", normalizedBgColor);
        form.append("photo_size", isStampTab ? "0.8x1" : "1.5x1.9");
        form.append("page_size", "A4");
        form.append("rows", String(rows));
        form.append("dpi", "300");
      } else {
        form.append("image", origFile, origFile.name || "your_photo.jpg");
        form.append("mode", activeTab);
        form.append("color", normalizedBgColor);
        form.append("size_option", sizeOption);
      }

      const res = await fetch(endpoint, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        let message = "Request failed";
        try {
          const errData = await res.json();
          message = errData?.error || errData?.detail || JSON.stringify(errData);
        } catch {
          message = (await res.text()) || message;
        }
        throw new Error(message);
      }

      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await res.json();
        const sheetUrl = data?.sheet_url;
        if (!sheetUrl) throw new Error("sheet_url missing in response");

        const absoluteSheetUrl = /^https?:\/\//i.test(sheetUrl)
          ? sheetUrl
          : `${apiBase.replace(/\/$/, "")}/${sheetUrl.replace(/^\//, "")}`;

        try {
          const fileRes = await fetch(absoluteSheetUrl);
          if (!fileRes.ok) throw new Error("File download failed");

          const blob = await fileRes.blob();
          const fileName = absoluteSheetUrl.split("/").pop() || "output.png";
          triggerBlobDownload(blob, fileName);
        } catch {
          window.location.assign(absoluteSheetUrl);
        }
      } else {
        const blob = await res.blob();
        triggerBlobDownload(blob, "output.png");
      }
    } catch (e) {
      console.error(e);
      setError("Processing failed. Please try again.");
    } finally {
      setBusy(false);
      setBusyLabel("Removing background...");
    }
  };

  const renderToolbar = () => (
    <div className="mx-auto mt-2 w-full max-w-[920px] rounded-full bg-[#f2f2f0] px-2 py-1.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab === "Background") setStep("edit");
              }}
              className={`rounded-full px-3 py-1 text-[10px] ${
                activeTab === tab ? "bg-[#e5e5e5] text-[#202020]" : "text-[#505050]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button className="text-xs text-[#595959]">↶</button>
          <button className="text-xs text-[#595959]">↷</button>
          <button
            onClick={downloadOutput}
            disabled={!origFile || busy}
            className="rounded-full bg-[#7f8ef0] px-4 py-1 text-[10px] text-white disabled:opacity-40"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );

  // ✅ what to show in preview:
  // if removed is ready -> show transparent PNG
  // else -> show original preview
  const shownSrc = fakeRemovedReady && removedUrl ? removedUrl : previewUrl;

  return (
    <>
      <section className="px-4 pb-4 font-[Poppins] md:px-6">
        <div
          ref={heroContainerRef}
          className="relative mx-auto mt-3 min-h-[600px] w-full max-w-[1240px] overflow-hidden rounded-[18px] bg-gradient-to-b from-[#d0d4ea] to-[#97a0ea] px-4 py-10 md:px-8"
        >
          {!hasImage && showLanding && (
            <>
              <img
                src="/images/bg-image1.png"
                alt=""
                className="pointer-events-none absolute left-2 top-12 hidden h-[140px] w-[190px] -rotate-[15deg] rounded-2xl object-cover md:block lg:left-7 lg:h-[170px] lg:w-[240px]"
              />
              <img
                src="/images/bg-image2.png"
                alt=""
                className="pointer-events-none absolute right-10 top-16 hidden h-[105px] w-[180px] rotate-[18deg] object-cover opacity-95 md:block"
              />
              <img
                src="/images/bg-image3.png"
                alt=""
                className="pointer-events-none absolute bottom-7 left-8 hidden h-[125px] w-[165px] rotate-[14deg] rounded-2xl object-cover md:block lg:h-[155px] lg:w-[210px]"
              />
              <img
                src="/images/bg-image4.png"
                alt=""
                className="pointer-events-none absolute bottom-7 right-8 hidden h-[125px] w-[165px] rotate-[14deg] rounded-2xl object-cover md:block lg:h-[155px] lg:w-[210px]"
              />

              <div className="relative mx-auto mt-8 flex max-w-[660px] flex-col items-center text-center">
                <h2 className="text-3xl font-semibold leading-tight text-[#22232c] md:text-[52px]">
                  Remove Backgrounds in
                  <br />
                  One Click
                </h2>
                <p className="mt-2 text-xs text-[#5c6176] md:text-[24px]">
                  Instantly get clean, high-quality images with sharp, pixel-perfect precision
                </p>

                <div
                  className={`mt-8 w-full max-w-[390px] rounded-2xl bg-[#f4f4f4] px-4 py-16 text-center ${
                    dragging ? "ring-2 ring-[#7f8ef0]" : ""
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setDragging(false);
                  }}
                  onDrop={onDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onPickFile(file);
                    }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mx-auto inline-flex rounded-full bg-[#7f8ef0] px-8 py-2.5 text-2xl text-white"
                  >
                    Upload Image
                  </button>
                  <p className="mt-3 text-xs text-[#585858]">Or drop and image here</p>
                </div>
              </div>
            </>
          )}

          {hasImage && (
            <>
              {renderToolbar()}

              <div
                className={`mx-auto mt-10 grid w-full max-w-[920px] gap-3 ${
                  showPalette || showSizes ? "md:grid-cols-2" : ""
                }`}
              >
                <div className="relative overflow-hidden rounded-[16px] bg-[#f4f4f4] p-3">
                  <button
                    onClick={resetImage}
                    className="absolute right-2 top-2 z-10 h-5 w-5 rounded-full border border-[#9a9a9a] text-[10px] text-[#636363]"
                  >
                    ×
                  </button>

                  <div
                    className="relative mx-auto w-full max-w-[320px] overflow-hidden"
                    style={{
                      aspectRatio: "1.7 / 2.1",
                      // ✅ state3 behavior:
                      // Background tab = checkerboard always
                      // other tabs = color behind transparent PNG
                      ...(activeTab === "Background"
                        ? checkerboardStyle(20)
                        : { backgroundColor: bgColor === "transparent" ? "#ffffff" : bgColor }),
                    }}
                  >
                    <img
                      src={shownSrc}
                      alt="preview"
                      className={`h-full w-full ${
                        activeTab === "Background" ? "object-contain" : "object-contain"
                      } ${fakeRemovedReady ? "drop-shadow-[0_10px_18px_rgba(0,0,0,0.18)]" : ""}`}
                    />

                    {busy && (
                      <div className="absolute inset-0 z-20 grid place-items-center bg-white/60">
                        <div className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white">
                          {busyLabel}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {showPalette && (
                  <div className="rounded-[16px] bg-[#f4f4f4] p-3">
                    <div className="grid max-h-[320px] grid-cols-3 gap-2 overflow-y-auto pr-1">
                      <button
                        onClick={() => setBgColor("transparent")}
                        className={`h-[92px] rounded-xl border border-[#c8c8c8] ${
                          bgColor === "transparent" ? "ring-2 ring-[#6875e8]" : ""
                        }`}
                        style={checkerboardStyle(14)}
                      >
                        <span className="text-xs text-[#7a7a7a]">⊘</span>
                      </button>

                      <button
                        onClick={() => colorInputRef.current?.click()}
                        className="h-[92px] rounded-xl"
                        style={{
                          background:
                            "conic-gradient(#ff0000,#ffcc00,#52ff00,#00d5ff,#1d4dff,#d100ff,#ff0000)",
                        }}
                      />
                      <button className="h-[92px] rounded-xl border border-[#c8c8c8] bg-white" />
                      <input
                        ref={colorInputRef}
                        type="color"
                        className="hidden"
                        onChange={(e) => setBgColor(e.target.value)}
                      />

                      {SWATCHES.filter((c) => c !== "transparent").map((color) => (
                        <button
                          key={color}
                          onClick={() => setBgColor(color)}
                          className={`h-[92px] rounded-xl ${
                            bgColor === color ? "ring-2 ring-[#6875e8]" : ""
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {showSizes && (
                  <div className="rounded-[16px] bg-[#f4f4f4] p-3">
                    <div className="mb-2 flex items-center gap-2">
                      {sizeOptions.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSizeOption(size)}
                          className={`rounded-md border px-3 py-1 text-xs ${
                            sizeOption === size
                              ? "border-[#7d8bee] bg-[#7d8bee] text-white"
                              : "border-[#c8c8c8] text-[#666]"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>

                    <div className="rounded-md border border-[#d2d2d2] bg-[#ececec] p-2">
                      <div className="mx-auto aspect-[210/297] w-full max-w-[340px] bg-white p-3 shadow-[0_6px_20px_rgba(0,0,0,0.12)]">
                        <div
                          className="grid h-full gap-2"
                          style={{ gridTemplateColumns: `repeat(${pageCols}, minmax(0, 1fr))` }}
                        >
                          {a4FillMap.map((isFilled, idx) => (
                            <div
                              key={idx}
                              className="overflow-hidden"
                              style={{
                                backgroundColor: isFilled
                                  ? bgColor === "transparent"
                                    ? "#e9df8c"
                                    : bgColor
                                  : "transparent",
                              }}
                            >
                              {isFilled && (
                                <div
                                  className="mx-auto h-full max-h-full w-full max-w-full"
                                  style={{ aspectRatio: photoAspectRatio }}
                                >
                                  <img
                                    src={shownSrc}
                                    alt="size preview"
                                    className="h-full w-full object-contain"
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {hasImage && activeTab !== "Background" && step === "edit" && (
        <div className="px-4 pb-8 md:px-6">
          <div className="mx-auto flex w-full max-w-[1240px] justify-center">
            <button
              onClick={() => setStep("sizes")}
              className="rounded-full bg-[#7f8ef0] px-8 py-2 text-sm text-white"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {error && <p className="px-6 pb-2 text-center text-xs text-red-600">{error}</p>}
    </>
  );
}
