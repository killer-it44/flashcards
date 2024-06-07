import FakeRepository from './fake-repository.js'
import Controller from '../controller.js'

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
            words: '一二, 一...二'
        })
    })

    it('returns some next character', async () => {
        const character = controller.getNextCharacter()
        expect(['一', '二']).toContain(character.hanzi)
        expect(['yī', 'èr']).toContain(character.pinyin)
        expect(character.words).toBe('一二, 一...二')
        expect(character.radical.hanzi).not.toBe('')
    })

    it('can submit characters with updated data', async () => {
        controller.submitCharacter({
            character: '一',
            remembered: true,
            meaning: 'updated meaning',
            words: '一下,一点儿',
            related: '二'
        })

        const character = controller.getCharacter('一')
        expect(character.hanzi).toBe('一')
        expect(character.meaning).toBe('updated meaning')
        expect(character.words).toBe('一二, 一...二, 一下, 一点儿')
        expect(character.related).toBe('二')
    })

    it('will not add words which already exist as part of the update', async () => {
        const updatedData = { character: '一', remembered: true, meaning: '', words: '一下', related: '' }
        controller.submitCharacter(updatedData)
        controller.submitCharacter(updatedData)
        expect(controller.getCharacter('一').words).toBe('一二, 一...二, 一下')
    })

    it('will return the characters that are least remembered with a higher probability', async () => {
        // REVISE feels weird that we're "forced" to pass some "words" property
        await controller.submitCharacter({ character: '一', remembered: false, words: '' })
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
        expect(word.sentences).toBe('一二三')

        const word2 = controller.getWord('一...二')
        expect(word2.sentences).toBe('一还是二')
    })

    it('returns some next word, and pinyin is looked up', async () => {
        const word = controller.getNextWord()
        expect(['一二', '一...二']).toContain(word.hanzi)
        expect(['yīèr', 'yī...èr']).toContain(word.pinyin)
    })

    it('can submit words with updated data', async () => {
        controller.submitWord({
            word: '一二',
            remembered: true,
            pinyin: 'yīēr',
            meaning: 'updated meaning',
            sentences: '一二四'
        })

        expect(controller.getWord('一二')).toEqual({
            hanzi: '一二',
            pinyin: 'yīēr',
            meaning: 'updated meaning',
            sentences: '一二三; 一二四'
        })
    })

    it('will return the words that are least remembered with a higher probability', async () => {
        // REVISE feels weird that we're "forced" to pass some "sentences" property
        await controller.submitWord({ word: '一二', remembered: false, sentences: '' })
        const words = []
        for (let i = 0; i < 1000; i++) {
            words.push(controller.getNextWord())
        }
        expect(words.filter(c => c.hanzi === '一二').length).toBeGreaterThan(600)
        expect(words.filter(c => c.hanzi === '一...二').length).toBeLessThan(400)
    })
})
