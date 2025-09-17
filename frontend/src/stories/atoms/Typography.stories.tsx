import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { DLSTypography } from "../../dls/atoms/Typography";

const meta: Meta<typeof DLSTypography> = {
  title: "DLS/Atoms/Typography",
  component: DLSTypography,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["h1", "h2", "h3", "h4", "h5", "h6", "body1", "body2", "caption", "button", "overline"],
    },
    color: {
      control: "select",
      options: ["inherit", "primary", "secondary", "textPrimary", "textSecondary", "error"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Heading1: Story = {
  args: {
    variant: "h1",
    children: "Heading 1",
  },
};

export const Heading2: Story = {
  args: {
    variant: "h2",
    children: "Heading 2",
  },
};

export const Body1: Story = {
  args: {
    variant: "body1",
    children: "Body text",
  },
};

export const Body2: Story = {
  args: {
    variant: "body2",
    children: "Small body text",
  },
};