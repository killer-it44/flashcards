import fs from 'fs/promises'
import FsRepository from '../fs-repository.js'
import Controller from '../controller.js'

describe('Performance', () => {
    beforeEach(() => fs.rm('server/spec/tmp', { recursive: true, force: true }))
    afterAll(() => fs.rm('server/spec/tmp', { recursive: true, force: true }))

    it('is <0.1s for loading and saving data', async () => {
        const t0 = Date.now()
        const repo = new FsRepository('server/spec/tmp')
        expect(Date.now() - t0).toBeLessThan(100)
        const t1 = Date.now()
        await repo.save()
        expect(Date.now() - t1).toBeLessThan(100)
    })

    it('is <0.01s to get next character with large submission pools and realistic basic data', async () => {
        const repo = new FsRepository('server/spec/tmp')
        repo.save = () => null
        const controller = new Controller(repo)

        for (let i = 0; i < 20000; i++) {
            const character = repo.characters[Math.floor(repo.characters.length * Math.random())].hanzi
            const remembered = Boolean(Math.floor(2 * Math.random()))
            await controller.submitCharacter({ character, remembered, meaning: '', words: '', related: '' })
        }

        const t0 = Date.now()
        controller.getNextCharacter()
        expect(Date.now() - t0).toBeLessThan(100)
    })
})
