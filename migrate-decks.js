import fs from 'fs'
import path from 'path'

if (process.argv.length < 3) {
    console.error('Usage: node migrate-decks.js <dataDir>')
    process.exit(1)
}

const dataDir = process.argv[2]
const decksJsonPath = path.join(dataDir, 'decks.json')
const decksDir = path.join(dataDir, 'decks')

fs.mkdirSync(decksDir, { recursive: true })

const decks = JSON.parse(fs.readFileSync(decksJsonPath, 'utf-8'))
const now = Date.now()

for (const [name, items] of Object.entries(decks)) {
    const deckFile = path.join(decksDir, `${name}.json`)
    const deckData = { name, items, createdAt: now, createdBy: '', isPrivate: false, description: '', tags: [] }
    fs.writeFileSync(deckFile, JSON.stringify(deckData, null, '\t'))
}
