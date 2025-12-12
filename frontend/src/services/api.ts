// Detect if running in Codespaces or localhost
const getAPIBaseURL = (): string => {
  try {
    // Check if in browser environment
    if (typeof window === 'undefined') {
      return 'http://localhost:5000';
    }

    const currentUrl = window.location.origin;
    
    // If running on Codespaces domain, replace port
    if (currentUrl.includes('.github.dev') || currentUrl.includes('.app.github.dev')) {
      // Extract the base domain (before the port number)
      const match = currentUrl.match(/^(https?:\/\/[^:]+)-\d+/);
      if (match) {
        console.log(`✅ Codespaces detected: Using ${match[1]}-5000`);
    return currentUrl.replace('-5173', '-5000');      }
    }
    
    // For localhost or other environments
    console.log(`👨‍💻 Local environment detected: Using http://localhost:5000`);
    return 'http://localhost:5000';
  } catch (error) {
    console.error('Error detecting API URL, falling back to localhost', error);
    return 'http://localhost:5000';
  }
};

const API_BASE_URL = getAPIBaseURL();

console.log('🎟️ Ticket Booking System - API Base URL:', API_BASE_URL);

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

const makeRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`📡 Fetching: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      console.error(`❌ API Error (${response.status}):`, error);
      return { error: error.error || 'Request failed' };
    }

    const data = await response.json();
    console.log(`✅ API Success:`, data);
    return data;
  } catch (error) {
    console.error('🔴 Network Error:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Shows API
export const showsApi = {
  getShows: () => makeRequest('/shows'),
  createShow: (name: string, start_time: string, total_seats: number) =>
    makeRequest('/admin/shows', {
      method: 'POST',
      body: JSON.stringify({ name, start_time, total_seats }),
    }),
  getShowSeats: (showId: number) => makeRequest(`/shows/${showId}/seats`),
};

// Bookings API
export const bookingsApi = {
  bookSeats: (show_id: number, user_id: string, seat_ids: number[]) =>
    makeRequest('/booking', {
      method: 'POST',
      body: JSON.stringify({ show_id, user_id, seat_ids }),
    }),
  getBooking: (bookingId: number) => makeRequest(`/booking/${bookingId}`),
};

// Health API
export const healthApi = {
  check: () => makeRequest('/health'),
};
