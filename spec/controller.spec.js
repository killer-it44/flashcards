import FakeRepository from './fake-repository.js'
import Controller from '../controller.js'

describe('Controller', () => {
    let controller

    beforeEach(async () => {
        controller = new Controller(new FakeRepository())
    })

    it('returns the details of a specific character including matching radicals and words', async () => {
        expect(controller.get('一')).toEqual({
            character: '一',
            pinyin: 'yī',
            meaning: 'one; a, an; alone',
            radical: {
                number: 1,
                radical: '一',
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
        const char = controller.getNext()
        expect(['一', '二']).toContain(char.character)
        expect(['yī', 'èr']).toContain(char.pinyin)
    })

    it('can submit with updated data', async () => {
        controller.submit({
            character: '一',
            remembered: true,
            meaning: 'updated meaning',
            words: '一下,一点儿',
            related: '二'
        })

        const char = controller.get('一')
        expect(char.character).toBe('一')
        expect(char.meaning).toBe('updated meaning')
        expect(char.words).toBe('一二, 一...二, 一下, 一点儿')
        expect(char.related).toBe('二')
    })

    it('will not add words which already exist as part of the update', async () => {
        const updatedData = { character: '一', remembered: true, meaning: '', words: '一下', related: '' }
        controller.submit(updatedData)
        controller.submit(updatedData)
        expect(controller.get('一').words).toBe('一二, 一...二, 一下')
    })

    it('will return the characters first that are least remembered', async () => {
        const updatedData = { character: '一', remembered: false, meaning: '', words: '', related: '' }
        controller.submit(updatedData)
        expect(controller.getNext().character).toBe('一')
    })

    it('returns the word including the details, and pinyin is looked up', async () => {
        const w = controller.getWord('一二')
        expect(w.word).toBe('一二')
        expect(w.pinyin).toBe('yīèr')
        expect(w.meaning).toBe('one two')
    })

    it('returns some next word, and pinyin is looked up', async () => {
        const word = controller.getNextWord()
        expect(['一二', '一...二']).toContain(word.word)
        expect(['yīèr', 'yī...èr']).toContain(word.pinyin)
    })

    it('can submit words with updated data, and a specific pinyin can override the lookup value', async () => {
        controller.submitWord({ word: '一二', remembered: true, pinyin: 'yīēr', meaning: 'updated meaning' })

        expect(controller.getWord('一二')).toEqual({
            word: '一二',
            pinyin: 'yīēr',
            meaning: 'updated meaning'
        })
    })

    it('will return the words first that are least remembered', async () => {
        controller.submitWord({ word: '一二', remembered: false })
        expect(controller.getNextWord().word).toBe('一二')
    })
})
