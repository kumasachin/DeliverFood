import React from "react";
import { Box } from "@mui/material";
import { Search } from "@mui/icons-material";
import { DLSInput } from "../../dls/atoms/Input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar = ({
  value,
  onChange,
  placeholder = "Search...",
}: SearchBarProps) => {
  return (
    <Box sx={{ mb: 3 }}>
      <DLSInput
        fullWidth
        variant="outlined"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        InputProps={{
          startAdornment: <Search sx={{ mr: 1, color: "action.active" }} />,
        }}
      />
    </Box>
  );
};
