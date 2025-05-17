// IMPORTANT:
// This test makes sure that breaking changes to the repo / data structure will be detected.
// If such changes are made, this test here will fail, since the fake repo will then not be in sync with these changes.
// Usually this is a strong indicator for reverting the changes, as it will likely break in production on zero-downtime update scenarios.
//
// However, if the changes are considered save in production, apply the following steps:
// 1. Adjust the fake repo accordingly to make this test here pass
// 2. Run all tests, now the server tests should fail, since the server is using the fake repo, this makes the incompatibility visible
// 3. Adjust the server accordingly to adhere to the new data structures / APIs
// 4. IMPORTANT: committing and merging your code, be EXTRA sure that this will not caus trouble in production during update (the old version might run in parallel!)

import fs from 'fs/promises'
import FakeRepository from './fake-repository.js'
import FsRepository from '../fs-repository.js'

describe('Repository API and data structure contract', () => {
    beforeEach(() => fs.rm('spec/tmp', { recursive: true, force: true }))
    afterAll(() => fs.rm('spec/tmp', { recursive: true, force: true }))

    it('assures that the repo API and data structure is in sync with the fake api and data used for testing', () => {
        const fakeRepo = new FakeRepository()
        const fsRepo = new FsRepository('server/spec/tmp')

        expect(fakeRepo.radicals.length).toBeGreaterThan(0)
        expect(fakeRepo.characters.length).toBeGreaterThan(0)
        expect(fakeRepo.expressions.length).toBeGreaterThan(0)
        expect(fakeRepo.submissions).toBeInstanceOf(Array)

        expect(fakeRepo.characters[0]).toEqual(fsRepo.characters.find(c => c.hanzi === fakeRepo.characters[0].hanzi))        
        expect(fakeRepo.radicals[0]).toEqual(fsRepo.radicals.find(r => r.hanzi === fakeRepo.radicals[0].hanzi))

        expect(Object.keys(fakeRepo.expressions[0])).toEqual(Object.keys(fsRepo.expressions[0]))
        Object.keys(fakeRepo.expressions[0]).forEach(key => {
            expect(typeof fakeRepo.expressions[0][key]).toBe(typeof fsRepo.expressions[0][key])
        })

        expect(fsRepo.submissions).toBeInstanceOf(Array)

        expect(fsRepo.save.length).toBe(fakeRepo.save.length)
    })
})
