import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { db } from "lib/firebase"
import { collection, getDocs } from "firebase/firestore"
import UserPosts from "components/Posts/UserPosts"
import ProfileSkeleton from "components/Skeletons/ProfileSkeleton"
import ProfileHeader from "containers/Profile/ProfileHeader"
import SiteTitle from "components/SiteTitle"

const Profile = () => {
  const { user } = useParams()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({ username: null, data: null })

  useEffect(() => {
    const getUser = async () => {
      const usersRef = collection(db, "users")
      const usersSnap = await getDocs(usersRef)
      usersSnap.forEach((docRef) => {
        if (docRef.data().username.toLowerCase() === user.toLowerCase())
          setData({ id: docRef.id, ...docRef.data() })
      })

      setLoading(false)
    }

    getUser()
  }, [user])

  if (loading) {
    return <ProfileSkeleton />
  }

  if (!data.id) {
    return (
      <>
        <SiteTitle title="No user exists | Block." />
        <h1 className="title is-1">No user exists</h1>
      </>
    )
  }

  return (
    <>
      <SiteTitle title={`${data.username} | Block.`} />
      <ProfileHeader {...data} loading={loading} />
      <UserPosts author={data.username} />
    </>
  )
}

export default Profile
