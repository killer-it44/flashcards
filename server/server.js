import express from 'express'

export default function Server(controller) {
    let httpServer
    const app = express()

    app.use('/', express.static('web-content'))
    
    app.post('/api/submission', express.json(), async (req, res) => {
        // TODO weird and inconsistent API design (the GET APIs work differently)
        if (req.body.character) {
            await controller.submitCharacter(req.body)
        } else {
            await controller.submitWord(req.body)
        }
        res.status(201).end()
    })

    app.get('/api/char/:char', (req, res) => {
        res.json(controller.getCharacter(req.params.char))
    })

    app.get('/api/char', (req, res) => {
        res.json(controller.getNextCharacter())
    })

    app.get('/api/word/:word', (req, res) => {
        res.json(controller.getWord(req.params.word))
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
