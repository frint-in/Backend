/**
 * Generates a random string of specified length consisting of
 * uppercase and lowercase letters, and numbers.
 *
 * @param {number} length - The length of the random string to generate.
 * @returns {string} A random string of the specified length.
 *
 * @example
 * // returns a random string of length 10
 * generateRandomString(10);
 */
export function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

