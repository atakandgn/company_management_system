import React, { useState, useRef, useEffect } from "react";
import {
  EditableProTable,
  ProCard,
  ProForm,
  ProFormInstance,
  ProFormDependency,
} from "@ant-design/pro-components";
import type {
  ActionType,
  EditableFormInstance,
  ProColumns,
} from "@ant-design/pro-components";
import {
  Button,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  message,
  Tooltip,
  Descriptions,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import axiosInstance from "../../axiosConfig";
import * as XLSX from "xlsx";
import Preloader from "../components/Preloader";

interface Product {
  key: string;
  _id?: string;
  name: string;
  category: string;
  amount: string;
  unit: string;
  company: string;
  companyId: string;
}

interface Company {
  _id: string;
  name: string;
  legalNumber: string;
  country: string;
  website: string;
}

interface Unit {
  _id: string;
  name: string;
}

interface Category {
  _id: string;
  name: string;
}

const Products: React.FC = () => {
  const [loading, setLoading] = useState(false); 
  const [products, setProducts] = useState<Product[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [companyDetailsVisible, setCompanyDetailsVisible] = useState(false); 
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [originalData, setOriginalData] = useState<{ [key: string]: Product }>(
    {}
  );
  const formRef = useRef<ProFormInstance<any>>();
  const actionRef = useRef<ActionType>();
  const editableFormRef = useRef<EditableFormInstance>();
  const [form] = Form.useForm();
  const [units, setUnits] = useState<Unit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchCompanies();
    fetchStatics();
  }, []);

  const fetchStatics = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/product/statics");
      setUnits(response.data.units);
      setCategories(response.data.categories);
      setLoading(false);
    } catch (error) {
      message.error("Failed to fetch units.");
      setLoading(false);
      console.error(error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/product");
      const productData = response.data.products.map((product: any) => ({
        key: product._id,
        _id: product._id,
        name: product.name,
        category: product.category,
        amount: product.amount,
        unit: product.unit,
        company: product.companyId.name,
        companyId: product.companyId._id, 
      }));
      setProducts(productData);
      setLoading(false);
    } catch (error) {
      message.error("Failed to fetch products.");
      setLoading(false);
      console.error(error);
    }
  };

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/company");
      setCompanies(response.data.companies);
      setLoading(false);
    } catch (error) {
      message.error("Failed to fetch companies.");
      setLoading(false);
      console.error(error);
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet( products.map((product) => ({ ...product, company: product.company })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, "products_data.xlsx");
  };

  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      const newProduct = {
        ...values,
        companyId: values.company,
      };

      const response = await axiosInstance.post("/product/add", newProduct);

      setProducts([
        ...products,
        {
          key: response.data.product._id,
          ...response.data.product,
          company: companies.find(
            (c) => c._id === response.data.product.companyId
          )?.name,
        },
      ]);
      form.resetFields();
      setIsModalVisible(false);
      message.success(`${newProduct.name} has been successfully added.`);
    } catch (error) {
      message.error("Failed to add product.");
      console.error(error);
    }
  };

  const handleSave = async (key: React.Key, row: Product) => {
    try {
      const updatedProduct = {
        ...row,
        company: undefined,
        unit: undefined,
      };

      const response = await axiosInstance.put(
        `/product/update/${key}`,
        updatedProduct
      );

      const companyName = companies.find(
        (c) => c._id === response.data.product.companyId
      )?.name;

      setProducts((prevProducts) =>
        prevProducts.map((product) => {
          return product._id === key
            ? {
                ...product,
                ...response.data.product,
                company: companyName,
              }
            : product;
        })
      );

      message.success(`Changes for ${row.name} have been saved.`);
    } catch (error) {
      message.error("Failed to save changes.");
      console.error(error);
    }
  };

  const handleDelete = async (product: Product) => {
    try {
      await axiosInstance.delete(`/product/delete/${product._id}`);
      setProducts(products.filter((item) => item._id !== product._id));
      message.success(`${product.name} has been successfully deleted.`);
    } catch (error) {
      message.error("Failed to delete product.");
      console.error(error);
    }
  };

  const handleCancel = (product: Product) => {
    setProducts((prevProducts) =>
      prevProducts.map((item) =>
        item.key === product.key ? originalData[product.key] : item
      )
    );
    setEditableRowKeys(editableKeys.filter((key) => key !== product.key));
  };

  const onSearch = (value: string) => {
    setSearchText(value);
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchText.toLowerCase()) ||
      product.category.toLowerCase().includes(searchText.toLowerCase()) ||
      product.company.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleCompanyClick = async (companyId: string) => {
    try {
      const response = await axiosInstance.get(`/company/?id=${companyId}`);
      setSelectedCompany(response.data);
      setCompanyDetailsVisible(true);
    } catch (error) {
      message.error("Failed to fetch company details.");
      console.error(error);
    }
  };

  const columns: ProColumns<Product>[] = [
    {
      title: "Product Name",
      dataIndex: "name",
      valueType: "text",
      ellipsis: true,
      sorter: (a, b) => a.name.localeCompare(b.name),
      formItemProps: {
        rules: [{ required: true, message: "Product name is required." }],
      },
      className: "dark:text-white",
    },
    {
      title: "Category",
      dataIndex: "category",
      valueType: "text",
      sorter: (a, b) => a.category.localeCompare(b.category),
      formItemProps: {
        rules: [{ required: true, message: "Category is required." }],
      },
      className: "dark:text-white",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      valueType: "text",
      sorter: (a, b) => a.amount.localeCompare(b.amount),
      formItemProps: {
        rules: [{ required: true, message: "Amount is required." }],
      },
      className: "dark:text-white",
    },
    {
      title: "Unit",
      dataIndex: "unit",
      valueType: "text",
      editable: false,
      className: "dark:text-white",
    },
    {
      title: "Company",
      dataIndex: "company",
      valueType: "text",
      editable: false,
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => handleCompanyClick(record.companyId)}
          icon={<InfoCircleOutlined />}
        >
          <span className="dark:text-blue-500">{record.company}</span>
        </Button>
      ),
      sorter: (a, b) => a.company.localeCompare(b.company),
      className: "dark:text-white",
    },
    {
      title: "Operation",
      valueType: "option",
      render: (_, row) => [
        editableKeys.includes(row.key) ? (
          <>
            <Tooltip title="Save">
              <Button
                key="save"
                icon={<CheckOutlined />}
                onClick={() => editableFormRef.current?.onSave?.(row.key)}
              />
            </Tooltip>
            <Tooltip title="Cancel">
              <Button
                key="cancel"
                icon={<CloseOutlined />}
                onClick={() => editableFormRef.current?.onCancel?.(row.key)}
              />
            </Tooltip>
          </>
        ) : (
          <>
            <Tooltip title="Edit">
              <Button
                key="edit"
                icon={<EditOutlined />}
                onClick={() => {
                  setOriginalData((prev) => ({
                    ...prev,
                    [row.key]: { ...row },
                  }));
                  actionRef.current?.startEditable(row.key);
                }}
              />
            </Tooltip>
            <Popconfirm
              key="delete"
              title={`Are you sure to delete ${row.name}?`}
              onConfirm={() => handleDelete(row)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Delete">
                <Button danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          </>
        ),
      ],
      className: "dark:text-white",
    },
  ];

  return (
    <ProCard className="dark:bg-gray-800 dark:border dark:border-gray-700 h-[70vh]">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <Preloader />
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          <ProForm
            formRef={formRef}
            initialValues={{ table: products }}
            submitter={false}
          >
            <ProFormDependency name={["table"]}>
              {({ table }) => (
                <div className="flex items-center justify-between pb-4 flex-wrap dark:text-white">
                  <div>
                    <span className="text-lg font-semibold">
                      Products Data Table
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <Input.Search
                      placeholder="Search products"
                      onSearch={onSearch}
                      className="w-full sm:w-auto dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                    <Button
                      onClick={exportToExcel}
                      type="dashed"
                      className="w-full sm:w-auto dark:bg-gray-800 dark:text-white"
                    >
                      <DownloadOutlined />
                      Export to Excel
                    </Button>
                    <Button
                      type="primary"
                      className="w-full sm:w-auto "
                      onClick={() => setIsModalVisible(true)}
                    >
                      Add Product
                    </Button>
                  </div>
                </div>
              )}
            </ProFormDependency>

            <EditableProTable<Product>
              rowKey="key"
              editableFormRef={editableFormRef}
              controlled
              actionRef={actionRef}
              columns={columns}
              value={filteredProducts}
              onChange={(value) => setProducts(value as Product[])}
              editable={{
                type: "multiple",
                editableKeys,
                onChange: setEditableRowKeys,
                onSave: async (key: React.Key, row) => {
                  return handleSave(key, row);
                },
                onDelete: async (key, row) => {
                  handleDelete(row);
                },
                onCancel: async (key, row) => {
                  handleCancel(row);
                },
                actionRender: (row, config) => [
                  <Tooltip title="Save">
                    <Button
                      key="save"
                      icon={<CheckOutlined />}
                      onClick={() => config?.onSave?.(row.key, row)}
                    />
                  </Tooltip>,
                  <Tooltip title="Cancel">
                    <Button
                      key="cancel"
                      icon={<CloseOutlined />}
                      onClick={() => config?.onCancel?.(row.key, row)}
                    />
                  </Tooltip>,
                ],
              }}
              pagination={{
                pageSize: 5,
                showQuickJumper: true,
                position: ["bottomCenter"],
              }}
              search={false}
              scroll={{ x: true }}
              recordCreatorProps={false}
            />
          </ProForm>

          <Modal
            centered
            title="Add Product"
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            onOk={handleAdd}
            className="dark:bg-gray-800 dark:text-white dark:border dark:border-gray-600"
          >
            <Form form={form} layout="vertical">
              <Form.Item
                name="name"
                label="Product Name"
                rules={[{ required: true }]}
                className=""
              >
                <Input className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
              </Form.Item>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true }]}
                className="dark:text-white"
              >
                <Select className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                  {categories.map((category) => (
                    <Select.Option key={category._id} value={category.name}>
                      {category.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="amount"
                label="Amount"
                rules={[{ required: true }]}
                className="dark:text-white"
              >
                <Input className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
              </Form.Item>
              <Form.Item
                name="unit"
                label="Unit"
                rules={[{ required: true }]}
                className="dark:text-white"
              >
                <Select className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                  {units.map((unit) => (
                    <Select.Option key={unit._id} value={unit.name}>
                      {unit.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="company"
                label="Company"
                rules={[{ required: true }]}
                className="dark:text-white"
              >
                <Select className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                  {companies.map((company) => (
                    <Select.Option key={company._id} value={company._id}>
                      {company.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </Modal>
          <Modal
            centered
            title={
              <div className="flex items-center">
                <InfoCircleOutlined className="mr-2 text-blue-500" />
                <span className="text-lg font-semibold">Company Details</span>
              </div>
            }
            open={companyDetailsVisible}
            onCancel={() => setCompanyDetailsVisible(false)}
            footer={null}
            className="rounded-lg shadow-lg"
          >
            <div className="flex flex-col gap-4">
              <Descriptions
                bordered
                column={1}
                labelStyle={{
                  backgroundColor: "#f0f2f5",
                  fontWeight: 500,
                  width: "30%",
                }}
                contentStyle={{ backgroundColor: "#fff" }}
              >
                <Descriptions.Item label="Company Name">
                  <span className="text-lg">{selectedCompany?.name}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Legal Number">
                  <span className="text-lg">
                    {selectedCompany?.legalNumber}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Country">
                  <span className="text-lg">{selectedCompany?.country}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Website">
                  <a
                    href={selectedCompany?.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500"
                  >
                    {selectedCompany?.website}
                  </a>
                </Descriptions.Item>
              </Descriptions>
            </div>
          </Modal>
        </div>
      )}
    </ProCard>
  );
};

export default Products;
