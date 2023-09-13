
// start the server listening on a port
export function serve({hostname='0.0.0.0', port=8080, public_folder=undefined}={}) {
  Bun.listen({hostname, port, socket: {

    // message chunk received from the client
    data(socket, data) {

      // create a new request object. this is just an empty context for us to store information
      // about this request to pass to the user callbacks
      const req = new_request()
      req.socket = socket

      // parse the first line of the http request
      // parsing a raw http request in javascript is very slow and dumb but i don't know a faster alternative
      req.raw_http_request = data.toString('ascii') // ascii seems faster than utf-8
      let cursor = req.raw_http_request.indexOf('\r\n')
      const line0 = req.raw_http_request.slice(0, cursor)
      cursor += 2
      req.start_of_headers = cursor
      const first_space = line0.indexOf(' ')
      req.method = line0.slice(0, first_space)
      req.path = line0.slice(first_space+1, line0.indexOf(' ', first_space+1))

      // routing. match the path to its handler function
      const handler = router_find(req)
      if(handler) {
        const response = handler(req)
        if(!response) return send_200(socket)
        if(is_response(response)) return send_userresponse(socket, response)
        if(is_promise(response)) {
          return response.then(response => is_response(response)
                                           ? send_userresponse(socket, response)
                                           : (is_obj(response) ? send_fast_json(socket, response) : send_fast_text(socket, response))
          )
          .catch(e => {log(e); send_500(socket)})
        }
        // if(is_promise(response)) return response.then(r => is_response(r) ? send_userresponse(socket, r) : send_fast(socket, r)).catch(e => {log(e); send_500(socket)})
        return (is_obj(response) ? send_fast_json(socket, response) : send_fast_text(socket, response))
        // return send_fast(socket, response)
      }

      // no handler exists for this route, try to serve this path as a file from the public folder
      if(public_folder) {
        if(req.path[req.path.length-1] === '/') req.path += 'index.html'
        return send_file(socket, `${public_folder}/${req.path}`)
      }

      return send_404(socket)
    },

    error(socket, error) {
      log('i caught an error')
      log(error)
      send_500(socket)
    }, },
  })
}


// request context stuff
// todo object pooling? making new requests for every request sounds slow
const querystring = require('node:querystring')
class Request {
  get ip() { return this.headers?.['x-forwarded-for'] || this.socket.remoteAddress }

  get headers() {
    if(this._headers) return this._headers
    this._headers = {}

    // todo maybe faster to search for indexOf rather than incrementing cursor?
    let start_of_line = this.start_of_headers
    let cursor = start_of_line
    let colon_pos = -1
    const len = this.raw_http_request.length
    for(;cursor <= len;) {
      if(this.raw_http_request[cursor] === '\r' && this.raw_http_request[cursor+1] === '\n') {
        if(cursor === start_of_line) break
        let end_of_line = cursor
        const header_name  = this.raw_http_request.slice(start_of_line, colon_pos)
        const header_value = this.raw_http_request.slice(colon_pos+2, end_of_line)
        this._headers[header_name] = header_value
        cursor += 2
        start_of_line = cursor
        continue
      } else if(this.raw_http_request[cursor] === ':' && this.raw_http_request[cursor+1] === ' ') colon_pos = cursor
      cursor += 1
    }

    this.start_of_body = start_of_line+2

    return this._headers
  }

  get body()  {
    this.headers // ensure headers are parsed before we can get the body
    return this.raw_http_request.slice(this.start_of_body)
  }

  get query() {return querystring.parse(this.rawquery) }

}
function new_request() {return new Request()}


// sending responses stuff
export function response(content, options) {return new UserResponse(content, options) }
class UserResponse {
  constructor(content, options) {
    this.options = options || {}

    if(typeof content === 'object') {
      this.content = JSON.stringify(content)
      this.options.content_type = 'application/json'
    } else {
      this.content = content || ''
    }

  }
}
function send_userresponse(socket, userresponse) {
  let defined_count = 0
  if(userresponse.options.headers !== undefined) defined_count += 1
  if(userresponse.options.content_type !== undefined) defined_count += 1
  if(userresponse.options.status !== undefined) defined_count += 1
  if(defined_count === 1) {
    if(userresponse.options.headers !== undefined) return send_fast_headers(socket, userresponse.content, userresponse.options.headers)
    if(userresponse.options.content_type !== undefined) return send_fast_content_type(socket, userresponse.content, userresponse.options.content_type)
    return send_fast_status(socket, userresponse.content, userresponse.options.status)
  }
  send(socket, userresponse.content, userresponse.options)
}

function send_200(socket) {socket.write('HTTP/1.1 200\r\nContent-Length: 0\r\n\r\n'); socket.flush()}
function send_400(socket) {socket.write('HTTP/1.1 400\r\nContent-Length: 0\r\n\r\n'); socket.flush()}
function send_404(socket) {socket.write('HTTP/1.1 404\r\nContent-Length: 0\r\n\r\n'); socket.flush()}
function send_500(socket) {socket.write('HTTP/1.1 500\r\nContent-Length: 0\r\n\r\n'); socket.flush()}

// this is faster because it doesn't have arguments for status, headers, etc
// just adding these variable makes it a lot slower ...
// function send_fast(socket, content) {

//   let content_type = 'text/plain'
//   if(typeof content === 'object') {
//     content_type = 'application/json'
//     content = JSON.stringify(content)
//   } else {
//     if(!content) content = ''
//   }

//   const response = `HTTP/1.1 200\r\nContent-Length: ${content.length}\r\nContent-Type: ${content_type}\r\n\r\n${content}`
//   socket.write(response); socket.flush()
// }
// function send_fast_json(socket, obj) {
//   const content = Bun.gzipSync(JSON.stringify(obj))
//   const response = `HTTP/1.1 200\r\nContent-Length: ${content.length}\r\nContent-Type: application/json\r\nContent-Encoding: gzip\r\n\r\n`
//   socket.write(response); socket.write(content); socket.flush()
// }
function send_fast_json(socket, obj) {
  const content = JSON.stringify(obj)
  const response = `HTTP/1.1 200\r\nContent-Length: ${content.length}\r\nContent-Type: application/json\r\n\r\n${content}`
  socket.write(response); socket.flush()
}
function send_fast_text(socket, content) {
  const response = `HTTP/1.1 200\r\nContent-Length: ${content.length}\r\n\r\n${content}`
  socket.write(response); socket.flush()
}
function send_fast_headers(socket, content, headers) {
  let headers_str = ''
  for(const key in headers) headers_str += `${key}: ${headers[key]}\r\n`
  const response = `HTTP/1.1 200\r\nContent-Length: ${content.length}\r\n${headers_str}\r\n${content}`
  socket.write(response); socket.flush()
}
function send_fast_content_type(socket, content, content_type) {
  const response = `HTTP/1.1 200\r\nContent-Length: ${content.length}\r\nContent-Type: ${content_type}\r\n\r\n${content}`
  socket.write(response); socket.flush()
}
function send_fast_status(socket, content, status) {
  const response = `HTTP/1.1 ${status}\r\nContent-Length: ${content.length}\r\n\r\n${content}`
  socket.write(response); socket.flush()
}

function send(socket, content, {status=200, content_type='text/plain', headers}={}) {

  // headers obj to http response string
  let headers_str = ''
  if(headers) {
    for(const key in headers) headers_str += `${key}: ${headers[key]}\r\n`
  }

  let response = `HTTP/1.1 ${status}\r\nContent-Length: ${content.length}\r\nContent-Type: ${content_type}\r\n${headers_str}\r\n${content}`
  socket.write(response); socket.flush()
}

// this is slow. bun does not support quick sendfile... yet? (v1.0)
async function send_file(socket, filepath) {
  try {
    const file = Bun.file(filepath)
    const file_content = await file.text()

    send(socket, file_content, {
      content_type: file.type,
      headers: {
        'Referrer-Policy': 'no-referrer',
        'Cache-Control': 'public,max-age=604800,immutable',
      }
    })
  } catch(e) {send_404(socket)}
}




// helpers
function is_dev() {return process.env.NODE_ENV != 'production'}
function log(...args) {if(!is_dev) return; console.log(...args)}
function is_response(x) {return x instanceof UserResponse}
function is_promise(x) {return x instanceof Promise}
function is_obj(x) { return typeof x === 'object' } // faster as a function


// router stuff
export function any(path, handler)  {router_add(path, handler)}
export function get(path, handler)  {router_add(path, handler)}
export function post(path, handler) {router_add(path, handler)}

const static_routes = new Map()
const dynamic_routes = []
function new_dyanmic_route(path, handler) {
  const parts = path.split('/'); parts.shift()
  const info = []
  for(let i=0; i<parts.length; i++) {
    const part = parts[i]
    if(!is_named_part(part)) continue
    info.push({name: parts[i].slice(1), index: i})
  }
  return {parts, handler, info}
}

function router_find(req) {
  let path = req.path

  // search static routes
  const handler = static_routes.get(path)
  if(handler) return handler

  // remove ? if it exists then search static routes again
  const question_index = path.indexOf('?')
  if(question_index !== -1) {
    req.rawquery = path.slice(question_index+1)
    path = path.slice(0, question_index)
    const handler = static_routes.get(path)
    if(handler) return handler
  }

  // search dynamic routes
  const parts = path.split('/'); parts.shift()
  outer: for(let i=0; i<dynamic_routes.length; i++) {
    const route = dynamic_routes[i]
    if(route.parts.length !== parts.length) continue
    for(let i=0; i<parts.length; i++) {
      if(is_named_part(route.parts[i])) continue
      if(route.parts[i] !== parts[i]) continue outer
    }
    // found a matching route
    // set the request's params then return its handler
    req.params = {}
    for(const info of route.info) {
      req.params[info.name] = parts[info.index]
    }
    return route.handler
  }
}
function router_add(path, handler) {
  if(path[0] != '/') path = `/${path}` // ensure leading slash

  const parts = path.split('/'); parts.shift()
  const contains_named_part = parts.some(is_named_part)

  if(!contains_named_part) return static_routes.set(path, handler)

  // it's a dynamic route
  dynamic_routes.push(new_dyanmic_route(path, handler))

  // let static_parts = []
  // for(let i=0; i<parts.length; i++) {
  //   const part = parts[i]
  //   if(!is_named_part(part)) {
  //     static_parts.push(part)
  //   } else {
  //     // const static_parts.join('/')
  //   }
  // }

}

function is_named_part(part) {return part[0] === ':'}
