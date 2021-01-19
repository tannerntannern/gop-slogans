import express from 'express';
import { generateImage } from '../lib/image-generator';

const app = express();

type PathParams = {
    seed: string,
};

app.get<PathParams>('/api/image/:seed', (req, res) => {
    res.setHeader('Content-Type', 'image/png');
    res.send(generateImage(req.params.seed));
});

export default app;
