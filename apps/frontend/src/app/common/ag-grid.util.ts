import { GridOptions, ICellRendererParams, ValueFormatterParams } from 'ag-grid-community';
import { format, intervalToDuration } from 'date-fns';

export const dateValueFormatter = (params: ValueFormatterParams): string => {
  return params.value ? format(new Date(params.value), 'yyyy-MM-dd HH:mm:ss') : '';
};

export const timeValueFormatter = (params: ValueFormatterParams): string => {
  return params.value ? format(new Date(params.value), 'HH:mm:ss') : '';
};

export const durationValueFormatter = (params: ValueFormatterParams) => {
  if (!params.value) return '';
  const duration = intervalToDuration({ start: 0, end: params.value * 1000 });
  if (duration.hours) return `${duration.hours}h${duration.minutes}m${duration.seconds}s`;
  if (duration.minutes) return `${duration.minutes}m${duration.seconds}s`;
  if (duration.seconds) return `${duration.seconds}s`;
  return `${Math.trunc(params.value * 1000)}ms`;
};

export const updatedAtValueFormatter = (params: ValueFormatterParams) => {
  if (!params.value) return '';
  const duration = intervalToDuration({ start: new Date(params.value), end: new Date() });
  if (duration.days) return `>1d ago`;
  if (duration.hours) return `${duration.hours}h ago`;
  if (duration.minutes) return `${duration.minutes}m ago`;
  if (duration.seconds) return `${duration.seconds}s ago`;
  return `${Math.trunc(params.value * 1000)}ms ago`;
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
