import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { DLSIcon } from "../../dls/atoms/Icon";

const meta: Meta<typeof DLSIcon> = {
  title: "DLS/Atoms/Icon",
  component: DLSIcon,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    name: {
      control: "select",
      options: [
        "home",
        "restaurant",
        "storefront",
        "search",
        "add",
        "delete",
        "checkCircle",
        "error",
        "star",
        "shoppingCart",
      ],
    },
    size: {
      control: "select",
      options: ["inherit", "small", "medium", "large"],
    },
    color: {
      control: "select",
      options: [
        "inherit",
        "primary",
        "secondary",
        "action",
        "error",
        "disabled",
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "home",
  },
};

export const Restaurant: Story = {
  args: {
    name: "restaurant",
  },
};

export const Search: Story = {
  args: {
    name: "search",
  },
};

export const ShoppingCart: Story = {
  args: {
    name: "shoppingCart",
  },
};