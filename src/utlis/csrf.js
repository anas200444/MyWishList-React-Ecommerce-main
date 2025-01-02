// csrf.js
export const csrfTokens = {}; // Export to make it used

/**
 * Retrieves the CSRF token from localStorage or generates a new one if not found.
 * @returns {string} CSRF token
 */
export function getCSRFToken() {
    const token = localStorage.getItem('csrfToken');
    if (!token) {
        const newToken = generateCSRFToken();
        setCSRFToken(newToken);
        return newToken;
    }
    return token;
}

/**
 * Generates a new CSRF token using a random UUID-like structure.
 * @returns {string} Generated CSRF token
 */
export function generateCSRFToken() {
    return [...Array(36)]
        .map((_, i) =>
            (i === 8 || i === 13 || i === 18 || i === 23
                ? "-"
                : ((Math.random() * 16) | 0).toString(16)
            )
        )
        .join("");
}

/**
 * Stores the CSRF token in localStorage and sessionStorage.
 * @param {string} token - The CSRF token to store.
 */
export function setCSRFToken(token) {
    if (!token) {
        throw new Error("Invalid CSRF token.");
    }
    localStorage.setItem('csrfToken', token);
    sessionStorage.setItem('csrfToken', token);
}

/**
 * Validates the received CSRF token against the stored token.
 * @param {string} receivedToken - The token to validate.
 * @returns {boolean} Whether the tokens match.
 */
export function validateCSRFToken(receivedToken) {
    const storedToken = localStorage.getItem('csrfToken');
    if (!storedToken || receivedToken !== storedToken) {
        regenerateCSRFToken(); // Automatically regenerate the token on mismatch
        throw new Error("CSRF token mismatch, token regenerated.");
        // Removed unreachable code
    }
    return true;
}

/**
 * Regenerates a new CSRF token and updates the storage.
 * @returns {string} The newly generated CSRF token.
 */
export function regenerateCSRFToken() {
    const newToken = generateCSRFToken();
    setCSRFToken(newToken);
    return newToken;
}

/**
 * Adds CSRF token to headers for POST requests.
 * @param {RequestInit} options - The fetch options (headers, body, etc.)
 * @returns {RequestInit} The modified options including CSRF token in the headers
 */
export function addCSRFTokenToRequest(options = {}) {
    const csrfToken = getCSRFToken();
    const headers = options.headers || {};
    
    return {
        ...options,
        headers: {
            ...headers,
            'X-CSRF-Token': csrfToken
        }
    };
}