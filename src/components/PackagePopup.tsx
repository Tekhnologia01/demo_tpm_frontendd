import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const billingCycleMap: { [key: number]: string } = {
  1: 'Monthly',
  2: 'Quarterly',
  3: 'Half Yearly',
  4: 'Yearly',
};

const packageOptions = [
  { id: 1, name: 'Basic' },
  { id: 2, name: 'Advanced' },
  { id: 3, name: 'Premium' },
];

interface PackagePopupProps {
  isOpen: boolean;
  onClose: () => void;
  pkg: any;
  mode: 'view' | 'edit' | 'add';
  onSubmit: (values: any) => void;
  selectedProduct?: any;
}

interface PackageFormValues {
  product_Id?: string;
  package_name: string;
  package_Price: string;
  billing_cycle_Id?: string; // Optional since it's not used in edit mode
  max_users: string;
  storage_Limit: string;
}

const baseValidationSchema = Yup.object({
  package_name: Yup.string()
    .required('Package Name is required')
    .oneOf(packageOptions.map(option => option.id.toString()), 'Invalid package name'),
  package_Price: Yup.string()
    .required('Package Price is required')
    .matches(/^\d+(\.\d{1,2})?$/, 'Price must be a valid number (e.g., 100.00)'),
  max_users: Yup.string()
    .required('Max Users is required')
    .matches(/^\d+$/, 'Max Users must be a positive integer'),
  storage_Limit: Yup.string()
    .required('Storage Limit is required')
    .matches(/^\d+$/, 'Storage Limit must be a positive integer'),
});

const PackagePopup: React.FC<PackagePopupProps> = ({
  isOpen,
  onClose,
  pkg,
  mode,
  onSubmit,
  selectedProduct,
}) => {
  if (!isOpen) return null;

  // Map package name to its ID for edit mode
  const getPackageId = (name: string) => {
    const option = packageOptions.find(opt => opt.name.toLowerCase() === name.toLowerCase());
    if (!option) {
      console.warn(`Package name "${name}" not found in packageOptions`);
    }
    return option ? option.id.toString() : '';
  };

  const initialValues: PackageFormValues = {
    product_Id: mode === 'add' ? selectedProduct?.product : pkg?.product_Id?.toString() || '',
    package_name: mode === 'add' ? '' : getPackageId(pkg?.package_Name || '') || '',
    package_Price: pkg?.package_Price?.toString() || '',
    billing_cycle_Id: mode === 'add' ? pkg?.pack_Val_Id?.toString() || pkg?.billing_cycle_Id?.toString() || '' : undefined,
    max_users: pkg?.max_users?.toString() || '',
    storage_Limit: pkg?.storage_Limit?.toString() || '',
  };

  const validationSchema = mode === 'add'
    ? baseValidationSchema.shape({
        product_Id: Yup.string().required('Product is required'),
        billing_cycle_Id: Yup.string()
          .required('Billing Cycle is required')
          .oneOf(Object.keys(billingCycleMap).map(String), 'Invalid billing cycle'),
      })
    : baseValidationSchema;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md flex flex-col relative h-[80vh] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Title */}
        <h2 className="text-xl font-semibold mb-4">
          {mode === 'view' ? 'View Package' : mode === 'edit' ? 'Edit Package' : 'Add Package'}
        </h2>

        {/* Content */}
        {mode === 'view' && pkg ? (
          <div className="flex-1 overflow-y-auto space-y-3">
            <p><strong>Package ID:</strong> {pkg.package_Id ?? 'N/A'}</p>
            <p><strong>Package Name:</strong> {pkg.package_Name ?? 'N/A'}</p>
            <p><strong>Price:</strong> {pkg.package_Price ?? 'N/A'}</p>
            <p><strong>Billing Cycle:</strong> {pkg.billing_cycle ?? 'N/A'}</p>
            <p><strong>Max Users:</strong> {pkg.max_users ?? 'N/A'}</p>
            <p><strong>Storage Limit:</strong> {pkg.storage_Limit ?? 'N/A'}</p>
            <p><strong>Product ID:</strong> {pkg.product_Id ?? 'N/A'}</p>
          </div>
        ) : (
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            enableReinitialize={true}
            onSubmit={(values) => {
              console.log('Submitting form values:', values);
              const submitValues = {
                ...values,
                package_name: parseInt(values.package_name),
                // Exclude billing_cycle_Id in edit mode
                ...(mode === 'add' && values.billing_cycle_Id
                  ? { billing_cycle_Id: parseInt(values.billing_cycle_Id) }
                  : {}),
              };
              // Remove billing_cycle_Id from payload in edit mode
              if (mode === 'edit') {
                delete submitValues.billing_cycle_Id;
              }
              onSubmit(submitValues);
            }}
          >
            {({ isSubmitting, setFieldValue }) => (
              <Form className="flex-1 overflow-y-auto pr-2 space-y-4">
                {/* Package Name Dropdown */}
                <div>
                  <label htmlFor="package_name" className="block mb-1 font-medium">
                    Package Name
                  </label>
                  <Field
                    id="package_name"
                    name="package_name"
                    as="select"
                    className="w-full p-2 border rounded"
                    aria-label="Package Name"
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      setFieldValue('package_name', e.target.value);
                    }}
                  >
                    <option value="">Select package name</option>
                    {packageOptions.map(option => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="package_name"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Other Fields */}
                {[
                  { name: 'package_Price', label: 'Package Price', placeholder: 'Enter package price (e.g., 100.00)', type: 'text' },
                  { name: 'max_users', label: 'Max Users', placeholder: 'Enter max users', type: 'text' },
                  {
                    name: 'storage_Limit',
                    label: 'Storage Limit',
                    placeholder: 'Enter storage limit (e.g., 1024)',
                    type: 'text',
                  },
                ].map(({ name, label, placeholder, type = 'text' }) => (
                  <div key={name}>
                    <label htmlFor={name} className="block mb-1 font-medium">
                      {label}
                    </label>
                    <Field
                      id={name}
                      name={name}
                      type={type}
                      className="w-full p-2 border rounded"
                      placeholder={placeholder}
                      aria-label={label}
                    />
                    <ErrorMessage name={name} component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                ))}

                {/* Billing Cycle - Only show in add mode */}                                                                                                               
                {mode === 'add' && (
                  <div>
                    <label htmlFor="billing_cycle_Id" className="block mb-1 font-medium">
                      Billing Cycle
                    </label>
                    <Field
                      id="billing_cycle_Id"
                      name="billing_cycle_Id"
                      as="select"
                      className="w-full p-2 border rounded"
                      aria-label="Billing Cycle"
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        setFieldValue('billing_cycle_Id', e.target.value);
                      }}
                    >
                      <option value="">Select billing cycle</option>
                      {Object.entries(billingCycleMap).map(([id, label]) => (
                        <option key={id} value={id}>
                          {label}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="billing_cycle_Id"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                )}

                {/* Product ID */}
                {mode === 'add' ? (
                  <div>
                    <label htmlFor="product_Id" className="block mb-1 font-medium">
                      Product
                    </label>
                    <Field
                      id="product_Id"
                      name="product_Id"
                      as="select"
                      className="w-full p-2 border rounded"
                      aria-label="Product"
                    >
                      <option value="">Select product</option>
                      {selectedProduct && (
                        <option value={selectedProduct.product}>{selectedProduct.product_Name}</option>
                      )}
                    </Field>
                    <ErrorMessage
                      name="product_Id"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                ) : (
                  <Field name="product_Id" type="hidden" />
                )}

                {/* Buttons */}
                <div className="flex justify-end gap-2 sticky bottom-0 bg-white pt-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    aria-label="Cancel"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    aria-label={mode === 'edit' ? 'Update Package' : 'Save Package'}
                  >
                    {mode === 'edit' ? 'Update' : 'Save'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        )}

        {/* View mode Close button */}
        {mode === 'view' && (
          <div className="flex justify-end gap-2 mt-4 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              aria-label="Close"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PackagePopup;