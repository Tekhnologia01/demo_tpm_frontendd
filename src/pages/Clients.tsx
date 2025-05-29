import React, { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ClientPopup from '../components/ClientPopup';
import { FaPencilAlt, FaTrashAlt } from 'react-icons/fa';

interface Product {
  product: number;
  product_Name: string;
}

interface Plan {
  plan: number;
  plan_Name: string;
}

const Clients: React.FC = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMode, setPopupMode] = useState<'add' | 'edit'>('add');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [plan, setPlan] = useState<Plan[]>([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [dropdownError, setDropdownError] = useState<string | null>(null);
  const itemsPerPage = 10;

  const API_URL = import.meta.env.VITE_API_URL;

  // Timeline mapping
  const timelineMap = [
    { id: 1, name: 'Monthly' },
    { id: 2, name: 'Quarterly' },
    { id: 3, name: 'Half-Yearly' },
    { id: 4, name: 'Yearly' },
  ];

  // Map timeline ID to name for display
  

  // Map timeline name or ID to ID
  const getTimelineId = (timeline: string | number | undefined) => {
    if (!timeline) return 1; // Default to Monthly
    const timelineStr = timeline.toString();
    const found = timelineMap.find(
      option =>
        option.id.toString() === timelineStr ||
        option.name.toLowerCase() === timelineStr.toLowerCase()
    );
    return found ? found.id : 1; // Default to Monthly
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
  };

  const fetchClients = async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}/fetchClient`);
      const clientsData = response.data.data || [];
      const sanitizedClients = Array.from(
        new Map(
          clientsData.map((client: any) => [
            client.User_Id || client.id || JSON.stringify(client),
            {
              User_Id: client.User_Id || client.id || 0,
              User_Name: client.User_Name || client.name || 'N/A',
              Institute_Name: client.Institute_Name || client.institute || 'N/A',
              Contact: client.Contact || client.contact || 'N/A',
              Email: client.Email || client.email || 'N/A',
              product_Name: client.product_Name || client.product?.name || 'N/A',
              package_Name: client.package_Name || client.plan?.name || 'N/A',
              user_status:
                client.user_status === 'Deactive'
                  ? 'Deactive'
                  : client.user_status === 'Active'
                  ? 'Active'
                  : 'Unknown',
              Start_Date: client.Start_Date || client.start_date || '',
              Expiry_Date: client.Expiry_Date || client.expiry_date || '',
              timeline: getTimelineId(client.timeline), // Store as ID
            },
          ])
        ).values()
      );
      setClients(sanitizedClients);
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load clients';
      toast.error(errorMessage);
    }
  };

  const fetchDropdownData = async () => {
    setDropdownLoading(true);
    setDropdownError(null);
    try {
      const productResponse = await axiosInstance.get(`${API_URL}/productcategory`);
      if (productResponse.data.status) {
        const mappedProducts = productResponse.data.data.map((item: any) => ({
          product: item.product || item.id,
          product_Name: item.product_Name || item.name,
        }));
        setProducts(mappedProducts);
      } else {
        setDropdownError('Failed to load products');
        toast.error('Failed to load products');
      }

      const planResponse = await axiosInstance.get(`${API_URL}/packagecategory`);
      if (planResponse.data.status) {
        const mappedPlans = planResponse.data.data.map((item: any) => ({
          plan: item.plan || item.id,
          plan_Name: item.plan_Name || item.name,
        }));
        setPlan(mappedPlans);
      } else {
        setDropdownError('Failed to load packages');
        toast.error('Failed to load packages');
      }
    } catch (err) {
      console.error('Error fetching dropdown data:', err);
      setDropdownError('Failed to load dropdown data');
      toast.error('Failed to load dropdown data');
    } finally {
      setDropdownLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchDropdownData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  const filteredClients = useMemo(
    () =>
      filterStatus === 'All'
        ? clients
        : clients.filter(client => client.user_status === filterStatus),
    [clients, filterStatus]
  );

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const currentClients = useMemo(
    () =>
      filteredClients.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      ),
    [filteredClients, currentPage]
  );

  const handleAdd = () => {
    setSelectedClient(null);
    setPopupMode('add');
    setIsPopupOpen(true);
  };

  const handleEdit = (client: any) => {
    const productMatch = products.find(
      p => p.product_Name.trim().toLowerCase() === (client.product_Name || '').trim().toLowerCase()
    );
    const planMatch = plan.find(
      p => p.plan_Name.trim().toLowerCase() === (client.package_Name || '').trim().toLowerCase()
    );
    const mappedClient = {
      ...client,
      product: productMatch ? productMatch.product : '',
      plan: planMatch ? planMatch.plan : '',
      timeline: getTimelineId(client.timeline).toString(), // Convert to string for form
    };
    setSelectedClient(mappedClient);
    setPopupMode('edit');
    setIsPopupOpen(true);
  };

  const handleDelete = async (clientId: number) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await axiosInstance.delete(`${API_URL}/deleteclient`, {
          data: { user_Id: clientId },
        });
        await fetchClients();
        toast.success('Client deleted successfully');
      } catch (error: any) {
        console.error('Error deleting client:', error);
        const errorMessage = error.response?.data?.message || 'Failed to delete client';
        toast.error(errorMessage);
      }
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (popupMode === 'add') {
        const payload = {
          user_Name: values.user_Name,
          institute_Name: values.institute_Name,
          contact: values.contact,
          email: values.email,
          product: parseInt(values.product),
          plan: parseInt(values.plan),
          start_Date: values.start_Date,
          timeline: parseInt(values.timeline), // Send as number
        };
        await axiosInstance.post(`${API_URL}/createclients`, payload);
        toast.success('Client added successfully');
      } else if (popupMode === 'edit' && selectedClient) {
        const payload = {
          user_Id: selectedClient.User_Id,
          user_Name: values.user_Name,
          institute_Name: values.institute_Name,
          contact: values.contact,
          email: values.email,
          product: Number(values.product),
          Package: Number(values.plan),
          start_Date: values.start_Date,
          plan: Number(values.timeline), // Send as number
        };
        await axiosInstance.put(`${API_URL}/updateclient`, payload);
        toast.success('Client updated successfully');
      }
      await fetchClients();
      setIsPopupOpen(false);
      setSelectedClient(null);
    } catch (error: any) {
      console.error(`Error ${popupMode === 'add' ? 'adding' : 'updating'} client:`, error);
      const errorMessage =
        error.response?.data?.message ||
        `Failed to ${popupMode === 'add' ? 'add' : 'update'} client`;
      toast.error(errorMessage);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h1 className="text-xl font-semibold text-[#080B6C] mb-2 md:mb-0">
          Client List
        </h1>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="p-2 rounded border border-gray-300 w-full md:w-48"
          >
            <option value="All">All Clients</option>
            <option value="Active">Active</option>
            <option value="Deactive">Deactive</option>
          </select>
          <button
            onClick={handleAdd}
            className="bg-[#080B6C] text-white px-4 py-2 rounded hover:bg-[#060845] transition-colors"
          >
            + Add Client
          </button>
        </div>
      </div>

      {dropdownError && (
        <div className="text-red-500 text-center mb-4">{dropdownError}</div>
      )}

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        {dropdownLoading ? (
          <div className="text-center py-10">
            <p>Loading clients...</p>
          </div>
        ) : filteredClients.length > 0 ? (
          <>  
            <table className="min-w-full">
              <thead className="bg-blue-100">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Client Name / Institute</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Contact / Email</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Product</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Package Name</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Start Date</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">End Date</th>
                  
                  <th className="p-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentClients.map((client, index) => (
                  <tr key={client.User_Id || index} className="hover:bg-gray-50">
                    <td className="p-3 text-sm text-gray-700">
                      <div className="flex flex-col">
                        <span>{client.User_Name}</span>
                        <span>{client.Institute_Name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-gray-700">
                      <div className="flex flex-col">
                        <span>{client.Contact}</span>
                        <span>{client.Email}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-gray-700">{client.product_Name}</td>
                    <td className="p-3 text-sm text-gray-700">{client.package_Name}</td>
                    <td className="p-3 text-sm text-gray-700">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${
                          client.user_status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : client.user_status === 'Deactive'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {client.user_status}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-700">{formatDate(client.Start_Date)}</td>
                    <td className="p-3 text-sm text-gray-700">{formatDate(client.Expiry_Date)}</td>
                    
                    <td className="p-3 text-sm text-center">
                      <div className="flex justify-center space-x-3">
                        <button
                          onClick={() => handleEdit(client)}
                          className="text-green-500 hover:text-green-700"
                          title="Edit"
                        >
                          <FaPencilAlt />
                        </button>
                        <button
                          onClick={() => handleDelete(client.User_Id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <FaTrashAlt />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, filteredClients.length)}
                      </span>{' '}
                      of <span className="font-medium">{filteredClients.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">First</span>
                        «
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Previous</span>
                        ‹
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === pageNum
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Next</span>
                        ›
                      </button>
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Last</span>
                        »
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No clients found.</p>
          </div>
        )}
      </div>

      <ClientPopup
        isOpen={isPopupOpen}
        onClose={() => {
          setIsPopupOpen(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
        mode={popupMode}
        onSubmit={handleSubmit}
        products={products}
        plan={plan}
        loading={dropdownLoading}
        error={dropdownError}
      />
    </div>
  );
};

export default Clients;