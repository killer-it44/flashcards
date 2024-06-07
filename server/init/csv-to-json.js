import fs from 'fs/promises'

const radicals = []
const rSegments = 7
const rContent = (await fs.readFile('convert/radicals.csv')).toString()
rContent.split('\n').forEach((line, i) => {
    const segments = line.split('\t')
    if (segments.length !== rSegments) {
        console.error(`Line ${i + 1} broken: found ${segments.length} segments, expected ${rSegments}`)
        process.exit(1)
    }
    radicals.push({
        number: Number(segments[0]),
        hanzi: segments[1],
        simplified: segments[2],
        pinyin: segments[3],
        meaning: segments[4],
        strokes: Number(segments[5]),
        frequency: Number(segments[6])
    })
})
console.log(`Loaded ${radicals.length} radicals`)


const characters = []
const cContent = (await fs.readFile('convert/characters.csv')).toString()
const cSegments = 8
cContent.split('\n').forEach((line, i) => {
    const segments = line.split('\t')
    if (segments.length !== cSegments) {
        console.error(`Line ${i + 1} broken: found ${segments.length} segments, expected ${cSegments}`)
        process.exit(1)
    } else if (!segments[2] && Number(segments[7]) !== 0 && Number(segments[7]) < 3000) {
        console.warn(`${segments[0]} has no meaning`)
    }
    characters.push({
        hanzi: segments[0],
        pinyin: segments[1],
        meaning: segments[2],
        radical: segments[3],
        strokes: Number(segments[4]),
        hskLevel: Number(segments[5]),
        standardRank: Number(segments[6]),
        frequencyRank: Number(segments[7]),
        related: ''
    })
})
console.log(`Loaded ${characters.length} characters`)


characters.forEach(cEntry => {
    const radical = cEntry.radical.substring(0, 1)
    if (!radicals.find(r => r.radical.includes(radical))) {
        console.error(`Could not find radical ${radical} for character ${cEntry.character}`)
        process.exit(1)
    }
})
console.log('Characters and radicals are consistent')


await fs.writeFile('convert/radicals.json', JSON.stringify(radicals, null, '\t'))
await fs.writeFile('convert/characters.json', JSON.stringify(characters, null, '\t'))
console.log('JSON data generated successfully')

