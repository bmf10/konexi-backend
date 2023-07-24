import firebase from 'firebase-admin'
import { type RequestHandler } from 'express'
import { type File } from '../types'
import { getStorage } from 'firebase-admin/storage'
import moment from 'moment'
import path from 'path'

export const firebaseInit: RequestHandler = (_req, _res, next) => {
  if (firebase.apps.length === 0) {
    firebase.initializeApp({
      credential: firebase.credential.cert(
        path.resolve('config/firebase.json'),
      ),
      storageBucket: process.env.FIREBASE_BUCKET_NAME,
    })
  }
  next()
}

export const uploadFile = async (file: File): Promise<string> => {
  const filename = `${moment().unix()}-${file.originalname}`
  await getStorage().bucket().upload(file.path, {
    destination: filename,
  })

  return filename
}

export const deleteFile = async (filename: string): Promise<void> => {
  await getStorage().bucket().file(filename).delete()
}
