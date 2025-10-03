import {beforeEach, describe, expect, it, vi} from "vitest";
import {type CallOptions, type ClientUnaryCall, Metadata, type ServiceError} from "@grpc/grpc-js";
import {Status} from "@grpc/grpc-js/build/src/constants.js";
import {KeygenKeyService} from "./keys.js";
import type {KeyService} from "../keys/keys.js";
import {KeyResponse, Void} from "./keys-contract_pb.js";
import type {KeysClient} from "./keys-contract_grpc_pb.js";

type KeyCallback = (err: ServiceError | null, data: KeyResponse) => void;

const getKeyMockTemplate = (err: ServiceError | null, res: KeyResponse) => {
    return vi.fn((request: Void, arg2: Metadata | KeyCallback, arg3?: Partial<CallOptions> | KeyCallback, arg4?: KeyCallback): ClientUnaryCall => {
        let callback: KeyCallback;

        // Determine the actual callback function based on the arguments provided
        if (typeof arg2 === 'function') {
            // Signature 1: getKey(request, callback)
            callback = arg2;
        } else if (typeof arg3 === 'function') {
            // Signature 2: getKey(request, metadata, callback)
            callback = arg3;
        } else if (typeof arg4 === 'function') {
            // Signature 3: getKey(request, metadata, options, callback)
            callback = arg4;
        } else {
            throw new Error("Mock getKey was called without a valid callback function.");
        }

        callback(err, res);

        return {
            cancel: vi.fn(),
            getPeer: vi.fn().mockReturnValue('mock-peer-address'),
            start: vi.fn(),
        } as unknown as ClientUnaryCall;
    });
};

describe("keygen keys service", () => {
    const mockClient: Partial<KeysClient> = {getKey: vi.fn()};

    const service: KeyService = new KeygenKeyService(mockClient as KeysClient);

    describe("allocate key", () => {
        const allocate = () => service.allocate();

        describe("when the service return a key", () => {
            beforeEach(() => {
                const res = new KeyResponse();
                res.setKey(new Uint8Array([116, 101, 115, 116, 45, 107, 101, 121])); // "test-key"

                mockClient.getKey = getKeyMockTemplate(null, res);
            });

            it("should return the allocated key in a practical format", async () => {
                const key = await allocate();

                expect(key).to.equal("test-key");
            });
        });

        describe("when the service return the key as a string", () => {
            beforeEach(() => {
                const res = new KeyResponse();
                res.setKey("test-key");

                mockClient.getKey = getKeyMockTemplate(null, res);
            });

            it("should return the allocated key", async () => {
                const key = await allocate();

                expect(key).to.equal("test-key");
            });
        });

        describe("when the service return a error", () => {
            beforeEach(() => {
                const keyResponse = new KeyResponse();

                const serviceErr = {
                    code: Status.INTERNAL,
                    details: "mocked error",
                    metadata: new Metadata(),
                    name: "mocked error",
                    message: "mocked error",
                    toString: vi.fn(() => "mocked error")
                }

                mockClient.getKey = getKeyMockTemplate(serviceErr, keyResponse);
            });

            it("should throw an error", async () => {
                await expect(allocate()).rejects.toThrow(/failed to allocate key.*mocked error/i);
            });
        });
    });
});
