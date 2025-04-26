import os
import sys

import numpy as np
import rasterio
from PIL import Image

# Путь к папке с TIFF-файлами
input_folder = sys.argv[1]
output_folder = sys.argv[2]  # можешь указать тот же

# Создаём выходную папку, если нужно
os.makedirs(output_folder, exist_ok=True)

# Перебираем все файлы в папке
for filename in os.listdir(input_folder):
    if filename.lower().endswith((".tif", ".tiff", '.TIF')):
        input_path = os.path.join(input_folder, filename)
        output_name = os.path.splitext(filename)[0] + ".png"
        output_path = os.path.join(output_folder, output_name)

        with rasterio.open(input_path) as src:
            data = src.read()

            # Приводим к uint8
            if data.dtype != np.uint8:
                data = (255 * (data / data.max())).astype(np.uint8)

            # Обработка: берём первые 3 канала или один
            if data.shape[0] >= 3:
                bands = data[:3]
                img = np.dstack([bands[0], bands[1], bands[2]])  # RGB
            else:
                img = data[0]  # одиночный канал

            # Сохраняем как PNG
            Image.fromarray(img).save(output_path)

        print(f"Сохранено: {output_name}")
