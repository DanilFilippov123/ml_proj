import React, {useRef, useState} from "react";
import * as tiff from "tiff";

export default function TiffViewer() {
    const [error, setError] = useState(null);
    const canvasRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setError(null);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const ifds = tiff.decode(arrayBuffer);
            //UTIF.decodeImages(arrayBuffer, ifds);
            const rgba = ifds[0].data;

            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            canvas.width = ifds[0].width;
            canvas.height = ifds[0].height;

            const width = ifds[0].width;

            const height = ifds[0].height;

            const imageDataArray = new Uint8ClampedArray(width * height * 4);

            // === Шаг 1: Найдём максимальные значения по каналам ===
            let maxR = 0, maxG = 0, maxB = 0, maxA = 0;

            for (let i = 0; i < rgba.length; i += 4) {
                maxR = Math.max(maxR, rgba[i]);
                maxG = Math.max(maxG, rgba[i + 1]);
                maxB = Math.max(maxB, rgba[i + 2]);
                maxA = Math.max(maxA, rgba[i + 3]);
            }

            for (let i = 0; i < width * height; i++) {
                const r16 = rgba[i * 4];
                const g16 = rgba[i * 4 + 1];
                const b16 = rgba[i * 4 + 2];
                const a16 = rgba[i * 4 + 3];

                const idx = i * 4;

                imageDataArray[idx] = maxR ? (r16 * 255) / maxR : 0;
                imageDataArray[idx + 1] = maxG ? (g16 * 255) / maxG : 0;
                imageDataArray[idx + 2] = maxB ? (b16 * 255) / maxB : 0;
                imageDataArray[idx + 3] = maxA ? (a16 * 255) / maxA : 255; // можно 255 по умолчанию
            }

            const imageData = new ImageData(
                imageDataArray,
                ifds[0].width,
                ifds[0].height
            );
            ctx.putImageData(imageData, 0, 0);
        } catch (err) {
            console.error("TIFF parsing error:", err);
            setError("Не удалось прочитать TIFF изображение.");
        }
    };

    return (
        <div className="p-4 max-w-xl mx-auto">
            <div className="p-4 border rounded shadow flex flex-col gap-4">
                <input type="file" accept=".tif,.tiff" onChange={handleFileChange}/>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <canvas ref={canvasRef} className="border rounded shadow"/>
            </div>
        </div>
    );
}
