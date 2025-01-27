import React, {SetStateAction, useState} from 'react'
import Popup from 'reactjs-popup'
import api from '../../services/axiosConfig.ts'
import { type LogInData } from '../../App'

type UserSettingsButtonProps = {
  logInData: LogInData
  setLogInData: React.Dispatch<SetStateAction<LogInData>>
}

export default function UserSettingsButton({ logInData, setLogInData }: UserSettingsButtonProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState(logInData?.username || '')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleOpenPopup = () => {
    if (!logInData?.isLoggedIn) {
      setError('You must be logged in to update your settings.')
      setIsPopupOpen(true)
      return
    }
    setIsPopupOpen(true)
    setIsLoading(true)
    setError('')
    setSuccessMessage('')
    api
      .get('/api/current-user/')
      .then((response: { data: { username: any; email: any } }) => {
        setUsername(response.data.username || '')
        setEmail(response.data.email || '')
      })
      .catch(() => {
        setError('Failed to load user data.')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleUserSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password && password !== confirmPassword) {
      setError('Passwords do not match. Please try again.')
      return
    }
    try {
      await api.put('/api/current-user/', {
        username,
        email,
        ...(password ? { password } : {})
      })
      setSuccessMessage('User settings updated successfully!')
      alert('User settings updated successfully!')
      setLogInData((prev: any) => ({
        ...prev,
        username
      }))
      setIsPopupOpen(false)
    } catch (err: unknown) {
      setSuccessMessage('')
      if (err && typeof err === 'object' && 'response' in err) {
        const status = (err as any).response?.status
        if (status === 400) {
          setError('Update failed. Provided data may not be valid or the username may already exist.')
        } else if (status === 500) {
          setError('A server error occurred. Please try again later.')
        } else {
          setError('Updating user settings failed. Please try again.')
        }
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    }
  }

  return (
    <>
      <button onClick={handleOpenPopup}>User Settings</button>
      <Popup open={isPopupOpen} onClose={() => setIsPopupOpen(false)} modal nested>
        {/* @ts-ignore */}
        {(close) => (
          <div className='modal'>
            <button className='close' onClick={close}>
              &times;
            </button>
            <div className='header'>Update User Settings</div>
            {isLoading ? (
              <p>Loading user data...</p>
            ) : (
              <form onSubmit={handleUserSettingsUpdate} className='content'>
                <div>
                  <label htmlFor='username'>Username:<div></div></label>
                  <input
                    id='username'
                    type='text'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={{
                      marginLeft: '16px',
                      width: '200px',
                      height: '40px',
                      fontSize: '16px'
                    }}
                  />
                </div>
                <div>
                  <label htmlFor='email'>Email:<div></div></label>
                  <input
                    id='email'
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      marginLeft: '16px',
                      width: '200px',
                      height: '40px',
                      fontSize: '16px'
                    }}
                  />
                </div>
                <div>
                  <label htmlFor='password'>New Password:</label>
                  <input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    minLength={8}
                    pattern='^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$'
                    title='Password must be at least 8 characters long and include at least one letter, one digit, and one special character.'
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      marginLeft: '16px',
                      width: '200px',
                      height: '40px',
                      fontSize: '16px'
                    }}
                  />
                  <div>
                    <label>
                      <input
                        type='checkbox'
                        onChange={() => setShowPassword(!showPassword)}
                        style={{ height: '20px', width: '20px' }}
                      />
                      Show
                    </label>
                  </div>
                </div>
                <div>
                  <label htmlFor='confirmPassword'>Confirm New Password:</label>
                  <input
                    id='confirmPassword'
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      marginLeft: '16px',
                      width: '200px',
                      height: '40px',
                      fontSize: '16px'
                    }}
                  />
                  <div>
                    <label>
                      <input
                        type='checkbox'
                        onChange={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{ height: '20px', width: '20px' }}
                      />
                      Show
                    </label>
                  </div>
                </div>
                <div className='actions'>
                  <button
                    type='button'
                    onClick={close}
                    style={{ width: 'auto' }}
                  >
                    Cancel
                  </button>
                  <button type='submit' style={{ width: 'auto' }}>
                    Update
                  </button>
                </div>
                {error && (
                  <div
                    style={{
                      color: 'orangered',
                      textAlign: 'center',
                      marginTop: '20px'
                    }}
                  >
                    {error}
                  </div>
                )}
                {successMessage && (
                  <div
                    style={{
                      color: 'green',
                      textAlign: 'center',
                      marginTop: '20px'
                    }}
                  >
                    {successMessage}
                  </div>
                )}
              </form>
            )}
          </div>
        )}
      </Popup>
    </>
  )
}
