export const ADMIN_EMAILS = ['ishimwet822@gmail.com', 'mwisenezanadjim0@gmail.com', 'ishimwethierry822@gmail.com'];
export const ADMIN_USERNAMES = ['trick_market', 'nadjim_12', 'trick'];

export function isEmailAdmin(email?: string | null) {
    if (!email) return false;
    return ADMIN_EMAILS.some(admin => email.toLowerCase() === admin.toLowerCase());
}

export function isUsernameAdmin(username?: string | null) {
    if (!username) return false;
    return ADMIN_USERNAMES.some(admin => username.toLowerCase() === admin.toLowerCase());
}
