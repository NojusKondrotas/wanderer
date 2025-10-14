import fs from 'fs/promises'
import path from 'path'
import ejs from 'ejs'

async function build() {
    const distDir = './src/main'
    const srcWb = path.join('./src/dev/', 'whiteboard-index.ejs')
    const srcLink = path.join('./src/dev/', 'link.ejs')
    const srcFirstT = path.join('./src/dev/', 'prompt-first-time.ejs')
    const destWb = path.join(distDir, 'whiteboard-index.html')
    const destLink = path.join(distDir, 'prompts/link', 'link.html')
    const destFirstT = path.join(distDir, 'prompts/first-time', 'prompt-first-time.html')

    let html
    html = await ejs.renderFile(srcWb, {})
    await fs.writeFile(destWb, html)
    html = await ejs.renderFile(srcLink, {})
    await fs.writeFile(destLink, html)
    html = await ejs.renderFile(srcFirstT, {})
    await fs.writeFile(destFirstT, html)
}

build()