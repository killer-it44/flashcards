import fs from 'fs/promises'

const dir = process.env.DATA_DIR || 'init'

const expressions = JSON.parse((await fs.readFile(`${dir}/expressions.json`)).toString())

for (const e of expressions) {
    if (e.pinyin === undefined) {
        e.pinyin = ''
    }
}

await fs.writeFile(`${dir}/expressions.json`, JSON.stringify(expressions, null, '\t'))
