type handlerResponse = UserResponse | object | string;

export function serve(options: { hostname?: string, port?: number, public_folder?: string })/*: ReturnType<Bun['listen']> */
export function response(content: string | object, options?: ResponseInit): UserResponse
export function any(path: string, handler: (req: BunzerRequest) => Promise<handlerResponse> | handlerResponse): void
export function get(path: string, handler: (req: BunzerRequest) => Promise<handlerResponse> | handlerResponse): void
export function post(path: string, handler: (req: BunzerRequest) => Promise<handlerResponse> | handlerResponse): void
export function put(path: string, handler: (req: BunzerRequest) => Promise<handlerResponse> | handlerResponse): void
export function del(path: string, handler: (req: BunzerRequest) => Promise<handlerResponse> | handlerResponse): void

declare class BunzerRequest {
    raw_http_request: string;
    method: string;
    path: string;
    params?: Record<string, string>;
    rawquery_index?: number;
    start_of_body?: number;
    private socket: any/* import('bun')['TCPSocket'] */;
    private _headers?: this['headers'];
    get ip(): string;
    get headers(): Record<string, any>;
    get body(): string;
    get query(): Record<string, string | string[] | undefined>;
}

declare class UserResponse {
    constructor(content: string | object, options: Omit<ResponseInit, 'statusText'>)
    options: Omit<ResponseInit, 'statusText'>
    content: string
}