// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var keys$contract_pb = require('./keys-contract_pb.js');

function serialize_keys_KeyRequest(arg) {
  if (!(arg instanceof keys$contract_pb.KeyRequest)) {
    throw new Error('Expected argument of type keys.KeyRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_keys_KeyRequest(buffer_arg) {
  return keys$contract_pb.KeyRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_keys_KeyResponse(arg) {
  if (!(arg instanceof keys$contract_pb.KeyResponse)) {
    throw new Error('Expected argument of type keys.KeyResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_keys_KeyResponse(buffer_arg) {
  return keys$contract_pb.KeyResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_keys_Void(arg) {
  if (!(arg instanceof keys$contract_pb.Void)) {
    throw new Error('Expected argument of type keys.Void');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_keys_Void(buffer_arg) {
  return keys$contract_pb.Void.deserializeBinary(new Uint8Array(buffer_arg));
}


var KeysService = exports.KeysService = {
  getKey: {
    path: '/keys.Keys/GetKey',
    requestStream: false,
    responseStream: false,
    requestType: keys$contract_pb.Void,
    responseType: keys$contract_pb.KeyResponse,
    requestSerialize: serialize_keys_Void,
    requestDeserialize: deserialize_keys_Void,
    responseSerialize: serialize_keys_KeyResponse,
    responseDeserialize: deserialize_keys_KeyResponse,
  },
  releaseKey: {
    path: '/keys.Keys/ReleaseKey',
    requestStream: false,
    responseStream: false,
    requestType: keys$contract_pb.KeyRequest,
    responseType: keys$contract_pb.Void,
    requestSerialize: serialize_keys_KeyRequest,
    requestDeserialize: deserialize_keys_KeyRequest,
    responseSerialize: serialize_keys_Void,
    responseDeserialize: deserialize_keys_Void,
  },
};

exports.KeysClient = grpc.makeGenericClientConstructor(KeysService, 'Keys');
