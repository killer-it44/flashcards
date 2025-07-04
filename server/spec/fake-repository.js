export default function FakeRepository() {
    this.radicals = [{
        number: 1,
        hanzi: '一',
        simplified: '',
        pinyin: 'yī',
        meaning: 'one',
        strokes: 1,
        frequency: 42
    }, {
        number: 7,
        hanzi: '二',
        simplified: '',
        pinyin: 'èr',
        meaning: 'two',
        strokes: 2,
        frequency: 29
    }]
    this.characters = [{
        hanzi: '一',
        pinyin: 'yī',
        meaning: 'one; a, an; alone',
        radical: '一 1.0',
        strokes: 1,
        hskLevel: 1,
        standardRank: 1,
        frequencyRank: 2,
        related: ''
    }, {
        hanzi: '二',
        pinyin: 'èr',
        meaning: 'two; twice',
        radical: '二 7.0',
        strokes: 2,
        hskLevel: 1,
        standardRank: 3,
        frequencyRank: 157,
        related: ''
    }]
    this.expressions = [{
        hanzi: '一二',
        pinyin: '',
        meaning: 'one two'
    }, {
        hanzi: '一...二',
        pinyin: '',
        meaning: 'one...two'
    }]
    this.save = () => null
}
