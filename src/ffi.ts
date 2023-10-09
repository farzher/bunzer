//@ts-ignore
import { dlopen, suffix, FFIType, } from "bun:ffi";

const path = `lib.${suffix}`;
const { pathname } = new URL(path, import.meta.url);

const { symbols } = dlopen(pathname, {
    parseQueryString: {
        args: [FFIType.ptr],
        returns: FFIType.ptr,
    },
    freeString: {
        args: [FFIType.ptr],
        returns: FFIType.void,
    },
    getKey: {
        args: [FFIType.ptr, FFIType.ptr],
        returns: FFIType.ptr,
    }
});

export { symbols }