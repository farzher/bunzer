import { dlopen, suffix, FFIType } from "bun:ffi";

const { platform, arch } = process;

let filename: string;

if (platform === "linux" && arch === "x64") {
  filename = `lib.${suffix}`;
} else {
  filename = `lib.${suffix}`;
}

const { pathname }: URL = new URL(filename, import.meta.url);

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
  },
});

export { symbols };
