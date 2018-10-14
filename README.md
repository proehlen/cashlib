# Cashlib
## Experimental Bitcoin Cash Library

Experimental Bitcoin Cash library.  This sofware is in pre-alpha state and should not be used for any purpose.

[API docs (under construction)](https://proehlen.github.io/cashlib/)

**Do NOT use this code!**

## History

Existing Bitcoin JavaScript libraries are quite large and involve learning the library quirks/api on top of learning bitcoin itself.  I began writing this library as a learning exercise, going back (as much as I can) to basics.  Obviously, for developing production apps you should use libraries that are safe, tested and have many eyes watching for problems (ie popular ones).

## Objectives

* Avoid use of external libraries where practical to learn more about the Bitcoin protocol.
* Use Flow static type checking to both learn it and see what it's like in a non-trivial project.

## Terminology

### Data formats and methods

This library uses the following terms and conventions in method naming:

| Term | Methods | Meaning |
|------|------|---------|
| bytes | toBytes, fromBytes | Bytes are data stored as a JavaScript Uint8Array consisting of 8-bit bytes. Order/endianess/signed is not defined. The Data class provides a convenient parent to subclass for objects that are fundamentally represented by bytes. |
| hex  | toHex, fromHex | A JavaScript String of even length consisting of two character hexadecimal bytes without any special prefix (ie no '0x').  Example data: "FF00". |
| raw | - | Term avoided due to semantic ambiguity.  See 'serialized' |
| serialized | toSerialized, fromSerialized | Serialized data is in a format intended for transmission to other machines or humans. In the Bitcoin protocol, this is also often also known as 'raw'.  When talking about addresses, extended public keys etc, 'serialized' data is presented in a format that is easier for humans to work with (e.g. hashed and base58 or base64 encoded) |
| string | toString, fromString | Where used, format is undefined. Should be avoided. |
