const retryOperation = async (operation, maxRetries = 3) => {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            if (!error.message.includes('TransientTransactionError')) {
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 100));
        }
    }
    
    throw lastError;
};

module.exports = retryOperation; 