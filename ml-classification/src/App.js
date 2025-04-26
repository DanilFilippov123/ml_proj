// src/App.js

import React from 'react';
import {Container, CssBaseline, Typography} from '@mui/material';
import ImageClassTable from "./ImageClassTable";
import ImageUploader from "./ImageUpload";

const App = () => {
    return (
        <Container component="main" maxWidth="md" sx={{paddingTop: 4, paddingBottom: 4}}>
            <CssBaseline/>
            <Typography variant="h4" align="center" gutterBottom>
                Классы изображений
            </Typography>
            <ImageUploader/>
            <ImageClassTable/>
        </Container>
    );
};

export default App;
