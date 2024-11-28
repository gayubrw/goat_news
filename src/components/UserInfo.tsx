'use client'

import { useUser } from "@clerk/nextjs"

const UserInfo = () => {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (!isSignedIn) {
    return <div>Please sign in first</div>
  }

  return (
    <div>
      {/* Tampilkan data user sesuai kebutuhan */}
      <div>
        <h3>Welcome, {user.firstName}</h3>
        <p>Email: {user.primaryEmailAddress?.emailAddress}</p>
      </div>
    </div>
  )
}

export default UserInfo