/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import Recorder from 'recorder-js';
import { v4 as uuidv4 } from 'uuid';

let socket;

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [mediaUrl, setMediaUrl] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [typing, setTyping] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [readReceipts, setReadReceipts] = useState({});
  const audioRef = useRef(null);

  useEffect(() => {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);
    socket.on('connect', () => console.log('Connected to socket'));

    socket.on('message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      markAsRead(msg.id);
    });

    socket.on('typing', () => setTyping(true));
    socket.on('stopTyping', () => setTyping(false));

    initRecorder();
    fetchMessages();

    return () => socket.disconnect();
  }, []);

  const initRecorder = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new Recorder(new (window.AudioContext || window.webkitAudioContext)(), {
      onAnalysed: (data) => console.log(data),
    });
    rec.init(stream);
    setRecorder(rec);
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get('/api/chat/history', { withCredentials: true });
      setMessages(res.data);
      const readIds = res.data.reduce((acc, msg) => {
        acc[msg.id] = true;
        return acc;
      }, {});
      setReadReceipts(readIds);
    } catch (err) {
      console.error('Error fetching chat history', err);
    }
  };

  const markAsRead = (id) => {
    setReadReceipts((prev) => ({ ...prev, [id]: true }));
    axios.post('/api/chat/read', { messageId: id }, { withCredentials: true }).catch(() => {});
  };

  const handleSend = async () => {
    if (!input && !mediaUrl) return;

    const newMsg = {
      id: uuidv4(),
      senderId: 'me', // Replace with actual user ID
      text: input,
      media: mediaUrl,
      timestamp: new Date().toISOString(),
    };

    socket.emit('message', newMsg);
    socket.emit('stopTyping');
    setMessages((prev) => [...prev, newMsg]);
    setInput('');
    setMediaUrl(null);

    try {
      await axios.post('/api/chat/save', newMsg, { withCredentials: true });
    } catch (err) {
      console.error('Error saving message', err);
    }
  };

  const uploadFile = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'YOUR_CLOUDINARY_PRESET');
    const res = await fetch('https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/auto/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    setMediaUrl(data.secure_url);
  };

  const handleRecord = async () => {
    if (recording) {
      const { blob } = await recorder.stop();
      const formData = new FormData();
      formData.append('file', blob);
      formData.append('upload_preset', 'YOUR_CLOUDINARY_PRESET');
      const res = await fetch('https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/auto/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setMediaUrl(data.secure_url);
      setRecording(false);
    } else {
      recorder.start();
      setRecording(true);
    }
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    socket.emit('typing');
    setTimeout(() => socket.emit('stopTyping'), 1500);
  };

  const filteredMessages = messages.filter(
    (msg) =>
      msg.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.senderId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <div className="max-w-2xl mx-auto bg-white shadow rounded p-4">
        <input
          type="text"
          placeholder="Search messages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />

        <div className="h-80 overflow-y-auto mb-4">
          {filteredMessages.map((msg) => (
            <div key={msg.id} className="mb-2">
              <p className="text-sm font-medium">{msg.senderId} {readReceipts[msg.id] && <span className="text-green-500">✓ Read</span>}</p>
              <p>{msg.text}</p>
              {msg.media && (
                msg.media.includes('.mp3') || msg.media.includes('audio') ? (
                  <audio controls src={msg.media} className="mt-1" />
                ) : (
                  <img src={msg.media} alt="media" className="w-32 h-32 object-cover mt-1" />
                )
              )}
            </div>
          ))}
          {typing && <p className="text-sm text-gray-500 italic">Typing...</p>}
        </div>

        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={handleTyping}
            placeholder="Type a message"
            className="border p-2 rounded w-full"
          />
          <input type="file" onChange={uploadFile} className="hidden" id="fileInput" />
          <label htmlFor="fileInput" className="cursor-pointer px-3 py-2 bg-gray-300 rounded">📎</label>
          <button onClick={handleRecord} className="px-3 py-2 bg-yellow-400 rounded">
            {recording ? 'Stop 🎙️' : 'Voice 🎤'}
          </button>
          <button onClick={handleSend} className="px-3 py-2 bg-blue-600 text-white rounded">Send</button>
        </div>
      </div>
    </div>
  );
}
