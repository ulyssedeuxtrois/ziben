"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Camera, X } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onUpload: (url: string) => void;
}

declare global {
  interface Window {
    cloudinary?: {
      createUploadWidget: (
        config: Record<string, unknown>,
        callback: (error: unknown, result: { event: string; info: { secure_url: string } }) => void
      ) => { open: () => void; destroy: () => void };
    };
  }
}

export function ImageUpload({ value, onUpload }: ImageUploadProps) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const widgetRef = useRef<{ open: () => void; destroy: () => void } | null>(null);

  const hasCloudinary = Boolean(cloudName && uploadPreset);

  useEffect(() => {
    if (!hasCloudinary) return;
    if (document.getElementById("cloudinary-widget-script")) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "cloudinary-widget-script";
    script.src = "https://widget.cloudinary.com/v2.0/global/all.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
  }, [hasCloudinary]);

  const openWidget = useCallback(() => {
    if (!scriptLoaded || !window.cloudinary) return;

    if (widgetRef.current) {
      widgetRef.current.destroy();
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName,
        uploadPreset,
        sources: ["local", "url", "camera"],
        multiple: false,
        maxFiles: 1,
        cropping: true,
        croppingAspectRatio: 16 / 9,
        maxImageFileSize: 5000000,
        language: "fr",
        text: {
          fr: {
            or: "ou",
            menu: {
              files: "Fichiers",
              url: "URL",
              camera: "Camera",
            },
          },
        },
      },
      (error: unknown, result: { event: string; info: { secure_url: string } }) => {
        if (!error && result?.event === "success") {
          onUpload(result.info.secure_url);
        }
      }
    );

    widgetRef.current = widget;
    widget.open();
  }, [scriptLoaded, cloudName, uploadPreset, onUpload]);

  // Fallback: simple URL input when Cloudinary is not configured
  if (!hasCloudinary) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Image (URL)</label>
        {value ? (
          <div className="relative">
            <img
              src={value}
              alt="Preview"
              className="w-full aspect-[16/9] object-cover rounded-xl border border-gray-200"
            />
            <button
              type="button"
              onClick={() => onUpload("")}
              className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        ) : (
          <input
            type="url"
            value={value}
            onChange={(e) => onUpload(e.target.value)}
            className="input"
            placeholder="https://..."
          />
        )}
      </div>
    );
  }

  // Cloudinary upload widget
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
      {value ? (
        <div className="relative">
          <img
            src={value}
            alt="Preview"
            className="w-full aspect-[16/9] object-cover rounded-xl border border-gray-200"
          />
          <button
            type="button"
            onClick={() => onUpload("")}
            className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={openWidget}
          disabled={!scriptLoaded}
          className="w-full aspect-[16/9] border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-wait"
        >
          <Camera className="w-8 h-8 text-gray-400" />
          <span className="text-sm text-gray-500 font-medium">Ajouter une photo</span>
          <span className="text-xs text-gray-400">JPG, PNG - 5 Mo max</span>
        </button>
      )}
    </div>
  );
}
