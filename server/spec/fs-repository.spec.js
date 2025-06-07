import fs from 'fs/promises'
import FsRepository from '../fs-repository.js'

describe('File System Repository', () => {
    beforeEach(() => fs.mkdir('server/spec/tmp', { recursive: true }))
    afterEach(() => fs.rm('server/spec/tmp', { recursive: true, force: true }))

    it('persists updates, and will re-load them correctly', async () => {
        const repo = new FsRepository('server/spec/tmp')
        repo.expressions.push({ hanzi: '测试', pinyin: 'cèshì', meaning: 'test' })
        await repo.save()

        const repo2 = new FsRepository('server/spec/tmp')
        expect(repo2.expressions[0].meaning).toBe('test')
    })

    it('handles concurrent save calls correctly', async () => {
        const repo = new FsRepository('server/spec/tmp')

        repo.radicals.push('testRadical1')
        repo.characters.push('testCharacter1')
        repo.expressions.push('testExpression1')
        repo.decks.push('testDeck1')
        const save1 = repo.save()

        repo.radicals.push('testRadical2')
        repo.characters.push('testCharacter2')
        repo.expressions.push('testExpression2')
        repo.decks.push('testDeck2')
        const save2 = repo.save()

        repo.radicals.push('testRadical3')
        repo.characters.push('testCharacter3')
        repo.expressions.push('testExpression3')
        repo.decks.push('testDeck3')
        const save3 = repo.save()
        await Promise.all([save1, save2, save3])

        // Reload and check all expressions are saved
        const repo2 = new FsRepository('server/spec/tmp')
        expect(repo2.radicals).toEqual(['testRadical1', 'testRadical2', 'testRadical3'])
        expect(repo2.characters).toEqual(['testCharacter1', 'testCharacter2', 'testCharacter3'])
        expect(repo2.expressions).toEqual(['testExpression1', 'testExpression2', 'testExpression3'])
        expect(repo2.decks).toEqual(['testDeck1', 'testDeck2', 'testDeck3'])
    })
})
