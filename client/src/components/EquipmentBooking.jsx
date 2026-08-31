import React, { useState } from 'react';
import { Calendar, Clock, MapPin, CreditCard, User, Phone, Mail, AlertCircle } from 'lucide-react';
import api from '../Authorisation/axiosConfig';

const EquipmentBooking = ({ equipment, onClose, onSuccess }) => {
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    rentalType: 'daily',
    quantity: 1,
    deliveryType: 'pickup',
    deliveryAddress: '',
    pickupAddress: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/equipment-bookings', {
        equipmentId: equipment._id,
        ...bookingData
      });

      onSuccess(response.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const baseRate = equipment.rentalRate[bookingData.rentalType];
    const totalAmount = baseRate * duration * bookingData.quantity;
    const deliveryCharges = bookingData.deliveryType === 'delivery' ? 500 : 0;
    return totalAmount + deliveryCharges;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Book Equipment</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Equipment Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipment Details</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <img
                  src={equipment.images?.[0]?.url || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop&crop=center'}
                  alt={equipment.name}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop&crop=center';
                  }}
                />
                <h4 className="font-semibold text-gray-900">{equipment.name}</h4>
                <p className="text-sm text-gray-600">{equipment.brand} {equipment.model}</p>
                <p className="text-sm text-gray-500 mt-2">{equipment.location.city}, {equipment.location.state}</p>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Daily Rate:</span>
                    <span className="font-medium">{formatPrice(equipment.rentalRate.daily)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Weekly Rate:</span>
                    <span className="font-medium">{formatPrice(equipment.rentalRate.weekly)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Monthly Rate:</span>
                    <span className="font-medium">{formatPrice(equipment.rentalRate.monthly)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rental Period
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={bookingData.startDate}
                        onChange={(e) => setBookingData(prev => ({ ...prev, startDate: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">End Date</label>
                      <input
                        type="date"
                        value={bookingData.endDate}
                        onChange={(e) => setBookingData(prev => ({ ...prev, endDate: e.target.value }))}
                        min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rental Type
                  </label>
                  <select
                    value={bookingData.rentalType}
                    onChange={(e) => setBookingData(prev => ({ ...prev, rentalType: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={bookingData.quantity}
                    onChange={(e) => setBookingData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Option
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="deliveryType"
                        value="pickup"
                        checked={bookingData.deliveryType === 'pickup'}
                        onChange={(e) => setBookingData(prev => ({ ...prev, deliveryType: e.target.value }))}
                        className="mr-2"
                      />
                      <span className="text-sm">Pickup from owner</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="deliveryType"
                        value="delivery"
                        checked={bookingData.deliveryType === 'delivery'}
                        onChange={(e) => setBookingData(prev => ({ ...prev, deliveryType: e.target.value }))}
                        className="mr-2"
                      />
                      <span className="text-sm">Delivery to my location (+₹500)</span>
                    </label>
                  </div>
                </div>

                {bookingData.deliveryType === 'delivery' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Address
                    </label>
                    <textarea
                      value={bookingData.deliveryAddress}
                      onChange={(e) => setBookingData(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                      placeholder="Enter your complete address"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      rows="3"
                    />
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Booking Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Base Rate:</span>
                      <span>{formatPrice(equipment.rentalRate[bookingData.rentalType])}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>
                        {bookingData.startDate && bookingData.endDate
                          ? Math.ceil((new Date(bookingData.endDate) - new Date(bookingData.startDate)) / (1000 * 60 * 60 * 24)) + ' days'
                          : '0 days'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quantity:</span>
                      <span>{bookingData.quantity}</span>
                    </div>
                    {bookingData.deliveryType === 'delivery' && (
                      <div className="flex justify-between">
                        <span>Delivery Charges:</span>
                        <span>{formatPrice(500)}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total Amount:</span>
                        <span>{formatPrice(calculateTotal())}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Creating Booking...' : 'Book Now'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentBooking;
