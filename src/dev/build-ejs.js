import fs from 'fs/promises'
import path from 'path'
import ejs from 'ejs'

async function writeHTML(src, dest){
    let html = await ejs.renderFile(src, {});
    await fs.writeFile(dest, html);
}

async function build() {
    const mainDir = './src/main';
    const srcs = [
        path.join('./src/dev/', 'notepad-index.ejs'),
        path.join('./src/dev/', 'whiteboard-index.ejs'),
        path.join('./src/dev/prompts/', 'prompt-first-time.ejs'),
        path.join('./src/dev/prompts/', 'prompt-link.ejs'),
        path.join('./src/dev/prompts/', 'configs.ejs')
    ];
    const dests = [
        path.join(mainDir, 'notepad-index.html'),
        path.join(mainDir, 'whiteboard-index.html'),
        path.join(mainDir, 'prompts/first-time', 'prompt-first-time.html'),
        path.join(mainDir, 'prompts/link', 'prompt-link.html'),
        path.join(mainDir, 'prompts/configs', 'configs.html')
    ];

    for(let i = 0; i < srcs.length; ++i) {
        writeHTML(srcs[i], dests[i]);
    }
}

build();