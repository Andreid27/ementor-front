// ** React Imports
import { useState, useEffect, useRef } from 'react'
import validator from 'validator'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Hooks
import { useAuth } from 'src/hooks/useAuth'

// ** Services
import { profileServiceClient } from 'src/services'

// ** Components
import AddressInfoCard from './TabAccount/Cards/AddressInfoCard'

const orgSchema = yup.object().shape({
  name: yup.string().required('Numele organizației este obligatoriu'),
  registryNumber: yup.string().required('CUI este obligatoriu'),
  tradeRegisterNo: yup.string(),
  organisationType: yup.string().required('Tipul organizației este obligatoriu')
})

const initialOrgValues = {
  name: '',
  registryNumber: '',
  tradeRegisterNo: '',
  organisationType: 'SRL'
}

const TabEInvoice = () => {
  // ** Hooks
  const auth = useAuth()
  const addressInfoRef = useRef()

  // ** State
  const [loading, setLoading] = useState(true)
  const [invoicesLoading, setInvoicesLoading] = useState(false)
  const [invoices, setInvoices] = useState([])
  const [orgSubmitSuccess, setOrgSubmitSuccess] = useState(null)

  // Profile Data
  const [professorProfile, setProfessorProfile] = useState(null)
  const [counties, setCounties] = useState([])

  // Bank Accounts State (managed locally before save)
  const [bankAccounts, setBankAccounts] = useState([])
  const [bankAccountErrors, setBankAccountErrors] = useState({})

  const {
    control: orgControl,
    handleSubmit: handleOrgSubmit,
    setValue: setOrgValue,
    formState: { errors: orgErrors }
  } = useForm({
    defaultValues: initialOrgValues,
    mode: 'onChange',
    resolver: yupResolver(orgSchema)
  })

  // ** Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      if (!auth.user?.id) return

      setLoading(true)
      try {
        // 1. Fetch Organisation
        const orgResponse = await profileServiceClient.organisation
          .getOrganisation({
            professorId: auth.user.id
          })
          .catch(() => null)

        if (orgResponse && orgResponse.data) {
          const org = orgResponse.data
          setOrgValue('name', org.name || '')
          setOrgValue('registryNumber', org.registryNumber || '')
          setOrgValue('tradeRegisterNo', org.tradeRegisterNo || '')
          setOrgValue('organisationType', org.organisationType || 'SRL')
        }

        // 2. Fetch Prerequisities (Counties)
        const prereqResponse = await profileServiceClient.studentProfile.getProfilePrerequire()
        if (prereqResponse && prereqResponse.data) {
          setCounties(prereqResponse.data.counties || [])
        }

        // 3. Fetch Professor Profile
        const profileResponse = await profileServiceClient.professorProfile.getFull2()
        if (profileResponse && profileResponse.data) {
          setProfessorProfile(profileResponse.data)
          setBankAccounts(profileResponse.data.bankAccounts || [])
        }

        // 4. Fetch Invoices
        setInvoicesLoading(true)
        const invoicesResponse = await profileServiceClient.invoice.getMyInvoices()
        if (invoicesResponse && invoicesResponse.data) {
          setInvoices(invoicesResponse.data)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
        setInvoicesLoading(false)
      }
    }

    fetchData()
  }, [auth.user?.id, setOrgValue])

  // ** Organisation Submit
  const onOrgSubmit = async data => {
    if (!auth.user?.id) return

    try {
      await profileServiceClient.organisation.createOrUpdateOrganisation({
        professorId: auth.user.id,
        organisationDto: {
          ...data,
          professorId: auth.user.id
        }
      })
      setOrgSubmitSuccess('Detaliile organizației au fost salvate cu succes.')
      toast.success('Organizație actualizată!')
      setTimeout(() => setOrgSubmitSuccess(null), 3000)
    } catch (error) {
      console.error('Error saving organisation:', error)
      toast.error('Eroare la salvarea organizației.')
    }
  }

  // ** Profile Submit (Address + Bank Accounts)
  const onProfileSubmit = async () => {
    if (!professorProfile) return

    try {
      // Get Address Data from Ref
      const addressData = addressInfoRef.current?.getValues()

      // Use clean bank accounts (remove any temp IDs if needed, but here simple array)

      const updatedProfile = {
        ...professorProfile,
        address: addressData,
        bankAccounts: bankAccounts
      }

      await profileServiceClient.professorProfile.update2({
        professorProfileDTO: updatedProfile
      })

      toast.success('Profil actualizat (Adresă și Date Bancare)!')

      // Refresh state
      setProfessorProfile(updatedProfile)
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Eroare la actualizarea profilului.')
    }
  }

  // ** Bank Account Helpers
  const addBankAccount = () => {
    setBankAccounts([
      ...bankAccounts,
      { iban: '', bankName: '', swiftCode: '', accountHolderName: '', isPrimary: false }
    ])
  }

  const removeBankAccount = index => {
    const newAccounts = [...bankAccounts]
    newAccounts.splice(index, 1)
    setBankAccounts(newAccounts)
  }

  const updateBankAccount = (index, field, value) => {
    const newAccounts = [...bankAccounts]
    newAccounts[index] = { ...newAccounts[index], [field]: value }
    setBankAccounts(newAccounts)

    if (field === 'iban') {
      if (value && !validator.isIBAN(value)) {
        setBankAccountErrors(prev => ({ ...prev, [`${index}_iban`]: 'IBAN invalid' }))
      } else {
        setBankAccountErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[`${index}_iban`]
          return newErrors
        })
      }
    }
  }

  const handleDownloadInvoice = async invoice => {
    if (invoice.downloadUrl) {
      window.open(invoice.downloadUrl, '_blank')
    } else if (invoice.id) {
      // Fallback
      toast.error('Link de descărcare indisponibil momentan.')
    }
  }

  // Helper helpers
  const formatCurrency = (amount, currencyFn) => {
    return new Intl.NumberFormat('ro-RO', { style: 'currency', currency: currencyFn || 'RON' }).format(amount || 0)
  }

  const formatDate = dateString => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ro-RO')
  }

  if (loading && !professorProfile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Grid container spacing={6}>
      {/* Organisation Form */}
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Detalii Organizație'
            subheader='Datele firmei pentru facturare'
            avatar={
              <Box
                component='img'
                src='/images/cards/org_round_icon.png'
                alt='Organization'
                sx={{ width: 40, height: 40, borderRadius: '50%' }}
              />
            }
          />
          <CardContent>
            {orgSubmitSuccess && (
              <Alert severity='success' sx={{ mb: 4 }}>
                {orgSubmitSuccess}
              </Alert>
            )}

            <form onSubmit={handleOrgSubmit(onOrgSubmit)}>
              <Grid container spacing={5}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='name'
                    control={orgControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size='small' // Standardize to small
                        label='Nume Organizație'
                        placeholder='Ex: Nume Firma SRL'
                        error={Boolean(orgErrors.name)}
                        helperText={orgErrors.name?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name='organisationType'
                    control={orgControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        size='small'
                        label='Tip Organizație'
                        error={Boolean(orgErrors.organisationType)}
                        helperText={orgErrors.organisationType?.message}
                      >
                        {['SRL', 'PFA', 'SA', 'II', 'IF', 'ONG', 'ALTE'].map(type => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name='registryNumber'
                    control={orgControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size='small'
                        label='CUI'
                        placeholder='12345678'
                        error={Boolean(orgErrors.registryNumber)}
                        helperText={orgErrors.registryNumber?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name='tradeRegisterNo'
                    control={orgControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size='small'
                        label='Nr. Reg. Com.'
                        placeholder='J40/123/2023'
                        error={Boolean(orgErrors.tradeRegisterNo)}
                        helperText={orgErrors.tradeRegisterNo?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button type='submit' variant='contained'>
                    Salvează Organizația
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>

      {/* Professor Profile: Address & Bank Accounts */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Grid container spacing={6}>
              {/* Address Section */}
              <Grid item xs={12}>
                {professorProfile && (
                  <AddressInfoCard address={professorProfile.address} counties={counties} ref={addressInfoRef} />
                )}
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              {/* Bank Accounts Section */}
              <Grid item xs={12}>
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      component='img'
                      src='/images/cards/bank_round_icon.png' // New round asset
                      alt='Bank'
                      sx={{ height: 50, width: 50, mr: 3, borderRadius: '50%' }} // Applied borderRadius
                    />
                    <Typography variant='h6'>Conturi Bancare</Typography>
                  </Box>
                  <Button variant='outlined' startIcon={<Icon icon='tabler:plus' />} onClick={addBankAccount}>
                    Adaugă Cont
                  </Button>
                </Box>

                {bankAccounts.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 5 }}>
                    <Box
                      component='img'
                      src='/images/cards/empty_bank_state.png' // New generated asset
                      alt='No Bank Accounts'
                      sx={{ height: 160, mb: 4, opacity: 0.8 }}
                    />
                    <Typography variant='body1' color='text.secondary'>
                      Nu există conturi bancare adăugate.
                      <br />
                      Adăugați un cont pentru a completa profilul.
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={4}>
                    {bankAccounts.map((account, index) => (
                      <Grid item xs={12} key={index}>
                        <Card variant='outlined' elevation={0} sx={{ position: 'relative' }}>
                          <CardHeader
                            title={`Cont Bancar ${index + 1}`}
                            avatar={
                              <Box
                                component='img'
                                src='/images/cards/bank_card_icon.png' // New generated asset
                                alt='Bank'
                                sx={{ width: 35, height: 24, borderRadius: 1 }} // Card ratio
                              />
                            }
                            action={
                              <IconButton onClick={() => removeBankAccount(index)} color='error' size='small'>
                                <Icon icon='tabler:trash' />
                              </IconButton>
                            }
                          />
                          <CardContent>
                            <Grid container spacing={5}>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label='Bancă'
                                  placeholder='Ex: Banca Transilvania'
                                  value={account.bankName || ''}
                                  onChange={e => updateBankAccount(index, 'bankName', e.target.value)}
                                  size='small' // Ensure small size
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label='IBAN'
                                  placeholder='RO00 BTRL ...'
                                  value={account.iban || ''}
                                  onChange={e => updateBankAccount(index, 'iban', e.target.value)}
                                  size='small'
                                  error={Boolean(bankAccountErrors[`${index}_iban`])}
                                  helperText={bankAccountErrors[`${index}_iban`]}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label='SWIFT/BIC'
                                  placeholder='BTRLRO...'
                                  value={account.swiftCode || ''}
                                  onChange={e => updateBankAccount(index, 'swiftCode', e.target.value)}
                                  size='small'
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label='Titular Cont'
                                  placeholder='Nume Prenume / Nume Firma'
                                  value={account.accountHolderName || ''}
                                  onChange={e => updateBankAccount(index, 'accountHolderName', e.target.value)}
                                  size='small'
                                />
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Grid>

              <Grid item xs={12}>
                <Button variant='contained' onClick={onProfileSubmit}>
                  Salvează Profilul
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Invoices List */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Istoric Facturi' />
          <CardContent>
            {invoicesLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                <CircularProgress />
              </Box>
            ) : invoices.length > 0 ? (
              <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid rgba(0,0,0,0.1)' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Număr Factură</TableCell>
                      <TableCell>Dată Emitere</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align='right'>Acțiuni</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoices.map(invoice => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <Typography variant='body2' fontWeight={600}>
                            {invoice.series} {invoice.number}
                          </Typography>
                        </TableCell>
                        <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                        <TableCell>{formatCurrency(invoice.totalAmount, invoice.currencyCode)}</TableCell>
                        <TableCell>
                          <Chip
                            label={invoice.status}
                            size='small'
                            color={
                              invoice.status === 'PAID' ? 'success' : invoice.status === 'ISSUED' ? 'info' : 'default'
                            }
                            variant='tonal'
                          />
                        </TableCell>
                        <TableCell align='right'>
                          {invoice.downloadUrl ? (
                            <IconButton onClick={() => window.open(invoice.downloadUrl, '_blank')} color='primary'>
                              <Icon icon='mdi:download' />
                            </IconButton>
                          ) : (
                            <Typography variant='caption' color='text.disabled'>
                              Nedisponibil
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity='info'>Nu există facturi emise.</Alert>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default TabEInvoice
