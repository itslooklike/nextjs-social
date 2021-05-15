import axios from 'axios'
import Router from 'next/router'
import cookie from 'js-cookie'
import baseUrl from './baseUrl'
import catchErrors from './catchErrors'

export const registerUser = async (user, profilePicUrl, setError, setLoading) => {
  try {
    const res = await axios.post(`${baseUrl}/api/signup`, { user, profilePicUrl })

    setToken(res.data)
  } catch (error) {
    const errorMsg = catchErrors(error)
    setError(errorMsg)
  }
  setLoading(false)
}

export const loginUser = async (user, setError, setLoading) => {
  setLoading(true)
  try {
    const res = await axios.post(`${baseUrl}/api/auth`, { user })

    setToken(res.data)
  } catch (error) {
    const errorMsg = catchErrors(error)
    setError(errorMsg)
  }
  setLoading(false)
}

const setToken = (token) => {
  cookie.set('token', token)
  Router.push('/')
}
