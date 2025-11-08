'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Card } from '@/components/ui';
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

export default function CustomerViewPage() {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE = 'http://localhost:8000';

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await axios.get(`${API_BASE}/profiles/default-profile`);
      setProfile(response.data);
    } catch (error) {
      setError('Business profile not found. Please create a profile first.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3EF]">
        <div className="text-xl">Loading business profile...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3EF]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Business Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href="/profile"
            className="inline-block"
          >
            <Button variant="primary" size="lg">
              Create Business Profile
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link 
            href="/"
            className="inline-flex items-center text-[#14B8A6] hover:text-[#0F9488] mb-2 transition-colors"
          >
            ← Back to Home
          </Link>
          <div className="text-sm text-gray-500">Customer View</div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Business Header */}
        <Card className="bg-white rounded-lg overflow-hidden mb-8">
          {profile.image_url && (
            <div className="h-64 md:h-80 overflow-hidden">
              <img
                src={profile.image_url}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {profile.name || 'Business Name'}
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              {profile.description || 'No description available.'}
            </p>
          </div>
        </Card>

        {/* Services Section */}
        <Card className="bg-white rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Services</h2>
          
          {profile.services.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.services.map((service) => (
                <Card
                  key={service.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                  hoverable
                >
                  {service.image_url && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={service.image_url}
                        alt={service.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      {service.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-[#10B981]">
                        ${service.price}
                      </span>
                      <Button variant="primary" size="sm">
                        Book Now
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Services Available</h3>
              <p className="text-gray-500">This business hasn&apos;t added any services yet.</p>
            </div>
          )}
        </Card>

        {/* Contact/Info Section */}
        <div className="bg-[#F59E0B]/10 border-2 border-[#F59E0B] rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Ready to Book?</h3>
          <p className="text-gray-600 mb-4">
            Contact {profile.name || 'us'} to schedule your appointment or learn more about our services.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" size="lg">
              Contact Us
            </Button>
            <Button variant="ghost" size="lg">
              View Location
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}