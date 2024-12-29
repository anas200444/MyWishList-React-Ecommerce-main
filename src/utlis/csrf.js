let csrfTokens = {}; // Store CSRF tokens temporarily in-memory

/**
 * Retrieves the CSRF token from localStorage or generates a new one if not found.
 * @returns {string} CSRF token
 */
export function getCSRFToken() {
    const token = localStorage.getItem('csrfToken');
    if (!token) {
        // Clear user session if token is missing
        sessionStorage.clear(); // Clear sessionStorage as well
        localStorage.clear();    // Clear localStorage
        throw new Error("CSRF token is missing, session terminated.");
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
 * Validates the received CSRF token against the stored token.
 * @param {string} receivedToken - The token to validate.
 * @returns {boolean} Whether the tokens match.
 */
export function validateCSRFToken(receivedToken) {
    const storedToken = localStorage.getItem('csrfToken');
    if (!storedToken || receivedToken !== storedToken) {
        sessionStorage.clear(); // Clear sessionStorage
        localStorage.clear();    // Clear localStorage
        throw new Error("CSRF token mismatch, session terminated.");
    }
    return true;
}

/**
 * Adds CSRF token to headers for POST requests.
 * @param {RequestInit} options - The fetch options (headers, body, etc.)
 * @returns {RequestInit} The modified options including CSRF token in the headers
 */
export function addCSRFTokenToRequest(options = {}) {
    const csrfToken = getCSRFToken();
    
    if (!options.headers) {
        options.headers = {};
    }

    options.headers['X-CSRF-Token'] = csrfToken; // Add the CSRF token to request headers
    return options;
}
