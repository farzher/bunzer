package main

/*
#include <stdlib.h>
#include <string.h>
*/
import "C"

import (
	"encoding/json"
	"net/url"
	"unsafe"
)

func ch(str string) *C.char {
	return C.CString(str)
}

func str(ch *C.char) string {
	return C.GoString(ch)
}

//export Decode
func Decode(queryString *C.char) *C.char {
	values, err := url.ParseQuery(str(queryString))
	if err != nil {
		panic(err)
	}

	params := make(map[string]string)
	for k, v := range values {
		params[k] = v[0]
	}

	jsonParams, err := json.Marshal(params)
	if err != nil {
		panic(err)
	}

	return ch(string(jsonParams))
}

//export FreeString
func FreeString(str *C.char) {
	C.free(unsafe.Pointer(str))
}

func main() {}
