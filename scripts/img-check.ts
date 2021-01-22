import { existsSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { things, targets } from '../lib/liberal';
import { resolveImage, imgBasePath } from '../lib/generator';

const checkImages = (predefinedItems: string[], imgSubDir: string) => {
    const missingImages: string[] = [];
    const misnamedImages: string[] = [];

    console.info(`Checking ${imgSubDir} against predefined list...`);
    for (let item of predefinedItems)
        if (!existsSync(resolveImage(imgSubDir, item, 0)))
            missingImages.push(item);

    console.info(`Ensuring each item in list has at least one image in ${imgSubDir}...`);
    for (let image of readdirSync(resolve(imgBasePath, imgSubDir))) {
        const patternMatch = /^([\w-.]+)\d+\.\w*$/.exec(image);
        if (!patternMatch || !(predefinedItems.includes(patternMatch[1].replace(/_/g, ' '))))
            misnamedImages.push(image);
    }
    
    return { missingImages, misnamedImages };
};

const summarizeImages = (preDefinedItems: string[], imgSubDir: string) => {
    const { missingImages, misnamedImages } = checkImages(preDefinedItems, imgSubDir);

    if (missingImages.length > 0)
        console.error(`WARNING: ${imgSubDir} is missing the following items (${missingImages.length}): [${missingImages.join(', ')}]`);
    
    if (misnamedImages.length > 0)
        console.error(`WARNING: ${imgSubDir} has the following misnamed images (${misnamedImages.length}): [${misnamedImages.join(', ')}]`);
    
    return (missingImages.length + misnamedImages.length > 0);
};

const badThings = summarizeImages(things.map(([thing, _]) => thing), 'liberal-things');
const badTargets = summarizeImages(targets, 'liberal-targets');

if (badThings || badTargets)
    process.exit(1);
