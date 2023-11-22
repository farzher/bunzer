import "reflect-metadata";
import { TCPSocket } from "bun";

type ServiceMetaData = {
    absolutePath: string
    semantic: boolean
    initRouteWithServiceName: boolean
    fakeName: string
    originalName: string
}

type OptionsService = {
    path: string
    semantic?: boolean
    initRouteWithServiceName?: boolean
}

export function Service(options: OptionsService) {
    return function(target: Function){
        const semantic_value = options?.semantic ?? true
        const initRoute_value = options?.initRouteWithServiceName ?? true
        Reflect.defineMetadata("service", { semantic: semantic_value, initRouteWithServiceName: initRoute_value, fakeName: target.name.charAt(0).toLowerCase() + target.name.slice(1), originalName: target.name, absolutePath: options.path }, target.prototype)
    }
}

export interface Request {
    socket: TCPSocket
    raw_http_request: string
    method: string
    ip: string
    headers: Array<string>
    body: string
    query: string
    params: {[key:string]:string}
}

type RouteMetaData = {
    type: "get" | "post" | "patch"
    route: string
    async: boolean
}

export function Get() {
    return function(target: Object, propertyKey: string, descriptor: PropertyDescriptor): void {
        Reflect.defineMetadata(propertyKey, { type: "get", route: "/" + propertyKey, async: descriptor.value.toString().startsWith("async") }, target.constructor.prototype)
    }
}
export function Post(){
    return function(target: Object, propertyKey: string, descriptor: PropertyDescriptor): void {
        Reflect.defineMetadata(propertyKey, { type: "post", route: "/" + propertyKey, async: descriptor.value.toString().startsWith("async") }, target.constructor.prototype)
    }
}

export function Patch(){
    return function(target: Object, propertyKey: string, descriptor: PropertyDescriptor): void {
        Reflect.defineMetadata(propertyKey, { type: "patch", route: "/" + propertyKey, async: descriptor.value.toString().startsWith("async") }, target.constructor.prototype)
    }
}

export function Body(target: Object, propertyKey: string, parameterIndex: number): void {
    if(!Reflect.hasMetadata(`${propertyKey}:params`, target.constructor.prototype)) Reflect.defineMetadata(`${propertyKey}:params`, [],
        target.constructor.prototype)
    const md = Reflect.getMetadata(`${propertyKey}:params`, target.constructor.prototype) as ParamsMetaData
    md.push({ type: "body", index: parameterIndex })
    Reflect.defineMetadata(`${propertyKey}:params`, md, target.constructor.prototype)
}

export function Query(target: Object, propertyKey: string, parameterIndex: number): void {
    if(!Reflect.hasMetadata(`${propertyKey}:params`, target.constructor.prototype)) Reflect.defineMetadata(`${propertyKey}:params`, [],
        target.constructor.prototype)
    const md = Reflect.getMetadata(`${propertyKey}:params`, target.constructor.prototype) as ParamsMetaData
    md.push({ type: "query", index: parameterIndex })
    Reflect.defineMetadata(`${propertyKey}:params`, md, target.constructor.prototype)
}

export function QueryAttribute(name: string){
    return function(target: Object, propertyKey: string, parameterIndex: number): void {
        if(!Reflect.hasMetadata(`${propertyKey}:params`, target.constructor.prototype)) Reflect.defineMetadata(`${propertyKey}:params`, [],
            target.constructor.prototype)
        const md = Reflect.getMetadata(`${propertyKey}:params`, target.constructor.prototype) as ParamsMetaData
        md.push({ name: name, type: "query_attribute", index: parameterIndex })
        Reflect.defineMetadata(`${propertyKey}:params`, md, target.constructor.prototype)
    }
}

export function BodyAttribute(name: string){
    return function(target: Object, propertyKey: string, parameterIndex: number): void {
        if(!Reflect.hasMetadata(`${propertyKey}:params`, target.constructor.prototype)) Reflect.defineMetadata(`${propertyKey}:params`, [],
            target.constructor.prototype)
        const md = Reflect.getMetadata(`${propertyKey}:params`, target.constructor.prototype) as ParamsMetaData
        md.push({ name: name, type: "body_attribute", index: parameterIndex })
        Reflect.defineMetadata(`${propertyKey}:params`, md, target.constructor.prototype)
    }
}
type ParamsMetaData = {
    name?: string
    type: "req" | "param" | "header" | "body_attribute" | "body" | "query" | "query_attribute"
    index: number
}[]

export function Param(name: string) {
    return function (target: Object, propertyKey: string, parameterIndex: number): void {
        if(!Reflect.hasMetadata(`${propertyKey}:params`, target.constructor.prototype)) Reflect.defineMetadata(`${propertyKey}:params`, [], 
target.constructor.prototype)
        const md = Reflect.getMetadata(`${propertyKey}:params`, target.constructor.prototype) as ParamsMetaData
        md.push({ name: name, type: "param", index: parameterIndex})
        Reflect.defineMetadata(`${propertyKey}:params`, md, target.constructor.prototype)
    }
}

export function Header(name: string) {
    return function (target: Object, propertyKey: string, parameterIndex: number): void {
        if(!Reflect.hasMetadata(`${propertyKey}:params`, target.constructor.prototype)) Reflect.defineMetadata(`${propertyKey}:params`, [],
            target.constructor.prototype)
        const md = Reflect.getMetadata(`${propertyKey}:params`, target.constructor.prototype) as ParamsMetaData
        md.push({ name: name, type: "header", index: parameterIndex})
        Reflect.defineMetadata(`${propertyKey}:params`, md, target.constructor.prototype)
    }
}

export function Req(target: Object, propertyKey: string, parameterIndex: number): void {
    if(!Reflect.hasMetadata(`${propertyKey}:params`, target.constructor.prototype)) Reflect.defineMetadata(`${propertyKey}:params`, [], target.constructor.prototype)
    const md = Reflect.getMetadata(`${propertyKey}:params`, target.constructor.prototype) as ParamsMetaData
    if(md.some(x => x.type === "req")) throw new Error("No se pueden añadir más de 1 parámetro de Request.")
    md.push({ name: "req_param", type: "req", index: parameterIndex})
    Reflect.defineMetadata(`${propertyKey}:params`, md, target.constructor.prototype)
}

// Nota: El index solo puede ser ejecutado desde la carpeta donde se accede a todas las carpetas de los servicios
function splitPath(path: string): string {
    let path_array = path.split("/")
    let cwd_array = process.cwd().split("/")
    let final = ""
    for (let i = 0; i < cwd_array.length; i++) {
        if(cwd_array[i] !== path_array[i] && n === 0){
            n++;
            final += `./${path_array[i]}`
        } else if(cwd_array[i] !== path_array[i] && n !== 0){
            final += `/${path_array[i]}`
        }
    }
    return final
}

interface CreateBackendOptions {
    hostname?: string
    port?: number
    public_folder?: string
}

let routes_obj: string = "const routes_obj = {"
let text: string = "import {get, post, patch, serve, LauriStart} from \"@bunland/lauri\""
let imports: string = ""
let n: number = 0
export function CreateBackend(ClassArray: Array<Function>, options?: CreateBackendOptions): void {
    console.time()
    for (let Clase of ClassArray) {
        const date_routes = Object.getOwnPropertyNames(Clase.prototype).filter(mn => Reflect.has(Clase.prototype, mn)).filter(x => String(x) !== "constructor")
        const date_service = Reflect.getMetadata("service", Clase.prototype) as ServiceMetaData;
        for (const m of date_routes){
            n += 1
            const mgp = Reflect.getMetadata(String(m), Clase.prototype) as RouteMetaData
            const p = Reflect.getMetadata(`${String(m)}:params`, Clase.prototype)
            function ParamsString(){
                if(p === undefined) return `  const ret = routes_obj.${String(m)}.fn()\n  if(ret !== undefined) return ret;`;
                let text = `  ${(p as ParamsMetaData).some(x => (x.type === "body") || (x.type === "body_attribute")) ? "const body = JSON.parse(req.body);" : ""}\n  ${(p as ParamsMetaData).some(x => (x.type === "query") || (x.type === "query_attribute")) ? "const query = req.query;": ""}\n  const ret = ${mgp.async ? "await" : ""} routes_obj.${String(m)}.fn(${(p as ParamsMetaData).some(x => x.type === "req") ? "req," : ""}`
                for (const y of (p as ParamsMetaData).sort(({index:a},{index:b}) => a-b)){
                    switch (y.type) {
                        case "param":
                            text += `req.params.${y.name!},`
                            break
                        case "header":
                            text += `req.headers["${y.name!}"],`
                            break
                        case "body":
                            text += "body,"
                            break
                        case "body_attribute":
                            text += `body["${y.name!}"],`
                            break
                        case "query":
                            text += `query,`
                            break
                        case "query_attribute":
                            text += `query["${y.name!}"],`
                            break
                        default:
                            break
                    }
                }
                text = text.slice(0, -1) + ")"
                return text + "\n\n  if(ret !== undefined) return ret"
            }
            function RouteString() {
                let route = ""
                if(!date_service.initRouteWithServiceName){
                    route = `"/${mgp.route.slice(1)}`
                } else if(date_service.initRouteWithServiceName && date_service.semantic) {
                    route = `"/${date_service.fakeName}/${mgp.route.slice(1)}`
                } else if(date_service.initRouteWithServiceName && !date_service.semantic) {
                    route = `"/${date_service.originalName}/${mgp.route.slice(1)}`
                }
                if(p === undefined) return (route + '"');
                for (const o of (p as ParamsMetaData).sort(({index:a},{index:b}) => a-b)) {
                    if(o.type === "param") {
                        route += `/:${o.name}`
                    }
                }
                return route + `"`;
            }
            routes_obj += `${mgp.route.slice(1)}:{ fn: ${mgp.route.slice(1)}.prototype.${mgp.route.slice(1)} },`
            imports += `const ${mgp.route.slice(1)} = (await import("${splitPath(date_service.absolutePath)}")).default;\n`
            text  = text + `\n${mgp.type}(${RouteString()}, ${mgp.async ? "async(req: any)" : "(req: any)"} => {\n${ParamsString()}\n})`
        }
    }
    text = `LauriStart("${options?.hostname ?? "localhost"}", ${options?.port ?? 3000});\n` +imports.slice(0, -1) + "\n" + routes_obj.slice(0, -1) + " }\n" + text + `\n\n//@ts-ignore\nserve({ hostname: "${options?.hostname ?? "localhost"}", port: ${options?.port ?? 3000}, public_folder: "${options?.public_folder ?? "public"}" })`
    console.log(text)
    console.timeEnd()
}
