//@ts-ignore
import { dlopen, suffix, FFIType, } from "bun:ffi";

const path = `querystring.${suffix}`;
const { pathname } = new URL(path, import.meta.url);

const { symbols } = dlopen(pathname, {
    Decode: {
        args: [FFIType.ptr],
        returns: FFIType.ptr,
    },
    FreeString: {
        args: [FFIType.ptr],
        returns: FFIType.void,
    },
});

export { symbols }