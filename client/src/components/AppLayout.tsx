import { Button } from "antd";
import { Link, Outlet, useNavigate } from "react-router-dom";

export function AppLayout() {
  const navigate = useNavigate();

  return (
    <div className="app">
      <header className="header">
        <Link to="/" className="brand">
          Wallet Watchlist
        </Link>
        <Button onClick={() => navigate("/wallets/new")}>Add wallet</Button>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
