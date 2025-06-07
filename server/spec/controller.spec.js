import FakeRepository from './fake-repository.js'
import Controller from '../controller.js'
import NotFound from '../not-found.js'

describe('Controller', () => {
    let controller

    beforeEach(() => {
        controller = new Controller(new FakeRepository())
    })

    // TODO anything to consider the frequencyRank?

    it('returns the details of a specific character with matching radicals + expressions incl. pinyin', async () => {
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
            expressions: [{
                hanzi: '一二',
                pinyin: 'yīèr',
                meaning: 'one two'
            }, {
                hanzi: '一...二',
                pinyin: 'yī...èr',
                meaning: 'one...two'
            }]
        })
    })

    it('throws an error if character does not exist', async () => {
        expect(() => controller.getCharacter('not-existing')).toThrowError(NotFound)
    })

    it('can update an existing character', async () => {
        await controller.updateCharacter({ character: '一', meaning: 'updated meaning', related: '二' })
        const character = controller.getCharacter('一')
        expect(character).toEqual(jasmine.objectContaining({ hanzi: '一', meaning: 'updated meaning', related: '二' }))
    })

    it('can add new expressions, which are also looked up', async () => {
        await controller.addExpressions([{ hanzi: '一下', pinyin: '', meaning: 'a little' }])
        expect(controller.getExpression('一下').meaning).toBe('a little')
        expect(controller.getCharacter('一').expressions).toContain(jasmine.objectContaining({ hanzi: '一下' }))
    })

    it('returns the expression and meaning, pinyin is looked up', async () => {
        const expression = controller.getExpression('一二')
        expect(expression.hanzi).toBe('一二')
        expect(expression.pinyin).toBe('yīèr')
        expect(expression.meaning).toBe('one two')
    })

    it('will lookup the pinyin of a expression from the individual characters, unless explicitly set ', async () => {
        await controller.updateExpression({ expression: '一二', pinyin: '' })
        expect(controller.getExpression('一二').pinyin).toBe('yīèr')

        await controller.updateExpression({ expression: '一二', pinyin: 'yìèr' })
        expect(controller.getExpression('一二').pinyin).toBe('yìèr')
    })

    it('throws an error if expression does not exist', async () => {
        expect(() => controller.getExpression('not-existing')).toThrowError(NotFound)
    })

    it('can update an existing expression', async () => {
        await controller.updateExpression({ expression: '一二', pinyin: 'yìèr', meaning: 'updated meaning' })
        const expression = controller.getExpression('一二')
        expect(expression).toEqual(jasmine.objectContaining({ hanzi: '一二', pinyin: 'yìèr', meaning: 'updated meaning' }))
    })
})
