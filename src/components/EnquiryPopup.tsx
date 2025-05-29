import React, { useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-toastify';

interface EnquiryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEnquiry: any;
  onSubmit: (values: any, actions: any) => void;
  isSubmitting: boolean;
  editMode: boolean;
}

interface Product {
  Product_id: number;
  product_Name: string;
}

interface Package {
  package_Id: any;
  package_Name: string;
}

const EnquiryPopup: React.FC<EnquiryPopupProps> = ({
  isOpen,
  onClose,
  selectedEnquiry,
  onSubmit,
  editMode,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingPackages, setIsLoadingPackages] = useState(false);

  // Define initial values for the form
  const initialValues = editMode
    ? {
        Name: selectedEnquiry?.Name || '',
        Institute_Name: selectedEnquiry?.Institute_Name || '',
        Email: selectedEnquiry?.Email || '',
        Contact: selectedEnquiry?.Contact || '',
        Product_id: selectedEnquiry?.Product_id?.toString() || '',
        Product_name: selectedEnquiry?.Product || '',
        Package_id: selectedEnquiry?.Package_id?.toString() || '',
        Package_name: selectedEnquiry?.Plan || '',
        Message: selectedEnquiry?.Message || '',
        Enquiry_Status: selectedEnquiry?.Enquiry_Status || 'Pending',
      }
    : {
        Name: '',
        Institute_Name: '',
        Email: '',
        Contact: '',
        Product_id: '',
        Product_name: '',
        Package_id: '',
        Package_name: '',
        Message: '',
        Enquiry_Status: 'Pending',
      };

  // Fetch products when the popup is opened
  useEffect(() => {
    if (isOpen) {
      const fetchProducts = async () => {
        setIsLoadingProducts(true);
        try {
          const response = await axiosInstance.get('/productcategory');
          const productData = Array.isArray(response.data)
            ? response.data
            : Array.isArray(response.data.data)
            ? response.data.data
            : [];
          setProducts(productData);
        } catch (error) {
          console.error('Error fetching products:', error);
          toast.error('Failed to load products');
          setProducts([]);
        } finally {
          setIsLoadingProducts(false);
        }
      };
      fetchProducts();
    }
  }, [isOpen]);

  // Fetch packages when the Product field changes or in edit mode
  const fetchPackages = async (productId: string, setFieldValue?: (field: string, value: any) => void) => {
    if (!productId) {
      setPackages([]);
      setFieldValue?.('Package_id', '');
      setFieldValue?.('Package_name', '');
      return;
      }
      setIsLoadingPackages(true);
      try {
        const response = await axiosInstance.get(`/fetchpackage/${productId}`);
        const packageData = Array.isArray(response.data.data)
          ? response.data.data
          : Array.isArray(response.data)
          ? response.data
          : [];
        setPackages(packageData);

      // In edit mode, set the Package_id and Package_name if they match the fetched packages
      if (editMode && setFieldValue && selectedEnquiry?.Package_id) {
        const selectedPackage = packageData.find(
          (pkg: Package) => pkg.package_Id.toString() === selectedEnquiry.Package_id.toString()
        );
        if (selectedPackage) {
          setFieldValue('Package_id', selectedPackage?.package_id.toString());
          setFieldValue('Package_name', selectedPackage?.package_Name);
        } else {
          setFieldValue('Package_id', '');
          setFieldValue('Package_name', '');
        }
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast.error('Failed to load packages');
      setPackages([]);
      setFieldValue?.('Package_id', '');
      setFieldValue?.('Package_name', '');
    } finally {
      setIsLoadingPackages(false);
    }
  };

  // Fetch packages in edit mode when popup opens or selectedEnquiry changes
  useEffect(() => {
    if (isOpen && editMode && selectedEnquiry?.Product_id) {
      fetchPackages(selectedEnquiry.Product_id.toString());
    }
  }, [isOpen, editMode, selectedEnquiry?.Product_id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md h-[70vh] flex flex-col relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="text-lg font-semibold mb-4">
          {editMode ? 'Update Enquiry' : 'Add New Enquiry'}
        </h2>

        <Formik
          initialValues={initialValues}
          onSubmit={(values, actions) => {
            
            onSubmit(values, actions);
          }}
          enableReinitialize // Reinitialize when initialValues change
        >
          {({ isSubmitting, setFieldValue, values }) => (
            <Form className="flex-1 overflow-y-auto">
              <div className="pr-2">
                {!editMode && (
                  <>
                    <div className="mb-4">
                      <label className="block mb-1 font-medium">Name</label>
                      <Field
                        name="Name"
                        type="text"
                        className="w-full p-2 border rounded"
                        placeholder="Enter name"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block mb-1 font-medium">Institute Name</label>
                      <Field
                        name="Institute_Name"
                        type="text"
                        className="w-full p-2 border rounded"
                        placeholder="Enter institute name"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block mb-1 font-medium">Contact</label>
                      <Field
                        name="Contact"
                        type="text"
                        className="w-full p-2 border rounded"
                        placeholder="Enter contact number"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block mb-1 font-medium">Email</label>
                      <Field
                        name="Email"
                        type="email"
                        className="w-full p-2 border rounded"
                        placeholder="Enter email"
                      />
                    </div>
                  </>
                )}
                <div className="mb-4">
                  <label className="block mb-1 font-medium">Product</label>
                  {editMode ? (
                    <input
                      name="Product_name"
                      type="text"
                      value={values.Product_name}
                      readOnly
                      className="w-full p-2 border rounded bg-gray-100"
                    />
                  ) : (
                    <Field
                      as="select"
                      name="Product_id"
                      className="w-full p-2 border rounded"
                      onChange={async (e: React.ChangeEvent<HTMLSelectElement>) => {
                        const productId = e.target.value;
                        const selectedProduct = products.find(
                          (p) => p.Product_id.toString() === productId
                        );
                        setFieldValue('Product_id', productId);
                        setFieldValue('Product_name', selectedProduct?.product_Name || '');
                        setFieldValue('Package_id', '');
                        setFieldValue('Package_name', '');
                        await fetchPackages(productId, setFieldValue);
                      }}
                      disabled={isLoadingProducts}
                    >
                      <option value="">Select a product</option>
                      {isLoadingProducts ? (
                        <option value="">Loading products...</option>
                      ) : products?.length > 0 ? (
                        products?.map((product) => (
                          <option key={product.Product_id} value={product.Product_id}>
                            {product.product_Name}
                          </option>
                        ))
                      ) : (
                        <option value="">No products available</option>
                      )}
                    </Field>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block mb-1 font-medium">Package</label>
                  <Field
                    as="select"
                    name="Package_id"
                    className="w-full p-2 border rounded"
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      const packageId = e.target.value;
                      const selectedPackage = packages.find(
                        (p) => p.package_Id.toString() === packageId
                      );
                      setFieldValue('Package_id', packageId);
                      setFieldValue('Package_name', selectedPackage?.package_Id || '');
                      // Debug the selected package
                     
                    }}
                    disabled={isLoadingPackages || packages.length === 0}
                    value={values.Package_id} // Ensure the dropdown reflects the form state
                  >
                    <option value="">Select a package</option>
                    {isLoadingPackages ? (
                      <option value="">Loading packages...</option>
                    ) : packages.length > 0 ? (
                      packages.map((pkg) => (
                        <option key={pkg.package_Id} value={pkg.package_Id}>
                          {pkg.package_Name}
                        </option>
                      ))
                    ) : (
                      <option value="">No packages available</option>
                    )}
                  </Field>
                </div>
                {!editMode && (
                  <div className="mb-4">
                    <label className="block mb-1 font-medium">Message</label>
                    <Field
                      name="Message"
                      as="textarea"
                      className="w-full p-2 border rounded"
                      placeholder="Enter message"
                    />
                  </div>
                )}
                <div className="mb-4">
                  <label className="block mb-1 font-medium">Status</label>
                  <Field
                    as="select"
                    name="Enquiry_Status"
                    className="w-full p-2 border rounded"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </Field>
                </div>
              </div>

              <div className="flex justify-center gap-2 mt-4 sticky bottom-0 bg-white pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {editMode ? 'Update' : 'Save'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default EnquiryPopup;