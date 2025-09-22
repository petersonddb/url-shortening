/**
 * KeyService for keys storage access
 */
export interface KeyService {
    allocate(): Promise<string>;

    /**
     * deallocate a given taken key.
     *
     * This won't throw an error if the key is not taken/found
     * @param key to be deallocated
     */
    deallocate(key: string): Promise<void>;
}
