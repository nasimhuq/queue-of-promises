# queue-of-promises
**Queue of promises. All promises are executed concurrently as they are added to the input queue. Regardless of which promise resolved earlier, output queue will always keep the order it was executed**

To abort queue of promises please checkout [abort-promise-queue](https://www.npmjs.com/package/@nasimhuq/abort-promise-queue)

Zero-dependency, total size: **`1755 B` uncompressed and `1002 B` gzip-compressed**

Output queue returns an object `{ config, data, error }`
  * On successful response, `data` will contain the response body.
  * On error response, `error` will contain the error message.


# Install

`npm install --save @nasimhuq/queue-of-promises`

# Typical usage

Require as **CJS**

```js
const queueOfPromises = require('@nasimhuq/queue-of-promises');
```

Import as **ES6 Module**
```js
import queueOfPromises from '@nasimhuq/queue-of-promises';
```

# Examples

Example 1: Single batch of requests

```js
import queueOfPromises from '@nasimhuq/queue-of-promises'

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

const test_single_batch = async (resolve) => {
    const { inputQueue, outputQueue } = queueOfPromises(api)
    reqConfigList.forEach((config) => {
        inputQueue.next(config)
    })
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
    resolve() // this resolve is used for display purpose only
}

const test_multiple_batches = async (resolve) => {
    const { inputQueue, outputQueue, closeQueue } = queueOfPromises(api, true, 500)
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
    resolve() // this resolve is used for display purpose only
}

const test_multiple_batches_promise = async () => {
    return new Promise(async (resolve) => {
        test_multiple_batches(resolve);
    })
}

const test_single_batch_promise = async () => {
    return new Promise(async (resolve) => {
        test_single_batch(resolve)
    })
}

const allTests = async () => {
    console.log('---------------------- single batch -------------------------')
    await test_single_batch_promise()
    console.log('------------------------multiple batches ------------------')
    await test_multiple_batches_promise()
}

allTests()

```

# queue-of-promises can be used in node.js

