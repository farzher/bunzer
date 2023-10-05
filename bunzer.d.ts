import { TCPSocket } from "bun";

type handlerResponse = UserResponse | object | string;

export function serve(options: { hostname?: string, port?: number, public_folder?: string })/*: ReturnType<Bun['listen']> */
export function response(content: string | object, options?: ResponseInit): UserResponse
export function any(path: string, handler: (req: BunzerRequest) => Promise<handlerResponse> | handlerResponse): void
export function get(path: string, handler: (req: BunzerRequest) => Promise<handlerResponse> | handlerResponse): void
export function post(path: string, handler: (req: BunzerRequest) => Promise<handlerResponse> | handlerResponse): void
export function put(path: string, handler: (req: BunzerRequest) => Promise<handlerResponse> | handlerResponse): void
export function del(path: string, handler: (req: BunzerRequest) => Promise<handlerResponse> | handlerResponse): void

declare interface BunzerRequest {
    socket: TCPSocket;
    raw_http_request: string;
    start_of_headers: number;
    method: string;
    path: string;
    rawquery?: string;
    params?: Record<string, string>;
    rawquery_index?: number;
    readonly ip: string;
    readonly headers: Record<string, any>;
    readonly body: string;
    readonly query: Record<string, string | string[] | undefined>;
}

declare class UserResponse {
    constructor(content: string | object, options: ResponseInit)
    options: ResponseInit
    content: string
}