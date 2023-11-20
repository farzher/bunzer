import { querystring } from "./lib";
import chalk from "chalk";

export async function LauriStart(ip, port) {
  if(typeof ip !== "string") throw new Error("ip must be a string")
  if(typeof port !== "number") throw new Error("port must be a number")
  console.log(`
${chalk.red.bold(` 
     +-.                   :#*==+#@@@@@.          |                         ${chalk.blue.bold("Lauri v0.1")}
     -@@@@@#:         .  -%@@@@@@@@@@@@+          |                     ${chalk.green.bold(`http://${ip}:${port}`)}
       -%@@@@@#*=     .+%@@@@@@@@@@@@@@@@*-       | 
         -*@@@@@@#:    %@@@@@@@@@@@@@@%=:...      | 
           .*@@@@@@=  -@@@@@@@@@@@@@@@@=          | 
    +.       -%@@@@@#:%@@@@@@@@@@@@#+---:         | 
 - -%.:.       #@@@@@@@@@@@@@@@@#-                | 
 #*@@@@@@#=--==%@@@@@@@@@@@@@@@+                  |                       ${chalk.yellow.bold("@Bunland/Lauri")}
 #@@@@@@@@@@@@@@@@@@@@@@@@@@@@@.            .     | 
 #@@@@@#+@@@@@@@@@@@@@@@@@@@@@@           .=#     | 
 .@@@@%. :#@@@@@@@@@@@@@@@@@@@*       .-+@@+.     | 
   *@@+     =@@@@@@@@@@@@@@@@@%+.    :%*.         | 
   =@%#.     :@@@@@@@@@@@@@@@@@@%=   =@           | 
    ..     -#@@@@@@@@@@@@@@@@@@@@%*. =@:          | 
        -#%%%+:  .%@@@@@@@@@@@@@@@@@+:%@+:        | 
     :*%%+  :    :@@@+@@++%@@@@@@@@@@@#@@@@%*+=-  | 
       +=        %@@-=@@+  @@%@@@@@@@@@@@@@@@@@@@ |
                #@@%@%*-. #@@= -+%@@@@@@@@@@@@@#= |  
             -=*@#*=- .=+@@@-      ..:------:.    |`)}
`)
}

// start the server listening on a port
export function serve({
  hostname = "127.0.0.1",
  port = 8080,
  public_folder = undefined,
} = {}) {
  return Bun.listen({
    hostname,
    port,
    socket: {
      // message chunk received from the client
      data(socket, data) {
        // create a new request object. this is just an empty context for us to store information
        // about this request to pass to the user callbacks
        const req = new_request();
        req.socket = socket;

        // parse the first line of the http request
        // parsing a raw http request in javascript is very slow and dumb but i can't find a faster alternative
        const raw_http_request = data.toString("ascii"); // ascii seems faster than utf-8
        req.raw_http_request = raw_http_request;

        let first_space = 0;
        for (let i = 0; i < raw_http_request.length; i++) {
          if (raw_http_request.charCodeAt(i) === 32 /* */) {
            first_space = i;
            break;
          }
        }

        let second_space = 0;
        for (let i = first_space + 2; i < raw_http_request.length; i++) {
          if (raw_http_request.charCodeAt(i) === 32 /* */) {
            second_space = i;
            break;
          }
        }

        req.method = raw_http_request.slice(0, first_space);
        req.path = raw_http_request.slice(first_space + 1, second_space);

        // routing. match the path to its handler function
        const handler = router_find(req);
        if (handler) {
          // this is a wet mess because async/await and Promise.resolve is too slow
          const response = handler(req);
          if (!response) return send_200(socket);
          if (is_response(response))
            return send(socket, response.content, response.options);
          if (is_promise(response))
            return response
              .then((response) => {
                if (!response) return send_200(socket);
                if (is_response(response))
                  return send(socket, response.content, response.options);
                if (is_obj(response)) return send_fast_json(socket, response);
                return send_fast_text(socket, response.toString());
              })
              .catch((e) => {
                console.error(e);
                return send_500(socket);
              });
          if (is_obj(response)) return send_fast_json(socket, response);
          return send_fast_text(socket, response.toString());
        }

        // no handler exists for this route, try to serve this path as a file from the public folder
        if (public_folder) {
          if (req.path.charCodeAt(req.path.length - 1) === 47 /*/*/)
            req.path += "index.html";
          // @perf could check if the file exists using a bloom filter first to 10x the performance of 404s
          // (i've already implemented and benched this, but left it out because meh, it's a lot of code)
          return send_file(socket, `${public_folder}${req.path}`);
        }

        // i'd prefer to respond with Cannot GET / but meh, that creates garbage
        // return send(socket, `Cannot ${req.method} ${req.path}`, {status: 404})
        return send_404(socket);
      },

      // todo: when we write too much data to a socket, we have to wait
      // for this drain thing to be called then write more ... this is so annoying
      // currently sending large data that would require multiple writes breaks
      // until this is implemented. this is a part of uws, the http server bun uses internally
      // drain() {},

      error(socket, error) {
        send_500(socket);
        console.error(error);
      },
    },
  });
}

// request context stuff
// todo object pooling? making new requests for every request sounds slow
// fast-querystring is faster than node:querystring but i'd rather not have a dependency
// import querystring from 'fast-querystring'
// const querystring = require("node:querystring");
class Request {
  get ip() {
    return this.socket.remoteAddress;
  }

  get headers() {
    if (this._headers) return this._headers;
    const headers = {};

    const raw_http_request = this.raw_http_request;

    let start_of_headers = 0;
    for (let i = 12; i < raw_http_request.length; i++) {
      if (
        raw_http_request.charCodeAt(i) === 13 /*\r*/ &&
        raw_http_request.charCodeAt(i + 1) === 10 /*\n*/
      ) {
        start_of_headers = i + 2;
        break;
      }
    }

    let start_of_line = start_of_headers;
    let cursor = start_of_line;
    let colon_pos = -1;
    for (; cursor <= raw_http_request.length;) {
      if (
        raw_http_request.charCodeAt(cursor) === 13 /*\r*/ &&
        raw_http_request.charCodeAt(cursor + 1) === 10 /*\n*/
      ) {
        if (cursor === start_of_line) break;
        let end_of_line = cursor;
        const header_name = raw_http_request.slice(start_of_line, colon_pos);
        const header_value = raw_http_request.slice(colon_pos + 2, end_of_line);
        headers[header_name] = header_value;
        cursor += 2;
        start_of_line = cursor;
        continue;
      } else if (
        raw_http_request.charCodeAt(cursor) === 58 /*:*/ &&
        raw_http_request.charCodeAt(cursor + 1) === 32 /* */
      )
        colon_pos = cursor;
      cursor += 1;
    }

    this.start_of_body = start_of_line + 2;

    this._headers = headers;
    return headers;
  }

  get body() {
    this.headers; // ensure headers are parsed before we can get the body
    return this.raw_http_request.slice(this.start_of_body);
  }

  get query() {
    // //[0.55ms] process
    // console.time('process')
    // console.log(parsec(this.path.slice(this.rawquery_index)))
    // console.timeLog('process')
    // //[1.63ms] process
    // console.time('process')
    // console.log(querystring.parse(this.path.slice(this.rawquery_index)));
    // console.timeLog('process')

    return querystring(this.path.slice(this.rawquery_index));
  }
}
function new_request() {
  return new Request();
}

// sending responses stuff
export function response(content, options) {
  return new UserResponse(content, options);
}
class UserResponse {
  constructor(content, options) {
    this.options = options || {};

    if (typeof content === "object") {
      this.content = JSON.stringify(content);
      if (this.options.headers === undefined) this.options.headers = {};
      this.options.headers["Content-Type"] = "application/json";
    } else {
      this.content = content || "";
    }
  }
}

function send_200(socket) {
  socket.write("HTTP/1.1 200\r\nContent-Length: 0\r\n\r\n");
  socket.flush();
}
function send_400(socket) {
  socket.write("HTTP/1.1 400\r\nContent-Length: 0\r\n\r\n");
  socket.flush();
}
function send_404(socket) {
  socket.write("HTTP/1.1 404\r\nContent-Length: 0\r\n\r\n");
  socket.flush();
}
function send_500(socket) {
  socket.write("HTTP/1.1 500\r\nContent-Length: 0\r\n\r\n");
  socket.flush();
}

function send_fast_json(socket, obj) {
  const content = JSON.stringify(obj);
  const response = `HTTP/1.1 200\r\nContent-Length: ${content.length}\r\nContent-Type: application/json\r\n\r\n${content}`;
  socket.write(response);
  socket.flush();
}
function send_fast_text(socket, content) {
  const response = `HTTP/1.1 200\r\nContent-Length: ${content.length}\r\n\r\n${content}`;
  socket.write(response);
  socket.flush();
}
function send_fast_headers(socket, content, headers) {
  let headers_str = "";
  for (const key in headers) headers_str += `${key}: ${headers[key]}\r\n`;
  const response = `HTTP/1.1 200\r\nContent-Length: ${content.length}\r\n${headers_str}\r\n${content}`;
  socket.write(response);
  socket.flush();
}
function send_fast_status(socket, content, status) {
  const response = `HTTP/1.1 ${status}\r\nContent-Length: ${content.length}\r\n\r\n${content}`;
  socket.write(response);
  socket.flush();
}

function send(socket, content, { status = 200, headers } = {}) {
  // headers obj to http response string
  let headers_str = "";
  if (headers)
    for (const key in headers) headers_str += `${key}: ${headers[key]}\r\n`;

  let response = `HTTP/1.1 ${status}\r\nContent-Length: ${content.length}\r\n${headers_str}\r\n${content}`;
  socket.write(response);
  socket.flush();
}

// send_file is slow. bun does not support quick sendfile... yet? (v1.0)
// using fs instead of Bun.file because Bun.file doesn't work https://github.com/oven-sh/bun/issues/1446
import { FS } from "@bunland/fs";
const fs = new FS();

async function send_file(socket, filepath) {
  if (await fs.exists(filepath)) {
    send(socket, await fs.readFile(filepath), {
      headers: {
        "Content-Type": Bun.file(filepath).type,
        "Referrer-Policy": "no-referrer",
        "Cache-Control": "public,max-age=604800,immutable",
      },
    });
  }
}

// helpers
function is_response(x) {
  return x instanceof UserResponse;
}
function is_promise(x) {
  return x instanceof Promise;
}
function is_obj(x) {
  return typeof x === "object";
}

// router stuff
// custom methods aren't supported because i've never used them
export function any(path, handler) {
  router_add(0, path, handler);
}
export function get(path, handler) {
  router_add(1, path, handler);
}
export function post(path, handler) {
  router_add(2, path, handler);
}
export function put(path, handler) {
  router_add(3, path, handler);
}
export function del(path, handler) {
  router_add(4, path, handler);
}
export function patch(patch, handler) {
  router_add(5, patch, handler);
}


function method_to_method_id(method) {
  if (method.charCodeAt(1) === 85 /*U*/) return 3;
  if (method.charCodeAt(1) === 65 /*PATCH*/) return 5;
  switch (method.charCodeAt(0)) {
    case 71 /*G*/:
      return 1;
    case 80 /*P*/:
      return 2;
    case 68 /*D*/:
      return 4;
    default:
      return 0;
  }
}

const static_routes_by_method = [
  new Map(),
  new Map(),
  new Map(),
  new Map(),
  new Map(),
  new Map(),
];

const static_routes = static_routes_by_method[0];
const dynamic_routes_by_method = [[], [], [], [], [], []];
const dynamic_routes = dynamic_routes_by_method[0];

function new_dyanmic_route(path, handler) {
  const parts = path.slice(1).split("/");
  const info = [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!is_named_part(part)) continue;
    info.push({ name: parts[i].slice(1), index: i });
  }
  return { parts, handler, info };
}

function router_add(method_id, path, handler) {

  if (path[0] != "/") path = `/${path}`; // ensure leading slash

  const parts = path.slice(1).split("/");
  const contains_named_part = parts.some(is_named_part);

  if (!contains_named_part) {
    static_routes.set(path, handler);
    if (method_id) static_routes_by_method[method_id].set(path, handler);
    return;
  }

  // it's a dynamic route
  const dynamic_route_info = new_dyanmic_route(path, handler);
  dynamic_routes.push(dynamic_route_info);
  if (method_id) dynamic_routes_by_method[method_id].push(dynamic_route_info);
}

function router_find(req) {
  let path = req.path;
  let method_id = method_to_method_id(req.method);

  // search static routes
  const the_static_routes = static_routes_by_method[method_id];
  const handler = the_static_routes.get(path);
  if (handler) return handler;

  // remove ? if it exists then search static routes again
  for (let i = 0; i < path.length; i++) {
    if (path.charCodeAt(i) === 63 /*?*/) {
      req.rawquery_index = i + 1;
      path = path.slice(0, i);
      const handler = the_static_routes.get(path);
      if (handler) return handler;
    }
  }

  // search dynamic routes
  const parts = path.slice(1).split("/");
  const the_dyanmic_routes = dynamic_routes_by_method[method_id];
  outer: for (let i = 0; i < the_dyanmic_routes.length; i++) {
    const route = the_dyanmic_routes[i];
    if (route.parts.length !== parts.length) continue;
    for (let i = 0; i < parts.length; i++) {
      if (is_named_part(route.parts[i])) continue;
      if (route.parts[i] !== parts[i]) continue outer;
    }
    // found a matching route
    // set the request's params then return its handler
    req.params = {};
    for (const info of route.info) req.params[info.name] = parts[info.index];
    return route.handler;
  }
}

function is_named_part(part) {
  return part.charCodeAt(0) === 58; /*:*/
}
