import { resolve } from 'path';
import { registerFont } from 'canvas';
import shuffleSeed from 'shuffle-seed';
import text2png from 'text2png';
import { things, actions, targets } from './liberal';

// https://github.com/vercel/vercel/issues/3460#issuecomment-681925304
registerFont(resolve(__dirname, '../public/fonts/impact.ttf'), { family: 'Impact' });

export const generateImage = (seed: string) => {
    const slogan = generateSlogan(seed).toUpperCase();
    return text2png(slogan, {
        font: '80px Impact',
        textAlign: 'center',
        color: 'white',
        backgroundColor: 'black',
        lineSpacing: 10,
        padding: 20,
        output: 'buffer',
    }) as Buffer;
};

export const generateSlogan = (seed: string) => {
    const thing = pickRandom(things, seed);
    const action = pickRandom(actions, seed);
    const target = pickRandom(targets, seed);

    return `${thing} will ${action} ${target}`;
};

const pickRandom = <T>(arr: T[], seed: string): T =>
    shuffleSeed.shuffle(arr, seed).pop()!;
