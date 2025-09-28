import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Customer } from "../../types/customer";
import { fetchCustomerProfile } from "../../api/customer";

const CustomerDashboard: React.FC = () => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCustomer = async () => {
      try {
        const profile = await fetchCustomerProfile();
        setCustomer(profile);
      } catch (err: any) {
        setError(err.message || "Не вдалося завантажити профіль покупця");
        console.error("[CustomerDashboard] Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#151515]"></div>
    </div>
  );

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-black">
      {/* Header */}
      <div className="bg-[#e7e7e7] shadow-sm border-b border-[#dadada]">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-[#2a2a2a] rounded-full flex items-center justify-center text-white font-bold text-xl">
              {customer?.username ? customer.username.charAt(0).toUpperCase() : ''}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{customer?.username || 'Покупець'}</h1>
            </div>
          </div>
          <div className="flex space-x-3">
            <Link
              to={`/customer/edit`}
              className="px-4 py-2 text-sm font-medium bg-[#dadada] rounded-lg hover:bg-[#989898] transition"
            >
              Налаштування
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 border border-[#dadada] hover:shadow-lg transition-all duration-300">
          <h2 className="text-lg font-semibold mb-4">Інформація про покупця</h2>
          <div className="space-y-3">
            <div className="flex justify-between hover:bg-gray-100 px-2 py-1 rounded transition">
              <span className="text-[#454545]">Email:</span>
              <span className="font-medium">{customer?.email}</span>
            </div>
            <div className="flex justify-between hover:bg-gray-100 px-2 py-1 rounded transition">
              <span className="text-[#454545]">Телефон:</span>
              <span className="font-medium">{customer?.phone || 'Не вказано'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
