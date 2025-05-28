import fs from 'fs/promises'
import FsRepository from '../fs-repository.js'
import Controller from '../controller.js'

describe('Performance', () => {
    beforeEach(() => fs.mkdir('server/spec/tmp', { recursive: true }))
    afterEach(() => fs.rm('server/spec/tmp', { recursive: true, force: true }))

    it('is <0.1s for loading and saving large data', async () => {
        const expressions = Array.from({ length: 100000 }, (_, i) => ({ data: `test${i}` }))
        await fs.writeFile('server/spec/tmp/expressions.json', JSON.stringify(expressions, null, 2))

        const t0 = Date.now()
        const repo = new FsRepository('server/spec/tmp')
        expect(Date.now() - t0).toBeLessThan(100)
        const t1 = Date.now()
        await repo.save()
        expect(Date.now() - t1).toBeLessThan(100)
    })

    it('is <0.01s to get next character/expression/radical for large data pool', async () => {
        const characters = Array.from({ length: 100000 }, (_, i) => ({ hanzi: `字${i}`, pinyin: `zi${i}` }))
        await fs.writeFile('server/spec/tmp/characters.json', JSON.stringify(characters, null, 2))

        const repo = new FsRepository('server/spec/tmp')
        repo.save = () => null
        const controller = new Controller(repo)

        for (let i = 0; i < 100000; i++) {
            const character = repo.characters[Math.floor(repo.characters.length * Math.random())].hanzi
            const remembered = Boolean(Math.floor(2 * Math.random()))
            await controller.submitCharacter({ character, remembered })
        }

        const t0 = Date.now()
        const nextChar = controller.getNextCharacter()
        expect(Date.now() - t0).toBeLessThan(100)
        expect(nextChar.hanzi).toMatch(/字\d+/)
    })
})
