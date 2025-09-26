import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { DLSInput } from "../../dls/atoms/Input";

const meta: Meta<typeof DLSInput> = {
  title: "DLS/Atoms/Input",
  component: DLSInput,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["outlined", "filled", "standard"],
    },
    size: {
      control: "select",
      options: ["small", "medium"],
    },
    type: {
      control: "select",
      options: ["text", "email", "password", "number"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Enter text",
  },
};

export const Email: Story = {
  args: {
    type: "email",
    placeholder: "Enter email",
  },
};

export const Password: Story = {
  args: {
    type: "password",
    placeholder: "Enter password",
  },
};