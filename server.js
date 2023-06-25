import express from 'express'

export default function Server(controller) {
    let httpServer
    const app = express()

    app.use('/', express.static('web-content'))
    
    app.post('/api/submission', express.json(), async (req, res) => {
        if (req.body.character) {
            await controller.submit(req.body)
        } else {
            await controller.submitWord(req.body)
        }
        res.status(201).end()
    })

    app.get('/api/char/:char', (req, res) => {
        res.json(controller.get(req.params.char))
    })

    app.get('/api/char', (req, res) => {
        res.json(controller.getNext())
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
