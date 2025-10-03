import type {KeyService} from "../keys/keys.js";
import type {KeysClient} from "./keys-contract_grpc_pb.js";
import {KeyResponse, Void} from "./keys-contract_pb.js";

/**
 * KeygenKeyService for keys storage management at the keygen service
 */
export class KeygenKeyService implements KeyService {
    private readonly keysClient: KeysClient;

    constructor(keysClient: KeysClient) {
        this.keysClient = keysClient;
    }

    async allocate(): Promise<string> {
        console.log(`allocating key at the keygen service`);

        return await new Promise((resolve, reject) => {
            this.keysClient.getKey(new Void(), (err, keyResponse: KeyResponse) => {
                if (err) {
                    reject(new Error(`failed to allocate key: ${err}`));

                    return;
                }

                const key = keyResponse.getKey();

                if (typeof key === "string") {
                    resolve(key);

                    return;
                }

                try {
                    const decoder = new TextDecoder("utf-8");

                    resolve(decoder.decode(key));
                } catch (err: unknown) {
                    reject(new Error(`failed to allocate key: failed to decode key: ${err instanceof Error ? err : "unknown error"}`));
                }
            });
        });
    }

    deallocate(key: string): Promise<void> {
        console.log(`deallocating key ${key} at the keygen service`);

        throw Error("not implemented");
    }
}
