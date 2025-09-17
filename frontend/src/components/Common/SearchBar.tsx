import React from "react";
import { Search } from "@mui/icons-material";
import { DLSInput } from "dls/atoms/Input";
import { Box } from "dls/atoms";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar = ({
  value,
  onChange,
  placeholder = "Search...",
  ...props
}: SearchBarProps & { [key: string]: any }) => {
  return (
    <Box sx={{ mb: 3 }}>
      <DLSInput
        fullWidth
        variant="outlined"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputProps={{ "data-testid": "search-input" }}
        InputProps={{
          startAdornment: <Search sx={{ mr: 1, color: "action.active" }} />,
        }}
        {...props}
      />
    </Box>
  );
};
