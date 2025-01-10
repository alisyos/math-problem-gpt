document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('message-input');
    const chatMessages = document.getElementById('chat-messages');
    const sendButton = document.getElementById('send-button');
    const fileInput = document.getElementById('file-input');
    const uploadButton = document.getElementById('upload-button');

    // API URL 설정
    const API_URL = 'https://math-problem-gpmath-problem-gpt.onrender.com';

    // 메시지 표시 함수
    const appendMessage = (content, isUser) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'ai'}`;
        messageDiv.textContent = content;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    // 메시지 전송 함수
    const sendMessage = async () => {
        const message = messageInput.value.trim();
        if (!message) return;

        try {
            appendMessage(message, true);
            messageInput.value = '';

            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || '서버 에러');
            }

            appendMessage(data.response, false);

        } catch (error) {
            console.error('에러:', error);
            appendMessage(`Error: ${error.message}`, false);
        }
    };

    // 파일 업로드 함수
    const uploadFile = async () => {
        const file = fileInput.files[0];
        if (!file) {
            alert('파일을 선택해주세요.');
            return;
        }

        try {
            appendMessage('파일 분석 중...', false);
            
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || '파일 분석 실패');
            }

            appendMessage(data.response, false);
            fileInput.value = '';

        } catch (error) {
            console.error('파일 업로드 에러:', error);
            appendMessage(`Error: ${error.message}`, false);
        }
    };

    // 이벤트 리스너
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    uploadButton.addEventListener('click', uploadFile);

    // 서버 연결 테스트
    fetch(`${API_URL}/test`)
        .then(response => response.json())
        .then(data => {
            console.log('서버 테스트 성공:', data);
            appendMessage('서버에 연결되었습니다.', false);
        })
        .catch(error => {
            console.error('서버 테스트 실패:', error);
            appendMessage('서버 연결 실패', false);
        });
});