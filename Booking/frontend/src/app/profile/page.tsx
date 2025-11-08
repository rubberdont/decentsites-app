'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Button, Input, Card } from '@/components/ui';

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
        <div className="text-xl dark:text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3EF] dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-[#14B8A6] dark:text-[#14B8A6] hover:text-[#0F9488] dark:hover:text-[#0F9488] mb-4 font-semibold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Business Profile
          </h1>
        </div>

        {/* Profile Form */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 dark:text-white">Business Information</h2>
          
          <div className="space-y-4">
            <Input
              label="Business Name"
              type="text"
              value={profile.name}
              onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your business name"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={profile.description}
                onChange={(e) => setProfile(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent dark:bg-gray-800 dark:text-white transition-all resize-none"
                rows={4}
                placeholder="Describe your business"
              />
            </div>
            
            <Input
              label="Business Image URL"
              type="url"
              value={profile.image_url}
              onChange={(e) => setProfile(prev => ({ ...prev, image_url: e.target.value }))}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          
          <Button
            onClick={saveProfile}
            disabled={saving}
            isLoading={saving}
            className="mt-6"
          >
            Save Profile
          </Button>
        </Card>

        {/* Services Section */}
        <Card className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold dark:text-white">Services</h2>
            <Button
              onClick={() => setShowServiceForm(true)}
              variant="secondary"
            >
              Add Service
            </Button>
          </div>

          {/* Service Form */}
          {(showServiceForm || editingService) && (
            <div className="mb-6 p-6 border border-[#14B8A6]/20 rounded-2xl bg-white dark:bg-gray-800 mb-6">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              <div className="space-y-4">
                <Input
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
                />
                <div>
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
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent dark:bg-gray-800 dark:text-white transition-all resize-none"
                    rows={3}
                  />
                </div>
                <Input
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
                />
                <Input
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
                />
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={editingService ? updateService : addService}
                  >
                    {editingService ? 'Update' : 'Add'} Service
                  </Button>
                  <Button
                    onClick={() => {
                      setShowServiceForm(false);
                      setEditingService(null);
                      setNewService({ title: '', description: '', price: 0, image_url: '' });
                    }}
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Services List */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profile.services.map((service) => (
              <Card key={service.id} className="p-4 bg-white dark:bg-gray-800 rounded-2xl" hoverable>
                {service.image_url && (
                  <img
                    src={service.image_url}
                    alt={service.title}
                    className="w-full h-40 object-cover rounded-xl mb-4"
                  />
                )}
                <h3 className="font-semibold text-lg mb-2 dark:text-white">{service.title}</h3>
                <p className="text-[#78716C] dark:text-gray-400 text-sm mb-4">{service.description}</p>
                <p className="text-xl font-bold text-[#F59E0B] mb-4">${service.price}</p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setEditingService(service)}
                    variant="secondary"
                    size="sm"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => deleteService(service.id)}
                    size="sm"
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {profile.services.length === 0 && (
            <p className="text-[#78716C] dark:text-gray-400 text-center py-12">
              No services added yet. Click &quot;Add Service&quot; to get started.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}