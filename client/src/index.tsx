import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './components/App'
import reportWebVitals from './reportWebVitals'
import { MaterialThemeContextProvider } from './contexts/MaterialThemeContext'
import { TranslationContextProvider } from './contexts/TranslationsContext'
import { UserSettingsContextProvider } from './contexts/UserSettingsContext'
import { NotificationsContextProvider } from './contexts/NotificationsContext'

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
)
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <MaterialThemeContextProvider>
        <TranslationContextProvider>
          <NotificationsContextProvider>
            <UserSettingsContextProvider>
              <App />
            </UserSettingsContextProvider>
          </NotificationsContextProvider>
        </TranslationContextProvider>
      </MaterialThemeContextProvider>
    </BrowserRouter>
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
