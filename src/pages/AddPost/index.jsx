import React from 'react'
import TextField from '@mui/material/TextField'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import SimpleMDE from 'react-simplemde-editor'

import 'easymde/dist/easymde.min.css'
import styles from './AddPost.module.scss'
import { selectIsAuth } from '../../redux/slices/auth'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from '../../axios'

export const AddPost = () => {
  const isAuth = useSelector(selectIsAuth)
  const { id } = useParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = React.useState(false)
  const [text, setText] = React.useState('')
  const [title, setTitle] = React.useState('')
  const [tags, setTags] = React.useState('')
  const [imageUrl, setImageUrl] = React.useState('')
  const inputFileRef = React.useRef(null)

  const isEditing = Boolean(id)

  React.useEffect(() => {
    if (id) {
      axios
        .get(`/posts/${id}`)
        .then(({ data }) => {
          setTitle(data.title)
          setText(data.text)
          setImageUrl(data.imageUrl)
          setTags(data.tags.join(''))
        })
        .catch((err) => {
          console.warn(err)
          alert('Error get post!')
        })
    }
  }, [])

  const onChange = React.useCallback((value) => {
    setText(value)
  }, [])

  const onSubmit = async () => {
    try {
      setIsLoading(true)
      const fields = {
        title,
        text,
        imageUrl,
        tags,
      }

      const { data } = isEditing
        ? await axios.patch(`/posts/${id}`, fields)
        : await axios.post('/posts', fields)

      const _id = isEditing ? id : data._id

      navigate(`/posts/${_id}`)
    } catch (error) {
      console.warn('Error creating post')
    }
  }

  const handleChangeFile = async (event) => {
    try {
      const formData = new FormData()
      const file = event.target.files[0]
      formData.append('image', file)
      const { data } = await axios.post('/upload', formData)
      setImageUrl(data.url)
    } catch (error) {
      console.warn(error)
      alert('Error uploading pic')
    }
  }
  const onClickRemoveImage = () => {
    setImageUrl('')
  }

  const options = React.useMemo(
    () => ({
      spellChecker: false,
      maxHeight: '400px',
      autofocus: true,
      placeholder: 'Введите текст...',
      status: false,
      autosave: {
        enabled: true,
        delay: 1000,
      },
    }),
    []
  )

  console.log({ title, tags, text })

  if (!window.localStorage.getItem('token') && !isAuth) {
    return <Navigate to="/" />
  }

  return (
    <Paper style={{ padding: 30 }}>
      <Button
        onClick={() => inputFileRef.current.click()}
        variant="outlined"
        size="large"
      >
        Загрузить превью
      </Button>
      <input
        ref={inputFileRef}
        type="file"
        onChange={handleChangeFile}
        hidden
      />
      {imageUrl && (
        <>
          <Button
            onClick={onClickRemoveImage}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
          <img
            className={styles.image}
            // ={`http://localhost:4444${imageUrl}`}
            src={imageUrl ? `${process.env.REACT_APP_API_URL}${imageUrl}` : ''}
            alt="Uploaded"
          />
        </>
      )}
      <br />
      <br />
      <TextField
        classes={{ root: styles.title }}
        variant="standard"
        placeholder="Post title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        fullWidth
      />
      <TextField
        classes={{ root: styles.tags }}
        variant="standard"
        placeholder="Tags"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        fullWidth
      />
      <SimpleMDE
        className={styles.editor}
        value={text}
        onChange={onChange}
        options={options}
      />
      <div className={styles.buttons}>
        <Button onClick={onSubmit} size="large" variant="contained">
          {isEditing ? 'Save' : 'Create a post'}
        </Button>
        <Button size="large">Отмена</Button>
      </div>
    </Paper>
  )
}
