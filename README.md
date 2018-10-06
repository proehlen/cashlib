# Experimental Bitcoin Cash Library

Experimental Bitcoin Cash library.  This sofware is in pre-alpha state and should not be used for any purpose.

**Do NOT use this code!**

## History

Existing Bitcoin JavaScript libraries are quite large and involve learning the library quirks/api on top of learning bitcoin itself.  I began writing this library as a learning exercise, going back (as much as I can) to basics.  Obviously, for developing production apps you should use libraries that are safe, tested and have many eyes watching for problems (ie popular ones).

## Objectives

* Avoid use of external libraries where practical to learn more about the Bitcoin protocol.
* Use Flow static type checking to both learn it and see what it's like in a non-trivial project.

## Terminology

This library uses the following terms:

| Term | Uses | Meaning |
|------|------|---------|
| bytes | toBytes, fromBytes | Bytes are data stores as a JavaScript Uint8Array consisting of 8-bit bytes. Order/endianess/signed is not defined. The Data class provides a convenience wrapper for storing and working with bytes. |
| hex  | toHex, fromHex | A JavaScript String of equal length consisting of two character hexadecimal bytes without any special prefix (ie no '0x').  Example data: "FF00". |
| string | toString, fromString | Undefined. Should be avoided. |
