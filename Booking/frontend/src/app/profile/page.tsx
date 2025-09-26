'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url?: string;
}

interface BusinessProfile {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  services: Service[];
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<BusinessProfile>({
    id: 'default-profile',
    name: '',
    description: '',
    image_url: '',
    services: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [newService, setNewService] = useState<Omit<Service, 'id'>>({
    title: '',
    description: '',
    price: 0,
    image_url: ''
  });

  const API_BASE = 'http://localhost:8000';

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await axios.get(`${API_BASE}/profiles/default-profile`);
      setProfile(response.data);
    } catch (error) {
      // Profile doesn't exist, create default one
      console.log('Creating default profile');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_BASE}/profiles/default-profile`, profile);
      alert('Profile saved successfully!');
    } catch (error) {
      try {
        await axios.post(`${API_BASE}/profiles`, profile);
        alert('Profile created successfully!');
      } catch (createError) {
        alert('Error saving profile');
      }
    } finally {
      setSaving(false);
    }
  };

  const addService = async () => {
    try {
      const response = await axios.post(`${API_BASE}/profiles/default-profile/services`, {
        ...newService,
        id: ''
      });
      setProfile(prev => ({
        ...prev,
        services: [...prev.services, response.data]
      }));
      setNewService({ title: '', description: '', price: 0, image_url: '' });
      setShowServiceForm(false);
    } catch (error) {
      alert('Error adding service');
    }
  };

  const updateService = async () => {
    if (!editingService) return;
    
    try {
      const response = await axios.put(
        `${API_BASE}/profiles/default-profile/services/${editingService.id}`,
        editingService
      );
      setProfile(prev => ({
        ...prev,
        services: prev.services.map(s => s.id === editingService.id ? response.data : s)
      }));
      setEditingService(null);
    } catch (error) {
      alert('Error updating service');
    }
  };

  const deleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    try {
      await axios.delete(`${API_BASE}/profiles/default-profile/services/${serviceId}`);
      setProfile(prev => ({
        ...prev,
        services: prev.services.filter(s => s.id !== serviceId)
      }));
    } catch (error) {
      alert('Error deleting service');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Business Profile
          </h1>
        </div>

        {/* Profile Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Business Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Business Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your business name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={profile.description}
                onChange={(e) => setProfile(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Describe your business"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Business Image URL
              </label>
              <input
                type="url"
                value={profile.image_url}
                onChange={(e) => setProfile(prev => ({ ...prev, image_url: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          
          <button
            onClick={saveProfile}
            disabled={saving}
            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        {/* Services Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Services</h2>
            <button
              onClick={() => setShowServiceForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Add Service
            </button>
          </div>

          {/* Service Form */}
          {(showServiceForm || editingService) && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="text-lg font-medium mb-4">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Service title"
                  value={editingService ? editingService.title : newService.title}
                  onChange={(e) => {
                    if (editingService) {
                      setEditingService({ ...editingService, title: e.target.value });
                    } else {
                      setNewService({ ...newService, title: e.target.value });
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
                <textarea
                  placeholder="Service description"
                  value={editingService ? editingService.description : newService.description}
                  onChange={(e) => {
                    if (editingService) {
                      setEditingService({ ...editingService, description: e.target.value });
                    } else {
                      setNewService({ ...newService, description: e.target.value });
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  rows={3}
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={editingService ? editingService.price : newService.price}
                  onChange={(e) => {
                    if (editingService) {
                      setEditingService({ ...editingService, price: parseFloat(e.target.value) });
                    } else {
                      setNewService({ ...newService, price: parseFloat(e.target.value) });
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
                <input
                  type="url"
                  placeholder="Image URL (optional)"
                  value={editingService ? editingService.image_url : newService.image_url}
                  onChange={(e) => {
                    if (editingService) {
                      setEditingService({ ...editingService, image_url: e.target.value });
                    } else {
                      setNewService({ ...newService, image_url: e.target.value });
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
                <div className="flex gap-2">
                  <button
                    onClick={editingService ? updateService : addService}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    {editingService ? 'Update' : 'Add'} Service
                  </button>
                  <button
                    onClick={() => {
                      setShowServiceForm(false);
                      setEditingService(null);
                      setNewService({ title: '', description: '', price: 0, image_url: '' });
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Services List */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.services.map((service) => (
              <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                {service.image_url && (
                  <img
                    src={service.image_url}
                    alt={service.title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}
                <h3 className="font-semibold text-lg mb-2">{service.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                <p className="text-xl font-bold text-green-600 mb-3">${service.price}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingService(service)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteService(service.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {profile.services.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              No services added yet. Click "Add Service" to get started.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}