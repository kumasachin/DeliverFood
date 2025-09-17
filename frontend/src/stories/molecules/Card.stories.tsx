import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { DLSCard } from "../../dls/molecules/Card";

const meta: Meta<typeof DLSCard> = {
  title: "DLS/Molecules/Card",
  component: DLSCard,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    elevation: {
      control: { type: "range", min: 0, max: 24, step: 1 },
    },
    variant: {
      control: "select",
      options: ["elevation", "outlined"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Card Title",
    children:
      "This is the card content. It can contain any React elements or components.",
  },
};

export const WithSubtitle: Story = {
  args: {
    title: "Restaurant Name",
    subtitle: "Italian Cuisine",
    children:
      "Experience authentic Italian flavors in our cozy restaurant. Fresh ingredients and traditional recipes.",
  },
};

export const WithActions: Story = {
  args: {
    title: "Order Summary",
    subtitle: "Review your order",
    children: "Your order has been prepared and is ready for checkout.",
    actions: [
      {
        label: "Cancel",
        onClick: () => console.log("Cancel clicked"),
        variant: "outlined",
      },
      {
        label: "Confirm",
        onClick: () => console.log("Confirm clicked"),
        variant: "primary",
      },
    ],
  },
};
