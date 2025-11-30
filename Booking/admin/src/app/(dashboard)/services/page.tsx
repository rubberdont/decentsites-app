'use client';

import { useState, useEffect, useCallback } from 'react';
import { Service, ServiceCreate, ServiceUpdate, BusinessProfile } from '@/types';
import { Modal, LoadingSpinner } from '@/components/ui';
import { authAPI, profilesAPIClient } from '@/services/api';

/**
 * Service form data interface
 */
interface ServiceFormData {
  title: string;
  description: string;
  price: string;
  duration_minutes: string;
  image_url: string;
  is_active: boolean;
}

const defaultFormData: ServiceFormData = {
  title: '',
  description: '',
  price: '',
  duration_minutes: '',
  image_url: '',
  is_active: true,
};

/**
 * Services management page
 * Displays all services with add/edit/delete functionality
 */
export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>(defaultFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Fetch owner's profile and services on mount
   */
  const fetchOwnerProfileAndServices = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Get current user
      const userResponse = await authAPI.getCurrentUser();
      const user = userResponse.data;

      // Step 2: Get all profiles
      const profilesResponse = await profilesAPIClient.getAll();
      const profiles: BusinessProfile[] = profilesResponse.data;

      // Step 3: Find the profile where owner_id matches user.id
      const ownerProfile = profiles.find((p) => p.owner_id === user.id);

      if (!ownerProfile) {
        setError('No profile found for your account. Please create a profile first.');
        setIsLoading(false);
        return;
      }

      // Step 4: Store profileId and set services from profile
      setProfileId(ownerProfile.id);
      setServices(ownerProfile.services || []);
    } catch (err) {
      console.error('Error fetching profile and services:', err);
      setError('Failed to load services. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOwnerProfileAndServices();
  }, [fetchOwnerProfileAndServices]);

  /**
   * Refresh services from API
   */
  const refreshServices = async () => {
    if (!profileId) return;

    try {
      const response = await profilesAPIClient.getServices(profileId);
      setServices(response.data);
    } catch (err) {
      console.error('Error refreshing services:', err);
    }
  };

  /**
   * Open add service modal
   */
  const handleAddService = () => {
    setEditingService(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };

  /**
   * Open edit service modal
   */
  const handleEditService = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      price: service.price.toString(),
      duration_minutes: service.duration_minutes?.toString() || '',
      image_url: service.image_url || '',
      is_active: service.is_active ?? true,
    });
    setIsModalOpen(true);
  };

  /**
   * Open delete confirmation modal
   */
  const handleDeleteClick = (service: Service) => {
    setDeletingService(service);
    setIsDeleteModalOpen(true);
  };

  /**
   * Confirm delete service
   */
  const handleConfirmDelete = async () => {
    if (!deletingService || !profileId) return;

    setIsDeleting(true);
    try {
      await profilesAPIClient.deleteService(profileId, deletingService.id);
      setServices((prev) => prev.filter((s) => s.id !== deletingService.id));
      setIsDeleteModalOpen(false);
      setDeletingService(null);
    } catch (err) {
      console.error('Error deleting service:', err);
      setError('Failed to delete service. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Handle form input change
   */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  /**
   * Handle form submit
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileId) return;

    setIsSaving(true);
    setError(null);

    try {
      if (editingService) {
        // Update existing service
        const updateData: ServiceUpdate = {
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          duration_minutes: formData.duration_minutes
            ? parseInt(formData.duration_minutes)
            : undefined,
          image_url: formData.image_url || undefined,
          is_active: formData.is_active,
        };

        const response = await profilesAPIClient.updateService(
          profileId,
          editingService.id,
          updateData
        );

        setServices((prev) =>
          prev.map((s) => (s.id === editingService.id ? response.data : s))
        );
      } else {
        // Create new service
        const createData: ServiceCreate = {
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          duration_minutes: formData.duration_minutes
            ? parseInt(formData.duration_minutes)
            : undefined,
          image_url: formData.image_url || undefined,
          is_active: formData.is_active,
        };

        const response = await profilesAPIClient.createService(profileId, createData);
        setServices((prev) => [...prev, response.data]);
      }

      setIsModalOpen(false);
      setEditingService(null);
      setFormData(defaultFormData);
    } catch (err) {
      console.error('Error saving service:', err);
      setError('Failed to save service. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Toggle service active status
   */
  const handleToggleActive = async (service: Service) => {
    if (!profileId) return;

    try {
      const updateData: ServiceUpdate = {
        is_active: !service.is_active,
      };

      const response = await profilesAPIClient.updateService(
        profileId,
        service.id,
        updateData
      );

      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? response.data : s))
      );
    } catch (err) {
      console.error('Error toggling service status:', err);
      setError('Failed to update service status. Please try again.');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state (no profile found)
  if (error && !profileId) {
    return (
      <div className="text-center py-16 bg-admin-bg-card rounded-lg border border-admin-border">
        <svg
          className="w-16 h-16 mx-auto text-red-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h3 className="text-lg font-medium text-admin-text mb-2">Profile Not Found</h3>
        <p className="text-admin-text-muted">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-admin-text">Services</h1>
          <p className="text-admin-text-muted mt-1">
            Manage your service offerings and pricing
          </p>
        </div>

        <button
          onClick={handleAddService}
          className="flex items-center gap-2 px-4 py-2 bg-admin-primary hover:bg-admin-primary-hover text-white font-medium rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Service
        </button>
      </div>

      {/* Error Banner */}
      {error && profileId && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-sm text-red-300 hover:text-red-200 mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className={`bg-admin-bg-card border border-admin-border rounded-lg overflow-hidden ${
              !service.is_active ? 'opacity-60' : ''
            }`}
          >
            {/* Service Image or Placeholder */}
            <div className="h-40 bg-admin-bg-hover flex items-center justify-center">
              {service.image_url ? (
                <img
                  src={service.image_url}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  className="w-16 h-16 text-admin-text-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              )}
            </div>

            {/* Service Info */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-admin-text">
                  {service.title}
                </h3>
                {!service.is_active && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-admin-bg-hover text-admin-text-muted rounded">
                    Inactive
                  </span>
                )}
              </div>

              <p className="text-sm text-admin-text-muted mb-3 line-clamp-2">
                {service.description}
              </p>

              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-bold text-admin-primary">
                  ₱{service.price}
                </span>
                {service.duration_minutes && (
                  <span className="text-sm text-admin-text-muted">
                    {service.duration_minutes} min
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditService(service)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-admin-text bg-admin-bg-hover hover:bg-admin-border rounded-lg transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleToggleActive(service)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    service.is_active
                      ? 'text-yellow-400 hover:bg-yellow-400/10'
                      : 'text-green-400 hover:bg-green-400/10'
                  }`}
                  title={service.is_active ? 'Deactivate' : 'Activate'}
                >
                  {service.is_active ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => handleDeleteClick(service)}
                  className="px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  title="Delete"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {services.length === 0 && (
        <div className="text-center py-16 bg-admin-bg-card rounded-lg border border-admin-border">
          <svg
            className="w-16 h-16 mx-auto text-admin-text-muted mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="text-lg font-medium text-admin-text mb-2">No services yet</h3>
          <p className="text-admin-text-muted mb-4">
            Get started by adding your first service
          </p>
          <button
            onClick={handleAddService}
            className="px-4 py-2 bg-admin-primary hover:bg-admin-primary-hover text-white font-medium rounded-lg transition-colors"
          >
            Add Service
          </button>
        </div>
      )}

      {/* Add/Edit Service Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingService(null);
          setFormData(defaultFormData);
        }}
        title={editingService ? 'Edit Service' : 'Add Service'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-admin-text mb-1">
              Service Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="admin-input"
              placeholder="e.g., Classic Haircut"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-admin-text mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="admin-input min-h-[100px] resize-y"
              placeholder="Describe your service..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-admin-text mb-1">
                Price (₱) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="admin-input"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-admin-text mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                name="duration_minutes"
                value={formData.duration_minutes}
                onChange={handleInputChange}
                className="admin-input"
                placeholder="30"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-admin-text mb-1">
              Image URL
            </label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleInputChange}
              className="admin-input"
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-admin-text-muted mt-1">
              Optional: Enter a URL for the service image
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleInputChange}
              className="w-4 h-4 bg-admin-bg-input border-admin-border rounded focus:ring-admin-primary"
            />
            <label htmlFor="is_active" className="text-sm text-admin-text">
              Service is active and available for booking
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-admin-border">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingService(null);
                setFormData(defaultFormData);
              }}
              className="px-4 py-2 text-admin-text hover:bg-admin-bg-hover rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-admin-primary hover:bg-admin-primary-hover text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : editingService ? 'Update Service' : 'Add Service'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingService(null);
        }}
        title="Delete Service"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-admin-text-muted">
            Are you sure you want to delete{' '}
            <span className="text-admin-text font-medium">
              {deletingService?.title}
            </span>
            ? This action cannot be undone.
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-admin-border">
            <button
              type="button"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingService(null);
              }}
              className="px-4 py-2 text-admin-text hover:bg-admin-bg-hover rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
