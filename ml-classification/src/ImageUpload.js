import React, {useState} from 'react';
import axios from 'axios';
import {useDispatch} from 'react-redux';
import {setImageData} from './imageSlice';
import {Box, Button, Card, CardContent, CircularProgress, Typography} from '@mui/material';
import {api_host, api_prefix} from "./config";

const ImageUploader = () => {
    const dispatch = useDispatch();
    const [image, setImage] = useState(null);
    const [prediction, setPrediction] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const handleImageChange = async (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
        const formData = new FormData();
        formData.append('file', file);
        try {
            // Отправка фото на сервер
            await axios.post(`http://${api_host}/${api_prefix}convert/tiff`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                responseType: 'blob', // Получаем бинарные данные (изображение)
            }).then(response => {
                const data = response.data;
                setImage(URL.createObjectURL(data));
            });
        } catch (error) {
            console.error('Ошибка при загрузке изображения:', error);
            alert('Не удалось загрузить изображение.');
        }
    };

    // Отправка изображения на сервер
    const handleImageUpload = async () => {
        if (!image) return;

        setLoading(true);

        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            await axios.post(`http://${api_host}/${api_prefix}upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }).then(response => {
                const data = response.data;
                dispatch(setImageData(data['predictions']));
                setPrediction(data['predictions']);
            });
        } catch (error) {
            console.error('Error uploading image', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{textAlign: 'center', padding: 3}}>
            <Typography variant="h4" gutterBottom>Загрузка изображения</Typography>

            {image && (
                <Card sx={{display: 'inline-block', marginBottom: 2}}>
                    <img src={image} alt="Uploaded" style={{width: '128px', margin: '16px'}}/>
                </Card>
            )}

            <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <input
                    type="file"
                    id="fileInput"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{display: 'none'}}
                />
                <Button
                    variant="contained"
                    component="label"
                    color="primary"
                    sx={{marginBottom: 2}}
                >
                    Выбрать изображение
                    <input
                        type="file"
                        hidden
                        onChange={handleImageChange}
                    />
                </Button>

                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleImageUpload}
                    disabled={loading || !image}
                    sx={{marginBottom: 2}}
                >
                    {loading ? <CircularProgress size={24}/> : 'Загрузить'}
                </Button>
            </Box>

            <Box>
                {prediction.length > 0 && (
                    <Card sx={{marginTop: 2}}>
                        <CardContent>
                            <Typography variant="h6">Результаты классификации:</Typography>
                            <Box sx={{display: 'flex', flexWrap: 'wrap', marginTop: 1}}>
                                {prediction.map((pred, index) => (
                                    <Typography key={index} variant="body1" sx={{marginRight: 2, marginBottom: 1}}>
                                        {pred}
                                    </Typography>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                )}
            </Box>
        </Box>
    );
};

export default ImageUploader;
