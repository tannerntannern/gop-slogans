import express from 'express';
import { generateSlogan } from '../lib/image-generator';

const app = express();

type PathParams = {
    seed: string,
};

app.get<PathParams>('/api/image/:seed', (req, res) => {
    res.send(generateSlogan(req.params.seed));
});

export default app;
