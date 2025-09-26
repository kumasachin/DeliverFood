import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { DLSStatusChip } from "../../dls/molecules/StatusChip";

const meta: Meta<typeof DLSStatusChip> = {
  title: "DLS/Molecules/StatusChip",
  component: DLSStatusChip,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    status: {
      control: "select",
      options: [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "delivered",
        "cancelled",
        "active",
        "inactive",
      ],
    },
    variant: {
      control: "select",
      options: [
        "default",
        "primary",
        "secondary",
        "error",
        "info",
        "success",
        "warning",
      ],
    },
    size: {
      control: "select",
      options: ["small", "medium"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    status: "confirmed",
  },
};

export const Pending: Story = {
  args: {
    status: "pending",
  },
};

export const Delivered: Story = {
  args: {
    status: "delivered",
  },
};

export const Cancelled: Story = {
  args: {
    status: "cancelled",
  },
};
