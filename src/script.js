document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');
    const fileInput = document.getElementById('file-input');
    const uploadButton = document.getElementById('upload-button');

    // 메시지 전송 함수
    async function sendMessage(message) {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Error:', error);
            return '죄송합니다. 오류가 발생했습니다.';
        }
    }

    // 메시지 표시 함수
    function displayMessage(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'ai'}`;
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 전송 버튼 클릭 이벤트
    sendButton.addEventListener('click', async () => {
        const message = messageInput.value.trim();
        if (message) {
            displayMessage(message, true);
            messageInput.value = '';
            const response = await sendMessage(message);
            displayMessage(response);
        }
    });

    // 엔터 키 이벤트
    messageInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendButton.click();
        }
    });

    // 파일 업로드 이벤트
    uploadButton.addEventListener('click', async () => {
        if (!fileInput.files.length) {
            displayMessage('파일을 선택해주세요.', false);
            return;
        }

        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
            displayMessage(`파일 "${file.name}" 분석 중...`, false);
            
            const response = await fetch('/api/analyze', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            displayMessage(result.response);
        } catch (error) {
            console.error('Error:', error);
            displayMessage('파일 처리 중 오류가 발생했습니다.');
        }

        // 파일 입력 초기화
        fileInput.value = '';
    });
});