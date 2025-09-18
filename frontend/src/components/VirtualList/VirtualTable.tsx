import React from "react";
import {
  Box,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
} from "@mui/material";
import { VirtualList } from "./VirtualList";

interface VirtualTableProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  headers: string[];
  renderRow: (item: T, index: number) => React.ReactElement;
  className?: string;
}

export const VirtualTable = <T,>({
  items,
  itemHeight,
  containerHeight,
  headers,
  renderRow,
  className,
}: VirtualTableProps<T>) => {
  return (
    <Box className={className}>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {headers.map((header, index) => (
                <TableCell key={index}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
        </Table>
      </TableContainer>
      <VirtualList
        items={items}
        itemHeight={itemHeight}
        containerHeight={containerHeight}
        renderItem={renderRow}
      />
    </Box>
  );
};

export default VirtualTable;
