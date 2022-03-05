import { GridOptions, ValueFormatterParams } from 'ag-grid-community';
import { format } from 'date-fns';

export const valueFormatterDate = (params: ValueFormatterParams): string => {
  return params.value ? format(new Date(params.value), 'yyyy-MM-dd HH:mm:ss.SSS') : '';
};

export const valueFormatterTime = (params: ValueFormatterParams): string => {
  return params.value ? format(new Date(params.value), 'HH:mm:ss.SSS') : '';
};

export const valueFormatterDuration = (params: ValueFormatterParams) => {
  return params.value?.toFixed(2);
};

export const defaultGridOptions: GridOptions = {
  enableCellTextSelection: true,
  defaultColDef: {
    sortable: true,
    resizable: true,
  },
};
