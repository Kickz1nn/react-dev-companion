export interface NetworkLog {
  id: string;
  url: string;
  method: string;
  status?: number;
  duration?: number;
  timestamp: string;
  requestData?: any;
  responseData?: any;
}

type LogCallback = (log: NetworkLog) => void;

let isInitialized = false;

// Flags of Network Settings
export const networkConfig = {
  isOffline: false,
  delayMs: 0,
};

export const initFetchInterceptor = (onLog: LogCallback) => {
  if (isInitialized || typeof window === 'undefined') return;
  isInitialized = true;

  const originalFetch = window.fetch;

  window.fetch = async (...args) => {
    const startTime = performance.now();
    const id = Math.random().toString(36).substring(2, 9);

    let url = '';
    let method = 'GET';
    let requestData: any = null;

    if (typeof args[0] === 'string') {
      url = args[0];
    } else if (args[0] instanceof URL) {
      url = args[0].toString();
    } else if (args[0] instanceof Request) {
      url = args[0].url;
      method = args[0].method || 'GET';
    }

    if (args[1]) {
      if (args[1].method) method = args[1].method.toUpperCase();
      if (args[1].body) {
        try {
          requestData = typeof args[1].body === 'string' ? JSON.parse(args[1].body) : args[1].body;
        } catch {
          requestData = args[1].body;
        }
      }
    }

    // 1. Simulation of Network Delay
    if (networkConfig.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, networkConfig.delayMs));
    }

    // 2. Simulation of Offline Mode
    if (networkConfig.isOffline) {
      const endTime = performance.now();
      onLog({
        id,
        url,
        method,
        status: 0,
        duration: Math.round(endTime - startTime),
        timestamp: new Date().toLocaleTimeString(),
        requestData,
      });

      throw new TypeError('Failed to fetch (Simulated Offline Mode)');
    }

    try {
      const response = await originalFetch(...args);
      const endTime = performance.now();

      // Clonamos a resposta para ler o corpo sem consumir a stream principal
      let responseData: any = null;
      try {
        const clonedResponse = response.clone();
        const text = await clonedResponse.text();
        try {
          responseData = JSON.parse(text);
        } catch {
          responseData = text;
        }
      } catch {
        responseData = '[Unable to parse response body]';
      }

      onLog({
        id,
        url,
        method,
        status: response.status,
        duration: Math.round(endTime - startTime),
        timestamp: new Date().toLocaleTimeString(),
        requestData,
        responseData,
      });

      return response;
    } catch (error) {
      const endTime = performance.now();

      onLog({
        id,
        url,
        method,
        status: 0,
        duration: Math.round(endTime - startTime),
        timestamp: new Date().toLocaleTimeString(),
        requestData,
        responseData: String(error),
      });

      throw error;
    }
  };
};