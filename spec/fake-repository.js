export default function FakeRepository() {
    this.radicals = [{
        "number": 1,
        "radical": "一",
        "simplified": "",
        "pinyin": "yī",
        "meaning": "one",
        "strokes": 1,
        "frequency": 42
    }]
    this.characters = [{
        "character": "一",
        "pinyin": "yī",
        "meaning": "sell; betray; show off",
        "radical": "一 1.0",
        "strokes": 1,
        "hskLevel": 1,
        "standardRank": 1,
        "frequencyRank": 2,
        "related": ""
    }]
    this.words = [{
        "word": "一样",
        "pinyin": "",
        "meaning": ""
    }]
    this.submissions = []
    this.save = () => null
}
