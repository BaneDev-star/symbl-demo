import { Symbl } from '@symblai/symbl-web-sdk';
import './App.css';
import { useState } from 'react';
import { Button, List, Avatar } from 'antd';
import { AudioOutlined, AudioMutedOutlined } from '@ant-design/icons';

function App() {
  const [conversationId, setConversationId] = useState(null)
  const [symblConn, setSymblConn] = useState(null)
  const [transcripts, setTranscripts] = useState([])

  const startConversation = async () => {
    try {

      // Symbl recommends replacing the App ID and App Secret with an Access Token for authentication in production applications.
      // For more information about authentication see https://docs.symbl.ai/docs/developer-tools/authentication/.
      const symbl = new Symbl({
        appId: process.env.REACT_APP_SYMBL_APP_ID,
        appSecret: process.env.REACT_APP_SYMBL_APP_SECRET,
      });

      // Open a Streaming API WebSocket Connection and start processing audio from your input device.
      const connection = await symbl.createAndStartNewConnection();
      setSymblConn(connection);

      // Retrieve the conversation ID for the conversation.
      connection.on("conversation_created", (conversationData) => {
        const conversationId = conversationData.data.conversationId;
        setConversationId(conversationId);
      });

      connection.on("speech_recognition", (speechData) => {
        const name = speechData.user ? speechData.user.name : "User";
        const transcript = speechData.punctuated.transcript;
        console.log(`${name}: `, speechData);
        const newData = [...transcripts]
        newData.push(transcript)
        console.log('newData = ', transcripts)
        setTranscripts(old => {
          console.log('old = ', old)
          return newData
        })
      });
      // document.querySelector("#startButton").removeAttribute("disabled");
    } catch (e) {
      // Handle errors here.
    }
  }

  const stopConversation = async () => {
    if (symblConn) {
      await symblConn.stopProcessing();
      symblConn.disconnect();
      setSymblConn(null)
      setConversationId(null)
      setTranscripts([])
    }
  }


  return (
    <div className="App">
      <h2>Symbl AI Demo Application</h2>
      <Button type="primary" onClick={conversationId ? stopConversation : startConversation} shape="round" icon={conversationId ? <AudioMutedOutlined /> : <AudioOutlined />} size={'large'} />
      <List
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
      />
    </div>
  );
}

export default App;
