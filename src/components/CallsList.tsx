"use client";

import React, { useState, useCallback, useMemo } from "react";
import styled from "styled-components";
import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  GridOptions,
  ModuleRegistry,
  AllCommunityModule,
} from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/ui/date-picker";
import {
  format,
  isWithinInterval,
  parseISO,
  startOfDay,
  endOfDay,
} from "date-fns";

interface CallRecord {
  id: number;
  interactionId: string;
  agentName: string;
  callType: "Inbound" | "Outbound";
  interactionDate: string;
  origin: string;
  status: "PENDING REVIEW" | "REVIEW IN PROGRESS" | "REVIEWED";
}

interface StatusRendererProps {
  value: string;
}

const StyledBadge = styled(Badge)<{ $status: string }>`
  ${(props) => {
    switch (props.$status) {
      case "PENDING REVIEW":
        return `
          background-color: var(--status-pending-bg) !important;
          color: var(--status-pending-text) !important;
          border-color: var(--status-pending-bg) !important;
        `;
      case "REVIEW IN PROGRESS":
        return `
          background-color: var(--status-progress-bg) !important;
          color: var(--status-progress-text) !important;
          border-color: var(--status-progress-bg) !important;
        `;
      case "REVIEWED":
        return `
          background-color: var(--status-reviewed-bg) !important;
          color: var(--status-reviewed-text) !important;
          border-color: var(--status-reviewed-bg) !important;
        `;
      default:
        return `
          background-color: var(--muted) !important;
          color: var(--muted-foreground) !important;
          border-color: var(--muted) !important;
        `;
    }
  }}
`;

const StatusRenderer = (params: StatusRendererProps) => {
  const status = params.value;
  return (
    <StyledBadge $status={status} variant="outline">
      {status}
    </StyledBadge>
  );
};

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

const StyledAgGridWrapper = styled.div`
  width: 100%;

  &.ag-theme-alpine,
  .ag-theme-alpine .ag-header,
  .ag-theme-alpine .ag-cell,
  .ag-theme-alpine .ag-row,
  .ag-theme-alpine .ag-header-cell-text,
  .ag-theme-alpine .ag-cell-value,
  .ag-theme-alpine .ag-filter,
  .ag-theme-alpine .ag-filter-filter,
  .ag-theme-alpine .ag-simple-filter-body-wrapper,
  .ag-theme-alpine input,
  .ag-theme-alpine select,
  .ag-theme-alpine .ag-paging-panel,
  .ag-theme-alpine .ag-status-bar,
  .ag-theme-alpine .ag-overlay-no-rows-wrapper {
    font-family: Overpass, ui-sans-serif, sans-serif !important;
  }

  /* Header row background color */
  .ag-theme-alpine .ag-header,
  .ag-theme-alpine .ag-header-viewport,
  .ag-theme-alpine .ag-header-container,
  .ag-theme-alpine .ag-header-row,
  .ag-theme-alpine .ag-header-cell,
  .ag-theme-alpine .ag-header-cell-wrapper,
  .ag-theme-alpine .ag-floating-filter {
    background-color: var(--header-bg) !important;
  }

  .ag-theme-alpine .ag-header-cell-resize::after {
    background-color: rgba(58, 71, 82, 0.2) !important;
  }
`;

const ActionRenderer = () => {
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={() => {
        // Handle view call action
        console.log("View call clicked");
      }}
    >
      View Call
    </Button>
  );
};

const CallsList: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  // Sample data
  const sampleData: CallRecord[] = useMemo(
    () => [
      {
        id: 1,
        interactionId: "INT-001234",
        agentName: "John Smith",
        callType: "Inbound",
        interactionDate: "2024-09-29",
        origin: "Phone",
        status: "PENDING REVIEW",
      },
      {
        id: 2,
        interactionId: "INT-001235",
        agentName: "Sarah Johnson",
        callType: "Outbound",
        interactionDate: "2024-09-29",
        origin: "Web",
        status: "REVIEW IN PROGRESS",
      },
      {
        id: 3,
        interactionId: "INT-001236",
        agentName: "Mike Wilson",
        callType: "Inbound",
        interactionDate: "2024-09-28",
        origin: "Mobile App",
        status: "REVIEWED",
      },
      {
        id: 4,
        interactionId: "INT-001237",
        agentName: "Emily Davis",
        callType: "Outbound",
        interactionDate: "2024-09-27",
        origin: "Phone",
        status: "PENDING REVIEW",
      },
      {
        id: 5,
        interactionId: "INT-001238",
        agentName: "David Brown",
        callType: "Inbound",
        interactionDate: "2024-09-26",
        origin: "Email",
        status: "REVIEWED",
      },
    ],
    []
  );

  // Filter data based on date range
  const filteredData = useMemo(() => {
    if (!startDate && !endDate) return sampleData;

    return sampleData.filter((record) => {
      const recordDate = parseISO(record.interactionDate);

      if (startDate && endDate) {
        return isWithinInterval(recordDate, {
          start: startOfDay(startDate),
          end: endOfDay(endDate),
        });
      } else if (startDate) {
        return recordDate >= startOfDay(startDate);
      } else if (endDate) {
        return recordDate <= endOfDay(endDate);
      }

      return true;
    });
  }, [startDate, endDate, sampleData]);

  const columnDefs: ColDef[] = [
    {
      headerName: "No.",
      field: "id",
      flex: 0.5,
      sortable: true,
    },
    {
      headerName: "Interaction ID",
      field: "interactionId",
      flex: 1.5,
      sortable: true,
    },
    {
      headerName: "Agent Name",
      field: "agentName",
      flex: 1.2,
      sortable: true,
    },
    {
      headerName: "Call Type",
      field: "callType",
      flex: 1,
      sortable: true,
    },
    {
      headerName: "Interaction Date",
      field: "interactionDate",
      flex: 1.2,
      sortable: true,
      valueFormatter: (params) => {
        if (params.value) {
          return format(parseISO(params.value), "MM/dd/yyyy");
        }
        return "";
      },
    },
    {
      headerName: "Origin",
      field: "origin",
      flex: 1,
      sortable: true,
    },
    {
      headerName: "Status",
      field: "status",
      flex: 1.5,
      cellRenderer: StatusRenderer,
    },
    {
      headerName: "Actions",
      flex: 1,
      cellRenderer: ActionRenderer,
      sortable: false,
      filter: false,
    },
  ];

  const gridOptions: GridOptions = {
    theme: "legacy",
    defaultColDef: {
      resizable: true,
      filter: true,
    },
    pagination: true,
    paginationPageSize: 10,
    domLayout: "normal",
    suppressColumnVirtualisation: true,
  };

  const clearFilters = useCallback(() => {
    setStartDate(undefined);
    setEndDate(undefined);
  }, []);

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold">List of Calls</h1>
        <p className="text-sm text-gray-600 mt-2">
          Showing {filteredData.length} calls
        </p>
      </div>

      {/* Date Filter Row */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">From:</label>
          <DatePicker
            value={startDate}
            onChange={setStartDate}
            placeholder="Start date"
            className="w-[200px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">To:</label>
          <DatePicker
            value={endDate}
            onChange={setEndDate}
            placeholder="End date"
            className="w-[200px]"
          />
        </div>
        <Button variant="outline" onClick={clearFilters} className="ml-4">
          Clear Filters
        </Button>
      </div>

      {/* AG Grid Table */}
      <StyledAgGridWrapper
        className="ag-theme-alpine w-full"
        style={{ height: "500px" }}
      >
        <AgGridReact
          rowData={filteredData}
          columnDefs={columnDefs}
          gridOptions={gridOptions}
          onGridReady={(params) => {
            console.log("Grid ready, data count:", filteredData.length);
            params.api.sizeColumnsToFit();
          }}
        />
      </StyledAgGridWrapper>
    </div>
  );
};

export default CallsList;
