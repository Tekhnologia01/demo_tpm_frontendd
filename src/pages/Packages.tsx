import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PackagePopup from "../components/PackagePopup";
import { FaEye, FaPencilAlt, FaTrashAlt } from "react-icons/fa";

interface Product {
  product: string;
  product_Name: string;
}

interface Package {
  package_Id: number;
  package_Name: string;
  package_Price: number;
  billing_cycle: string;
  max_users: number;
  storage_Limit: number;
  product_Id?: number;
  product_name: string;
}

const Packages: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMode, setPopupMode] = useState<"view" | "edit" | "add">("view");
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 10;

  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get("/productcategory");
      setProducts(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load product categories");
    }
  };

  const fetchPackages = async (productId: string = "") => {
    try {
      setIsLoading(true);
      const url = productId ? `/fetchpackage/${productId}` : "/fetchpackage/all";
      const response = await axiosInstance.get(url);
  
      // Ensure we always have an array and transform data consistently
      const packagesData = Array.isArray(response.data?.data)
        ? response.data.data.map((pkg: any) => ({
            package_Id: pkg.package_Id,
            package_Name: pkg.package_name || pkg.package_Name || '', // Ensure package_Name is set
            package_Price: pkg.package_Price,
            billing_cycle: pkg.billing_cycle,
            max_users: pkg.max_users,
            storage_Limit: pkg.storage_Limit,
            product_Id: pkg.product_Id,
            product_name: pkg.product_name || '', // Ensure product_name is set
          }))
        : [];
  
      setPackages(packagesData);
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast.error("Failed to load packages");
      setPackages([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchPackages(selectedProductId);
    setCurrentPage(1); // Reset to first page when product changes
  }, [selectedProductId]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPackages = packages.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(packages.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProductId(e.target.value);
  };

  const handleView = (pkg: Package) => {
    setSelectedPackage(pkg);
    setPopupMode("view");
    setIsPopupOpen(true);
  };

  const handleEdit = (pkg: Package) => {
    setSelectedPackage(pkg);
    setPopupMode("edit");
    setIsPopupOpen(true);
  };

  const handleAdd = () => {
    setSelectedPackage(null);
    setPopupMode("add");
    setIsPopupOpen(true);
  };

  const handleDelete = async (packageId: number) => {
    if (window.confirm("Are you sure you want to delete this package?")) {
      try {
        await axiosInstance.delete("/deletepackage", {
          data: { package_Id: packageId,
                  product_Id: selectedProductId ? parseInt(selectedProductId) : undefined   
           },
        });
        toast.success("Package deleted successfully");
        fetchPackages(selectedProductId);
      } catch (error) {
        console.error("Error deleting package:", error);
        toast.error("Failed to delete package");
      }
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (popupMode === "add") {
        const payload = {
          product_Id: parseInt(values.product_Id),
          package_Id: values.package_name,
          package_Price: values.package_Price,
          pack_Val_Id: parseInt(values.billing_cycle_Id),
          max_users: parseInt(values.max_users),
          storage_Limit: parseInt(values.storage_Limit),
        };

        await axiosInstance.post("/createpackage", payload);
        toast.success("Package added successfully");
      } else if (popupMode === "edit" && selectedPackage) {
        const payload = {
          product_Id: parseInt(values.product_Id),
          package_Id: selectedPackage.package_Id,
          package_Price: values.package_Price,
          max_users: parseInt(values.max_users),
          storage_Limit: parseInt(values.storage_Limit),
        };

        await axiosInstance.put("/updatepackage", payload);
        toast.success("Package updated successfully");
      }

      setIsPopupOpen(false);
      fetchPackages(selectedProductId);
    } catch (error) {
      console.error("Error saving package:", error);
      toast.error(`Failed to ${popupMode === "add" ? "add" : "update"} package`);
    }
  };

  return (
    <div className=" mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h1 className="text-xl font-semibold text-[#080B6C] mb-2 md:mb-0">
          Package List
        </h1>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <select
            value={selectedProductId}
            onChange={handleProductChange}
            className="p-2 rounded border border-gray-300 w-full md:w-48"
          >
            <option value="">All Products</option>
            {products.map((product) => (
              <option key={product.product} value={product.product}>
                {product.product_Name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            className="bg-[#080B6C] text-white px-4 py-2 rounded hover:bg-[#060845] transition-colors"
          >
            + Add Package
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow scrollbar-thin">
        {isLoading ? (
          <div className="text-center py-10">
            <p>Loading packages...</p>
          </div>
        ) : packages.length > 0 ? (
          <>
            <table className="w-full table-auto">
              <thead className="bg-blue-100">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Product Name </th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Package Name</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Price</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Billing Cycle</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Max Users</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Storage Limit</th>
                  <th className="p-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 overflow-y-auto">
                {currentPackages.map((pkg) => (
                  <tr key={`${pkg.package_Id}-${pkg.product_Id || 'all'}`} className="hover:bg-gray-50">
                    <td className="p-3 text-sm text-gray-700">{pkg.product_name}</td>
                    <td className="p-3 text-sm text-gray-700">{pkg.package_Name}</td>
                    <td className="p-3 text-sm text-gray-700">{pkg.package_Price}</td>
                    <td className="p-3 text-sm text-gray-700">{pkg.billing_cycle}</td>
                    <td className="p-3 text-sm text-gray-700">{pkg.max_users}</td>
                    <td className="p-3 text-sm text-gray-700">{pkg.storage_Limit}</td>
                    <td className="p-3 text-sm text-center">
                      <div className="flex justify-center space-x-3">
                        <button
                          onClick={() => handleView(pkg)}
                          className="text-blue-500 hover:text-blue-700"
                          title="View"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleEdit(pkg)}
                          className="text-green-500 hover:text-green-700"
                          title="Edit"
                        >
                          <FaPencilAlt />
                        </button>
                        <button
                          onClick={() => handleDelete(pkg.package_Id)}
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
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 mb-10">
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
                      Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(indexOfLastItem, packages.length)}
                      </span>{' '}
                      of <span className="font-medium">{packages.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px " aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">First</span>
                        &laquo;
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Previous</span>
                        &lsaquo;
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
                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Next</span>
                        &rsaquo;
                      </button>
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Last</span>
                        &raquo;
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No packages found.</p>
          </div>
        )}
      </div>

      <PackagePopup
        isOpen={isPopupOpen}
        onClose={() => {
          setIsPopupOpen(false);
          setSelectedPackage(null);
        }}
        pkg={selectedPackage}
        mode={popupMode}
        onSubmit={handleSubmit}
        selectedProduct={products.find((product) => +product.product === +selectedProductId)}
      />
    </div>
  );
};

export default Packages;