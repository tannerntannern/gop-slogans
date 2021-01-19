import { things, actions, targets } from './liberal';
import shuffleSeed from 'shuffle-seed';

export const generateSlogan = (seed: string = '') => {
    const thing = pickRandom(things, seed);
    const action = pickRandom(actions, seed);
    const target = pickRandom(targets, seed);

    return `${thing} will ${action} ${target}`;
};

const pickRandom = <T>(arr: T[], seed: string): T =>
    shuffleSeed.shuffle(arr, seed).pop()!;
