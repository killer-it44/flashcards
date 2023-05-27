import fs from 'fs'
import FsRepository from '../fs-repository.js'
import Logger from '../winston-logger.js'

describe('File System Repository', () => {
    beforeEach(() => fs.rmSync('spec/tmp', { recursive: true, force: true }))
    beforeAll(() => global.logger = spyOnAllFunctions(new Logger()))

    it('initializes successfully and loads the assets correctly', () => {
        const repo = new FsRepository('spec/tmp')
        expect(repo.characters.length).toBe(8105)
        expect(repo.radicals.length).toBe(214)
        expect(repo.words).toBeInstanceOf(Array)
        expect(repo.submissions.length).toBe(0)
    })

    it('persists updates, and will re-load them correctly', async () => {
        const repo = new FsRepository('spec/tmp')
        expect(repo.characters[0].meaning).not.toBe('test meaning')

        repo.characters[0].meaning = 'test meaning'
        repo.submissions.push('test submission')
        await repo.save()

        const repo2 = new FsRepository('spec/tmp')
        expect(repo2.characters[0].meaning).toBe('test meaning')
        expect(repo.submissions).toEqual(['test submission'])
    })
})
