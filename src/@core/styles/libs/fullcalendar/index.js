// ** MUI imports
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'

// ** Hooks Imports
import useBgColor from 'src/@core/hooks/useBgColor'

// ** utilities
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

// Session state icons (tabler circle-check, clock-exclamation, circle-x) as CSS masks, so the calendar can
// draw them in the text color without adding markup inside FullCalendar's events
const maskIcon = body =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">${body}</g></svg>`
  )}")`

const STATUS_ICONS = {
  completed: maskIcon('<path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0"/><path d="m9 12l2 2l4-4"/>'),
  unconfirmed: maskIcon('<path d="M20.986 12.502a9 9 0 1 0-5.973 7.98"/><path d="M12 7v5l3 3m4 1v3m0 3v.01"/>'),
  cancelled: maskIcon('<path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0m7-2l4 4m0-4l-4 4"/>')
}

const CalendarWrapper = styled(Box)(({ theme }) => {
  // ** Hook
  const bgColors = useBgColor()

  return {
    display: 'flex',
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    '& .fc': {
      zIndex: 1,
      '.fc-col-header, .fc-daygrid-body, .fc-scrollgrid-sync-table, .fc-timegrid-body, .fc-timegrid-body table': {
        width: '100% !important'
      },

      // ** Toolbar
      '& .fc-toolbar': {
        flexWrap: 'wrap',
        flexDirection: 'row !important',
        '&.fc-header-toolbar': {
          marginBottom: theme.spacing(6)
        },
        '.fc-prev-button, & .fc-next-button': {
          display: 'inline-block',
          borderColor: 'transparent',
          backgroundColor: 'transparent',
          '& .fc-icon': {
            color: theme.palette.text.secondary,
            fontSize: theme.typography.h4.fontSize
          },
          '&:hover, &:active, &:focus': {
            boxShadow: 'none !important',
            borderColor: 'transparent !important',
            backgroundColor: 'transparent !important'
          }
        },
        '& .fc-prev-button': {
          paddingLeft: '0 !important',
          marginRight: theme.spacing(1.5)
        },
        '& .fc-toolbar-chunk:first-of-type': {
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          [theme.breakpoints.down('md')]: {
            '& div:first-of-type': {
              display: 'flex',
              alignItems: 'center'
            }
          }
        },
        '& .fc-button': {
          padding: theme.spacing(),
          '&:active, .&:focus': {
            boxShadow: 'none'
          }
        },
        '& .fc-button-group': {
          '& .fc-button': {
            textTransform: 'capitalize',
            '&:focus': {
              boxShadow: 'none'
            }
          },
          '& .fc-button-primary': {
            '&:not(.fc-prev-button):not(.fc-next-button):not(.fc-sidebarToggle-button)': {
              border: 0,
              color: theme.palette.primary.main,
              padding: theme.spacing(1.94, 5.08),
              backgroundColor: hexToRGBA(theme.palette.primary.main, 0.16),
              '&.fc-button-active, &:hover': {
                backgroundColor: hexToRGBA(theme.palette.primary.main, 0.24)
              }
            }
          },
          '& .fc-sidebarToggle-button': {
            border: 0,
            lineHeight: 0.8,
            borderColor: 'transparent',
            paddingBottom: '0 !important',
            backgroundColor: 'transparent',
            color: theme.palette.text.secondary,
            marginLeft: `${theme.spacing(-2)} !important`,
            padding: `${theme.spacing(1.275, 2)} !important`,
            '&:focus': {
              outline: 0,
              boxShadow: 'none'
            },
            '&:not(.fc-prev-button):not(.fc-next-button):hover': {
              backgroundColor: 'transparent !important'
            },
            '& + div': {
              marginLeft: 0
            }
          },
          '.fc-dayGridMonth-button, .fc-timeGridWeek-button, .fc-timeGridDay-button, & .fc-listMonth-button': {
            padding: theme.spacing(2.2, 6),
            '&:last-of-type, &:first-of-type': {
              borderRadius: theme.shape.borderRadius
            },
            '&:first-of-type': {
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0
            },
            '&:last-of-type': {
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0
            }
          }
        },
        '& > * > :not(:first-of-type)': {
          marginLeft: 0
        },
        '& .fc-toolbar-title': {
          ...theme.typography.h5,
          marginRight: theme.spacing(4),
          marginLeft: theme.spacing(2.5)
        },
        '.fc-button:empty:not(.fc-sidebarToggle-button), & .fc-toolbar-chunk:empty': {
          display: 'none'
        }
      },

      // ** Calendar head & body common
      '& tbody td, & thead th': {
        borderColor: theme.palette.divider,
        '&.fc-col-header-cell': {
          borderLeft: 0
        },
        '&[role="presentation"]': {
          borderRightWidth: 0
        }
      },

      // ** Event Colors
      '& .fc-event': {
        '&:not(.fc-list-event)': {
          '&.bg-primary': {
            borderColor: 'transparent',
            color: theme.palette.primary.main,
            backgroundColor: bgColors.primaryLight.backgroundColor,
            '& .fc-event-title, & .fc-event-time': {
              color: theme.palette.text.primary
            }
          },
          '&.bg-success': {
            borderColor: 'transparent',
            color: theme.palette.success.main,
            backgroundColor: bgColors.successLight.backgroundColor,
            '& .fc-event-title, & .fc-event-time': {
              color: theme.palette.text.primary
            }
          },
          '&.bg-error': {
            borderColor: 'transparent',
            color: theme.palette.error.main,
            backgroundColor: bgColors.errorLight.backgroundColor,
            '& .fc-event-title, & .fc-event-time': {
              color: theme.palette.text.primary
            }
          },
          '&.bg-warning': {
            borderColor: 'transparent',
            color: theme.palette.warning.main,
            backgroundColor: bgColors.warningLight.backgroundColor,
            '& .fc-event-title, & .fc-event-time': {
              color: theme.palette.text.primary
            }
          },
          '&.bg-info': {
            borderColor: 'transparent',
            color: theme.palette.info.main,
            backgroundColor: bgColors.infoLight.backgroundColor,
            '& .fc-event-title, & .fc-event-time': {
              color: theme.palette.text.primary
            }
          },

          // ** Session state. The series color stays in the tint, the dot and the outline; the text and the
          // state icon use the regular text color (the series colors on their own tint are 1.7–2.9:1)
          // Past sessions not finalized yet are hollow, so they stand out as the ones that need action
          '&.fc-event-status-unconfirmed': {
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: 'currentColor',
            backgroundColor: 'transparent'
          },
          '&.fc-event-status-cancelled .fc-event-title': {
            textDecoration: 'line-through'
          }
        },

        // Upcoming sessions keep a dot in their series color
        '& .fc-daygrid-event-dot': {
          borderColor: 'currentColor'
        },
        '& .fc-event-status-label': {
          marginLeft: theme.spacing(2),
          color: theme.palette.text.secondary,
          fontSize: theme.typography.body2.fontSize
        },
        '&.fc-list-event.fc-event-status-cancelled .fc-event-title, &.fc-list-event.fc-event-status-cancelled .fc-list-event-title a':
          {
            textDecoration: 'line-through'
          },
        '&.bg-primary': {
          '& .fc-list-event-dot': {
            borderColor: theme.palette.primary.main,
            backgroundColor: theme.palette.primary.main
          },
          '&:hover td': {
            backgroundColor: hexToRGBA(theme.palette.primary.light, 0.1)
          }
        },
        '&.bg-success': {
          '& .fc-list-event-dot': {
            borderColor: theme.palette.success.main,
            backgroundColor: theme.palette.success.main
          },
          '&:hover td': {
            backgroundColor: hexToRGBA(theme.palette.success.light, 0.1)
          }
        },
        '&.bg-error': {
          '& .fc-list-event-dot': {
            borderColor: theme.palette.error.main,
            backgroundColor: theme.palette.error.main
          },
          '&:hover td': {
            backgroundColor: hexToRGBA(theme.palette.error.light, 0.1)
          }
        },
        '&.bg-warning': {
          '& .fc-list-event-dot': {
            borderColor: theme.palette.warning.main,
            backgroundColor: theme.palette.warning.main
          },
          '&:hover td': {
            backgroundColor: hexToRGBA(theme.palette.warning.light, 0.1)
          }
        },
        '&.bg-info': {
          '& .fc-list-event-dot': {
            borderColor: theme.palette.info.main,
            backgroundColor: theme.palette.info.main
          },
          '&:hover td': {
            backgroundColor: hexToRGBA(theme.palette.info.light, 0.1)
          }
        },
        '&.fc-daygrid-event': {
          marginLeft: '4px',
          marginRight: '4px'
        },

        // Finalized, not finalized and cancelled sessions show their state icon where the dot would be
        // (month grid and agenda) or before the title (week and day), in the text color
        ...Object.fromEntries(
          Object.entries(STATUS_ICONS).map(([key, mask]) => {
            const icon = {
              border: 0,
              flexShrink: 0,
              borderRadius: 0,
              backgroundColor: theme.palette.text.primary,
              WebkitMask: `${mask} center / contain no-repeat`,
              mask: `${mask} center / contain no-repeat`
            }

            return [
              `&.fc-event-status-${key}`,
              {
                '& .fc-daygrid-event-dot, & .fc-list-event-dot': { ...icon, width: 14, height: 14 },
                '&.fc-timegrid-event .fc-event-title::before': {
                  ...icon,
                  width: 12,
                  height: 12,
                  content: '""',
                  display: 'inline-block',
                  verticalAlign: '-1px',
                  marginRight: theme.spacing(1)
                }
              }
            ]
          })
        )
      },
      '& .fc-view-harness': {
        minHeight: '650px',
        margin: theme.spacing(0, -6),
        width: `calc(100% + ${theme.spacing(6 * 2)})`
      },

      // ** Calendar Head
      '& .fc-col-header': {
        '& .fc-col-header-cell': {
          fontWeight: 500,
          color: theme.palette.text.secondary,
          fontSize: theme.typography.body1.fontSize,
          '& .fc-col-header-cell-cushion': {
            padding: theme.spacing(0.5, 2),
            textDecoration: 'none !important'
          }
        }
      },

      // ** Daygrid
      '& .fc-scrollgrid-section-liquid > td': {
        borderBottom: 0
      },
      '& .fc-daygrid-event-harness': {
        '& .fc-event': {
          marginTop: 0,
          fontWeight: 500,
          marginBottom: 0,
          borderRadius: 4,
          padding: theme.spacing(0.4, 2),
          fontSize: theme.typography.body2.fontSize
        },
        '&:not(:last-of-type)': {
          marginBottom: theme.spacing(2)
        }
      },
      '& .fc-daygrid-day-bottom': {
        marginTop: theme.spacing(1.2)
      },
      '& .fc-daygrid-day': {
        padding: '5px',
        '& .fc-daygrid-day-top': {
          flexDirection: 'row'
        }
      },
      '& .fc-scrollgrid': {
        borderLeftWidth: 0,
        borderColor: theme.palette.divider
      },
      '& .fc-day-past, & .fc-day-future': {
        '&.fc-daygrid-day-number': {
          color: theme.palette.text.disabled
        }
      },

      // ** All Views Event
      '& .fc-daygrid-day-number': {
        marginBottom: theme.spacing(1.5),
        padding: theme.spacing(0, 1.5)
      },
      '& .fc-daygrid-day-number, & .fc-timegrid-slot-label-cushion, & .fc-list-event-time': {
        textDecoration: 'none !important',
        color: `${theme.palette.text.secondary} !important`
      },
      '& .fc-day-today:not(.fc-popover):not(.fc-col-header-cell)': {
        backgroundColor: theme.palette.action.selected
      },

      // ** WeekView
      '& .fc-timegrid': {
        '& .fc-scrollgrid-section': {
          height: 0,
          '& .fc-col-header-cell, & .fc-timegrid-axis': {
            borderLeft: 0,
            borderColor: theme.palette.divider
          },
          '& .fc-timegrid-axis': {
            borderColor: theme.palette.divider
          }
        },
        '& .fc-timegrid-axis': {
          '&.fc-scrollgrid-shrink': {
            '& .fc-timegrid-axis-cushion': {
              textTransform: 'lowercase',
              color: theme.palette.text.disabled,
              fontSize: theme.typography.h6.fontSize
            }
          }
        },
        '& .fc-timegrid-slots': {
          '& .fc-timegrid-slot': {
            height: '3rem',
            borderColor: theme.palette.divider,
            '&.fc-timegrid-slot-label': {
              borderRight: 0
            },
            '&.fc-timegrid-slot-lane': {
              borderLeft: 0
            },
            '& .fc-timegrid-slot-label-frame': {
              textAlign: 'center',
              '& .fc-timegrid-slot-label-cushion': {
                textTransform: 'lowercase',
                fontSize: theme.typography.body2.fontSize,
                color: `${theme.palette.text.secondary} !important`
              }
            }
          }
        },
        '& .fc-timegrid-divider': {
          display: 'none'
        },
        '& .fc-timegrid-event': {
          boxShadow: 'none'
        }
      },

      // ** List View
      '& .fc-list': {
        border: 'none',
        '& th[colspan="3"]': {
          position: 'relative'
        },
        '& .fc-list-table': {
          borderBottom: `1px solid ${theme.palette.divider}`,
          '& tr': {
            borderBottom: `1px solid ${theme.palette.divider}`,
            '&:first-of-type': {
              borderTop: `1px solid ${theme.palette.divider}`
            },
            '& > *': {
              border: 0
            }
          }
        },
        '& .fc-list-day-cushion': {
          background: theme.palette.action.hover
        },
        '.fc-list-event': {
          cursor: 'pointer',
          '&:hover': {
            '& td': {
              backgroundColor: theme.palette.action.hover
            }
          },
          '& td': {
            borderColor: theme.palette.divider
          }
        },
        '& .fc-list-day': {
          backgroundColor: theme.palette.action.hover,
          '& .fc-list-day-text, & .fc-list-day-side-text': {
            textDecoration: 'none',
            ...theme.typography.h6
          },
          '&  >  *': {
            background: 'none',
            borderColor: theme.palette.divider
          }
        },
        '& .fc-list-event-title': {
          display: 'flex',
          paddingLeft: theme.spacing(2.5),
          color: theme.palette.text.secondary,
          fontSize: theme.typography.body1.fontSize
        },
        '& .fc-list-event-time': {
          color: theme.palette.text.disabled,
          fontSize: theme.typography.body1.fontSize
        }
      },

      // ** Popover
      '& .fc-popover': {
        zIndex: 20,
        boxShadow: 1,
        borderColor: theme.palette.divider,
        background: theme.palette.background.paper,
        '& .fc-popover-header': {
          padding: theme.spacing(2),
          background: theme.palette.action.hover,
          '& .fc-popover-title, & .fc-popover-close': {
            color: theme.palette.text.primary
          }
        },
        '& .fc-popover-body': {
          '& *:not(.fc-event-main):not(:last-of-type)': {
            marginBottom: theme.spacing(1.2)
          }
        }
      },

      // ** Media Queries
      [theme.breakpoints.up('md')]: {
        '& .fc-sidebarToggle-button': {
          display: 'none'
        },
        '& .fc-toolbar-title': {
          marginLeft: 0
        }
      },
      '@media (max-width:610px)': {
        '& .fc-header-toolbar .fc-toolbar-chunk:last-of-type': {
          marginTop: theme.spacing(4)
        }
      }
    }
  }
})

export default CalendarWrapper
