// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM Elements
const authScreen = document.getElementById('auth-screen');
const chatScreen = document.getElementById('chat-screen');
const phoneNumberInput = document.getElementById('phone-number');
const verifyPhoneButton = document.getElementById('verify-phone');
const verificationCodeInput = document.getElementById('verification-code');
const signInButton = document.getElementById('sign-in');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendMessageButton = document.getElementById('send-message');

let verificationId;

// Verify Phone Number
verifyPhoneButton.addEventListener('click', () => {
  const phoneNumber = phoneNumberInput.value;
  const appVerifier = new firebase.auth.RecaptchaVerifier('verify-phone');

  auth.signInWithPhoneNumber(phoneNumber, appVerifier)
    .then((confirmationResult) => {
      verificationId = confirmationResult.verificationId;
      alert('Verification code sent!');
    })
    .catch((error) => {
      console.error('Error sending verification code:', error);
    });
});

// Sign In with Verification Code
signInButton.addEventListener('click', () => {
  const code = verificationCodeInput.value;
  const credential = firebase.auth.PhoneAuthProvider.credential(verificationId, code);

  auth.signInWithCredential(credential)
    .then(() => {
      authScreen.style.display = 'none';
      chatScreen.style.display = 'block';
      loadMessages();
    })
    .catch((error) => {
      console.error('Error signing in:', error);
    });
});

// Send Message
sendMessageButton.addEventListener('click', () => {
  const message = messageInput.value;
  const user = auth.currentUser;

  if (user && message) {
    db.collection('messages').add({
      senderId: user.uid,
      content: message,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
      messageInput.value = '';
    })
    .catch((error) => {
      console.error('Error sending message:', error);
    });
  }
});

// Load Messages
function loadMessages() {
  db.collection('messages')
    .orderBy('timestamp')
    .onSnapshot((snapshot) => {
      messagesDiv.innerHTML = '';
      snapshot.forEach((doc) => {
        const message = doc.data();
        const messageElement = document.createElement('div');
        messageElement.textContent = `${message.senderId}: ${message.content}`;
        messagesDiv.appendChild(messageElement);
      });
    });
}

// Auth State Listener
auth.onAuthStateChanged((user) => {
  if (user) {
    authScreen.style.display = 'none';
    chatScreen.style.display = 'block';
    loadMessages();
  } else {
    authScreen.style.display = 'block';
    chatScreen.style.display = 'none';
  }
});

