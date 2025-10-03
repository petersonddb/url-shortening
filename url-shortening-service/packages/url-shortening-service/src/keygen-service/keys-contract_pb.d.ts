// package: keys
// file: keys-contract.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";

export class Void extends jspb.Message { 

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Void.AsObject;
    static toObject(includeInstance: boolean, msg: Void): Void.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Void, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Void;
    static deserializeBinaryFromReader(message: Void, reader: jspb.BinaryReader): Void;
}

export namespace Void {
    export type AsObject = {
    }
}

export class KeyResponse extends jspb.Message { 
    getKey(): Uint8Array | string;
    getKey_asU8(): Uint8Array;
    getKey_asB64(): string;
    setKey(value: Uint8Array | string): KeyResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): KeyResponse.AsObject;
    static toObject(includeInstance: boolean, msg: KeyResponse): KeyResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: KeyResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): KeyResponse;
    static deserializeBinaryFromReader(message: KeyResponse, reader: jspb.BinaryReader): KeyResponse;
}

export namespace KeyResponse {
    export type AsObject = {
        key: Uint8Array | string,
    }
}

export class KeyRequest extends jspb.Message { 
    getKey(): Uint8Array | string;
    getKey_asU8(): Uint8Array;
    getKey_asB64(): string;
    setKey(value: Uint8Array | string): KeyRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): KeyRequest.AsObject;
    static toObject(includeInstance: boolean, msg: KeyRequest): KeyRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: KeyRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): KeyRequest;
    static deserializeBinaryFromReader(message: KeyRequest, reader: jspb.BinaryReader): KeyRequest;
}

export namespace KeyRequest {
    export type AsObject = {
        key: Uint8Array | string,
    }
}
