import { symbols } from './ffi';
import { ptr } from "bun:ffi";
import { encode, toString } from "./encoder";

const parse = (querystring: any) => JSON.parse(toString(symbols.parseQueryString(ptr(encode(querystring)))));

export {
    parse
}