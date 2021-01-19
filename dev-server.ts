import app from './api';
import express from 'express';

app.use(express.static('./public'));

const port = 3000;
app.listen(port, () => {
    console.log(`Dev server running. Example URL: http://localhost:3000/api/image/0`);
});
