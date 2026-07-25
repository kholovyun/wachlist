import { Alert, App, Button, Form, Input, Spin, Table } from "antd";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  formatAmount,
  formatDate,
  formatUsd,
  networkLabel,
  shortenAddress,
} from "../formatHelpers";
import {
  ApiError,
  deleteWallet,
  getWallet,
  getWalletActivity,
  getWalletAssets,
  updateWallet,
} from "../walletApi";
import type { Activity, Asset, Wallet } from "../walletTypes";

type EditValues = { label: string; notes?: string };

export function WalletDetails() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  const [form] = Form.useForm<EditValues>();

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [totalValueUsd, setTotalValueUsd] = useState(0);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [w, a, act] = await Promise.all([
        getWallet(id),
        getWalletAssets(id),
        getWalletActivity(id),
      ]);
      setWallet(w);
      form.setFieldsValue({ label: w.label, notes: w.notes });
      setAssets(a.assets);
      setTotalValueUsd(a.totalValueUsd);
      setActivity(act.activity);
    } catch (err) {
      setWallet(null);
      setError(err instanceof ApiError ? err.message : "Failed to load wallet");
    } finally {
      setLoading(false);
    }
  }, [id, form]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSave(values: EditValues) {
    setSaving(true);
    try {
      const updated = await updateWallet(id, values);
      setWallet(updated);
      message.success("Saved");
    } catch (err) {
      if (err instanceof ApiError) {
        message.error(err.message);
        if (err.fieldErrors) {
          form.setFields(
            Object.entries(err.fieldErrors).map(([name, errors]) => ({
              name: name as keyof EditValues,
              errors,
            }))
          );
        }
      } else {
        message.error("Failed to save");
      }
    } finally {
      setSaving(false);
    }
  }

  function onDelete() {
    modal.confirm({
      title: "Delete wallet?",
      okText: "Delete",
      okButtonProps: { type: "default" },
      onOk: async () => {
        setDeleting(true);
        try {
          await deleteWallet(id);
          message.success("Deleted");
          navigate("/");
        } catch (err) {
          message.error(err instanceof ApiError ? err.message : "Failed to delete");
          setDeleting(false);
        }
      },
    });
  }

  if (loading) {
    return (
      <div className="center">
        <Spin />
      </div>
    );
  }

  if (error || !wallet) {
    return (
      <div className="page">
        <Alert
          type="error"
          showIcon={false}
          message={error ?? "Wallet not found"}
          action={
            <Button size="small" onClick={() => void load()}>
              Retry
            </Button>
          }
        />
        <Link to="/">Back</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div>
        <Link to="/">← Watchlist</Link>
        <h1 style={{ marginTop: 8 }}>{wallet.label}</h1>
        <div className="muted">
          {networkLabel(wallet.network)} · {formatUsd(totalValueUsd)}
        </div>
        <div className="mono muted" style={{ marginTop: 4 }}>
          {wallet.address}
        </div>
      </div>

      <section className="section">
        <h2>Assets</h2>
        <Table<Asset>
          rowKey="symbol"
          size="middle"
          pagination={false}
          dataSource={assets}
          scroll={{ x: 360 }}
          columns={[
            { title: "Asset", dataIndex: "symbol" },
            {
              title: "Balance",
              dataIndex: "balance",
              render: (v: number) => <span className="mono">{formatAmount(v)}</span>,
            },
            {
              title: "Value",
              dataIndex: "valueUsd",
              render: (v: number) => formatUsd(v),
            },
          ]}
        />
      </section>

      <section className="section">
        <h2>Activity</h2>
        <Table<Activity>
          rowKey="id"
          size="middle"
          pagination={false}
          dataSource={activity}
          scroll={{ x: 520 }}
          columns={[
            { title: "Type", dataIndex: "type" },
            {
              title: "Amount",
              render: (_, row) => (
                <span className="mono">
                  {formatAmount(row.amount)} {row.asset}
                </span>
              ),
            },
            {
              title: "Date",
              dataIndex: "timestamp",
              render: (ts: string) => formatDate(ts),
            },
            {
              title: "Counterparty",
              dataIndex: "counterparty",
              render: (v: string) => (
                <span className="mono muted">{shortenAddress(v, 4)}</span>
              ),
            },
            { title: "Status", dataIndex: "status" },
          ]}
        />
      </section>

      <section className="section">
        <h2>Edit</h2>
        <Form form={form} layout="vertical" requiredMark={false} onFinish={onSave}>
          <Form.Item
            label="Label"
            name="label"
            rules={[{ required: true, message: "Label is required" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Notes" name="notes">
            <Input.TextArea rows={2} />
          </Form.Item>
          <div className="actions">
            <Button loading={deleting} onClick={onDelete}>
              Delete
            </Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              Save
            </Button>
          </div>
        </Form>
      </section>
    </div>
  );
}
