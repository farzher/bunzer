import { symbols } from './ffi';
//@ts-ignore
import { CString, ptr } from "bun:ffi";

const utf8e = new TextEncoder();
const encode = (ptr) => utf8e.encode(ptr + "\0");

const toString = function (ptr) {
    const str = new CString(ptr);
    symbols.FreeString(str.ptr);
    return str.toString();
};

console.log(toString(symbols.Decode(ptr(encode("ip=3248789234&name=lucas"))))) 