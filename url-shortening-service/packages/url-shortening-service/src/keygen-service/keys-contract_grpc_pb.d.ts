// package: keys
// file: keys-contract.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as keys_contract_pb from "./keys-contract_pb";

interface IKeysService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    getKey: IKeysService_IGetKey;
    releaseKey: IKeysService_IReleaseKey;
}

interface IKeysService_IGetKey extends grpc.MethodDefinition<keys_contract_pb.Void, keys_contract_pb.KeyResponse> {
    path: "/keys.Keys/GetKey";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<keys_contract_pb.Void>;
    requestDeserialize: grpc.deserialize<keys_contract_pb.Void>;
    responseSerialize: grpc.serialize<keys_contract_pb.KeyResponse>;
    responseDeserialize: grpc.deserialize<keys_contract_pb.KeyResponse>;
}
interface IKeysService_IReleaseKey extends grpc.MethodDefinition<keys_contract_pb.KeyRequest, keys_contract_pb.Void> {
    path: "/keys.Keys/ReleaseKey";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<keys_contract_pb.KeyRequest>;
    requestDeserialize: grpc.deserialize<keys_contract_pb.KeyRequest>;
    responseSerialize: grpc.serialize<keys_contract_pb.Void>;
    responseDeserialize: grpc.deserialize<keys_contract_pb.Void>;
}

export const KeysService: IKeysService;

export interface IKeysServer extends grpc.UntypedServiceImplementation {
    getKey: grpc.handleUnaryCall<keys_contract_pb.Void, keys_contract_pb.KeyResponse>;
    releaseKey: grpc.handleUnaryCall<keys_contract_pb.KeyRequest, keys_contract_pb.Void>;
}

export interface IKeysClient {
    getKey(request: keys_contract_pb.Void, callback: (error: grpc.ServiceError | null, response: keys_contract_pb.KeyResponse) => void): grpc.ClientUnaryCall;
    getKey(request: keys_contract_pb.Void, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: keys_contract_pb.KeyResponse) => void): grpc.ClientUnaryCall;
    getKey(request: keys_contract_pb.Void, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: keys_contract_pb.KeyResponse) => void): grpc.ClientUnaryCall;
    releaseKey(request: keys_contract_pb.KeyRequest, callback: (error: grpc.ServiceError | null, response: keys_contract_pb.Void) => void): grpc.ClientUnaryCall;
    releaseKey(request: keys_contract_pb.KeyRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: keys_contract_pb.Void) => void): grpc.ClientUnaryCall;
    releaseKey(request: keys_contract_pb.KeyRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: keys_contract_pb.Void) => void): grpc.ClientUnaryCall;
}

export class KeysClient extends grpc.Client implements IKeysClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public getKey(request: keys_contract_pb.Void, callback: (error: grpc.ServiceError | null, response: keys_contract_pb.KeyResponse) => void): grpc.ClientUnaryCall;
    public getKey(request: keys_contract_pb.Void, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: keys_contract_pb.KeyResponse) => void): grpc.ClientUnaryCall;
    public getKey(request: keys_contract_pb.Void, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: keys_contract_pb.KeyResponse) => void): grpc.ClientUnaryCall;
    public releaseKey(request: keys_contract_pb.KeyRequest, callback: (error: grpc.ServiceError | null, response: keys_contract_pb.Void) => void): grpc.ClientUnaryCall;
    public releaseKey(request: keys_contract_pb.KeyRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: keys_contract_pb.Void) => void): grpc.ClientUnaryCall;
    public releaseKey(request: keys_contract_pb.KeyRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: keys_contract_pb.Void) => void): grpc.ClientUnaryCall;
}
