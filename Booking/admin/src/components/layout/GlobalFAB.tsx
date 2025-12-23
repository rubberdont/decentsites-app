'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'react-hot-toast';

/**
 * Global Floating Action Button
 * Provides quick access to common actions like adding a walk-in booking
 */
export function GlobalFAB() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form state
    const [customerName, setCustomerName] = useState('');
    const [service, setService] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setIsOpen(false);
            setCustomerName('');
            setService('');
            setNotes('');
            toast.success('Walk-in booking added!');
        }, 1000);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 p-4 bg-admin-primary text-white rounded-full shadow-lg hover:bg-admin-primary-dark transition-colors z-50 flex items-center justify-center md:bottom-8 md:right-8 w-14 h-14"
                title="Quick Walk-in"
                aria-label="Add Walk-in Booking"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            </button>

            {/* Quick Walk-in Modal */}
            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Quick Walk-in Booking"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-admin-text mb-1">
                            Customer Name
                        </label>
                        <input
                            type="text"
                            required
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full px-3 py-2 border border-admin-border rounded-lg bg-admin-bg focus:ring-2 focus:ring-admin-primary focus:border-transparent outline-none transition-all"
                            placeholder="Enter customer name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-admin-text mb-1">
                            Service
                        </label>
                        <select
                            required
                            value={service}
                            onChange={(e) => setService(e.target.value)}
                            className="w-full px-3 py-2 border border-admin-border rounded-lg bg-admin-bg focus:ring-2 focus:ring-admin-primary focus:border-transparent outline-none transition-all"
                        >
                            <option value="">Select Service</option>
                            <option value="Haircut">Haircut (₱350)</option>
                            <option value="Shave">Shave (₱200)</option>
                            <option value="Full Service">Full Service (₱500)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-admin-text mb-1">
                            Notes
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-3 py-2 border border-admin-border rounded-lg bg-admin-bg focus:ring-2 focus:ring-admin-primary focus:border-transparent outline-none transition-all"
                            placeholder="Optional notes"
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-admin-text-muted hover:text-admin-text transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-admin-primary rounded-lg hover:bg-admin-primary-dark disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Adding...' : 'Add Walk-in'}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
