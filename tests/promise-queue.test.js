import promiseQueue from '../index.js'

const api = (config) => {
    return new Promise((resolve, reject) => {
        const { output } = config
        setTimeout(() => {
            if (output.reject) {
                reject(output)
            } else {
                resolve(output)
            }
        }, output.duration)
    })
}

const multi = 1000

const reqConfigList = [
    {
        output: {
            key: 'First',
            duration: 1000 + multi,
        },
    },
    {
        output: {
            key: 'Second',
            duration: 500 + multi,
        },
    },
    {
        output: {
            key: 'Third',
            duration: 1300,
            reject: true,
        },
    },
    {
        output: {
            key: 'Fourth',
            duration: 1300 + multi * 2,
            reject: true,
        },
    },
    {
        output: {
            key: 'Fifth',
            duration: 1000 + multi * 3,
            reject: true,
        },
    },
    {
        output: {
            key: 'Sixth',
            duration: 900 + multi,
        },
    },
    {
        output: {
            key: 'Seventh',
            duration: 700 + multi,
        },
    },
]

const test_batch = async () => {
    return new Promise(async (resolve) => {
        const { inputQueue, outputQueue, closeQueue } = promiseQueue(api, true)
        inputQueue.next(reqConfigList[0])
        inputQueue.next(reqConfigList[1])
        inputQueue.next(reqConfigList[2])

        const start = Date.now()
        setTimeout(() => {
            console.log('new Batch:', Date.now() - start)
            inputQueue.next(reqConfigList[3])
            inputQueue.next(reqConfigList[4])
            inputQueue.next(reqConfigList[5])
            inputQueue.next(reqConfigList[6])
        }, 3000)

        setTimeout(() => {
            closeQueue() // no more adding new fetch config to inputQueue after this call.
        }, 5000)

        try {
            for await (const res of outputQueue) {
                console.log(res)
                const end = Date.now()
                console.log('duration: ', end - start)
            }
        } catch (e) {
            console.log('something went wrong!')
        }
        console.log('finished')
        resolve()
    })
}

const test_no_batch = async () => {
    return new Promise(async (resolve) => {
        const { inputQueue, outputQueue } = promiseQueue(api)
        inputQueue.next(reqConfigList[0])
        inputQueue.next(reqConfigList[1])
        inputQueue.next(reqConfigList[2])
        inputQueue.next(reqConfigList[3])
        inputQueue.next(reqConfigList[4])
        inputQueue.next(reqConfigList[5])
        inputQueue.next(reqConfigList[6])

        const start = Date.now()
        try {
            for await (const res of outputQueue) {
                console.log(res)
                const end = Date.now()
                console.log('duration: ', end - start)
            }
        } catch (e) {
            console.log('something went wrong!')
        }
        console.log('finished')
        resolve()
    })
}

const allTests = async () => {
    console.log('------------------------ batch ------------------')
    await test_batch()
    console.log('---------------------- no batch -------------------------')
    await test_no_batch()
}

allTests()
