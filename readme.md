# Bunzer - the fastest javascript server


20x faster than Express based on [this benchmark](https://github.com/SaltyAom/bun-http-framework-benchmark/tree/c7e26fe3f1bfee7ffbd721dbade10ad72a0a14ab#results)


|  Framework       | Average |  Get (/)    |  Params, query & header | Post JSON  |
| ---------------- | ------- | ----------- | ----------------------- | ---------- |
| **bunzer** (bun) | 285,762.363 | 342,871.54 | 260,395.69 | 254,019.86 |
| uws (node) | 278,776.167 | 322,555.4 | 295,197.79 | 218,575.31 |
| stricjs (bun) | 216,630.463 | 245,057.11 | 207,736.29 | 197,097.99 |
| elysia (bun) | 214,890.317 | 251,968.29 | 202,802.69 | 189,899.97 |
| bun (bun) | 213,534.33 | 249,512.44 | 196,581.78 | 194,508.77 |
| vixeny (bun) | 208,969.307 | 238,919.74 | 200,920.93 | 187,067.25 |
| hono (bun) | 201,313.597 | 232,681.33 | 203,405.59 | 167,853.87 |
| bun-web-standard (bun) | 195,904.55 | 216,791.66 | 194,000.6 | 176,921.39 |
| nhttp (bun) | 191,891.073 | 241,789.94 | 181,050.04 | 152,833.24 |
| hyper-express (node) | 184,534.003 | 268,293.51 | 210,629.1 | 74,679.4 |
| hyperbun (bun) | 146,633.573 | 192,520.17 | 147,533.49 | 99,847.06 |
| baojs (bun) | 136,181.91 | 171,221.71 | 132,735.77 | 104,588.25 |
| nbit (bun) | 135,690.673 | 173,464.2 | 132,190.21 | 101,417.61 |
| hono (deno) | 118,515.623 | 145,397.44 | 126,152.89 | 83,996.54 |
| h3 (node) | 94,372.367 | 105,242.89 | 92,487.06 | 85,387.15 |
| fast (deno) | 78,733.583 | 90,591.24 | 79,986.06 | 65,623.45 |
| fastify (node) | 56,487.12 | 64,370.5 | 59,750.54 | 45,340.32 |
| oak (deno) | 43,052.537 | 50,180.03 | 45,907.46 | 33,070.12 |
| abc (deno) | 36,408.973 | 44,033.83 | 38,891.68 | 26,301.41 |
| koa (node) | 35,385.217 | 39,107.29 | 37,100.94 | 29,947.42 |
| hapi (node) | 22,709.927 | 32,911.79 | 12,654.89 | 22,563.1 |
| hono (node) | 13,911.717 | 14,163.89 | 16,205.51 | 11,365.75 |
| express (node) | 13,799.197 | 13,830.7 | 15,729.42 | 11,837.47 |
| nest (node) | 12,378.507 | 12,913.46 | 13,642.93 | 10,579.13 |
| acorn (deno) | 8,675.513 | 14,187.87 | 6,607.04 | 5,231.63 |


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
get('/async', async req => (await fetch('https://example.com').text()))

post('/body', req => {
  const {username, message} = JSON.parse(req.body)
})

serve({hostname: 'localhost', port: 8080, public_folder: 'public'})
```