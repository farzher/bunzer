// import { parse } from "./src/lib";

// console.log(parse("ip=3248789234&name=lucas"))


import {serve, get, post, response} from './src/bunzer'

get('/hello',       req => 'Hello, World!')
get('/json',        req => ({hello: 'world'}))
get('/hello/:name', req => `Hello, ${req.params.name}!`)
get('/status',      req => response(`I'm a teapot`, {status: 418}))
get('/setheaders',  req => response(`brrrr`, {headers: {'X-Powered-By': 'bunzer'}}))
get('/getheaders',  req => req.headers['user-agent'])
get('/ip',          req => req.ip)
get('/query',       req => req.query) // /query?limit=10
get('/error',       req => null.ptr)
get('/async', async req => (await fetch('https://example.com')).text())

post('/body', req => {
  const {username, message} = JSON.parse(req.body)
})

serve({hostname: '127.0.0.1', port: 8080, public_folder: 'public'})