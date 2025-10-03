// GENERATED CODE -- DO NOT EDIT!

'use strict';
import {makeGenericClientConstructor} from '@grpc/grpc-js';
import {KeyRequest, KeyResponse, Void} from './keys-contract_pb.js';

function serialize_keys_KeyRequest(arg) {
  if (!(arg instanceof KeyRequest)) {
    throw new Error('Expected argument of type keys.KeyRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_keys_KeyRequest(buffer_arg) {
  return KeyRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_keys_KeyResponse(arg) {
  if (!(arg instanceof KeyResponse)) {
    throw new Error('Expected argument of type keys.KeyResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_keys_KeyResponse(buffer_arg) {
  return KeyResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_keys_Void(arg) {
  if (!(arg instanceof Void)) {
    throw new Error('Expected argument of type keys.Void');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_keys_Void(buffer_arg) {
  return Void.deserializeBinary(new Uint8Array(buffer_arg));
}


var KeysService = {
  getKey: {
    path: '/keys.Keys/GetKey',
    requestStream: false,
    responseStream: false,
    requestType: Void,
    responseType: KeyResponse,
    requestSerialize: serialize_keys_Void,
    requestDeserialize: deserialize_keys_Void,
    responseSerialize: serialize_keys_KeyResponse,
    responseDeserialize: deserialize_keys_KeyResponse,
  },
  releaseKey: {
    path: '/keys.Keys/ReleaseKey',
    requestStream: false,
    responseStream: false,
    requestType: KeyRequest,
    responseType: Void,
    requestSerialize: serialize_keys_KeyRequest,
    requestDeserialize: deserialize_keys_KeyRequest,
    responseSerialize: serialize_keys_Void,
    responseDeserialize: deserialize_keys_Void,
  },
};

export const KeysClient = makeGenericClientConstructor(KeysService, 'Keys');
export { KeysService };