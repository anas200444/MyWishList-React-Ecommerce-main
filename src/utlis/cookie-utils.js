// src/utils/cookie-utils.js
import Cookies from 'js-cookie';

export const setCookie = (name, value, options = {}) => {
  const defaultOptions = {
    expires: 1, // 1 day
    secure: process.env.NODE_ENV === 'production', // Only send cookie over HTTPS in production
    sameSite: 'strict',
    httpOnly: true, // Cookie only accessible via HTTP(S), not JavaScript
    path: '/'
  };

  Cookies.set(name, value, { ...defaultOptions, ...options });
};

export const getCookie = (name) => {
  return Cookies.get(name);
};

export const removeCookie = (name) => {
  Cookies.remove(name, { path: '/' });
};

export const setSessionCookie = (token) => {
  setCookie('session', token, {
    expires: 1/24, // 1 hour
    secure: true,
    sameSite: 'strict',
    httpOnly: true
  });
};

export const setAuthTokens = (accessToken, refreshToken) => {
  // Store access token with shorter expiry
  setCookie('accessToken', accessToken, {
    expires: 1/24, // 1 hour
    secure: true,
    sameSite: 'strict',
    httpOnly: true
  });

  // Store refresh token with longer expiry
  setCookie('refreshToken', refreshToken, {
    expires: 7, // 7 days
    secure: true,
    sameSite: 'strict',
    httpOnly: true
  });
};

export const clearAuthTokens = () => {
  removeCookie('accessToken');
  removeCookie('refreshToken');
  removeCookie('session');
};

export const validateSession = () => {
  const sessionToken = getCookie('session');
  const accessToken = getCookie('accessToken');
  
  if (!sessionToken || !accessToken) {
    return false;
  }
  
  try {
    // Add any additional validation logic here
    return true;
  } catch (error) {
    clearAuthTokens();
    return false;
  }
};

export const refreshTokenIfNeeded = async () => {
  const refreshToken = getCookie('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await fetch('/api/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const { accessToken, newRefreshToken } = await response.json();
    setAuthTokens(accessToken, newRefreshToken);
    return accessToken;
  } catch (error) {
    clearAuthTokens();
    throw new Error('Session expired. Please login again.');
  }
};

// Helper for making authenticated requests
export const makeAuthenticatedRequest = async (url, options = {}) => {
  const accessToken = getCookie('accessToken');
  
  if (!accessToken) {
    throw new Error('No access token available');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401) {
    // Token expired, try to refresh
    const newAccessToken = await refreshTokenIfNeeded();
    
    // Retry the request with new token
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${newAccessToken}`,
      },
    });
  }

  return response;
};