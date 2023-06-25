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

    it('will return the characters first that are least remembered, but only after a certain time', async () => {
        jasmine.clock().mockDate(new Date())
        jasmine.clock().withMock(() => {
            /*
            / 1. directly after submission, both may be picked, cause time has not yet elapsed
            / 2. submit another one after half the time
            / 3. still, both may be picked
            / 4. wait the other half of the time, not it should definitely be the first one
            */
            controller.submit({ character: '一', remembered: false, meaning: '', words: '', related: '' })
            expect(['一', '二']).toContain(controller.getNext().character)
            jasmine.clock().tick(1000 * 60 * 1)
            controller.submit({ character: '二', remembered: false, meaning: '', words: '', related: '' })
            expect(['一', '二']).toContain(controller.getNext().character)
            jasmine.clock().tick(1000 * 60 * 1)
            expect(controller.getNext().character).toBe('一')
        })
    })

    it('returns the word and meaning, pinyin is looked up, as well as related sentences', async () => {
        const w = controller.getWord('一二')
        expect(w.word).toBe('一二')
        expect(w.pinyin).toBe('yīèr')
        expect(w.meaning).toBe('one two')
        expect(w.sentences).toBe('一二可乐')
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
            meaning: 'updated meaning',
            sentences: '一二可乐'
        })
    })

    it('will return the words first that are least remembered, but only after a certain time', async () => {
        jasmine.clock().mockDate(new Date())
        jasmine.clock().withMock(() => {
            /*
            / 1. directly after submission, both may be picked, cause time has not yet elapsed
            / 2. submit another one after half the time
            / 3. still, both may be picked
            / 4. wait the other half of the time, not it should definitely be the first one
            */
            controller.submitWord({ word: '一二', remembered: false })
            expect(['一二', '一...二']).toContain(controller.getNextWord().word)
            jasmine.clock().tick(1000 * 60 * 1)
            controller.submitWord({ word: '一...二', remembered: false })
            expect(['一二', '一...二']).toContain(controller.getNextWord().word)
            jasmine.clock().tick(1000 * 60 * 1)
            expect(controller.getNextWord().word).toBe('一二')
        })
    })
})
