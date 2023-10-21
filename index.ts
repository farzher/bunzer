import { serve, get, post, response, patch } from './src/bunzer'

get('/hello/some/some', req => 'Hello, World!')
get('/json', req => ({ hello: 'world' }))
get('/hello/:name', req => `Hello, ${req.params.name}!`)
get('/status', req => response(`I'm a teapot`, { status: 418 }))
get('/setheaders', req => response(`brrrr`, { headers: { 'X-Powered-By': 'bunzer' } }))
get('/getheaders', req => req.headers['user-agent'])
get('/ip', req => req.ip)
get('/query', req => req.query) // /query?limit=10
get('/error', req => null.ptr)
get('/async', async req => (await fetch('https://example.com')).text())
patch("/some", req => { hello: 'world' }) // use req.body;

post('/body', req => {
  const { username, message } = JSON.parse(req.body)
})

serve({ hostname: '127.0.0.1', port: 8080, public_folder: 'public' })