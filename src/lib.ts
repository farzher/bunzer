import { symbols } from './ffi';
import { ptr } from "bun:ffi";
import { encode, toString } from "./encoder";

const querystring = (querystring: string) => JSON.parse(toString(symbols.parseQueryString(ptr(encode(querystring)))))
const getKey = (querystring: any, key: string) => toString(symbols.getKey(ptr(encode(querystring)), ptr(encode(key))));


export {
    querystring,
    getKey
}