import { AudioMutedOutlined, AudioOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useEffect, useState } from 'react';
import { useReactMediaRecorder, ReactMediaRecorder } from "react-media-recorder";
import { io } from 'socket.io-client'

import './App.css';
import API from './api/api'

function App() {
  const [isActive, setActive] = useState(false)
  const [stream, setStream] = useState()
  const [socket, setSocket] = useState()

  useEffect(() => {
    const socket = io.connect('http://localhost:3001')
    socket.on('connect', () => {
      console.log('socket connected')
    })
    setSocket(socket)
  }, [])

  // const {
  //   status,
  //   startRecording,
  //   stopRecording
  // } = useReactMediaRecorder({
  //   video: false,
  //   audio: true,
  //   echoCancellation: true,
  //   onStop: (blobUrl, blob) => {
  //     const audioFile = new File([blob], 'voice.wav', { type: 'audio/wav' });
  //     const formData = new FormData(); // preparing to send to the server
  //     formData.append('file', audioFile);  // preparing to send to the server    
  //     API.onSpeech(formData);
  //   },
  //   askPermissionOnMount: true,
  //   previewAudioStream: (stream) => {
  //     console.log('stream', stream)
  //   }
  // })

  const startRecording1 = (id) => {
    socket.connect();
    var partSize = 0, parts = [];
    const MIN_BLOB_SIZE = 8192;
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const mimeTypes = ["audio/webm"].filter((type) =>
        MediaRecorder.isTypeSupported(type)
      );

      if (mimeTypes.length === 0) return alert("Browser not supported");
      setActive(true);
      setStream(stream);
      let recorder = new MediaRecorder(stream, { mimeType: mimeTypes[0], audioBitsPerSecond: 128000 });
      recorder.addEventListener("dataavailable", async (event) => {
        console.log("cheking data available for send");
        if (socket.connected) {
          // socket.emit('speech', { data: event.data })
          const blob = event.data;
          partSize += blob.size;
          parts.push(blob);
          while (partSize >= MIN_BLOB_SIZE) {
            let bigBlob = new Blob(parts, { type: blob.type });
            let sizedBlob = bigBlob.slice(0, MIN_BLOB_SIZE, blob.type);
            parts = [ bigBlob.slice(MIN_BLOB_SIZE, bigBlob.size, blob.type) ];
            partSize = parts[0].size
            console.log("sending audio = ", sizedBlob.size);
            socket.emit('speech', { data: sizedBlob })
          }
        } else {
          console.log("no data avialable");
        }
      });
      recorder.start(1000);
    });
  };

  const stopRecording = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setActive(false);
    console.log("Recording stopped");
  };

  return (
    <div className="App">
      <h2>Symbl AI Demo Application</h2>
      <Button
        type="primary"
        onClick={() => {
          if (isActive) {
            stopRecording()
          } else {
            startRecording1()
          }
          setActive(!isActive)
        }}
        shape="round"
        icon={isActive ? <AudioMutedOutlined /> : <AudioOutlined />} size={'large'} />
      {/* <List
        itemLayout="horizontal"
        dataSource={transcripts}
        renderItem={(item, index) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar src={`https://xsgames.co/randomusers/avatar.php?g=pixel&key=${index}`} />}
              title={<a href="https://ant.design">{item}</a>}
            />
          </List.Item>
        )}
      /> */}
    </div>
  );
}

export default App;
