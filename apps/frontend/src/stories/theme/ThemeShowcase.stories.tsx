import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { Box, Paper } from "@mui/material";
import { DLSTypography } from "../../dls/atoms/Typography";
import { DLSButton } from "../../dls/atoms/Button";

const ThemeShowcase = () => {
  return (
    <Box sx={{ p: 3 }}>
      <DLSTypography variant="h3" gutterBottom>
        DLS Theme
      </DLSTypography>

      <Box sx={{ mb: 4 }}>
        <DLSTypography variant="h5" gutterBottom>
          Colors
        </DLSTypography>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Paper sx={{ width: 60, height: 60, bgcolor: "primary.main" }} />
          <Paper sx={{ width: 60, height: 60, bgcolor: "secondary.main" }} />
          <Paper sx={{ width: 60, height: 60, bgcolor: "error.main" }} />
        </Box>
      </Box>

      <Box sx={{ mb: 4 }}>
        <DLSTypography variant="h5" gutterBottom>
          Typography
        </DLSTypography>
        <DLSTypography variant="h1">Heading 1</DLSTypography>
        <DLSTypography variant="h2">Heading 2</DLSTypography>
        <DLSTypography variant="body1">Body text</DLSTypography>
      </Box>

      <Box>
        <DLSTypography variant="h5" gutterBottom>
          Buttons
        </DLSTypography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <DLSButton variant="primary">Primary</DLSButton>
          <DLSButton variant="secondary">Secondary</DLSButton>
          <DLSButton variant="outlined">Outlined</DLSButton>
        </Box>
      </Box>
    </Box>
  );
};

const meta: Meta<typeof ThemeShowcase> = {
  title: "DLS/Theme/Showcase",
  component: ThemeShowcase,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
