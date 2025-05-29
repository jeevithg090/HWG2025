/**
 * Helper functions for dashboard data related operations
 */

import { freelanceApi } from './api-client';
import { getAuthToken } from './auth-utils';
import { toast } from 'sonner';

/**
 * Fetch client dashboard data
 * @param clientId The client ID to fetch dashboard for
 * @returns Dashboard data or null if error
 */
export const fetchClientDashboard = async (clientId: string) => {
  try {
    const token = getAuthToken();
    if (!token) {
      toast.error('Authentication required');
      return null;
    }
    
    const response = await freelanceApi.getClientDashboard(clientId, token);
    if (response.success) {
      return response.data;
    } else {
      toast.error('Failed to load client dashboard');
      return null;
    }
  } catch (error) {
    console.error('Error fetching client dashboard:', error);
    toast.error('Error loading client dashboard');
    return null;
  }
};

/**
 * Fetch freelancer dashboard data
 * @param freelancerId The freelancer ID to fetch dashboard for
 * @returns Dashboard data or null if error
 */
export const fetchFreelancerDashboard = async (freelancerId: string) => {
  try {
    const token = getAuthToken();
    if (!token) {
      toast.error('Authentication required');
      return null;
    }
    
    const response = await freelanceApi.getFreelancerDashboard(freelancerId, token);
    if (response.success) {
      return response.data;
    } else {
      toast.error('Failed to load freelancer dashboard');
      return null;
    }
  } catch (error) {
    console.error('Error fetching freelancer dashboard:', error);
    toast.error('Error loading freelancer dashboard');
    return null;
  }
};

/**
 * Fetch projects with filters
 * @param filters Optional filters for projects
 * @returns List of projects or empty array if error
 */
export const fetchProjects = async (filters: Record<string, any> = {}) => {
  try {
    const token = getAuthToken();
    
    const response = await freelanceApi.getProjects(filters, token || undefined);
    if (response.success) {
      return response.data || [];
    } else {
      toast.error('Failed to load projects');
      return [];
    }
  } catch (error) {
    console.error('Error fetching projects:', error);
    toast.error('Error loading projects');
    return [];
  }
};

/**
 * Fetch proposals for a specific gig
 * @param gigId The gig ID to fetch proposals for
 * @returns List of proposals or empty array if error
 */
export const fetchProposalsByGigId = async (gigId: string) => {
  try {
    const token = getAuthToken();
    if (!token) {
      toast.error('Authentication required');
      return [];
    }
    
    const response = await freelanceApi.getProposalsByGigId(gigId, token);
    if (response.success) {
      return response.data || [];
    } else {
      toast.error('Failed to load proposals');
      return [];
    }
  } catch (error) {
    console.error('Error fetching proposals:', error);
    toast.error('Error loading proposals');
    return [];
  }
};

/**
 * Fetch proposals for a specific freelancer
 * @param freelancerId The freelancer ID to fetch proposals for
 * @returns List of proposals or empty array if error
 */
export const fetchProposalsByFreelancerId = async (freelancerId: string) => {
  try {
    const token = getAuthToken();
    if (!token) {
      toast.error('Authentication required');
      return [];
    }
    
    const response = await freelanceApi.getProposalsByFreelancerId(freelancerId, token);
    if (response.success) {
      return response.data || [];
    } else {
      toast.error('Failed to load your proposals');
      return [];
    }
  } catch (error) {
    console.error('Error fetching freelancer proposals:', error);
    toast.error('Error loading your proposals');
    return [];
  }
};

/**
 * Fetch reviews for a specific gig
 * @param gigId The gig ID to fetch reviews for
 * @returns List of reviews or empty array if error
 */
export const fetchReviewsByGigId = async (gigId: string) => {
  try {
    const token = getAuthToken();
    // Pass the token which may be null or a string
    const response = await freelanceApi.getReviewsByGigId(gigId, token || undefined);
    if (response.success) {
      return response.data || [];
    } else {
      toast.error('Failed to load reviews');
      return [];
    }
  } catch (error) {
    console.error('Error fetching reviews:', error);
    toast.error('Error loading reviews');
    return [];
  }
};

/**
 * Create a new review
 * @param reviewData The review data to submit
 * @returns The created review or null if error
 */
export const createReview = async (reviewData: any) => {
  try {
    const token = getAuthToken();
    if (!token) {
      toast.error('Authentication required');
      return null;
    }
    
    const response = await freelanceApi.createReview(reviewData, token);
    if (response.success) {
      toast.success('Review submitted successfully!');
      return response.data;
    } else {
      toast.error('Failed to submit review');
      return null;
    }
  } catch (error) {
    console.error('Error creating review:', error);
    toast.error('Error submitting review');
    return null;
  }
};
