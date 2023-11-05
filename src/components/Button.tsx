import * as AK from '@ariakit/react'
import type {ButtonProps} from '@ariakit/react'
import styles from './Button.module.css'

export const Button = (props: ButtonProps) => (
  <AK.Button
    {...props}
    className={`${styles.button} ${props.className || ''}`}
  />
)
