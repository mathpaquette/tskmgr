import { GridOptions, ICellRendererParams, ValueFormatterParams } from 'ag-grid-community';
import { format, formatDistanceToNow } from 'date-fns';
import { formatDuration } from './time.utils';

export const dateValueFormatter = (params: ValueFormatterParams): string => {
  return params.value ? format(params.value, 'yyyy-MM-dd HH:mm:ss') : '';
};

export const timeValueFormatter = (params: ValueFormatterParams): string => {
  return params.value ? format(params.value, 'HH:mm:ss') : '';
};

export const durationValueFormatter = (params: ValueFormatterParams) => {
  return formatDuration(params.value);
};

export const updatedAtValueFormatter = (params: ValueFormatterParams) => {
  if (!params.value) return '';
  return formatDistanceToNow(params.value, { addSuffix: true });
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
