import fs from 'fs/promises'
import FsRepository from '../fs-repository.js'

describe('File System Repository', () => {
    beforeEach(() => fs.rm('server/spec/tmp', { recursive: true, force: true }))
    afterAll(() => fs.rm('server/spec/tmp', { recursive: true, force: true }))

    it('initializes successfully and loads the assets correctly', () => {
        const repo = new FsRepository('server/spec/tmp')

        expect(repo.radicals.length).toBe(214)
        expect(repo.characters.length).toBe(8105)
        expect(repo.words).toBeInstanceOf(Array)
        expect(repo.sentences).toBeInstanceOf(Array)
        expect(repo.submissions.length).toBe(0)
    })

    it('persists updates, and will re-load them correctly', async () => {
        const repo = new FsRepository('server/spec/tmp')
        expect(repo.characters[0].meaning).not.toBe('test meaning')

        repo.characters[0].meaning = 'test meaning'
        repo.submissions.push('test submission')
        await repo.save()

        const repo2 = new FsRepository('server/spec/tmp')
        expect(repo2.characters[0].meaning).toBe('test meaning')
        expect(repo.submissions).toEqual(['test submission'])
    })
})
