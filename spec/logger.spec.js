import WinstonLogger from '../winston-logger.js'

describe('Winston Logger', () => {
    let stdOutSpy, logger

    beforeEach(() => {
        stdOutSpy = spyOn(console._stdout, 'write')
        logger = new WinstonLogger()
    })

    it('will write info to stdout and format the message', () => {
        logger.info('message %s', 'test')
        expect(stdOutSpy).toHaveBeenCalledOnceWith('info: message test\n')
    })

    it('will write warnings to stdout and format the message', () => {
        logger.warn('message %s', 'test')        
        expect(stdOutSpy).toHaveBeenCalledOnceWith('warn: message test\n')
    })

    it('will write errors to stderr and format the message', () => {
        logger.error('message %s', 'test')        
        expect(stdOutSpy).toHaveBeenCalledOnceWith('error: message test\n')
    })
})
