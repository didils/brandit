// 📁 app/core/components/ImageCropper.tsx
import "react-image-crop/dist/ReactCrop.css";

import React, { useEffect, useRef, useState } from "react";
import ReactCrop, {
  type Crop,
  type PercentCrop,
  type PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";

import { Button } from "./ui/button";

// 이미지에서 crop된 결과를 canvas로 렌더링하여 Blob으로 변환하는 함수
async function cropImageToBlob(
  image: HTMLImageElement,
  crop: PixelCrop,
): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = crop.width;
  canvas.height = crop.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height,
  );

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
      },
      "image/jpeg",
      0.95,
    );
  });
}

type ImageCropperProps = {
  imageFile: File;
  onCancel: () => void;
  croppedImage: File | null;
  setCroppedImage: (image: File | null) => void;
  setShowCropper: (show: boolean) => void;
};

export default function ImageCropper({
  imageFile,
  onCancel,
  croppedImage,
  setCroppedImage,
  setShowCropper,
}: ImageCropperProps) {
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    x: 10,
    y: 10,
    width: 60,
    height: 45, // aspect에 맞춰서, 너무 큰 값을 주면 안됨
  });

  const didSetInitialCrop = useRef(false);

  // 이미지 URL을 생성하여 미리보기로 사용
  const imageUrl = URL.createObjectURL(imageFile);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (didSetInitialCrop.current) return; // ✅ 이미 설정했으면 다시 실행 안함
    didSetInitialCrop.current = true;

    const { width, height } = e.currentTarget;
    const aspect = 4 / 3;
    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 50,
        },
        aspect,
        width,
        height,
      ),
      width,
      height,
    );
    setCrop(initialCrop);
    setCompletedCrop(initialCrop); // ✅ 바로 completedCrop도 설정
  };

  const handleSave = async () => {
    console.log("💾 handleSave 실행");

    if (!imgRef.current) {
      console.warn("imgRef가 null입니다.");
      return;
    }

    if (
      !completedCrop ||
      completedCrop.width === 0 ||
      completedCrop.height === 0
    ) {
      console.warn("completedCrop 정보가 부족하거나 0입니다:", completedCrop);
      return;
    }

    try {
      const blob = await cropImageToBlob(imgRef.current, completedCrop);
      if (!blob) {
        console.error("cropImageToBlob 실패: Blob이 null입니다.");
        return;
      }

      const file = new File([blob], "cropped.jpg", { type: "image/jpeg" });
      setCroppedImage(file);
      onCancel(); // 또는 setShowCropper(false);
    } catch (error) {
      console.error("handleSave 오류:", error);
    }
  };

  return (
    <div className="pointer-events-auto fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="max-h-[90vh] max-w-[90vw] overflow-auto rounded-lg bg-white p-4 shadow-xl">
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
          //   aspect={4 / 3}
          minWidth={20} // 최소 크기 설정
          minHeight={15}
          keepSelection={false} // 사용자가 크롭 제거 가능하게
          circularCrop={false}
          className="pointer-events-auto"
        >
          <img
            ref={imgRef}
            src={imageUrl}
            onLoad={onImageLoad}
            alt="Crop me"
            className="pointer-events-auto max-h-[70vh] max-w-full object-contain"
          />
        </ReactCrop>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="default" onClick={handleSave}>
            Crop Image
          </Button>
        </div>
      </div>
    </div>
  );
}
