import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

// Platform mapping
const platformMap: { [key: number]: string } = {
  1: 'iOS',
  2: 'Android',
  3: 'Web',
};

interface ProductPopupProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  mode: 'view' | 'edit' | 'add';
  onSubmit: (values: any) => void;
}

// Define the type for form values to ensure TypeScript knows the shape
interface FormValues {
  product_Name: string;
  platform_Ids: number[];
  release_Date: string;
  website: string;
}

// Validation schema for the 'add' mode
const validationSchema = Yup.object().shape({
  product_Name: Yup.string()
    .min(2, 'Product name must be at least 2 characters')
    .required('Product name is required'),
  platform_Ids: Yup.array()
    .min(1, 'At least one platform must be selected')
    .required('At least one platform must be selected'),
  release_Date: Yup.date()
    .required('Release date is required')
    .typeError('Please enter a valid date'),
  website: Yup.string()
    .url('Please enter a valid URL')
    .required('Website URL is required'),
});

const ProductPopup: React.FC<ProductPopupProps> = ({
  isOpen,
  onClose,
  product,
  mode,
  onSubmit,
}) => {
  if (!isOpen) return null;

  // Define initial values with only required fields
  const initialValues: FormValues = mode === 'add' ? {
    product_Name: '',
    platform_Ids: [],
    release_Date: '',
    website: '',
  } : {
    product_Name: product?.product_Name || '',
    release_Date: product?.release_Date ? new Date(product.release_Date).toISOString().slice(0, 10) : '',
    website: product?.url || '',
    platform_Ids: [],
  };

  return (
    <div className="fixed inset-0 backdrop-blur flex items-center justify-center">
      <div className={`bg-white p-6 rounded-lg w-full max-w-md flex flex-col relative ${mode !== 'view' ? 'h-[70vh]' : ''}`}>
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
          {mode === 'view' ? 'View Product Details' : mode === 'edit' ? 'Edit Product' : 'Add Product'}
        </h2>

        {mode === 'view' && product ? (
          <div className="space-y-4">
            <p><strong>Product ID:</strong> {product.product_Id}</p>
            <p><strong>Product Name:</strong> {product.product_Name}</p>
            <p><strong>Platform:</strong> {product.platform_Names}</p>
            <p><strong>Release Date:</strong> {new Date(product.release_Date).toLocaleDateString()}</p>
            <p><strong>Website:</strong> {product.url}</p>
          </div>
        ) : (
          <Formik<FormValues>
            initialValues={initialValues}
            validationSchema={mode === 'add' ? validationSchema : undefined}
            onSubmit={onSubmit}
          >
            {({ isSubmitting, setFieldValue, values, errors, touched }) => (
              <Form className="flex-1 overflow-y-auto">
                <div className="pr-2">
                  <div className="mb-4">
                    <label className="block mb-1 font-medium">Product Name</label>
                    <Field
                      name="product_Name"
                      type="text"
                      className="w-full p-2 border rounded"
                      placeholder="Enter product name"
                    />
                    {touched.product_Name && errors.product_Name && (
                      <div className="text-red-500 text-sm mt-1">{errors.product_Name}</div>
                    )}
                  </div>

                  {mode === 'add' && (
                    <div className="mb-4">
                      <label className="block mb-1 font-medium">Platform</label>
                      <div className="space-y-2">
                        {Object.entries(platformMap).map(([id, name]) => (
                          <label key={id} className="flex items-center">
                            <Field
                              type="checkbox"
                              name="platform_Ids"
                              value={id}
                              checked={values.platform_Ids.includes(Number(id))}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const idNum = Number(id);
                                const updatedPlatforms = e.target.checked
                                  ? [...values.platform_Ids, idNum]
                                  : values.platform_Ids.filter((item: number) => item !== idNum);
                                setFieldValue('platform_Ids', updatedPlatforms);
                              }}
                              className="mr-2"
                            />
                            {name}
                          </label>
                        ))}
                      </div>
                      {touched.platform_Ids && errors.platform_Ids && (
                        <div className="text-red-500 text-sm mt-1">{errors.platform_Ids}</div>
                      )}
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block mb-1 font-medium">Release Date</label>
                    <Field
                      name="release_Date"
                      type="date"
                      className="w-full p-2 border rounded"
                    />
                    {touched.release_Date && errors.release_Date && (
                      <div className="text-red-500 text-sm mt-1">{errors.release_Date}</div>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block mb-1 font-medium">Website</label>
                    <Field
                      name="website"
                      type="text"
                      className="w-full p-2 border rounded"
                      placeholder="Enter website URL"
                    />
                    {touched.website && errors.website && (
                      <div className="text-red-500 text-sm mt-1">{errors.website}</div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4 sticky bottom-0 bg-white pt-2">
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
                    Save
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        )}

        {mode === 'view' && (
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPopup;