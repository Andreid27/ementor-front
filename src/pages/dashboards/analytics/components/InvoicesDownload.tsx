import React, { useEffect, useState } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import DownloadIcon from '@mui/icons-material/Download'
import { profileServiceClient } from 'src/services'

type Invoice = {
  id?: string
  number?: string
  issueDate?: string
  totalAmount?: number
  currencyCode?: string
  downloadUrl?: string
}

const formatDate = (iso?: string) => {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleDateString()
  } catch (e) {
    return iso
  }
}

const InvoicesDownload: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let mounted = true

    const fetchInvoices = async () => {
      setLoading(true)
      try {
        if (profileServiceClient && profileServiceClient.invoice && profileServiceClient.invoice.getMyInvoices()) {
          // profileServiceClient.invoice.getMyInvoices returns an AxiosPromise
          const res = await profileServiceClient.invoice.getMyInvoices()
          const data = res?.data ?? res
          if (mounted) setInvoices(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        if (mounted) setInvoices([])
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchInvoices()

    return () => {
      mounted = false
    }
  }, [])

  const handleDownload = (invoice: Invoice) => {
    if (invoice.downloadUrl && invoice.downloadUrl !== '#') {
      window.open(invoice.downloadUrl, '_blank')
      return
    }

    if (profileServiceClient && profileServiceClient.invoice) {
      // try common generated method names
      const api = profileServiceClient.invoice
      if (typeof api.downloadInvoice === 'function') {
        api
          .downloadInvoice({ id: invoice.id })
          .then((res: any) => {
            const url = res?.data?.downloadUrl || null
            if (url) window.open(url, '_blank')
          })
          .catch(() => {})
      }
    }
  }

  return (
    <Card>
      <CardHeader title='Invoices' subheader='Recent invoices' />
      <CardContent>
        {loading ? (
          <CircularProgress size={24} />
        ) : invoices && invoices.length > 0 ? (
          <List dense>
            {invoices.map(inv => (
              <ListItem key={inv.id || inv.number} divider>
                <ListItemText
                  primary={inv.number || `#${inv.id}`}
                  secondary={
                    <>
                      <Typography component='span' variant='body2' color='textPrimary'>
                        {inv.totalAmount ? `${inv.totalAmount} ${inv.currencyCode || ''}` : ''}
                      </Typography>
                      {` — ${formatDate(inv.issueDate)}`}
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <Tooltip title='Download'>
                    <IconButton edge='end' aria-label='download' onClick={() => handleDownload(inv)}>
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant='body2'>No invoices found.</Typography>
        )}
      </CardContent>
    </Card>
  )
}

export default InvoicesDownload
