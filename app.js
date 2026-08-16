// Aapka live backend URL
const BASE_URL = 'https://chatbot-backend-0kyc.onrender.com';

// 1. Jab page load ho tab MongoDB se purani history mangwana
window.onload = async () => {
    const statusText = document.getElementById('status');
    try {
        const response = await fetch(`${BASE_URL}/api/history`);
        
        if (!response.ok) throw new Error("Network response was not ok");
        
        const historyData = await response.json();
        
        if(historyData.length > 0) {
            historyData.forEach(chat => {
                if (chat.userMessage) addMessageToChat('user', chat.userMessage);
                if (chat.botResponse) addMessageToChat('bot', chat.botResponse);
            });
        }
        statusText.innerText = "Online";
        statusText.style.color = "#a8f0c6"; // Green text for online status
    } catch (error) {
        statusText.innerText = "Connecting to Database...";
        console.error("History fetch error:", error);
    }
};

// 2. Naya message bhejna
async function sendMessage() {
    const inputField = document.getElementById('user-input');
    const message = inputField.value.trim();
    if (!message) return;

    // Turant UI par dikhana
    addMessageToChat('user', message);
    inputField.value = '';

    try {
        const response = await fetch(`${BASE_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        
        if (data.reply) {
            addMessageToChat('bot', data.reply);
        } else {
            addMessageToChat('bot', "Error: Response nahi mila.");
        }
    } catch (error) {
        addMessageToChat('bot', "Server abhi shuru ho raha hai ya busy hai, thodi der mein try karein.");
    }
}

// 3. UI mein message add karne ka function
function addMessageToChat(sender, text) {
    const chatBox = document.getElementById('chat-box');
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message');
    msgDiv.classList.add(sender === 'user' ? 'user-msg' : 'bot-msg');
    
    msgDiv.innerText = text; 
    
    chatBox.appendChild(msgDiv);
    // Auto scroll bottom tak
    chatBox.scrollTop = chatBox.scrollHeight;
                         }
