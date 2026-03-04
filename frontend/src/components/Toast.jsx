import s from './Toast.module.css'
export default function Toast({ message }) {
  return <div className={s.toast}>{message}</div>
}
