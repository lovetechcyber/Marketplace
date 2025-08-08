import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import Recorder from 'recorder-js';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';

let socket;

export default function MessageWithProductPage() {
  const router = useRouter();
  const { productId } = router.query;
  const [product, setProduct] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [mediaUrl, setMediaUrl] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [typing, setTyping] = useState(false);
  const [readReceipts, setReadReceipts] = useState({});

  useEffect(() => {
    if (!productId) return;
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);

    socket.on('connect', () => console.log('Connected to socket'));

    socket.on('message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      markAsRead(msg.id);
    });

    socket.on('typing', () => setTyping(true));
    socket.on('stopTyping', () => setTyping(false));

    initRecorder();
    fetchProduct();
    fetchMessages();

    return () => socket.disconnect();
  }, [productId]);

  const initRecorder = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new Recorder(new (window.AudioContext || window.webkitAudioContext)(), {});
    rec.init(stream);
    setRecorder(rec);
  };

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`/api/products/${productId}`);
      setProduct(res.data);
    } catch (err) {
      console.error('Error fetching product', err);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`/api/chat/history?productId=${productId}`, { withCredentials: true });
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
      senderId: 'me',
      text: input,
      media: mediaUrl,
      timestamp: new Date().toISOString(),
      productId,
    };
    socket.emit('message', newMsg);
    socket.emit('stopTyping');
    setMessages((prev) => [...prev, newMsg]);
    setInput('');
    setMediaUrl(null);
    await axios.post('/api/chat/save', newMsg, { withCredentials: true });
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

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      {product && (
        <div className="mb-6 bg-white p-4 shadow rounded">
          <h2 className="text-xl font-semibold mb-1">{product.title}</h2>
          <p className="text-gray-600 mb-1">₦{product.price}</p>
          <p className="text-sm text-gray-700">{product.description}</p>
          <Link
            href={`/item/${productId}`}
            className="text-blue-600 underline text-sm mt-2 inline-block"
          >
            View Full Product Page
          </Link>
        </div>
      )}
      <div className="max-w-2xl mx-auto bg-white shadow rounded p-4">
        <div className="h-80 overflow-y-auto mb-4">
          {messages.map((msg) => (
            <div key={msg.id} className="mb-2">
              <p className="text-sm font-medium">{msg.senderId} {readReceipts[msg.id] && <span className="text-green-500">✓ Read</span>}</p>
              <p>{msg.text}</p>
              {msg.media && (
                msg.media.includes('audio') ? (
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
