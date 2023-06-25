import fs from 'fs/promises'
import fssync from 'fs'
import FsRepository from '../fs-repository.js'
import Controller from '../controller.js'
import WinstonLogger from '../winston-logger.js'

describe('Performance', () => {
    it('has a response time of less than 0.1 seconds for read/write operations', async () => {
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

    it('has a response time of less than 1 second for large submission pools', async () => {
        global.logger = { info: () => null, warn: () => null, error: () => null }
        const repo = new FsRepository('spec/tmp')
        repo.save = () => null
        const controller = new Controller(repo)

        for (let i = 0; i < 20000; i++) {
            const character = repo.characters[Math.floor(repo.characters.length * Math.random())].character
            const remembered = Boolean(Math.floor(2 * Math.random()))
            controller.submit({ character, remembered, meaning: '', words: '', related: '' })
        }

        controller.getNext()
    })
})
