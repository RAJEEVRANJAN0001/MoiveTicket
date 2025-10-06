// Utility to check if backend is available
class BackendChecker {
  static async isBackendAvailable(apiUrl) {
    try {
      const response = await fetch(`${apiUrl}/health/`, {
        method: 'GET',
        timeout: 3000,
      });
      return response.ok;
    } catch (error) {
      console.warn('Backend health check failed:', error.message);
      return false;
    }
  }
}

export default BackendChecker;