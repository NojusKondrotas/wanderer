import fs from 'fs/promises'
import path from 'path'
import ejs from 'ejs'

async function build() {
    const distDir = './src/main'
    const srcNp = path.join('./src/dev/', 'notepad-index.ejs')
    const srcWb = path.join('./src/dev/', 'whiteboard-index.ejs')
    const srcFirstT = path.join('./src/dev/prompts/', 'prompt-first-time.ejs')
    const srcLink = path.join('./src/dev/prompts/', 'prompt-link.ejs')

    const destNp = path.join(distDir, 'notepad-index.html')
    const destWb = path.join(distDir, 'whiteboard-index.html')
    const destLink = path.join(distDir, 'prompts/link', 'prompt-link.html')
    const destFirstT = path.join(distDir, 'prompts/first-time', 'prompt-first-time.html')

    let html
    html = await ejs.renderFile(srcNp, {})
    await fs.writeFile(destNp, html)
    html = await ejs.renderFile(srcWb, {})
    await fs.writeFile(destWb, html)
    html = await ejs.renderFile(srcLink, {})
    await fs.writeFile(destLink, html)
    html = await ejs.renderFile(srcFirstT, {})
    await fs.writeFile(destFirstT, html)
}

build()