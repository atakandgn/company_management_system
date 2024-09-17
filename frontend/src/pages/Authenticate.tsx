import React, { useState, useEffect, useRef } from "react";
import { Form, Input, Button, Row, Col, Tabs, message } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  IdcardOutlined,
  ArrowRightOutlined,
  LoginOutlined,
  UserAddOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import axiosInstance from "../../axiosConfig";
import { useNavigate } from "react-router-dom";
import LeftBg from "../assets/bg-left.png";
import RightBg from "../assets/bg-right.png";

const { TabPane } = Tabs;

const Authenticate: React.FC = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [tabHeight, setTabHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const onFinishLogin = async (values: any) => {
    try {
      const response = await axiosInstance.post("/user/login", {
        username: values.username,
        password: values.password,
      });
      message.success("Successfully logged in!");
      localStorage.setItem("token", response.data.token);
      navigate("/"); 
    } catch (error) {
      console.error("Login failed:", error);
      message.error("Login failed! Please check your credentials.");
    }
  };

  const onFinishRegister = async (values: any) => {
    try {
      const response = await axiosInstance.post("/user/register", {
        firstname: values.firstname,
        lastname: values.lastname,
        username: values.username,
        email: values.email,
        password: values.password,
      });
      message.success(
        `Account created successfully! Welcome! ${response.data.username}`
      );
      setActiveTab("login");
    } catch (error) {
      console.error("Register failed:", error);
      message.error("Register failed! Please check your information.");
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  useEffect(() => {
    if (contentRef.current) {
      setTabHeight(contentRef.current.scrollHeight);
    }
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      setTabHeight(contentRef.current.scrollHeight);
    }
  }, [activeTab]);

  return (
    <div className="min-h-full flex items-center justify-center rounded-lg bg-gray-100 dark:bg-black">
      {/* Background Images */}
      <img
        src={LeftBg}
        alt="Left Background"
        className="absolute left-0 top-0 h-full w-auto hidden md:block"
      />
      <img
        src={RightBg}
        alt="Right Background"
        className="absolute right-0 top-0 h-full w-auto hidden md:block"
      />

      {/* Authentication Form */}
      <div className="relative bg-white p-8 shadow-lg rounded-lg w-full max-w-md z-10 dark:bg-gray-800 dark:border dark:border-gray-700">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          tabBarStyle={{ marginBottom: "2rem" }}
          className="dark:text-white"
        >
          <TabPane
            tab={
              <span className="dark:text-white">
                <LoginOutlined /> Giriş Yap
              </span>
            }
            key="login"
          />
          <TabPane
            tab={
              <span className="dark:text-white">
                <UserAddOutlined /> Kayıt Ol
              </span>
            }
            key="register"
          />
        </Tabs>

        {/* Tab Content */}
        <div
          className="transition-all duration-500 ease-in-out overflow-hidden"
          style={{ height: tabHeight }}
        >
          <div ref={contentRef}>
            {activeTab === "login" && (
              <div className="transition-opacity duration-500 ease-in-out">
                <Form
                  name="login"
                  onFinish={onFinishLogin}
                  onFinishFailed={onFinishFailed}
                  autoComplete="off"
                  layout="vertical"
                  className="dark:text-white"
                >
                  <Form.Item
                    label={
                      <span className="dark:text-white">Kullanıcı Adı</span>
                    }
                    name="username"
                    rules={[
                      { required: true, message: "Kullanıcı adınızı giriniz!" },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="Kullanıcı Adı"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    />
                  </Form.Item>

                  <Form.Item
                    label={<span className="dark:text-white">Şifre</span>}
                    name="password"
                    rules={[{ required: true, message: "Şifrenizi giriniz!" }]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Şifre"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      block
                      className="dark:bg-blue-500 dark:border-blue-500 dark:text-white"
                    >
                      <LoginOutlined /> Giriş Yap
                    </Button>
                  </Form.Item>

                  <div className="flex flex-col items-center gap-2 mt-4 dark:text-white">
                    <span>
                      Hesabınız yok mu?{" "}
                      <a
                        onClick={() => setActiveTab("register")}
                        className="dark:text-blue-400"
                      >
                        <UserAddOutlined />
                        <span>Kayıt olun</span>
                      </a>
                    </span>
                    <a href="#" className="dark:text-blue-400">
                      <KeyOutlined />
                      <span>Şifremi unuttum</span>
                    </a>
                  </div>
                </Form>
              </div>
            )}

            {activeTab === "register" && (
              <div className="transition-opacity duration-500 ease-in-out">
                <Form
                  name="register"
                  onFinish={onFinishRegister}
                  onFinishFailed={onFinishFailed}
                  autoComplete="off"
                  layout="vertical"
                  className="dark:text-white"
                >
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label={<span className="dark:text-white">Ad</span>}
                        name="firstname"
                        rules={[
                          { required: true, message: "Adınızı giriniz!" },
                        ]}
                      >
                        <Input
                          prefix={<IdcardOutlined />}
                          placeholder="Ad"
                          className="dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label={<span className="dark:text-white">Soyad</span>}
                        name="lastname"
                        rules={[
                          { required: true, message: "Soyadınızı giriniz!" },
                        ]}
                      >
                        <Input
                          prefix={<IdcardOutlined />}
                          placeholder="Soyad"
                          className="dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label={
                          <span className="dark:text-white">Kullanıcı Adı</span>
                        }
                        name="username"
                        rules={[
                          {
                            required: true,
                            message: "Kullanıcı adınızı giriniz!",
                          },
                        ]}
                      >
                        <Input
                          prefix={<UserOutlined />}
                          placeholder="Kullanıcı Adı"
                          className="dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label={<span className="dark:text-white">Email</span>}
                        name="email"
                        rules={[
                          {
                            required: true,
                            message: "Email adresinizi giriniz!",
                          },
                          {
                            type: "email",
                            message: "Geçerli bir email adresi giriniz!",
                          },
                        ]}
                      >
                        <Input
                          prefix={<MailOutlined />}
                          placeholder="Email"
                          className="dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label={<span className="dark:text-white">Şifre</span>}
                        name="password"
                        rules={[
                          { required: true, message: "Şifrenizi giriniz!" },
                        ]}
                      >
                        <Input.Password
                          prefix={<LockOutlined />}
                          placeholder="Şifre"
                          className="dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label={
                          <span className="dark:text-white">
                            Şifreyi Onaylayın
                          </span>
                        }
                        name="confirmPassword"
                        dependencies={["password"]}
                        rules={[
                          { required: true, message: "Şifrenizi onaylayın!" },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (
                                !value ||
                                getFieldValue("password") === value
                              ) {
                                return Promise.resolve();
                              }
                              return Promise.reject(
                                new Error("Şifreler uyuşmuyor!")
                              );
                            },
                          }),
                        ]}
                      >
                        <Input.Password
                          prefix={<LockOutlined />}
                          placeholder="Şifreyi Onaylayın"
                          className="dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      block
                      className="dark:bg-blue-500 dark:border-blue-500 dark:text-white"
                    >
                      <UserAddOutlined /> Kayıt Ol
                    </Button>
                  </Form.Item>

                  <div className="flex justify-center mt-4 dark:text-white">
                    <span>
                      Hesabınız var mı?{" "}
                      <a
                        className="dark:text-blue-400"
                        onClick={() => setActiveTab("login")}
                      >
                        <ArrowRightOutlined /> Giriş yapın
                      </a>
                    </span>
                  </div>
                </Form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Authenticate;
