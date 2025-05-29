import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EnquiryPopup from '../components/EnquiryPopup';
import { FaPencilAlt, FaUserPlus } from 'react-icons/fa';

const Enquiry: React.FC = () => {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState<number | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [isConvertPopupOpen, setIsConvertPopupOpen] = useState(false);
  const [convertEnquiryId, setConvertEnquiryId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const itemsPerPage = 10;

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchEnquiries = async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}/fetchEnquiry`);
      setEnquiries(response.data.data || []);
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      toast.error('Failed to load enquiries');
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const filteredEnquiries = filterStatus === 'All'
    ? enquiries
    : enquiries.filter(enquiry => enquiry.Enquiry_Status === filterStatus);

  const totalPages = Math.ceil(filteredEnquiries.length / itemsPerPage);
  const currentEnquiries = filteredEnquiries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleEdit = (enquiry: any) => {
    setEditId(enquiry.en_id);
    setSelectedEnquiry(enquiry);
    setIsPopupOpen(true);
  };

  const handleAdd = () => {
    setEditId(null);
    setSelectedEnquiry(null);
    setIsPopupOpen(true);
  };

  const handleConvertToClientClick = (enquiryId: number) => {
    setConvertEnquiryId(enquiryId);
    setStartDate(''); // Reset start date
    setIsConvertPopupOpen(true);
  };

  const handleConvertToClientSubmit = async () => {
    if (!startDate) {
      toast.error('Please select a start date');
      return;
    }
    if (convertEnquiryId === null) {
      toast.error('No enquiry selected for conversion');
      return;
    }
    try {
      await axiosInstance.post(`${API_URL}/convertenquiryToclient/${convertEnquiryId}`, {
        start_date: startDate
      });
      toast.success('Enquiry converted to client successfully');
      setEnquiries(enquiries.filter(enq => enq.en_id !== convertEnquiryId));
      setIsConvertPopupOpen(false);
      setConvertEnquiryId(null);
      setStartDate('');
    } catch (error) {
      console.error('Error converting enquiry to client:', error);
      toast.error('Failed to convert enquiry to client');
    }
  };

 const handleSubmit = async (values: any, { setSubmitting }: any) => {
  try {
    if (editId) {
      // For edit mode - only update status and package
      const statusUpdate = {
        enquiry_Id: editId.toString(),
        product: values.Product_id, // Send product_id
        plan: values.Package_id,    // Send package_id
        en_Status:
          values.Enquiry_Status === 'Pending' ? '1' :
          values.Enquiry_Status === 'In Progress' ? '2' : '3',
      };
      await axiosInstance.put(`${API_URL}/updatdeenquiry`, statusUpdate);
      await fetchEnquiries();
      toast.success('Enquiry updated successfully');
    } else {
      // For add mode - create new enquiry
      const enquiryData = {
        enquiry_Name: values.Name,
        institute_Name: values.Institute_Name,
        email: values.Email,
        contact: values.Contact,
        product: values.Product_id, // Send product_id
        plan: values.Package_id,    // Send package_id
        message: values.Message,
        enquiry_Date: new Date().toISOString().split('T')[0],
      };
      const response = await axiosInstance.post(`${API_URL}/addenquiry`, enquiryData);
      setEnquiries([...enquiries, response.data]);
      toast.success('Enquiry added successfully');
    }
    setIsPopupOpen(false);
    setEditId(null);
    setSelectedEnquiry(null);
  } catch (error) {
    console.error('Error saving enquiry:', error);
    toast.error('Failed to save enquiry');
  } finally {
    setSubmitting(false);
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
          Enquiry List
        </h1>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 rounded border border-gray-300 w-full md:w-48"
          >
            <option value="All">All Enquiry</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
          <button
            onClick={handleAdd}
            className="bg-[#080B6C] text-white px-4 py-2 rounded hover:bg-[#060845] transition-colors"
          >
            + Add Enquiry
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        {filteredEnquiries.length > 0 ? (
          <>
            <table className="min-w-full">
              <thead className="bg-blue-100">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Contact No</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Products</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Plan</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Message</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Enquiry Date</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="p-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentEnquiries.map((enquiry) => (
                  <tr key={enquiry.en_id} className="hover:bg-gray-50">
                    <td className="p-3 text-sm text-gray-700">
                      <div className="flex flex-col">
                        <span>{enquiry.Name}</span>
                        <span>{enquiry.Institute_Name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-gray-700">
                      <div className="flex flex-col">
                        <span>{enquiry.Contact}</span>
                        <span>{enquiry.Email}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-gray-700">{enquiry.Product}</td>
                    <td className="p-3 text-sm text-gray-700">{enquiry.Plan}</td>
                    <td className="p-3 text-sm text-gray-700">{enquiry.Message}</td>
                    <td className="p-3 text-sm text-gray-700">{enquiry.Enquiry_Date || 'N/A'}</td>
                    <td className="p-3 text-sm text-gray-700">
                      <span className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${enquiry.Enquiry_Status === 'Pending' ? 'bg-yellow-100 text-yellow-800'
                        : enquiry.Enquiry_Status === 'In Progress' ? 'bg-green-100 text-green-800'
                          : enquiry.Enquiry_Status === 'Resolved' ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                        {enquiry.Enquiry_Status}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-center">
                      <div className="flex justify-center space-x-3">
                        <button
                          onClick={() => handleEdit(enquiry)}
                          className="text-blue-500 hover:text-blue-700"
                          title="Edit"
                        >
                          <FaPencilAlt />
                        </button>
                        <button
                          onClick={() => handleConvertToClientClick(enquiry.en_id)}
                          className="text-green-500 hover:text-green-700"
                          title="Convert to Client"
                        >
                          <FaUserPlus />
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
                        {Math.min(currentPage * itemsPerPage, filteredEnquiries.length)}
                      </span>{' '}
                      of <span className="font-medium">{filteredEnquiries.length}</span> results
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
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNum
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
                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
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
            <p className="text-gray-500">No enquiries found.</p>
          </div>
        )}
      </div>

      <EnquiryPopup
        isOpen={isPopupOpen}
        onClose={() => {
          setIsPopupOpen(false);
          setEditId(null);
          setSelectedEnquiry(null);
        }}
        selectedEnquiry={selectedEnquiry}
        onSubmit={handleSubmit}
        isSubmitting={false}
        editMode={!!selectedEnquiry}
      />

      {isConvertPopupOpen && (
        <div className="fixed inset-0 backdrop-blur  bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold text-[#080B6C] mb-4">Convert to Client</h2>
            <div className="mb-4">
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsConvertPopupOpen(false);
                  setConvertEnquiryId(null);
                  setStartDate('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConvertToClientSubmit}
                className="px-4 py-2 bg-[#080B6C] text-white rounded hover:bg-[#060845]"
              >
                Convert to Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Enquiry;