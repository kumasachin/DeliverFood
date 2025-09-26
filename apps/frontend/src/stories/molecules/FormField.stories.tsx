import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { DLSFormField } from "../../dls/molecules/FormField";

const meta: Meta<typeof DLSFormField> = {
  title: "DLS/Molecules/FormField",
  component: DLSFormField,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Name",
    placeholder: "Enter your name",
  },
};

export const Required: Story = {
  args: {
    label: "Email",
    placeholder: "Enter your email",
    required: true,
  },
};

export const WithError: Story = {
  args: {
    label: "Password",
    placeholder: "Enter password",
    error: true,
    helperText: "Password is required",
  },
};