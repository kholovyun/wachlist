import { Alert, Button, Empty, Table } from "antd";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { networkLabel, shortenAddress } from "../formatHelpers";
import { ApiError, listWallets } from "../walletApi";
import type { Wallet } from "../walletTypes";

export function WalletList() {
  const navigate = useNavigate();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setWallets(await listWallets());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load wallets");
      setWallets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="page">
      <h1>Watchlist</h1>

      {error && (
        <Alert
          type="error"
          showIcon={false}
          message={error}
          action={
            <Button size="small" onClick={() => void load()}>
              Retry
            </Button>
          }
        />
      )}

      {!error && (
        <Table<Wallet>
          rowKey="id"
          size="middle"
          loading={loading}
          dataSource={wallets}
          pagination={false}
          scroll={{ x: 520 }}
          locale={{
            emptyText: (
              <Empty description="No wallets yet" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                <Button onClick={() => navigate("/wallets/new")}>Add wallet</Button>
              </Empty>
            ),
          }}
          columns={[
            {
              title: "Label",
              dataIndex: "label",
              render: (label: string, row) => (
                <Link to={`/wallets/${row.id}`}>{label}</Link>
              ),
            },
            {
              title: "Address",
              dataIndex: "address",
              render: (address: string) => (
                <span className="mono muted">{shortenAddress(address)}</span>
              ),
            },
            {
              title: "Network",
              dataIndex: "network",
              width: 120,
              render: (network: string) => networkLabel(network),
            },
          ]}
        />
      )}
    </div>
  );
}
