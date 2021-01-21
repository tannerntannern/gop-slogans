import { promises } from 'fs';
import { resolve } from 'path';
import shuffleSeed from 'shuffle-seed';
import jimp from 'jimp';
import { Font } from '@jimp/plugin-print';
import { things, actions, targets } from './liberal';

const imgWidth = 850;
const imgHeight = 850;
const imgCenter = [imgWidth / 2, imgHeight / 2] as const;
const margin = 48;

export const generateImage = async (seed: string) => {
    const [thing, isPlural] = pickRandom(things, seed);
    const slogan = generateSlogan(seed).toUpperCase();
    const learnMore = 'More @ https://gop-slogans.vercel.app';

    const [impactFont, otherFont, textLayer, thingLayer, textMask] = await Promise.all([
        jimp.loadFont(resolve(fontBasePath, 'impact.ttf.fnt')),
        jimp.loadFont(jimp.FONT_SANS_32_WHITE),
        jimp.read(imgWidth, imgHeight, 0x000000),
        pickImage('liberal-things', thing, seed).then(buf => jimp.read(buf)),
        pickImage('masks', 'mask', seed).then(buf => jimp.read(buf)),
    ]);

    // https://github.com/oliver-moran/jimp/tree/master/packages/plugin-print
    const textComposite = textLayer
        .print(
            impactFont,
            margin, // NOTE: not sure why these wouldn't be the center of the the image, but this seems to center it
            margin,
            { text: slogan, alignmentX: jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: jimp.VERTICAL_ALIGN_MIDDLE },
            imgWidth - 2*margin,
            imgHeight - 2*margin,
        )
        .mask(textMask.cover(imgWidth, imgHeight), 0, 0)
        .print(
            otherFont,
            imgWidth,
            imgHeight,
            { text: learnMore, alignmentX: jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: jimp.VERTICAL_ALIGN_MIDDLE },
            imgWidth,
            imgHeight,
        )
        .shadow({ blur: 4, x: 0, y: 0, size: 1, opacity: 1 });

    return await (
        thingLayer
            .cover(imgWidth, imgHeight)
            .blit(textComposite, 0, 0)
    ).getBufferAsync('image/png');
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
    const [thing, isPlural] = pickRandom(things, seed);
    const actionVerb = pickRandom(actionVerbs, seed)[isPlural ? 1 : 0];
    const action = pickRandom(actions, seed);
    const target = pickRandom(targets, seed);

    return `${thing} ${actionVerb} ${action} ${target}`;
};

const actionVerbs: [singluar: string, plural: string][] = [
    ['will', 'will'],
    ['is going to', 'are going to'],
];

const pickRandom = <T>(arr: T[], seed: string): T =>
    shuffleSeed.shuffle(arr, seed).pop()!;
