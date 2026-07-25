import { Alert, App, Button, Form, Input, Select } from "antd";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError, createWallet } from "../walletApi";
import type { Network } from "../walletTypes";

const NETWORKS: { value: Network; label: string }[] = [
  { value: "ethereum", label: "Ethereum" },
  { value: "bitcoin", label: "Bitcoin" },
  { value: "solana", label: "Solana" },
  { value: "polygon", label: "Polygon" },
];

const SAMPLE: Record<Network, string> = {
  ethereum: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  polygon: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  bitcoin: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
  solana: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
};

type FormValues = {
  label: string;
  network: Network;
  address: string;
  notes?: string;
};

export function AddWallet() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm<FormValues>();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onFinish(values: FormValues) {
    setSubmitting(true);
    setError(null);

    try {
      const wallet = await createWallet({
        label: values.label,
        address: values.address,
        network: values.network,
        notes: values.notes,
      });
      message.success("Saved");
      navigate(`/wallets/${wallet.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.fieldErrors) {
          form.setFields(
            Object.entries(err.fieldErrors).map(([name, errors]) => ({
              name: name as keyof FormValues,
              errors,
            }))
          );
        }
      } else {
        setError("Failed to create wallet");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page" style={{ maxWidth: 460 }}>
      <div>
        <Link to="/">← Back</Link>
        <h1 style={{ marginTop: 8 }}>Add wallet</h1>
      </div>

      {error && <Alert type="error" showIcon={false} message={error} />}

      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={{
          network: "ethereum",
          address: SAMPLE.ethereum,
        }}
        onFinish={onFinish}
      >
        <Form.Item
          label="Label"
          name="label"
          rules={[{ required: true, message: "Label is required" }]}
        >
          <Input placeholder="Treasury" />
        </Form.Item>

        <Form.Item label="Network" name="network" rules={[{ required: true }]}>
          <Select
            options={NETWORKS}
            onChange={(network: Network) => {
              form.setFieldValue("address", SAMPLE[network]);
            }}
          />
        </Form.Item>

        <Form.Item
          label="Address"
          name="address"
          rules={[{ required: true, message: "Address is required" }]}
        >
          <Input className="mono" />
        </Form.Item>

        <Form.Item label="Notes" name="notes">
          <Input.TextArea rows={2} />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={submitting}>
          Save
        </Button>
      </Form>
    </div>
  );
}
