import {Button} from './Button'
import {useCallback, useEffect, useRef, useState} from 'react'
import type {AdventProps} from './advent/types'

const useWorker = <T,>(message: AdventProps, cb: (data: T) => void) => {
  const [worker] = useState(() => {
    if (typeof Worker !== 'undefined') {
      const worker = new Worker(
        new URL('./advent/worker.ts', import.meta.url),
        {type: 'module'},
      )
      worker.addEventListener('message', (event: MessageEvent<T>) =>
        cb(event.data),
      )
      worker.postMessage(message)
      return worker
    }
  })

  // Terminate on unmount
  useEffect(() => () => worker?.terminate(), [worker])

  return worker
}

const Day = (props: AdventProps) => {
  const [debug, setDebug] = useState<string>('')
  const [result, setResult] = useState<string>('')

  useWorker(props, (data: any) => {
    console.log('received from worker', data)
    if ('result' in data) {
      setResult(`${data.result}`)
    } else if ('debug' in data) {
      setDebug(debug => debug + '\n' + data.debug)
    }
  })

  return (
    <>
      {result}
      {debug && (
        <>
          {'\n\n'}DEBUG:{debug}
        </>
      )}
    </>
  )
}

const Advent = (props: AdventProps) => {
  const ref = useRef<HTMLPreElement>(null)
  const [running, setRunning] = useState(false)
  const run = useCallback(() => {
    const el = ref.current!
    const h = el.getBoundingClientRect().height
    const s = window.getComputedStyle(el)
    el.style.minHeight = `calc(${h}px - ${s.paddingTop} - ${s.paddingBottom})`
    setRunning(true)
  }, [])
  return (
    <pre ref={ref}>
      {running ? <Day {...props} /> : <Button onClick={run}>Run!</Button>}
    </pre>
  )
}

export default Advent // easier for dynamic import
