module.exports = function override(config) {
    config.resolve.fallback = {
      crypto: false, // Disable the 'crypto' module
    };
    return config;
  };
  