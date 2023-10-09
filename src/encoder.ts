import { symbols } from './ffi';
import { CString } from "bun:ffi";

const utf8e = new TextEncoder();
const encode = (ptr: any) => utf8e.encode(ptr + "\0");

const toString = function (ptr: any) {
    const str = new CString(ptr);
    symbols.freeString(str.ptr);
    return str.toString();
};

export {
    toString,
    encode
}