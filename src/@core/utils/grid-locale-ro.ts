// ** MUI Imports
import { roRO } from '@mui/x-data-grid'

// Romanian DataGrid texts. The grid's own Romanian locale has no "1–10 din 113" footer text, so it is added here.
export const gridLocaleText = (noRowsLabel?: string) => {
  const romanian = roRO.components.MuiDataGrid.defaultProps.localeText

  return {
    ...romanian,
    ...(noRowsLabel ? { noRowsLabel } : {}),
    MuiTablePagination: {
      ...romanian.MuiTablePagination,
      labelDisplayedRows: ({ from, to, count }: { from: number; to: number; count: number }) =>
        `${from}–${to} din ${count !== -1 ? count : `peste ${to}`}`
    }
  }
}
