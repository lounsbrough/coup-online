import { within, waitFor, act, render, fireEvent } from '@testing-library/react'
import { NotificationsContextProvider, useNotificationsContext } from './NotificationsContext'

function MockComponentThatWantsToShowNotification() {
  const { showNotification, removeNotification } = useNotificationsContext()

  return (
    <>
      <button onClick={() => {
        showNotification({
          message: 'that button is the worst!',
          severity: 'error',
        })
      }}
      >
        I cause errors
      </button>
      <button onClick={() => {
        showNotification({
          id: 'some unique id',
          message: <span>this message should never show up more than once</span>,
          severity: 'info'
        })
      }}
      >
        I show a unique message
      </button>
      <button onClick={() => {
        showNotification({
          id: 'specific-error',
          message: 'I am a specific error',
          severity: 'error'
        })
      }}
      >
        I cause a specific error
      </button>
      <button onClick={() => {
        showNotification({
          message: <span>You will see this message forever and for always</span>,
          severity: 'info',
          eternal: true
        })
      }}
      >
        I show an eternal message
      </button>
      <button onClick={() => {
        removeNotification('specific-error')
      }}
      >
        I remove a specific error
      </button>
    </>
  )
}

beforeEach(() => {
  jest.useFakeTimers()
})

afterEach(() => {
  jest.clearAllMocks()
  jest.useRealTimers()
})

it('should show test error notification and should be dismissable', async () => {
  const { findByText, findAllByText } = render(
    <NotificationsContextProvider>
      <MockComponentThatWantsToShowNotification />
    </NotificationsContextProvider>
  )

  const errorCausingButton = await findByText(/i cause errors/i)
  fireEvent.click(errorCausingButton)
  fireEvent.click(errorCausingButton)

  const [
    firstNotificationMessage,
    secondNotificationMessage
  ] = await findAllByText(/that button is the worst!/i)

  const firstNotification = firstNotificationMessage.parentElement!
  const firstNotificationSeveritySpan = firstNotification.querySelector('span')
  const secondNotification = secondNotificationMessage.parentElement!

  expect(firstNotification).toHaveTextContent(/error: that button is the worst!/i)
  expect(firstNotificationSeveritySpan).toHaveStyle({
    textTransform: 'capitalize', fontWeight: 'bold'
  })
  const errorIcon = await within(firstNotification).findByTestId('ErrorOutlineIcon')
  expect(errorIcon).toBeInTheDocument()

  let closeButton = await within(firstNotification).findByLabelText(/close/i)
  fireEvent.click(closeButton)

  await waitFor(() => expect(firstNotification).not.toBeInTheDocument())

  closeButton = await within(secondNotification).findByLabelText(/close/i)
  fireEvent.click(closeButton)

  await waitFor(() => expect(secondNotification).not.toBeInTheDocument())
})

it('should not duplicate notification for same id', async () => {
  const { findByText } = render(
    <NotificationsContextProvider>
      <MockComponentThatWantsToShowNotification />
    </NotificationsContextProvider>
  )

  const uniqueMessageButton = await findByText(/i show a unique message/i)

  fireEvent.click(uniqueMessageButton)
  fireEvent.click(uniqueMessageButton)
  fireEvent.click(uniqueMessageButton)

  const notificationMessage = await findByText(/this message should never show up more than once/i)
  expect(notificationMessage).toBeInTheDocument()
  const notificationContainer = notificationMessage.parentElement!.parentElement!

  const infoIcon = await within(notificationContainer).findByTestId('InfoOutlinedIcon')
  expect(infoIcon).toBeInTheDocument()
})

it('should auto dismiss notification after 6 seconds', async () => {
  const { findByText, queryByText } = render(
    <NotificationsContextProvider>
      <MockComponentThatWantsToShowNotification />
    </NotificationsContextProvider>
  )

  const errorCausingButton = await findByText(/i cause errors/i)
  fireEvent.click(errorCausingButton)

  const errorText = /that button is the worst!/i
  await findByText(errorText)

  act(() => jest.advanceTimersByTime(6000))
  act(() => jest.runOnlyPendingTimers())
  jest.useRealTimers()

  await waitFor(() => expect(queryByText(errorText)).not.toBeInTheDocument())
})

it('should not auto dismiss notification if notification is eternal', async () => {
  const { findByText } = render(
    <NotificationsContextProvider>
      <MockComponentThatWantsToShowNotification />
    </NotificationsContextProvider>
  )

  const eternalMessageButton = await findByText('I show an eternal message')
  fireEvent.click(eternalMessageButton)

  const eternalMessage = 'You will see this message forever and for always'
  await findByText(eternalMessage)

  act(() => { jest.advanceTimersByTime(60000) })

  jest.runOnlyPendingTimers()
  jest.useRealTimers()

  await new Promise((resolve) => { setTimeout(resolve, 0) })
  await findByText(eternalMessage)
})

it('should allow removing notification by id if exists', async () => {
  const { findByText } = render(
    <NotificationsContextProvider>
      <MockComponentThatWantsToShowNotification />
    </NotificationsContextProvider>
  )

  const errorCausingButton = await findByText(/i cause a specific error/i)
  const errorRemovingButton = await findByText(/i remove a specific error/i)

  fireEvent.click(errorCausingButton)

  const notificationMessage = await findByText(/I am a specific error/i)
  expect(notificationMessage).toBeInTheDocument()

  fireEvent.click(errorRemovingButton)
  await waitFor(() => expect(notificationMessage).not.toBeInTheDocument())

  fireEvent.click(errorRemovingButton)
  await waitFor(() => expect(notificationMessage).not.toBeInTheDocument())
})
