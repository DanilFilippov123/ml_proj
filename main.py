import io

import numpy as np
import rasterio
import torch
import torch.nn as nn
import torch.nn.functional as fnc
from PIL import Image
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import StreamingResponse
from torchvision import models

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Разрешает все домены
    allow_credentials=True,
    allow_methods=["*"],  # Разрешает все HTTP-методы (GET, POST, и т.д.)
    allow_headers=["*"],  # Разрешает все заголовки
)


def load_custom_model(model_path, device='cpu'):
    checkpoint = torch.load(model_path, map_location=device)

    model = models.efficientnet_b0(weights=None)

    original_conv = model.features[0][0]
    model.features[0][0] = nn.Conv2d(
        checkpoint['model_config']['input_channels'],
        original_conv.out_channels,
        kernel_size=original_conv.kernel_size,
        stride=original_conv.stride,
        padding=original_conv.padding,
        bias=False
    )

    model.classifier[1] = nn.Linear(
        model.classifier[1].in_features,
        checkpoint['model_config']['num_classes']
    )

    state_dict = checkpoint['model_state_dict']
    new_state_dict = {}
    for key, value in state_dict.items():
        if key.startswith('model.'):
            new_key = key[6:]
            new_state_dict[new_key] = value
        else:
            new_state_dict[key] = value

    model.load_state_dict(new_state_dict)
    model.to(device)
    model.eval()

    return model, checkpoint


model, config = load_custom_model("/home/danil/Documents/python/neuro/trained_model_complete.pth")


# with rasterio.open('/home/danil/Documents/python/neuro/Images/Images/0a0d9b30-4304-4765-b9d5-1a5cfc6de7fd.tiff') as src:
#     image = src.read()


def predict(image: torch.Tensor) -> torch.Tensor:
    with torch.no_grad():
        output = model(image.unsqueeze(0))
        return output


# Преобразование изображения в формат, подходящий для модели
def prepare_image(image, content_type):
    if content_type == 'image/tiff':
        with rasterio.open(io.BytesIO(image)) as src:
            image = src.read()
            pass
    image = torch.tensor(image[:, :128, :128]).float()
    image = (image - image.min()) / (image.max() - image.min())
    return image


@app.post("/convert/tiff")
async def convert_tiff_to_png(file: UploadFile = File(...)):
    tiff_data = await file.read()

    with rasterio.open(io.BytesIO(tiff_data)) as src:
        bands = src.read([1, 2, 3])
        bands = (255 * (bands / bands.max())).astype(np.uint8)
        rgb_image = np.dstack([bands[0], bands[1], bands[2]])

        pil_image = Image.fromarray(rgb_image)

        img_byte_arr = io.BytesIO()
        pil_image.save(img_byte_arr, format="PNG")
        img_byte_arr.seek(0)

        return StreamingResponse(img_byte_arr, media_type="image/png", headers={"Content-Disposition": "attachment; filename=converted.png"})


@app.post("/upload")
async def upload_image(image: UploadFile = File(...)):
    try:
        # Чтение изображения
        image_bytes = await image.read()

        # Подготовка изображения
        image = prepare_image(image_bytes, image.content_type)

        # Предсказание классов
        predictions = predict(image)
        predictions = fnc.softmax(predictions, dim=1)[0]
        # Предполагаем, что ваша модель возвращает несколько классов
        class_names = config['class_names']  # Пример названий классов
        result_classes = {class_names[i]: predictions[i].item() for i in range(len(class_names))}

        return JSONResponse(content={"predictions": result_classes})

    except Exception as e:
        return JSONResponse(status_code=400, content={"message": str(e)})


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
