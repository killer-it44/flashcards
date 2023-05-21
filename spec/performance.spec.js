import fs from 'fs/promises'
import fssync from 'fs'

describe('Performance', () => {
    it('Finishes each operation in less than 0.1 seconds', async () => {
        let starTime = Date.now()
        const characters = JSON.parse((await fs.readFile('init/characters.json')).toString())
        expect(Date.now() - starTime).toBeLessThan(100)
        expect(characters.length).toBe(8105)

        starTime = Date.now()
        await fs.writeFile('spec/characters.json.tmp', JSON.stringify(characters, null, '\t'))
        expect(Date.now() - starTime).toBeLessThan(100)
    
        starTime = Date.now()
        fssync.writeFileSync('spec/characters.csv.tmp', characters.map(c => Object.values(c).join('\t')).join('\n'))
        expect(Date.now() - starTime).toBeLessThan(100)
    
        starTime = Date.now()
        const cContent = (fssync.readFileSync('spec/characters.csv.tmp')).toString()
        const charsFromCsv = cContent.split('\n').map(line => {
            const [character, pinyin, meaning, radical, strokes, hskLevel, standardRank, frequencyRank, related] = line.split('\t')
            return { character, pinyin, meaning, radical, strokes: Number(strokes), hskLevel: Number(hskLevel), standardRank: Number(standardRank), frequencyRank: Number(frequencyRank), related }
        })
        expect(Date.now() - starTime).toBeLessThan(100)
        expect(charsFromCsv.length).toBe(8105)
    })
})
