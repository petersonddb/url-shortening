/**
 * AuthToken represents an authentication token
 * used for restricted requests
 */
export type AuthToken = string;

/**
 * CreateUserParams for `UserService.create`
 */
export type AuthenticateParams = {
    email: string;
    password: string;
}

/**
 *  AuthService provides authentication actions
 */
export interface AuthService {
    /**
     * authorization string; this is only valid after
     * successfully authentication with authenticate
     */
    authorization: string | null;

    authenticate(params: AuthenticateParams): Promise<AuthToken>;
}
