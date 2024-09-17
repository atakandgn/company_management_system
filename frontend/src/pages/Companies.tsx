import React, { useEffect, useRef, useState } from "react";
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
import { Button, Modal, Form, Input, Popconfirm, message, Tooltip } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import axiosInstance from "../../axiosConfig";
import * as XLSX from "xlsx";
import Preloader from "../components/Preloader";

interface Company {
  key: string | number;
  _id?: string;
  name: string;
  legalNumber: string;
  country: string;
  website: string;
}

const Companies: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState<string>("");
  const [originalData, setOriginalData] = useState<{ [key: string]: Company }>(
    {}
  );
  const formRef = useRef<ProFormInstance<any>>();
  const actionRef = useRef<ActionType>();
  const editableFormRef = useRef<EditableFormInstance>();
  const [form] = Form.useForm();

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/company");
      const companyData = response.data.companies.map((company: any) => ({
        key: company._id,
        _id: company._id,
        name: company.name,
        legalNumber: company.legalNumber,
        country: company.country,
        website: company.website,
      }));
      setCompanies(companyData);
    } catch (error) {
      message.error("Failed to fetch companies.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(companies.map(({ __v, ...item }) => item));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Companies");
    XLSX.writeFile(workbook, "companies_data.xlsx");
  };

  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      const newCompany = { ...values };
      const response = await axiosInstance.post("/company/add", newCompany);

      setCompanies([
        ...companies,
        { key: response.data.company._id, ...response.data.company },
      ]);
      form.resetFields();
      setIsModalVisible(false);
      message.success(`${newCompany.name} has been successfully added.`);
    } catch (error) {
      message.error("Failed to add company.");
      console.error(error);
    }
  };

  const handleSave = async (key: React.Key, row: Company) => {
    try {
      const response = await axiosInstance.put(`/company/update/${key}`, row);
      setCompanies((prevCompanies) =>
        prevCompanies.map((company) =>
          company._id === key
            ? { ...company, ...response.data.company }
            : company
        )
      );
      message.success(`Changes for ${row.name} have been saved.`);
    } catch (error) {
      message.error("Failed to save changes.");
      console.error(error);
    }
  };

  const handleDelete = async (company: Company) => {
    try {
      await axiosInstance.delete(`/company/delete/${company._id}`);
      setCompanies(companies.filter((item) => item._id !== company._id));
      message.success(`${company.name} has been successfully deleted.`);
    } catch (error) {
      message.error("Failed to delete company.");
      console.error(error);
    }
  };

  const handleCancel = (row: Company) => {
    setCompanies((prevCompanies) =>
      prevCompanies.map((company) =>
        company.key === row.key ? originalData[row.key] : company
      )
    );
    setEditableRowKeys(editableKeys.filter((key) => key !== row.key));
    message.info(`Editing for ${row.name} has been canceled.`);
  };

  const onSearch = (value: string) => {
    setSearchText(value);
  };

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchText.toLowerCase()) ||
      company.legalNumber.includes(searchText) ||
      company.country.toLowerCase().includes(searchText)
  );

  const columns: ProColumns<Company>[] = [
    {
      title: "Company Name",
      dataIndex: "name",
      valueType: "text",
      ellipsis: true,
      sorter: (a, b) => a.name.localeCompare(b.name),
      formItemProps: {
        rules: [{ required: true, message: "Company name is required." }],
      },
    },
    {
      title: "Legal Number",
      dataIndex: "legalNumber",
      valueType: "text",
      sorter: (a, b) => a.legalNumber.localeCompare(b.legalNumber),
      ellipsis: true,
      formItemProps: {
        rules: [{ required: true, message: "Legal number is required." }],
      },
    },
    {
      title: "Country",
      dataIndex: "country",
      valueType: "text",
      filters: [...new Set(companies.map((item) => item.country))].map(
        (country) => ({ text: country, value: country })
      ),
      onFilter: (value, record) => record.country === value,
      sorter: (a, b) => a.country.localeCompare(b.country),
      formItemProps: {
        rules: [{ required: true, message: "Country is required." }],
      },
    },
    {
      title: "Website",
      dataIndex: "website",
      valueType: "text",
      render: (_, record) => <a href={record.website}>{record.website}</a>,
      formItemProps: {
        rules: [{ required: true, message: "Website is required." }],
      },
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
                onClick={() => editableFormRef.current?.save?.(row.key)}
                className="dark:bg-gray-800 dark:text-white"
              />
            </Tooltip>
            <Tooltip title="Cancel">
              <Button
                key="cancel"
                icon={<CloseOutlined />}
                onClick={() => handleCancel(row)}
                className="dark:bg-gray-800 dark:text-white"
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
            initialValues={{ table: companies }}
            submitter={false}
          >
            <ProFormDependency name={["table"]}>
              {() => {
                return (
                  <div className="flex items-center justify-between pb-4 flex-wrap">
                    <div>
                      <span className="text-lg font-semibold dark:text-white">
                        Companies Data Table
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <Input.Search
                        placeholder="Search companies"
                        onSearch={onSearch}
                        className="w-full sm:w-auto dark:bg-gray-800 dark:border-gray-700 dark:text-white"
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
                        className="w-full sm:w-auto"
                        onClick={() => setIsModalVisible(true)}
                      >
                        Add Company
                      </Button>
                    </div>
                  </div>
                );
              }}
            </ProFormDependency>

            <EditableProTable<Company>
              rowKey="key"
              editableFormRef={editableFormRef}
              controlled
              actionRef={actionRef}
              columns={columns}
              value={filteredCompanies}
              onChange={(value) => setCompanies(value as Company[])}
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
              scroll={{
                x: true,
              }}
              recordCreatorProps={false}
            />
          </ProForm>

          {/* Modal for adding a new company */}
          <Modal
            title="Add Company"
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            onOk={handleAdd}
            className="rounded-lg"
          >
            <Form form={form} layout="vertical">
              <Form.Item
                name="name"
                label="Company Name"
                rules={[{ required: true }]}
                className="dark:text-white"
              >
                <Input className="dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
              </Form.Item>
              <Form.Item
                name="legalNumber"
                label="Legal Number"
                rules={[
                  { required: true },
                  {
                    pattern: /^[0-9]+$/,
                    message: "Legal number must be digits only.",
                  },
                ]}
                className="dark:text-white"
              >
                <Input className="dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
              </Form.Item>
              <Form.Item
                name="country"
                label="Country"
                rules={[
                  { required: true },
                  {
                    pattern: /^[A-Za-z\s]+$/,
                    message: "Country must contain letters only.",
                  },
                ]}
                className="dark:text-white"
              >
                <Input className="dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
              </Form.Item>
              <Form.Item
                name="website"
                label="Website"
                rules={[
                  { required: true },
                  {
                    type: "url",
                    message:
                      "Please enter a valid URL. (https://www.example.com)",
                  },
                ]}
                className="dark:text-white"
              >
                <Input className="dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
              </Form.Item>
            </Form>
          </Modal>
        </div>
      )}
    </ProCard>
  );
};

export default Companies;
