export const promiseQueue = (api, batch = false, delay = 1000) => {
    let kill = !batch
    const queue = []

    function waitForQueueToFillUp() {
        return new Promise((resolve) => {
            let intervalId = setInterval(() => {
                if (queue.length || kill) {
                    clearInterval(intervalId)
                    resolve()
                }
            }, delay)
        })
    }

    function* generatorInputQueue() {
        while (true) {
            const config = yield
            const result = { config }
            if (config) {
                const promise = api(config).catch((e) => {
                    result.error = e
                })
                queue.unshift({ promise, result })
            }
        }
    }

    async function* generatorOutputQueue(clearInputQueue) {
        while (true) {
            if (!queue.length) {
                if (kill) {
                    clearInputQueue()
                    break
                }
                await waitForQueueToFillUp()
                continue
            }
            const allConfig = queue.pop()
            const promise = allConfig.promise
            const result = allConfig.result
            try {
                result.data = await promise
            } catch (e) {
                result.error = e
            }
            yield result
        }
    }

    const inputQueue = generatorInputQueue()
    const clearInputStream = () => {
        inputQueue.return()
    }
    const outputQueue = generatorOutputQueue(clearInputStream)
    inputQueue.next()

    return {
        inputQueue,
        outputQueue,
        closeQueue: () => {
            kill = true
        },
    }
}

export default promiseQueue
