import { GridOptions, ICellRendererParams, ValueFormatterParams } from 'ag-grid-community';
import { format } from 'date-fns';

export const dateValueFormatter = (params: ValueFormatterParams): string => {
  return params.value ? format(new Date(params.value), 'yyyy-MM-dd HH:mm:ss') : '';
};

export const timeValueFormatter = (params: ValueFormatterParams): string => {
  return params.value ? format(new Date(params.value), 'HH:mm:ss.SSS') : '';
};

export const durationValueFormatter = (params: ValueFormatterParams) => {
  return params.value?.toFixed(2);
};

export const defaultGridOptions: GridOptions = {
  enableCellTextSelection: true,
  defaultColDef: {
    sortable: true,
    resizable: true,
  },
};

export const urlCellRenderer = (params: ICellRendererParams) => {
  return params.data.url
    ? `<a href="${params.data.url}" target="_blank" rel="noopener">${params.value}</a>`
    : params.value;
};

export const checkboxCellRenderer = (params: ICellRendererParams) => {
  return `<input type='checkbox' onclick="return false" ${params.value ? 'checked' : ''} />`;
};
