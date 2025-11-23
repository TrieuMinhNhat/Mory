"use client"

import React, { useRef, useEffect, useState } from "react";

const CameraComponent: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
    const [image, setImage] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [zoom, setZoom] = useState(1);
    const [zoomRange, setZoomRange] = useState<{ min: number; max: number; step: number } | null>(null);

    // Khởi tạo camera
    useEffect(() => {
        const startCamera = async () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop()); // tắt stream cũ
            }
            try {
                const newStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode },
                    audio: false,
                });
                setStream(newStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = newStream;
                }

                // 🔍 Kiểm tra khả năng zoom
                const [track] = newStream.getVideoTracks();
                const capabilities = track.getCapabilities() as any;
                if (capabilities.zoom) {
                    setZoomRange({
                        min: capabilities.zoom.min,
                        max: capabilities.zoom.max,
                        step: capabilities.zoom.step || 0.1,
                    });
                    setZoom(capabilities.zoom.min);
                } else {
                    setZoomRange(null);
                }
            } catch (err) {
                console.error("Không mở được camera:", err);
            }
        };

        void startCamera();
    }, [facingMode]);

    // 📸 Chụp ảnh
    const capture = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (context) {
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            context.drawImage(videoRef.current, 0, 0);
            const dataUrl = canvas.toDataURL("image/jpeg");
            setImage(dataUrl);
        }
    };

    // 🔍 Zoom handler
    const handleZoom = async (value: number) => {
        if (!stream) return;
        const [track] = stream.getVideoTracks();
        try {
            await track.applyConstraints({ advanced: [{ zoom: value }] });
            setZoom(value);
        } catch (err) {
            console.error("Không zoom được:", err);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Camera live view */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="rounded-xl shadow w-full max-w-md"
            />

            {/* Nút điều khiển */}
            <div className="flex gap-2">
                <button
                    onClick={() =>
                        setFacingMode(facingMode === "user" ? "environment" : "user")
                    }
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                >
                    🔄 Đổi camera
                </button>

                <button
                    onClick={capture}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg"
                >
                    📸 Chụp ảnh
                </button>
            </div>

            {/* Zoom control */}
            {zoomRange && (
                <div className="w-full max-w-md">
                    <input
                        type="range"
                        min={zoomRange.min}
                        max={zoomRange.max}
                        step={zoomRange.step}
                        value={zoom}
                        onChange={(e) => handleZoom(parseFloat(e.target.value))}
                        className="w-full"
                    />
                    <p className="text-sm text-gray-600 text-center">Zoom: {zoom.toFixed(1)}x</p>
                </div>
            )}

            {/* Canvas ẩn để render ảnh */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Hiển thị ảnh chụp */}
            {image && (
                <div className="mt-3">
                    <p className="text-sm text-gray-600 text-center">Ảnh đã chụp:</p>
                    <img
                        src={image}
                        alt="capture"
                        className="rounded-xl shadow max-w-md mt-2"
                    />
                </div>
            )}
        </div>
    );
};

export default CameraComponent;
