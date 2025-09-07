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
    authenticate(params: AuthenticateParams): Promise<AuthToken>;
}
