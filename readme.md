# Bunzer - the fastest javascript server

- 0 dependencies
- 25x faster than Express based on [this benchmark](https://github.com/SaltyAom/bun-http-framework-benchmark/tree/c7e26fe3f1bfee7ffbd721dbade10ad72a0a14ab)


|  Framework       | Average |  Get (/)    |  Params, query & header | Post JSON  |
| ---------------- | ------- | ----------- | ----------------------- | ---------- |
| **bunzer** (bun) | 290,992.89 | 351,752.4 | 258,006.58 | 263,219.69 |
| uws (node) | 271,934.287 | 324,807.78 | 282,010.8 | 208,984.28 |
| stricjs (bun) | 211,758.63 | 244,350.79 | 201,540.38 | 189,384.72 |
| bun (bun) | 210,171.453 | 245,276.53 | 194,902.84 | 190,334.99 |
| elysia (bun) | 204,060.407 | 239,145.74 | 194,002.53 | 179,032.95 |
| vixeny (bun) | 202,902.85 | 239,673.63 | 195,136.87 | 173,898.05 |
| bun-web-standard (bun) | 195,624.51 | 221,856.49 | 193,418.71 | 171,598.33 |
| hono (bun) | 195,316.583 | 230,039.35 | 189,619.79 | 166,290.61 |
| hyper-express (node) | 181,283.953 | 264,850.2 | 206,035.26 | 72,966.4 |
| nhttp (bun) | 169,546.29 | 203,334.46 | 166,325.49 | 138,978.92 |
| hyperbun (bun) | 135,741.65 | 176,029.13 | 141,189.48 | 90,006.34 |
| baojs (bun) | 129,005.473 | 157,340.56 | 129,675.62 | 100,000.24 |
| nbit (bun) | 123,564.49 | 160,011.83 | 119,921.27 | 90,760.37 |
| hono (deno) | 114,346.643 | 143,572.7 | 119,259.84 | 80,207.39 |
| h3 (node) | 95,735.03 | 112,002.53 | 91,882.63 | 83,319.93 |
| fast (deno) | 72,391.303 | 87,008.67 | 73,472.3 | 56,692.94 |
| cheetah (deno) | 60,504.143 | 116,772.84 | 49,150.96 | 15,588.63 |
| fastify (node) | 54,797.9 | 61,347.28 | 60,196.14 | 42,850.28 |
| oak (deno) | 39,847.05 | 45,904.66 | 42,388.43 | 31,248.06 |
| abc (deno) | 32,775.37 | 37,585.89 | 36,457.6 | 24,282.62 |
| koa (node) | 32,396.097 | 34,922.5 | 34,921.78 | 27,344.01 |
| express (bun) | 22,201.867 | 28,786.05 | 26,827.65 | 10,991.9 |
| hapi (node) | 21,129.03 | 31,055.6 | 11,796.38 | 20,535.11 |
| express (node) | 12,860.1 | 13,341.24 | 14,412.51 | 10,826.55 |
| hono (node) | 12,655.18 | 12,657.67 | 14,726.59 | 10,581.28 |
| nest (node) | 11,410.397 | 11,719 | 12,785.16 | 9,727.03 |
| acorn (deno) | 8,122.503 | 13,291 | 6,105.49 | 4,971.02 |


## Documentation / Usage Example
```js
import {serve, get, post, response} from 'bunzer'

get('/hello',       req => 'Hello, World!')
get('/json',        req => ({hello: 'world'}))
get('/hello/:name', req => `Hello, ${req.params.name}!`)
get('/status',      req => response(`I'm a teapot`, {status: 418}))
get('/contenttype', req => response(`{"a": 1}`, {content_type: 'application/json'}))
get('/setheaders',  req => response(`brrrr`, {headers: {'X-Powered-By': 'bunzer'}}))
get('/getheaders',  req => req.headers['user-agent'])
get('/ip',          req => req.ip)
get('/query',       req => req.query.limit) // /query?limit=10
get('/error',       req => null.ptr)
get('/async', async req => (await fetch('https://example.com')).text())

post('/body', req => {
  const {username, message} = JSON.parse(req.body)
})

serve({hostname: '127.0.0.1', port: 8080, public_folder: 'public'})
```
