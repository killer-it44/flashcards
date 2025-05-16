import FakeRepository from './fake-repository.js'
import Controller from '../controller.js'
import NotFound from '../not-found.js'

describe('Controller', () => {
    let controller

    beforeEach(() => {
        controller = new Controller(new FakeRepository())
    })

    // TODO anything to consider the frequencyRank?

    it('returns the details of a specific character including matching radicals and words', async () => {
        expect(controller.getCharacter('一')).toEqual({
            hanzi: '一',
            pinyin: 'yī',
            meaning: 'one; a, an; alone',
            radical: {
                number: 1,
                hanzi: '一',
                simplified: '',
                pinyin: 'yī',
                meaning: 'one',
                strokes: 1,
                frequency: 42
            },
            strokes: 1,
            hskLevel: 1,
            standardRank: 1,
            frequencyRank: 2,
            related: '',
            words: ['一二', '一...二']
        })
    })

    it('throws an error if character does not exist', async () => {
        expect(() => controller.getCharacter('not-existing')).toThrowError(NotFound)
    })

    it('returns some next character', async () => {
        const character = controller.getNextCharacter()
        expect(['一', '二']).toContain(character.hanzi)
        expect(['yī', 'èr']).toContain(character.pinyin)
        expect(character.words).toEqual(['一二', '一...二'])
        expect(character.radical.hanzi).not.toBe('')
    })

    it('can submit characters', async () => {
        await controller.submitCharacter({ character: '一', remembered: true })

        // TODO what's the test now?
    })

    it('can update an existing character', async () => {
        await controller.updateCharacter({ character: '一', meaning: 'updated meaning', related: '二' })
        const character = controller.getCharacter('一')
        expect(character).toEqual(jasmine.objectContaining({ hanzi: '一', meaning: 'updated meaning', related: '二' }))
    })

    it('can add new words, which are also looked up', async () => {
        await controller.addWord({ hanzi: '一下', meaning: 'a little' })
        expect(controller.getWord('一下').meaning).toBe('a little')
        expect(controller.getCharacter('一').words).toContain('一下')
    })

    it('will return the characters that are least remembered with a higher probability', async () => {
        await controller.submitCharacter({ character: '一', remembered: false })
        const characters = []
        for (let i = 0; i < 1000; i++) {
            characters.push(controller.getNextCharacter())
        }
        expect(characters.filter(c => c.hanzi === '一').length).toBeGreaterThan(600)
        expect(characters.filter(c => c.hanzi === '二').length).toBeLessThan(400)
    })

    it('returns the word and meaning, pinyin is looked up, as well as related sentences', async () => {
        const word = controller.getWord('一二')
        expect(word.hanzi).toBe('一二')
        expect(word.pinyin).toBe('yīèr')
        expect(word.meaning).toBe('one two')
        expect(word.sentences).toEqual(['一二三'])

        const word2 = controller.getWord('一...二')
        expect(word2.sentences).toEqual(['一还是二'])
    })

    it('will lookup the pinyin of a word from the individual characters, unless explicitly set ', async () => {
        await controller.updateWord({ word: '一二', pinyin: '' })
        expect(controller.getWord('一二').pinyin).toBe('yīèr')

        await controller.updateWord({ word: '一二', pinyin: 'yìèr' })
        expect(controller.getWord('一二').pinyin).toBe('yìèr')
    })

    it('throws an error if word does not exist', async () => {
        expect(() => controller.getWord('not-existing')).toThrowError(NotFound)
    })

    it('returns some next word, and pinyin is looked up', async () => {
        const word = controller.getNextWord()
        expect(['一二', '一...二']).toContain(word.hanzi)
        expect(['yīèr', 'yī...èr']).toContain(word.pinyin)
    })

    it('can submit words', async () => {
        controller.submitWord({ word: '一二', remembered: true })

        // TODO what's the test now?
    })

    it('will return the words that are least remembered with a higher probability', async () => {
        await controller.submitWord({ word: '一二', remembered: false })
        const words = []
        for (let i = 0; i < 1000; i++) {
            words.push(controller.getNextWord())
        }
        expect(words.filter(c => c.hanzi === '一二').length).toBeGreaterThan(600)
        expect(words.filter(c => c.hanzi === '一...二').length).toBeLessThan(400)
    })

    it('can update an existing word', async () => {
        await controller.updateWord({ word: '一二', pinyin: 'yìèr', meaning: 'updated meaning' })
        const word = controller.getWord('一二')
        expect(word).toEqual(jasmine.objectContaining({ hanzi: '一二', pinyin: 'yìèr', meaning: 'updated meaning' }))
    })

    it('can add new sentences, which are then looked up', async () => {
        await controller.addSentence({ hanzi: '一不是二', meaning: 'one is not two' })
        expect(controller.getWord('一...二').sentences).toContain('一不是二')
    })
})
