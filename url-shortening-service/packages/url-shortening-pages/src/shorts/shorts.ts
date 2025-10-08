/**
 * Short represents a link to an original URL
 */
export type Short = {
    hash: string;
    link: URL;
    originalUrl: URL;
    expire: Date;
}

/**
 * CreateShortParams for `ShortService.create`
 */
export type CreateShortParams = {
    originalUrl: URL;
};

/**
 * ShortService provides interaction with shorts
 */
export interface ShortService {
    /**
     * list all shorts
     */
    list(): Promise<Short[]>;

    /**
     * create a new short link for a URL
     */
    create(params: CreateShortParams): Promise<Short>;
}
