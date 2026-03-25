import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import './ImageCropper.css';

const ImageCropper = ({ image, onCropComplete, onCancel }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropChange = (crop) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom) => {
        setZoom(zoom);
    };

    const onCropAreaComplete = useCallback((_croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url) =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues
            image.src = url;
        });

    const getCroppedImg = async (imageSrc, pixelCrop) => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return null;
        }

        // Set maximum thumbnail size
        const THUMBNAIL_SIZE = 200;
        let targetWidth = pixelCrop.width;
        let targetHeight = pixelCrop.height;

        // Scale down if larger than target size
        if (targetWidth > THUMBNAIL_SIZE || targetHeight > THUMBNAIL_SIZE) {
            const scale = Math.min(THUMBNAIL_SIZE / targetWidth, THUMBNAIL_SIZE / targetHeight);
            targetWidth = targetWidth * scale;
            targetHeight = targetHeight * scale;
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Draw the cropped and resized image onto the canvas
        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            targetWidth,
            targetHeight
        );

        // As a blob with 0.5 quality to significantly reduce file size
        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Canvas is empty'));
                    return;
                }
                resolve(blob);
            }, 'image/jpeg', 0.5);
        });
    };

    const handleCrop = async () => {
        try {
            const croppedBlob = await getCroppedImg(image, croppedAreaPixels);
            onCropComplete(croppedBlob);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="cropper-modal">
            <div className="cropper-container">
                <div className="cropper-wrapper">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={1} // 1:1 aspect ratio for product images
                        onCropChange={onCropChange}
                        onCropComplete={onCropAreaComplete}
                        onZoomChange={onZoomChange}
                    />
                </div>
                <div className="cropper-controls">
                    <div className="zoom-control">
                        <label>Zoom</label>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="zoom-range"
                        />
                    </div>
                    <div className="cropper-btns">
                        <button className="btn-cancel" onClick={onCancel}>Cancel</button>
                        <button className="btn-crop" onClick={handleCrop}>Crop & Upload</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageCropper;
