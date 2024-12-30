// utils/csrf.js
export const getCSRFToken = () => {
    let token = localStorage.getItem('csrfToken');
    
    if (!token) {
      token = generateNewToken();
      localStorage.setItem('csrfToken', token);
    }
    
    return token;
  };
  
  const generateNewToken = () => {
    return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  };
  
  export const validateCSRFToken = (token) => {
    const storedToken = localStorage.getItem('csrfToken');
    return token === storedToken;
  };