import React, { useEffect } from 'react'
import { Container } from 'semantic-ui-react'
import nprogress from 'nprogress'
import { useRouter } from 'next/router'
import HeadTags from './HeadTags'
import Navbar from './Navbar'

const Layout: React.FC = ({ children }) => {
  const router = useRouter()

  useEffect(() => {
    const handleRouteStart = () => nprogress.start()
    const handleRouteStop = () => nprogress.done()

    router.events.on('routeChangeStart', handleRouteStart)
    router.events.on('routeChangeComplete', handleRouteStop)
    router.events.on('routeChangeError', handleRouteStop)

    return () => {
      router.events.off('routeChangeStart', handleRouteStart)
      router.events.off('routeChangeComplete', handleRouteStop)
      router.events.off('routeChangeError', handleRouteStop)
    }
  }, [])

  return (
    <>
      <HeadTags />
      <Navbar />
      <Container text>{children}</Container>
    </>
  )
}

export default Layout
