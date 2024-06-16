import express from 'express'
import NotFound from './not-found.js'

export default function Server(controller) {
    let httpServer
    const app = express()

    app.use('/', express.static('server/web-content'))

    // REVISE ought to be called submissions (plural)
    app.post('/api/submission', express.json(), async (req, res) => {
        // REVISE weird and inconsistent API design (the GET APIs work differently)
        if (req.body.character) {
            await controller.submitCharacter(req.body)
        } else {
            await controller.submitWord(req.body)
        }
        res.status(201).end()
    })

    app.get('/api/character/:char', (req, res) => {
        try {
            res.json(controller.getCharacter(req.params.char))
        } catch (error) {
            if (error instanceof NotFound) {
                res.status(404).end()
            } else {
                throw error
            }
        }
    })

    app.put('/api/character/:char', express.json(), async (req, res) => {
        await controller.updateCharacter({ character: req.params.char, ...req.body })
        res.status(200).end()
    })

    app.get('/api/character', (req, res) => {
        res.json(controller.getNextCharacter())
    })

    app.get('/api/word/:word', (req, res) => {
        try {
            res.json(controller.getWord(req.params.word))
        } catch (error) {
            if (error instanceof NotFound) {
                res.status(404).end()
            } else {
                throw error
            }
        }
    })

    app.get('/api/word', (req, res) => {
        res.json(controller.getNextWord())
    })

    this.start = (port) => {
        return new Promise((resolve, reject) => {
            httpServer = app.listen(port, () => resolve(httpServer.address().port)).on('error', reject)
        })
    }

    this.stop = async () => {
        httpServer.close()
        controller.stop()
    }
}
