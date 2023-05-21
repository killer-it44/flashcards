import Server from '../server.js'
import supertest from 'supertest'
import FakeRepository from './fake-repository.js'

describe('Server', () => {
    let client, server, port
    
    beforeEach(async () => {
        server = new Server(new FakeRepository())
        port = await server.start()
        client = supertest(`http://localhost:${port}`)
    })

    afterEach(() => server.stop())

    it('fails to start on a used port', async () => {
        await expectAsync(new Server().start(port)).toBeRejectedWithError(/EADDRINUSE/)
    })

    it('looks up matching radicals and words for the character', async () => {
        const response = await client.get('/api/char').expect(200)

        expect(response.body).toEqual({
            character: '一',
            pinyin: 'yī',
            meaning: 'sell; betray; show off',
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
            words: '一样'
        })
    })

    it('can update the data and merge into the existing one', async () => {
        await client.post('/api/submission').send({
            character: '一',
            remembered: true,
            meaning: 'updated meaning',
            words: '一下,一点儿',
            related: '二'
        }).expect(201)

        const response = await client.get('/api/char').expect(200)
        expect(response.body.character).toEqual('一')
        expect(response.body.meaning).toEqual('updated meaning')
        expect(response.body.words).toEqual('一样, 一下, 一点儿')
        expect(response.body.related).toEqual('二')
    })
})
