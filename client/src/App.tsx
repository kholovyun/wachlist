import { App as AntApp, ConfigProvider } from "antd";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { AddWallet } from "./pages/AddWallet";
import { WalletDetails } from "./pages/WalletDetails";
import { WalletList } from "./pages/WalletList";

export default function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 0,
          colorPrimary: "#111111",
          colorInfo: "#111111",
          colorSuccess: "#111111",
          colorWarning: "#111111",
          colorError: "#111111",
          colorLink: "#111111",
          colorText: "#111111",
          colorTextSecondary: "#666666",
          colorBorder: "#dddddd",
          colorBgContainer: "#ffffff",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          controlHeight: 36,
        },
        components: {
          Button: {
            primaryShadow: "none",
            defaultShadow: "none",
            dangerShadow: "none",
            defaultBorderColor: "#111111",
            defaultColor: "#111111",
          },
          Table: {
            headerBg: "#ffffff",
            headerColor: "#111111",
            borderColor: "#dddddd",
            rowHoverBg: "#fafafa",
          },
          Alert: {
            colorErrorBg: "#ffffff",
            colorErrorBorder: "#111111",
            colorError: "#111111",
            colorInfoBg: "#ffffff",
            colorInfoBorder: "#111111",
          },
          Message: {
            contentBg: "#ffffff",
          },
        },
      }}
    >
      <AntApp>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<WalletList />} />
              <Route path="wallets/new" element={<AddWallet />} />
              <Route path="wallets/:id" element={<WalletDetails />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}
