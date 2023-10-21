# Bunzer - the fastest javascript server

- 1 file, 0 dependencies
- 25x faster than Express based on [this benchmark](https://github.com/SaltyAom/bun-http-framework-benchmark/tree/c7e26fe3f1bfee7ffbd721dbade10ad72a0a14ab)


|  Framework       | Average |  Get (/)    |  Params, query & header | Post JSON  |
| ---------------- | ------- | ----------- | ----------------------- | ---------- |
| **bunzer** (bun) | 298,366.237 | 362,260.14 | 270,062.97 | 262,775.6 |
| uws (node) | 259,184.253 | 314,131.09 | 260,835.69 | 202,585.98 |
| bun (bun) | 217,784.367 | 256,266.44 | 199,123.36 | 197,963.3 |
| elysia (bun) | 215,080.713 | 250,485.6 | 205,187.71 | 189,568.83 |
| bun-web-standard (bun) | 199,598.013 | 220,924.03 | 201,743.12 | 176,126.89 |
| stricjs (bun) | 195,869.997 | 225,208.1 | 186,072.39 | 176,329.5 |
| vixeny (bun) | 189,681.683 | 218,870.19 | 185,639.64 | 164,535.22 |
| nhttp (bun) | 171,972.41 | 206,435.07 | 170,289.16 | 139,193 |
| hono (bun) | 166,691.877 | 210,994.98 | 165,364.33 | 123,716.32 |
| hyper-express (node) | 165,968.12 | 236,069.89 | 193,232.91 | 68,601.56 |
| baojs (bun) | 133,058.503 | 167,558.97 | 132,522.8 | 99,093.74 |
| nbit (bun) | 113,735.613 | 137,937.14 | 115,139.05 | 88,130.65 |
| hono (deno) | 109,047.02 | 129,770.14 | 120,337.58 | 77,033.34 |
| hyperbun (bun) | 104,449.793 | 124,138.08 | 107,202.7 | 82,008.6 |
| h3 (node) | 86,557.917 | 95,180.51 | 84,370.79 | 80,122.45 |
| fast (deno) | 74,739.957 | 88,251.24 | 75,445.2 | 60,523.43 |
| cheetah (deno) | 58,555.197 | 110,375.11 | 49,290.99 | 15,999.49 |
| fastify (node) | 52,983.053 | 57,229.67 | 57,187.39 | 44,532.1 |
| oak (deno) | 39,889.113 | 46,447.17 | 43,050.73 | 30,169.44 |
| abc (deno) | 33,383.993 | 42,279.4 | 35,024.77 | 22,847.81 |
| koa (node) | 32,620.467 | 35,640.15 | 34,624.91 | 27,596.34 |
| hapi (node) | 23,069.607 | 34,472.45 | 12,411.66 | 22,324.71 |
| express (bun) | 22,332.733 | 31,868.31 | 25,077.46 | 10,052.43 |
| hono (node) | 13,252.393 | 12,776.93 | 15,258.05 | 11,722.2 |
| express (node) | 12,913.697 | 13,658.09 | 14,221.31 | 10,861.69 |
| nest (node) | 11,989.067 | 12,905.22 | 13,060.53 | 10,001.45 |
| acorn (deno) | 8,149.053 | 13,112.01 | 6,375.24 | 4,959.91 |


## Documentation / Usage Example
```js
import {serve, get, post, response} from 'bunzer'

get('/hello',       req => 'Hello, World!')
get('/json',        req => ({hello: 'world'}))
get('/hello/:name', req => `Hello, ${req.params.name}!`)
get('/status',      req => response(`I'm a teapot`, {status: 418}))
get('/setheaders',  req => response(`brrrr`, {headers: {'X-Powered-By': 'bunzer'}}))
get('/getheaders',  req => req.headers['user-agent'])
get('/ip',          req => req.ip)
get('/query',       req => req.query.limit) // /query?limit=10
get('/error',       req => null.ptr)
get('/async', async req => (await fetch('https://example.com')).text())
patch("/some", req => ({ hello: 'world' })) // use req.body;

post('/body', req => {
  const {username, message} = JSON.parse(req.body)
})

serve({hostname: '127.0.0.1', port: 8080, public_folder: 'public'})
```
