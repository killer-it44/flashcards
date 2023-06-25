export default function FakeRepository() {
    this.radicals = [{
        "number": 1,
        "radical": "一",
        "simplified": "",
        "pinyin": "yī",
        "meaning": "one",
        "strokes": 1,
        "frequency": 42
    }, {
        "number": 7,
        "radical": "二",
        "simplified": "",
        "pinyin": "èr",
        "meaning": "two",
        "strokes": 2,
        "frequency": 29
    }]
    this.characters = [{
        "character": "一",
        "pinyin": "yī",
        "meaning": "one; a, an; alone",
        "radical": "一 1.0",
        "strokes": 1,
        "hskLevel": 1,
        "standardRank": 1,
        "frequencyRank": 2,
        "related": ""
    }, {
        "character": "二",
        "pinyin": "èr",
        "meaning": "two; twice",
        "radical": "二 7.0",
        "strokes": 2,
        "hskLevel": 1,
        "standardRank": 3,
        "frequencyRank": 157,
        "related": ""
    }]
    this.words = [{
        "word": "一二",
        "pinyin": "",
        "meaning": "one two"
    }, {
        "word": "一...二",
        "pinyin": "",
        "meaning": "one...two"
    }]
    this.sentences = [{
        "hanzi": "一二可乐"
    }, {
        "hanzi": "一个还是二"
    }]
    this.submissions = []
    this.save = () => null
}
