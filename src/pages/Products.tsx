import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProductPopup from "../components/ProductPopup";
import { FaEye, FaPencilAlt, FaTrashAlt } from "react-icons/fa";

interface Product {
  product_Id: number;
  product_Name: string;
  release_Date: string;
  website: string;
  platform_Names?: string;
  url?: string;
  plat_Form?: number[] | string;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMode, setPopupMode] = useState<"view" | "edit" | "add">("view");
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage =10;

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get("/fetchproducts");
      const productsData = Array.isArray(response.data?.data) ? response.data.data : [];
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setPopupMode("view");
    setIsPopupOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setPopupMode("edit");
    setIsPopupOpen(true);
  };

  const handleAdd = () => {
    setSelectedProduct(null);
    setPopupMode("add");
    setIsPopupOpen(true);
  };

  const handleDelete = async (productId: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axiosInstance.delete("/deleteproduct", {
          data: { product_Id: productId },
        });
        toast.success("Product deleted successfully");
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Failed to delete product");
      }
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (popupMode === "add") {
        const payload = {
          product_Name: values.product_Name,
          release_Date: values.release_Date,
          website: values.website,
          plat_Form: Array.isArray(values.platform_Ids) ? 
                     values.platform_Ids : 
                     [values.platform_Ids].filter(Boolean)
        };
        
        await axiosInstance.post("/createproducts", payload);
        toast.success("Product added successfully");
      } else if (popupMode === "edit" && selectedProduct) {
        const payload = {
          product_Id: selectedProduct.product_Id,
          product_Name: values.product_Name,
          release_Date: values.release_Date,
          website: values.website,
          platform_Ids: Array.isArray(values.platform_Ids) ? 
                     values.platform_Ids : 
                     [values.platform_Ids].filter(Boolean)
        };
        
        await axiosInstance.put("/updateproducts", payload);
        toast.success("Product updated successfully");
      }

      setIsPopupOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(`Failed to ${popupMode === "add" ? "add" : "update"} product`);
    }
  };

  return (
    <div className=" mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h1 className="text-xl font-semibold text-[#080B6C] mb-2 md:mb-0">
          Product List
        </h1>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <button
            onClick={handleAdd}
            className="bg-[#080B6C] text-white px-4 py-2 rounded hover:bg-[#060845] transition-colors"
          >
            + Add Product
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="text-center py-10">
            <p>Loading products...</p>
          </div>
        ) : products.length > 0 ? (
          <>
            <table className="min-w-full">
              <thead className="bg-blue-100">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Product Name</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Platforms</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Release Date</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Website</th>
                  <th className="p-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentProducts.map((product) => (
                  <tr key={product.product_Id} className="hover:bg-gray-50">
                    <td className="p-3 text-sm text-gray-700">{product.product_Name}</td>
                    <td className="p-3 text-sm text-gray-700">{product.platform_Names || "N/A"}</td>
                    <td className="p-3 text-sm text-gray-700">
                      {product.release_Date ? new Date(product.release_Date).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="p-3 text-sm text-gray-700">
                      <a 
                        href={product.website || product.url || "#"} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {product.website || product.url || "N/A"}
                      </a>
                    </td>
                    <td className="p-3 text-sm text-center">
                      <div className="flex justify-center space-x-3">
                        <button
                          onClick={() => handleView(product)}
                          className="text-blue-500 hover:text-blue-700"
                          title="View"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-green-500 hover:text-green-700"
                          title="Edit"
                        >
                          <FaPencilAlt />
                        </button>
                        <button
                          onClick={() => handleDelete(product.product_Id)}
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
                      Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(indexOfLastItem, products.length)}
                      </span>{' '}
                      of <span className="font-medium">{products.length}</span> results
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
            <p className="text-gray-500">No products found.</p>
          </div>
        )}
      </div>

      <ProductPopup
        isOpen={isPopupOpen}
        onClose={() => {
          setIsPopupOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        mode={popupMode}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default Products;