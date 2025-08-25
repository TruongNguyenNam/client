<template>
  <div>
    <!-- Chatbot Toggler -->
    <button id="chatbot-toggler" @click="toggleChatbot">
      <span class="material-symbols-rounded">Chat</span>
      <span class="material-symbols-rounded">close</span>
    </button>

    <!-- Chatbot Popup -->
    <div class="chatbot-popup" :class="{ 'show-chatbot': showChatbot }">
      <!-- Chatbot Header -->
      <div class="chat-header">
        <div class="header-info">
          <svg class="chatbot-logo" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
            <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z" />
          </svg>
          <h2 class="logo-text">Chatbot</h2>
        </div>
        <div>
          <button id="reset-chat" class="pi pi-refresh" style="font-size: 1.5rem" @click="resetChatHistory"></button>
          <button id="close-chatbot" class="pi pi-times" style="font-size: 1.5rem" @click="toggleChatbot"></button>
        </div>
      </div>

      <!-- Chatbot Body -->
      <div class="chat-body" ref="chatBody">
        <div
          v-for="(message, index) in chatHistory"
          :key="index"
          class="message"
          :class="[
            message.role === 'user' ? 'user-message' : 'bot-message',
            { 'thinking': message.thinking }
          ]"
        >
          <svg v-if="message.role !== 'user'" class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
            <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z" />
          </svg>
          <div class="message-text" v-if="!message.thinking">{{ message.parts[0].text }}</div>
          <div class="message-text" v-else>
            <div class="thinking-indicator">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
          </div>
          <img v-if="message.parts[1]?.inline_data" :src="`data:${message.parts[1].inline_data.mime_type};base64,${message.parts[1].inline_data.data}`" class="attachment" />
        </div>
      </div>

      <!-- Chatbot Footer -->
      <div class="chat-footer">
        <form class="chat-form" @submit.prevent="handleOutgoingMessage">
          <textarea
            v-model="userData.message"
            placeholder="Message..."
            class="message-input"
            required
            ref="messageInput"
            @input="adjustTextareaHeight"
            @keydown="handleEnterKey"
          ></textarea>
          <div class="chat-controls">
  <button type="button" id="emoji-picker" class="control-btn" @click="toggleEmojiPicker">
    <span class="pi pi-smile"></span> <!-- PrimeVue smile icon for emoji picker -->
  </button>
  <div class="file-upload-wrapper" :class="{ 'file-uploaded': userData.file.data }">
    <input type="file" id="file-input" hidden ref="fileInput" @change="handleFileChange" accept="image/jpeg,image/png,image/gif,image/webp" />
    <button type="button" id="file-upload" class="control-btn" @click="$refs.fileInput.click()">
      <span class="pi pi-paperclip"></span> <!-- PrimeVue paperclip icon for file upload -->
    </button>
    <button v-if="userData.file.data" type="button" id="file-cancel" class="control-btn" @click="resetFileInput">
      <span class="pi pi-times"></span> <!-- PrimeVue times icon for cancel -->
    </button>
    <img v-if="userData.file.data" :src="`data:${userData.file.mime_type};base64,${userData.file.data}`" class="file-preview" />
  </div>
  <button type="submit" id="send-message" class="control-btn send-btn">
    <span class="pi pi-send"></span> <!-- PrimeVue send icon -->
  </button>
</div>
        </form>
        <emoji-picker
          v-if="showEmojiPicker"
          class="emoji-picker"
          :theme="'light'"
          :show-skin-tones="false"
          :preview-position="'none'"
          @select="onEmojiSelect"
          @click-outside="showEmojiPicker = false"
        ></emoji-picker>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2';
import { Picker } from 'emoji-mart';
// import AttachFileIcon from '@mui/icons-material/AttachFile';
export default {
  name: 'App',
  components: {
    'emoji-picker': Picker,
  },
  data() {
    return {
      showChatbot: false,
      showEmojiPicker: false,
      userData: {
        message: null,
        file: {
          data: null,
          mime_type: null,
        },
      },
      chatHistory: [
        {
          role: 'model',
          parts: [{ text: 'Xin chào 👋Tôi có thể giúp gì cho bạn hôm nay?' }],
        },
      ],
      API_KEY: 'AIzaSyAKUwoWx4_fA28nhwufChsqB4PIPKCtPL8',
      API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=',
      initialInputHeight: 0,
    };
  },
  mounted() {
    this.API_URL += this.API_KEY;
    this.$nextTick(() => {
      this.initialInputHeight = this.$refs.messageInput.scrollHeight;
    });
  },
  methods: {
    toggleChatbot() {
      this.showChatbot = !this.showChatbot;
    },
    toggleEmojiPicker() {
      this.showEmojiPicker = !this.showEmojiPicker;
    },
    onEmojiSelect(emoji) {
      const textarea = this.$refs.messageInput;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      this.userData.message = this.userData.message
        ? this.userData.message.slice(0, start) + emoji.native + this.userData.message.slice(end)
        : emoji.native;
      this.$nextTick(() => {
        textarea.focus();
      });
    },
    adjustTextareaHeight() {
      const textarea = this.$refs.messageInput;
      textarea.style.height = `${this.initialInputHeight}px`;
      textarea.style.height = `${textarea.scrollHeight}px`;
      const form = textarea.closest('.chat-form');
      form.style.borderRadius = textarea.scrollHeight > this.initialInputHeight ? '15px' : '32px';
    },
    handleEnterKey(e) {
      if (e.key === 'Enter' && this.userData.message && !e.shiftKey && window.innerWidth > 768) {
        this.handleOutgoingMessage(e);
      }
    },
    async handleFileChange(e) {
      const file = e.target.files[0];
      if (!file) return;
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validImageTypes.includes(file.type)) {
        await Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WEBP)',
          confirmButtonText: 'OK',
        });
        this.resetFileInput();
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target.result.split(',')[1];
        this.userData.file = {
          data: base64String,
          mime_type: file.type,
        };
        this.$refs.fileInput.value = '';
      };
      reader.readAsDataURL(file);
    },
    resetFileInput() {
      this.userData.file = { data: null, mime_type: null };
      this.$refs.fileInput.value = '';
    },
    resetChatHistory() {
      this.chatHistory = [
        {
          role: 'model',
          parts: [{ text: 'Xin chào 👋 Tôi có thể giúp gì cho bạn hôm nay?' }],
        },
      ];
    },
    async fetchWithRetry(url, options, retries = 3) {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await fetch(url, options);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
          }
          return await response.json();
        } catch (error) {
          if (i === retries - 1) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    },
    async handleOutgoingMessage(e) {
      e.preventDefault();
      if (!this.userData.message) return;

      const messageContent = {
        role: 'user',
        parts: [{ text: this.userData.message }, ...(this.userData.file.data ? [{ inline_data: this.userData.file }] : [])],
      };
      this.chatHistory.push(messageContent);
      this.userData.message = '';
      this.resetFileInput();
      this.adjustTextareaHeight();

      this.$nextTick(() => {
        this.$refs.chatBody.scrollTo({ behavior: 'smooth', top: this.$refs.chatBody.scrollHeight });
      });

      const botMessage = {
        role: 'model',
        parts: [{ text: '' }],
        thinking: true,
      };
      this.chatHistory.push(botMessage);
      this.$nextTick(() => {
        this.$refs.chatBody.scrollTo({ behavior: 'smooth', top: this.$refs.chatBody.scrollHeight });
      });

      try {
        const filteredHistory = this.chatHistory
          .filter(msg => !msg.thinking && msg.parts && msg.parts.length > 0)
          .map(msg => ({
            role: msg.role,
            parts: msg.parts.map(part => ({
              text: part.text || undefined,
              inline_data: part.inline_data ? { data: part.inline_data.data, mime_type: part.inline_data.mime_type } : undefined,
            })).filter(part => part.text || part.inline_data),
          }));

        if (filteredHistory.length === 0) {
          throw new Error('Không có tin nhắn hợp lệ để gửi');
        }

        const response = await this.fetchWithRetry(this.API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: filteredHistory }),
        });

        const apiResponseText = response.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1').trim();
        const lastBotMessage = this.chatHistory[this.chatHistory.length - 1];
        lastBotMessage.parts[0].text = apiResponseText;
        lastBotMessage.thinking = false;
        this.chatHistory = [...this.chatHistory];
      } catch (error) {
        console.error('Chi tiết lỗi:', error);
        const lastBotMessage = this.chatHistory[this.chatHistory.length - 1];
        lastBotMessage.parts[0].text = `Lỗi: ${error.message}`;
        lastBotMessage.thinking = false;
        this.chatHistory = [...this.chatHistory];
      } finally {
        this.$nextTick(() => {
          this.$refs.chatBody.scrollTo({ behavior: 'smooth', top: this.$refs.chatBody.scrollHeight });
        });
      }
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@48,400,1,0');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
}

body {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(#E6E6FA, #87CEEB);
}

#chatbot-toggler {
  position: fixed;
  bottom: 30px;
  right: 35px;
  border: none;
  height: 60px;
  width: 60px;
  display: flex;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #1E90FF;
  box-shadow: 0 0 25px rgba(30, 144, 255, 0.5);
  transition: all 0.2s ease;
  z-index: 1000;
}

.show-chatbot #chatbot-toggler {
  transform: rotate(90deg);
}

#chatbot-toggler span {
  color: #fff;
  font-size: 1.5rem;
  position: absolute;
}

#chatbot-toggler span:last-child,
.show-chatbot #chatbot-toggler span:first-child {
  opacity: 0;
}

.show-chatbot #chatbot-toggler span:last-child {
  opacity: 1;
}

.chatbot-popup {
  position: fixed;
  right: 35px;
  bottom: 100px;
  width: 450px;
  max-height: 80vh;
  overflow: hidden;
  background: #FFFFFF;
  border-radius: 20px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2), 0 10px 30px rgba(0, 0, 0, 0.3);
  opacity: 0;
  pointer-events: none;
  transform: scale(0.2);
  transform-origin: bottom right;
  transition: all 0.3s ease;
  z-index: 1000;
}

.show-chatbot {
  opacity: 1;
  pointer-events: auto;
  transform: scale(1);
}

.chat-header {
  display: flex;
  align-items: center;
  padding: 15px 25px;
  background: linear-gradient(90deg, #1E90FF, #4169E1);
  justify-content: space-between;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}

.chat-header .header-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.header-info .chatbot-logo {
  width: 40px;
  height: 40px;
  padding: 6px;
  fill: #1E90FF;
  flex-shrink: 0;
  background: #fff;
  border-radius: 50%;
}

.header-info .logo-text {
  color: #fff;
  font-weight: 700;
  font-size: 1.4rem;
  letter-spacing: 0.02rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.chat-header #close-chatbot {
  border: none;
  color: #fff;
  height: 45px;
  width: 45px;
  font-size: 2rem;
  margin-right: -10px;
  padding-top: 2px;
  cursor: pointer;
  border-radius: 50%;
  background: none;
  transition: 0.2s ease;
}

.chat-header #close-chatbot:hover {
  background: rgba(255, 255, 255, 0.2);
}

.chat-body {
  padding: 25px;
  gap: 20px;
  display: flex;
  height: calc(80vh - 150px);
  overflow-y: auto;
  margin-bottom: 90px;
  flex-direction: column;
  scrollbar-width: thin;
  scrollbar-color: #D3D3D3 transparent;
  background: #F9F9FF;
}

.chat-body .message {
  display: flex;
  gap: 12px;
  align-items: center;
}

.chat-body .message .bot-avatar {
  width: 40px;
  height: 40px;
  padding: 6px;
  fill: #fff;
  flex-shrink: 0;
  margin-bottom: 2px;
  align-self: flex-end;
  border-radius: 50%;
  background: #1E90FF;
}

.chat-body .message .message-text {
  padding: 12px 16px;
  max-width: 75%;
  font-size: 1rem;
  border-radius: 15px;
}

.chat-body .bot-message.thinking .message-text {
  padding: 2px 16px;
}

.chat-body .bot-message .message-text {
  background: #E6E6FA;
  border-radius: 15px 15px 15px 5px;
}

.chat-body .user-message {
  flex-direction: column;
  align-items: flex-end;
}

.chat-body .user-message .message-text {
  color: #fff;
  background: #1E90FF;
  border-radius: 15px 15px 5px 15px;
}

.chat-body .user-message .attachment {
  width: 50%;
  margin-top: -7px;
  border-radius: 15px 5px 15px 15px;
}

.chat-body .bot-message .thinking-indicator {
  display: flex;
  gap: 5px;
  padding-block: 15px;
}

.chat-body .bot-message .thinking-indicator .dot {
  height: 8px;
  width: 8px;
  opacity: 0.7;
  border-radius: 50%;
  background: #6A5ACD;
  animation: dotPulse 1.8s ease-in-out infinite;
}

.chat-body .bot-message .thinking-indicator .dot:nth-child(1) {
  animation-delay: 0.2s;
}

.chat-body .bot-message .thinking-indicator .dot:nth-child(2) {
  animation-delay: 0.3s;
}

.chat-body .bot-message .thinking-indicator .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dotPulse {
  0%, 44% {
    transform: translateY(0);
  }
  28% {
    opacity: 0.4;
    transform: translateY(-5px);
  }
  44% {
    opacity: 0.2;
  }
}

.chat-footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: #fff;
  padding: 15px 25px 20px;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.1);
}

.chat-form {
  display: flex;
  align-items: center;
  position: relative;
  background: #F9F9FF;
  border-radius: 25px;
  outline: 2px solid #D3D3D3;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.chat-form:focus-within {
  outline: 2px solid #1E90FF;
  box-shadow: 0 0 15px rgba(30, 144, 255, 0.3);
}

.chat-form .message-input {
  width: 100%;
  height: 50px;
  outline: none;
  resize: none;
  border: none;
  max-height: 150px;
  scrollbar-width: thin;
  border-radius: inherit;
  font-size: 1rem;
  padding: 12px 18px;
  scrollbar-color: transparent transparent;
}

.chat-form .chat-controls {
  gap: 8px;
  height: 50px;
  display: flex;
  padding-right: 8px;
  align-items: center;
}

.chat-form .chat-controls .control-btn {
  height: 40px;
  width: 40px;
  border: none;
  cursor: pointer;
  color: #6A5ACD;
  border-radius: 50%;
  font-size: 1.2rem;
  background: none;
  transition: all 0.2s ease;
}

.chat-form .chat-controls .control-btn:hover {
  color: #1E90FF;
  background: #E6E6FA;
}

.chat-form .chat-controls .send-btn {
  color: #fff;
  background: #1E90FF;
}

.chat-form .chat-controls .send-btn:hover {
  background: #4169E1;
}

.chat-form .file-upload-wrapper {
  position: relative;
  height: 40px;
  width: 40px;
}

.chat-form .file-upload-wrapper :where(button, img) {
  position: absolute;
}

.chat-form .file-upload-wrapper img.file-preview {
  height: 100%;
  width: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid #fff;
}

.chat-form .file-upload-wrapper #file-cancel {
  color: #FF4500;
  background: #fff;
  z-index: 1;
}

.chat-form .file-upload-wrapper :where(img.file-preview, #file-cancel),
.chat-form .file-upload-wrapper.file-uploaded #file-upload {
  display: none;
}

.chat-form .file-upload-wrapper.file-uploaded img.file-preview,
.chat-form .file-upload-wrapper.file-uploaded:hover #file-cancel {
  display: block;
}

.emoji-picker {
  position: absolute;
  left: 50%;
  top: -350px;
  width: 100%;
  max-width: 350px;
  max-height: 330px;
  transform: translateX(-50%);
}

@media (max-width: 520px) {
  #chatbot-toggler {
    right: 20px;
    bottom: 20px;
  }
  .chatbot-popup {
    right: 0;
    bottom: 0;
    height: 100%;
    border-radius: 0;
    width: 100%;
  }
  .chatbot-popup .chat-header {
    padding: 12px 15px;
  }
  .chat-body {
    height: calc(90% - 60px);
    padding: 15px;
  }
  .chat-footer {
    padding: 10px 15px 15px;
  }
  .chat-form .file-upload-wrapper.file-uploaded #file-cancel {
    opacity: 0;
  }
}
</style>