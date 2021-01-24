import { promises } from 'fs';
import { resolve } from 'path';
import { alea } from 'seedrandom';
import jimp from 'jimp';
import { things, actions, targets } from './liberal';

const imgWidth = 800;
const imgHeight = 700;
const imgCenter = [imgWidth / 2, imgHeight / 2] as const;
const margin = 48;

export const generateImage = async (seed: string) => {
    const { slogan, thing, target } = generateSlogan(seed);
    const learnMore = 'Learn more at https://gop-slogans.vercel.app';

    const [impactFont, otherFont, textLayer, thingLayer, targetLayer, textMask, splitMask] = await Promise.all([
        jimp.loadFont(resolve(fontBasePath, 'impact.ttf.fnt')),
        jimp.loadFont(resolve(fontBasePath, 'impact28.ttf.fnt')),
        jimp.read(imgWidth, imgHeight, 0x000000),
        pickImage('liberal-things', thing, seed).then(buf => jimp.read(buf)),
        pickImage('liberal-targets', target, seed).then(buf => jimp.read(buf)),
        pickImage('masks', 'mask', seed).then(buf => jimp.read(buf)),
        pickImage('masks', 'split', seed).then(buf => jimp.read(buf)),
    ]);

    const targetComposite = targetLayer
        .cover(imgWidth, imgHeight)
        .mask(splitMask.cover(imgWidth, imgHeight), 0, 0);

    // https://github.com/oliver-moran/jimp/tree/master/packages/plugin-print
    const textComposite = textLayer
        .print(
            impactFont,
            margin, // NOTE: not sure why these wouldn't be the center of the the image, but this seems to center it
            margin,
            { text: slogan.toUpperCase(), alignmentX: jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: jimp.VERTICAL_ALIGN_MIDDLE },
            imgWidth - 2*margin,
            imgHeight - 2*margin,
        )
        .mask(textMask.cover(imgWidth, imgHeight), 0, 0)
        .print(
            otherFont,
            12,
            imgHeight - 40,
            learnMore,
        )
        .shadow({ blur: 4, x: 0, y: 0, size: 1, opacity: 1 });

    return await (
        thingLayer
            .cover(imgWidth, imgHeight)
            .posterize(8)
            .blit(targetComposite, 0, 0)
            .color([{ apply: 'mix', params: ['#F00', 30] }])
            .blit(textComposite, 0, 0)
    ).getBufferAsync('image/jpeg');
};

const pickImage = async (subDir: string, name: string, seed: string) => {
    const fileNameStart = name.replace(/\s/g, '_');
    const possibleImages = (await promises.readdir(resolve(imgBasePath, subDir))).filter(file => file.startsWith(fileNameStart));
    const image = pickRandom(possibleImages, seed);
    return await promises.readFile(resolve(imgBasePath, subDir, image));
};

const fontBasePath = resolve(__dirname, '../public/fonts/');

export const imgBasePath = resolve(__dirname, '../public/img/');
export const resolveImage = (subDir: string, name: string, variant: number) =>
    resolve(imgBasePath, subDir, `${name.replace(/\s/g, '_')}${variant}.jpg`);

export const generateSlogan = (seed: string) => {
    // NOTE: we need to use different (but stable) seeds for each component selection, because if
    // two of the arrays happened to be the same length, the same pairs of components would always
    // be chosen together.
    const [thing, isPlural] = pickRandom(things, `a${seed}1`);
    const actionVerb = pickRandom(actionVerbs, `b${seed}2`)[isPlural ? 1 : 0];
    const action = pickRandom(actions, `c${seed}3`);
    const target = pickRandom(targets, `d${seed}4`);

    const slogan = `${thing} ${actionVerb} ${action} ${target}`;

    return { thing, action, target, slogan };
};

const actionVerbs: [singluar: string, plural: string][] = [
    ['will', 'will'],
    ['is going to', 'are going to'],
];

const pickRandom = <T>(arr: T[], seed: string): T => {
    const rng = alea(seed);
    return arr[Math.floor(rng() * arr.length)];
};
