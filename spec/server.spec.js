import Server from '../server.js'
import supertest from 'supertest'
import FakeRepository from './fake-repository.js'
import Controller from '../controller.js'

describe('Server', () => {
    let client, server, port

    beforeEach(async () => {
        server = new Server(new Controller(new FakeRepository()))
        port = await server.start()
        client = supertest(`http://localhost:${port}`)
    })

    afterEach(() => server.stop())

    it('fails to start on a used port', async () => {
        await expectAsync(new Server().start(port)).toBeRejectedWithError(/EADDRINUSE/)
    })

    it('returns the details of a specific character', async () => {
        const response = await client.get(`/api/char/${encodeURIComponent('一')}`).expect(200)
        expect(response.body.character).toEqual('一')
    })

    it('returns some next character', async () => {
        const response = await client.get('/api/char').expect(200)
        expect(response.body.character).toBeInstanceOf(String)
    })

    it('can submit with updated data', async () => {
        const updatedData = {character: '一', remembered: true, meaning: 'updated meaning', words: '', related: ''}
        await client.post('/api/submission').send(updatedData).expect(201)

        const response = await client.get(`/api/char/${encodeURIComponent('一')}`).expect(200)
        expect(response.body.character).toEqual('一')
        expect(response.body.meaning).toEqual('updated meaning')
    })

    it('returns the details of a specific word', async () => {
        const response = await client.get(`/api/word/${encodeURIComponent('一二')}`).expect(200)
        expect(response.body.word).toBe('一二')
    })

    it('returns some next word', async () => {
        const response = await client.get('/api/word').expect(200)
        expect(response.body.word).toBeInstanceOf(String)
    })

    it('can submit words with updated data', async () => {
        const updatedData = { word: '一二', remembered: true, pinyin: 'yīēr', meaning: 'updated meaning', sentences: '' }
        await client.post('/api/submission').send(updatedData).expect(201)

        const response = await client.get(`/api/word/${encodeURIComponent('一二')}`).expect(200)
        expect(response.body.word).toEqual('一二')
        expect(response.body.meaning).toEqual('updated meaning')
    })
})
