import { useState, useEffect, createContext } from "react"
import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore"
import { db } from "lib/firebase"
import useAuth from "hooks/useAuth"
import { useNavigate } from "react-router-dom"
import defaultAvatar from "assets/images/avatar_placeholder.png"

export const UserContext = createContext()

const UserContextProvider = ({ children }) => {
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const [username, setUsername] = useState(null)
  const [avatar, setAvatar] = useState(null)
  const [uid, setUid] = useState(null)
  const { currentUser } = useAuth()

  useEffect(() => {
    const setData = async () => {
      if (!currentUser) return
      const querySnapshot = await getDocs(collection(db, "users"))
      querySnapshot.forEach((doc) => {
        if (currentUser.uid === doc.data().uid) {
          setUserData(doc.data())
          setUsername(doc.id)
          setAvatar(doc.data().avatar)
          setUid(doc.data().uid)
        }
      })
    }

    setData()
  }, [currentUser])

  const convertToSlug = (slug) => {
    return slug
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-")
  }

  const addComment = async (commentData, post_id, currentCommentCount) => {
    try {
      await addDoc(collection(db, "comments"), {
        ...commentData,
        date: new Date(),
      })

      updateCommentCount(post_id, currentCommentCount)

      console.log(`Comment posted successfully:`)
    } catch (error) {
      return error
    }
  }

  const updateCommentCount = async (post_id, currentCommentCount) => {
    const postRef = doc(db, "posts", post_id)

    await updateDoc(postRef, {
      comment_count: currentCommentCount + 1,
    })
  }

  const createPost = async (
    author,
    author_id,
    body,
    excerpt,
    image,
    title,
    id,
    tags
  ) => {
    const formattedSlug = convertToSlug(title)

    try {
      await addDoc(collection(db, "posts"), {
        author: author,
        author_id: author_id,
        comment_count: 0,
        content: {
          body: body,
          excerpt: excerpt,
          image: image,
          title: title,
        },
        date: new Date(),
        id: id,
        slug: formattedSlug,
        tags: tags,
      })

      console.log(`Post created successfully`)
      navigate(`/user/${author}/posts/${formattedSlug}`)
    } catch (error) {
      return error
    }
  }

  const deletePost = async (id) => {
    await deleteDoc(doc(db, "posts", id))
    return true
  }

  const getAvatar = async (author) => {
    try {
      const docRef = doc(db, "users", author)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) return null

      const userAvatar = docSnap.data().avatar

      return userAvatar
    } catch (error) {
      return defaultAvatar
    }
  }

  const value = {
    userData,
    username,
    uid,
    avatar,
    createPost,
    deletePost,
    addComment,
    getAvatar,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export default UserContextProvider
