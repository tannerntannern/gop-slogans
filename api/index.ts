import express from 'express';
import asyncHandler from 'express-async-handler';
import { generateSlogan, generateImage } from '../lib/generator';

const isVercel = process.env.VERCEL == '1';
const app = express();

type PathParams = {
    seed: string,
};

app.get<PathParams>('/api/image/:seed', asyncHandler(async (req, res) => {
    const cacheSeconds = isVercel ? '300' : '1';
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', `s-max-age=${cacheSeconds}, stale-while-revalidate`);
    res.send(await generateImage(req.params.seed));
}));

app.get<PathParams>('/api/text/:seed', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.send(generateSlogan(req.params.seed));
});

export default app;
