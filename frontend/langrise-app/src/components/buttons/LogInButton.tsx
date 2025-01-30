import React, { useState } from "react"
import axios from "axios"
import Popup from "reactjs-popup"
import { type LogInData, type View } from "../../App.tsx"

type LogInButtonProps = {
    setLogInData: React.Dispatch<React.SetStateAction<LogInData>>,
    setView: React.Dispatch<React.SetStateAction<View>>
}

type TokenResponse = {
    access: string
    refresh: string
}

export default function LogInButton({ setLogInData, setView }: LogInButtonProps) {
    const [isPopupOpen, setIsPopupOpen] = useState(false)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')

    const handleClick = async () => {
        try {
            const response = await axios.post<TokenResponse>("http://localhost:8000/api/token/", {
                username,
                password,
            })

            const { access, refresh } = response.data

            localStorage.setItem("access_token", access)
            localStorage.setItem("refresh_token", refresh)

            setLogInData({
                username: username,
                isLoggedIn: true,
            })
            setIsPopupOpen(false)
            setView('wordsLists')
            setError('')
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    setError("Invalid username or password. Please try again.")
                } else if (error.response?.status === 500) {
                    setError("A server error occurred. Please try again later.")
                } else {
                    setError("Login failed. Please try again.")
                }
            } else {
                setError("An unexpected error occurred. Please try again.")
            }
        }
    }

    return (
        <>
            <button onClick={() => setIsPopupOpen(true)}>
                Log In
            </button>
            <Popup open={isPopupOpen} onClose={() => setIsPopupOpen(false)} modal nested>
                {/* @ts-ignore} */}
                {(close) => (
                    <div className="modal">
                        <button className="close" onClick={close}>
                            &times;
                        </button>
                        <div className="header">Log In</div>
                        <div className="content">
                            <div>Username:</div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                style={{ marginLeft: '16px', width: '200px', height: '40px', fontSize: '16px' }}
                            />
                            <div>Password:</div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ marginLeft: '16px', width: '200px', height: '40px', fontSize: '16px' }}
                            />
                            <div>
                                Show Password:
                                <input
                                    type="checkbox"
                                    onChange={() => setShowPassword(!showPassword)}
                                    style={{ height: '20px', width: '20px', marginLeft: '8px' }}
                                />
                            </div>
                        </div>
                        <div className="actions">
                            <button onClick={close} style={{ width: 'auto' }}>
                                Cancel
                            </button>
                            <button onClick={handleClick} style={{ width: 'auto' }}>
                                Log In
                            </button>
                        </div>
                        {error && <div style={{ color: 'orangered', textAlign: 'center' }}>{error}</div>}
                    </div>
                )}
            </Popup>
        </>
    )
}
