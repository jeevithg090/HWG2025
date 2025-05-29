// API client for connecting with backend services
import { toast } from "sonner";
import { getAuthToken, getAuthHeaders } from "./auth-utils";

// API base URLs - using environment variables would be better in a real app
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
const USER_SERVICE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:4002'; // User service
const EVENT_SERVICE_URL = process.env.NEXT_PUBLIC_EVENT_SERVICE_URL || 'http://localhost:4001'; // Event service
const FREELANCE_SERVICE_URL = process.env.NEXT_PUBLIC_FREELANCE_SERVICE_URL || 'http://localhost:4003'; // Freelance service

// Common headers - we'll use our auth utility but keep this as a wrapper
// for backward compatibility and to allow passing explicit tokens
const getHeaders = (token?: string) => {
  // If a token is explicitly provided, use it
  if (token) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }
  
  // Otherwise use the auth utility which gets token from localStorage
  return getAuthHeaders();
};

// Error handling
const handleApiError = async (error: any) => {
  console.error('API Error:', error);
  
  // Try to extract error message from response
  let message = 'Something went wrong';
  
  // Handle fetch errors
  if (error instanceof Response) {
    try {
      const errorData = await error.json();
      message = errorData.message || 'An unexpected error occurred';
    } catch (jsonError) {
      message = error.statusText || 'Network error occurred';
    }
  } else if (error.message) {
    message = error.message;
  }
  
  toast.error(message);
  return Promise.reject({ message, status: error.status });
};  // User Service API
export const userApi = {
  signup: async (userData: any) => {
    try {
      console.log('Sending signup request:', userData);
      const response = await fetch(`${USER_SERVICE_URL}/user/signup`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      // Check both response.ok and success field in the response
      if (!response.ok || data.success === 0) {
        const errorMessage = data.message || 'Failed to sign up';
        console.error('Signup error:', errorMessage, data);
        throw new Error(errorMessage);
      }
      
      return {
        success: true,
        data: data
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  login: async (credentials: { email: string, password: string }) => {
    try {
      console.log('Sending login request');
      const response = await fetch(`${USER_SERVICE_URL}/user/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      // Check both response.ok and success field in the response
      if (!response.ok || data.success === false) {
        const errorMessage = data.message || 'Invalid login credentials';
        console.error('Login error:', errorMessage, data);
        throw new Error(errorMessage);
      }
      
      return {
        success: true,
        data: data
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  getUserProfile: async (token: string) => {
    try {
      const response = await fetch(`${USER_SERVICE_URL}/user/profile`, {
        method: 'GET',
        headers: getHeaders(token),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user profile');
      }
      
      const result = await response.json();
      return {
        success: true,
        data: result.data || result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Event Service API
export const eventApi = {
  getAllEvents: async (filters?: any, token?: string) => {
    try {
      const queryParams = filters ? new URLSearchParams(filters).toString() : '';
      const url = `${EVENT_SERVICE_URL}/events${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(token),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch events');
      }
      
      const result = await response.json();
      return {
        success: true,
        data: result.data || result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  getEventById: async (eventId: string, token?: string) => {
    try {
      const response = await fetch(`${EVENT_SERVICE_URL}/events/${eventId}`, {
        method: 'GET',
        headers: getHeaders(token),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch event details');
      }
      
      const result = await response.json();
      return {
        success: true,
        data: result.data || result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  createEvent: async (eventData: any, token: string) => {
    try {
      const response = await fetch(`${EVENT_SERVICE_URL}/events`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(eventData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        return { success: false, message: errorData.message || "Failed to create event" };
      }
      
      const result = await response.json();
      return {
        success: true,
        data: result.data || result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  registerForEvent: async (eventId: string, registrationData: any, token: string) => {
    try {
      const response = await fetch(`${EVENT_SERVICE_URL}/events/${eventId}/register`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(registrationData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        return { success: false, message: errorData.message || "Failed to register for event" };
      }
      
      // Assuming the registration endpoint returns some data upon success,
      // like the registration details or a success message.
      const result = await response.json();
      return {
        success: true,
        data: result.data || result // Adjust based on actual API response structure
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
};  // Freelance Service API
export const freelanceApi = {
  // Gigs (Projects) API
  getProjects: async (filters?: any, token?: string) => {
    try {
      const queryParams = filters ? new URLSearchParams(filters).toString() : '';
      const url = `${FREELANCE_SERVICE_URL}/gigs${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(token),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch projects');
      }
      
      const result = await response.json();
      return {
        success: true,
        data: result.data || result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  createProject: async (projectData: any, token: string) => {
    try {
      const response = await fetch(`${FREELANCE_SERVICE_URL}/gigs`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(projectData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create project');
      }
      
      const result = await response.json();
      return {
        success: true,
        data: result.data || result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getGigById: async (gigId: string, token?: string) => {
    try {
      const response = await fetch(`${FREELANCE_SERVICE_URL}/gigs/${gigId}`, {
        method: 'GET',
        headers: getHeaders(token),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch project details');
      }
      
      const result = await response.json();
      return {
        success: true,
        data: result.data || result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateGig: async (gigId: string, gigData: any, token: string) => {
    try {
      const response = await fetch(`${FREELANCE_SERVICE_URL}/gigs/${gigId}`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify(gigData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update project');
      }
      
      const result = await response.json();
      return {
        success: true,
        data: result.data || result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Proposals API
  createProposal: async (proposalData: any, token: string) => {
    try {
      const response = await fetch(`${FREELANCE_SERVICE_URL}/proposals`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(proposalData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit proposal');
      }
      
      const result = await response.json();
      return {
        success: true,
        data: result.data || result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getProposalsByGigId: async (gigId: string, token: string) => {
    try {
      const response = await fetch(`${FREELANCE_SERVICE_URL}/proposals/gig/${gigId}`, {
        method: 'GET',
        headers: getHeaders(token),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch proposals');
      }
      
      const result = await response.json();
      return {
        success: true,
        data: result.data || result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  getProposalsByFreelancerId: async (freelancerId: string, token: string) => {
    try {
      const response = await fetch(`${FREELANCE_SERVICE_URL}/proposals/freelancer/${freelancerId}`, {
        method: 'GET',
        headers: getHeaders(token),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch freelancer proposals');
      }
      
      const result = await response.json();
      return {
        success: true,
        data: result.data || result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateProposal: async (proposalId: string, proposalData: any, token: string) => {
    try {
      const response = await fetch(`${FREELANCE_SERVICE_URL}/proposals/${proposalId}`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify(proposalData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update proposal');
      }
      
      const result = await response.json();
      return {
        success: true,
        data: result.data || result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Reviews API
  createReview: async (reviewData: any, token: string) => {
    try {
      const response = await fetch(`${FREELANCE_SERVICE_URL}/reviews`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(reviewData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit review');
      }
      
      const result = await response.json();
      return {
        success: true,
        data: result.data || result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getReviewsByGigId: async (gigId: string, token?: string) => {
    try {
      const response = await fetch(`${FREELANCE_SERVICE_URL}/reviews/gig/${gigId}`, {
        method: 'GET',
        headers: getHeaders(token),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch reviews');
      }
      
      const result = await response.json();
      return {
        success: true,
        data: result.data || result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Dashboard API
  getClientDashboard: async (clientId: string, token: string) => {
    try {
      const response = await fetch(`${FREELANCE_SERVICE_URL}/dashboard/client/${clientId}`, {
        method: 'GET',
        headers: getHeaders(token),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch client dashboard');
      }
      
      const result = await response.json();
      return {
        success: true,
        data: result.data || result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getFreelancerDashboard: async (freelancerId: string, token: string) => {
    try {
      const response = await fetch(`${FREELANCE_SERVICE_URL}/dashboard/freelancer/${freelancerId}`, {
        method: 'GET',
        headers: getHeaders(token),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch freelancer dashboard');
      }
      
      const result = await response.json();
      return {
        success: true,
        data: result.data || result
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export default {
  user: userApi,
  event: eventApi,
  freelance: freelanceApi,
};
