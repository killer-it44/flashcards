import fs from 'fs/promises'
import FsRepository from '../fs-repository.js'
import Controller from '../controller.js'

describe('Performance', () => {
    beforeEach(() => fs.mkdir('server/spec/tmp', { recursive: true }))
    afterEach(() => fs.rm('server/spec/tmp', { recursive: true, force: true }))

    it('is <0.1s for loading and saving large data', async () => {
        const expressions = Array.from({ length: 100000 }, (_, i) => ({ data: `test${i}` }))
        await fs.writeFile('server/spec/tmp/expressions.json', JSON.stringify(expressions, null, 2))

        const t0 = Date.now()
        const repo = new FsRepository('server/spec/tmp')
        expect(Date.now() - t0).toBeLessThan(100)
        const t1 = Date.now()
        await repo.save()
        expect(Date.now() - t1).toBeLessThan(100)
    })
})
