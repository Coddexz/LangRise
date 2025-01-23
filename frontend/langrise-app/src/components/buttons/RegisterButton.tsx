import React, { useState } from "react"
import axios from "axios"
import Popup from "reactjs-popup"
import { type LogInData, type View } from "../../App.tsx"

type RegisterButtonProps = {
    setLogInData: React.Dispatch<React.SetStateAction<LogInData>>,
    setView: React.Dispatch<React.SetStateAction<View>>
}

export default function RegisterButton({ setLogInData, setView }: RegisterButtonProps) {
    const [isPopupOpen, setIsPopupOpen] = useState(false)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState('')

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            setError("Passwords do not match. Please try again.")
            return
        }

        try {
            const response = await axios.post("http://localhost:8000/api/register/", {
                username,
                password,
            })
            console.log(response)
            setLogInData({
                username: username,
                isLoggedIn: true,
            })
            setIsPopupOpen(false)
            setView('wordsLists')
            setError('')
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 400) {
                    setError("Registration failed. Username may already exist.")
                } else if (error.response?.status === 500) {
                    setError("A server error occurred. Please try again later.")
                } else {
                    setError("Registration failed. Please try again.")
                }
            } else {
                setError("An unexpected error occurred. Please try again.")
            }
        }
    }

    return (
        <>
            <button onClick={() => setIsPopupOpen(true)}>
                Register
            </button>
            <Popup open={isPopupOpen} onClose={() => setIsPopupOpen(false)} modal nested>
                {/* @ts-ignore} */}
                {(close) => (
                    <div className="modal">
                        <button className="close" onClick={close}>
                            &times;
                        </button>
                        <div className="header">Register</div>
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
                            <div>Confirm Password:</div>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                style={{ marginLeft: '16px', width: '200px', height: '40px', fontSize: '16px' }}
                            />
                            <div>
                                Show Confirm Password:
                                <input
                                    type="checkbox"
                                    onChange={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={{ height: '20px', width: '20px', marginLeft: '8px' }}
                                />
                            </div>
                        </div>
                        <div className="actions">
                            <button onClick={close} style={{ width: 'auto' }}>
                                Cancel
                            </button>
                            <button onClick={handleRegister} style={{ width: 'auto' }}>
                                Register
                            </button>
                        </div>
                        {error && <div style={{ color: 'orangered', textAlign: 'center', marginTop: '20px' }}>{error}</div>}
                    </div>
                )}
            </Popup>
        </>
    )
}
