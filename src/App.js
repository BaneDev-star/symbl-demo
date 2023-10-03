import { AudioMutedOutlined, AudioOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useEffect, useState } from 'react';
import RecordRTC from 'recordrtc';
import { io } from 'socket.io-client';

import './App.css';

function App() {
  const [isActive, setActive] = useState(false)
  const [socket, setSocket] = useState()

  const [recorder, setRecorder] = useState(null)

  const [finalSpeechText, setFinalSpeechText] = useState([])
  const [speechingText, setSpeechingText] = useState('')

  useEffect(() => {
    const socket = io.connect(process.env.REACT_APP_SERVER_URL)
    socket.on('connect', () => {
      console.log('socket connected')
    })
    socket.on('speech-detect', onSpeechDetect)
    setSocket(socket)

    return () => {
      socket.disconnect()
    }
  }, [])

  const onSpeechDetect = ({ data }) => {
    console.log('speech-detect', data)
    if (data.isFinal) {
      setSpeechingText('')
      setFinalSpeechText((prev) => {
        return [...prev, data.punctuated.transcript]
      })
    } else {
      setSpeechingText(data.punctuated.transcript)
    }
  }

  const initStream = async () => {
    var parts = [], partSize = 0;
    let stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
    var StereoAudioRecorder = RecordRTC.StereoAudioRecorder;
    let recorder = RecordRTC(stream, {
      type: 'audio',
      mimeType: 'audio/wav',
      recorderType: StereoAudioRecorder,
      disableLogs: false,
      timeSlice: 300,
      ondataavailable: async function (blob) {
        parts.push(blob)
        partSize += blob.size
        let start = 0
        let bigBlob = new Blob(parts, { type: blob.type })
        while (partSize >= 8192) {
          let sizedBlob = bigBlob.slice(start, start + 8192)
          partSize -= 8192
          start += 8192
          socket.emit('speech', { data: sizedBlob })
        }
        if (partSize > 0) {
          const remainBlob = bigBlob.slice(start, start + partSize)
          parts = [remainBlob]
        } else {
          parts = []
        }
      },
      bufferSize: 8192,
      desiredSampRate: 16000,
      numberOfAudioChannels: 1,
    });
    return recorder;
  }

  const startRecording = async () => {
    socket.connect();
    const recorder = await initStream()
    setRecorder(recorder)
    recorder.startRecording();
  };

  const stopRecording = async () => {
    recorder.stopRecording()
  };

  return (
    <div className="App">
      <h2>Symbl AI Demo Application</h2>
      <Button
        type="primary"
        disabled={!socket}
        onClick={() => {
          if (isActive) {
            stopRecording()
          } else {
            startRecording()
          }
          setActive(!isActive)
        }}
        shape="round"
        icon={isActive ? <AudioMutedOutlined /> : <AudioOutlined />} size={'large'} />

      <h3>Speech Detection</h3>
      <div className='speech-detect'>
        <span className='final-text'>{finalSpeechText.join(' ')}</span>
        <span className='speeching-text'>{speechingText}</span>
      </div>
    </div>
  );
}

export default App;
