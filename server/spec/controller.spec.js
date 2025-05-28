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

    it('returns some next character', async () => {
        const character = controller.getNextCharacter()
        expect(['一', '二']).toContain(character.hanzi)
        expect(['yī', 'èr']).toContain(character.pinyin)
        expect(character.radical.hanzi).not.toBe('')
        expect(character.expressions[0].hanzi).toBe('一二')
        expect(character.expressions[1].hanzi).toBe('一...二')
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

    it('can add new expressions, which are also looked up', async () => {
        await controller.addExpressions([{ hanzi: '一下', pinyin: '', meaning: 'a little' }])
        expect(controller.getExpression('一下').meaning).toBe('a little')
        expect(controller.getCharacter('一').expressions).toContain(jasmine.objectContaining({ hanzi: '一下' }))
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

    it('returns some next expression, and pinyin is looked up', async () => {
        const expression = controller.getNextExpression()
        expect(['一二', '一...二']).toContain(expression.hanzi)
        expect(['yīèr', 'yī...èr']).toContain(expression.pinyin)
    })

    it('can submit expressions', async () => {
        controller.submitExpression({ expression: '一二', remembered: true })

        // TODO what's the test now?
    })

    it('will return the expressions that are least remembered with a higher probability', async () => {
        await controller.submitExpression({ expression: '一二', remembered: false })
        const expressions = []
        for (let i = 0; i < 1000; i++) {
            expressions.push(controller.getNextExpression())
        }
        expect(expressions.filter(c => c.hanzi === '一二').length).toBeGreaterThan(600)
        expect(expressions.filter(c => c.hanzi === '一...二').length).toBeLessThan(400)
    })

    it('can update an existing expression', async () => {
        await controller.updateExpression({ expression: '一二', pinyin: 'yìèr', meaning: 'updated meaning' })
        const expression = controller.getExpression('一二')
        expect(expression).toEqual(jasmine.objectContaining({ hanzi: '一二', pinyin: 'yìèr', meaning: 'updated meaning' }))
    })
})
