import React, { useState, useEffect } from "react";
import { Form, Input, Button, Switch, message, Card, Row, Col } from "antd";
import { UserOutlined, MailOutlined, LockOutlined, SunOutlined, MoonOutlined } from "@ant-design/icons";
import axiosInstance from "../../axiosConfig";

interface SettingsProps {
  darkMode: boolean;
  toggleDarkMode: (checked: boolean) => void;
}

const Settings: React.FC<SettingsProps> = ({ darkMode, toggleDarkMode }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get("/user");
        const userData = response.data.user;
        form.setFieldsValue({
          firstname: userData.firstname,
          lastname: userData.lastname,
          username: userData.username,
          email: userData.email,
        });
      } catch (error) {
        message.error("Failed to load user information.");
        console.error(error);
      }
    };

    fetchUserData();
  }, [form]);

  const handleFormSubmit = async (values: any) => {
    setLoading(true);
    try {
      await axiosInstance.put("/user/update", {
        firstname: values.firstname,
        lastname: values.lastname,
        username: values.username,
        email: values.email,
        password: values.password,
      });
      message.success("User information updated successfully!");
    } catch (error) {
      message.error("Failed to update user information.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container p-6 max-w-3xl mx-auto dark:bg-gray-900">
      <Card className="shadow-lg dark:bg-gray-800 dark:text-white">
        <h2 className="text-2xl font-semibold mb-6 text-center dark:text-white">
          User Settings
        </h2>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={{
            firstname: "",
            lastname: "",
            username: "",
            email: "",
          }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="firstname"
                label={<span className="dark:text-white">First Name</span>}
                rules={[
                  { required: true, message: "Please enter your first name!" },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="First name"
                  className="dark:bg-gray-700 dark:text-white"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="lastname"
                label={<span className="dark:text-white">Last Name</span>}
                rules={[
                  { required: true, message: "Please enter your last name!" },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Last name"
                  className="dark:bg-gray-700 dark:text-white"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="username"
                label={<span className="dark:text-white">Username</span>}
                rules={[
                  { required: true, message: "Please enter your username!" },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Enter your username"
                  className="dark:bg-gray-700 dark:text-white"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="email"
                label={<span className="dark:text-white">Email</span>}
                rules={[
                  { required: true, message: "Please enter your email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Enter your email"
                  className="dark:bg-gray-700 dark:text-white"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="password"
                label={<span className="dark:text-white">New Password</span>}
                rules={[
                  {
                    required: false,
                    message: "Please enter your new password!",
                  },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Enter new password"
                  className="dark:bg-gray-700 dark:text-white"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="confirmPassword"
                label={<span className="dark:text-white">Confirm Password</span>}
                dependencies={["password"]}
                rules={[
                  {
                    required: false,
                    message: "Please confirm your password!",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Passwords do not match!")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Confirm password"
                  className="dark:bg-gray-700 dark:text-white"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item className="text-center">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full sm:w-auto"
            >
              Update Information
            </Button>
          </Form.Item>
        </Form>

        <div className="dark-mode-toggle mt-6 text-center">
          <h3 className="text-lg mb-3 dark:text-white">Dark Mode</h3>
          <Switch
            checked={darkMode}
            onChange={toggleDarkMode}
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
            className="dark:bg-gray-700 dark:text-white"
          />
        </div>
      </Card>
    </div>
  );
};

export default Settings;
