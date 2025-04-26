// src/components/ImageClassTable.js

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Slider, Typography } from '@mui/material';

const ImageClassTable = () => {
  const imageData = useSelector(state => state.image.imageData);  // Получаем данные из Redux
  const [threshold, setThreshold] = useState(0.5);  // Значение порога
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    if (Object.keys(imageData).length > 0) {
      const sortedClasses = Object.entries(imageData)
        .sort(([, a], [, b]) => b - a)  // Сортируем по вероятности
        .slice(0, 3);  // Топ-3 класса
      setClasses(sortedClasses);
    }
  }, [imageData]);

  // Функция для обработки изменения порога
  const handleThresholdChange = (event, newValue) => {
    setThreshold(newValue);
  };

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Измените порог вероятности:
      </Typography>

      <Slider
        value={threshold}
        onChange={handleThresholdChange}
        aria-labelledby="threshold-slider"
        valueLabelDisplay="auto"
        valueLabelFormat={(value) => value.toFixed(2)}
        step={0.01}
        min={0}
        max={1}
        sx={{ marginBottom: 2 }}
      />
      <Typography variant="body1" gutterBottom>
        Порог: {threshold.toFixed(2)}
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Класс</TableCell>
              <TableCell>Принадлежит картинке?</TableCell>
              <TableCell>Вероятность (%)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(imageData).map(([className, probability]) => (
              <TableRow key={className}>
                <TableCell>{className}</TableCell>
                <TableCell>
                  {probability >= threshold ? (
                    <span role="img" aria-label="check">✔️</span>
                  ) : (
                    <span role="img" aria-label="cross">❌</span>
                  )}
                </TableCell>
                <TableCell>{Math.round(probability * 100)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default ImageClassTable;
