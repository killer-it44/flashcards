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

    it('supports GET for individual characters', async () => {
        const response = await client.get(`/api/characters/${encodeURIComponent('一')}`).expect(200)
        expect(response.body.hanzi).toEqual('一')
    })

    it('responds with 404 if character does not exist', async () => {
        await client.get(`/api/characters/does-not-exist}`).expect(404)
    })

    it('returns some next character', async () => {
        const response = await client.get('/api/characters').expect(200)
        expect(response.body.hanzi).toBeInstanceOf(String)
    })

    it('can submit characters', async () => {
        const updatedData = { character: '一', remembered: true }
        await client.post('/api/submissions').send(updatedData).expect(201)
        // TODO what's the test now? or is expecting HTTP 201 sufficient?
    })

    it('can update data', async () => {
        await client.put(`/api/characters/${encodeURIComponent('一')}`).send({ meaning: 'updated meaning' }).expect(200)
        const response = await client.get(`/api/characters/${encodeURIComponent('一')}`)
        expect(response.body).toEqual(jasmine.objectContaining({ hanzi: '一', meaning: 'updated meaning' }))
    })

    it('returns the details of a specific expression', async () => {
        // REVISE extract a specific API client class that can be used by the tests and the frontend
        const response = await client.get(`/api/expressions/${encodeURIComponent('一二')}`).expect(200)
        expect(response.body.hanzi).toBe('一二')
    })

    it('responds with 404 if expression does not exist', async () => {
        await client.get(`/api/expressions/does-not-exist}`).expect(404)
    })

    it('can submit expressions', async () => {
        const updatedData = { expression: '一二', remembered: true }
        await client.post('/api/submissions').send(updatedData).expect(201)
        // TODO what's the test now? or is expecting HTTP 201 sufficient?
    })
})
