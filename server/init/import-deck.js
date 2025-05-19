import fs from 'fs/promises'

const dir = process.env.DATA_DIR || 'init'

const content = (await fs.readFile('init/new-deck.txt')).toString()

const decks = JSON.parse((await fs.readFile(`${dir}/decks.json`)).toString())
const characters = new Set(decks['characters'])
const expressions = new Set(decks['expressions'])

content.split('\n').forEach((line, i) => {
    if (line.length < 1) {
        throw new Error(`line ${i + 1}: empty line`)
    }
    
    for (const char of line) {
        characters.add(char)
    }
    if (line.length > 1) {
        expressions.add(line)
    }
})

decks.characters = Array.from(characters)
decks.expressions = Array.from(expressions)
await fs.writeFile(`${dir}/decks.json`, JSON.stringify(decks, null, '\t'))

console.log(`${characters.size} characters`)
console.log(`${expressions.size} expressions`)
