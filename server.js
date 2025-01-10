const express = require('express');
const cors = require('cors');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

// OpenAI 설정
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API 라우트
app.get('/api/test', (req, res) => {
    res.json({ message: '서버가 정상적으로 동작 중입니다.' });
});

// 채팅 API
app.post('/api/chat', async (req, res) => {
    try {
        const message = req.body.message;
        
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "당신은 수학 문제를 생성하고 해결하는 도우미입니다."
                },
                {
                    role: "user",
                    content: message
                }
            ]
        });

        res.json({ 
            success: true, 
            response: completion.choices[0].message.content 
        });

    } catch (error) {
        console.error('OpenAI Error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// 모든 요청을 index.html로 라우팅
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 서버 시작
app.listen(port, () => {
    console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
    console.log('OpenAI API Key:', process.env.OPENAI_API_KEY ? '설정됨' : '설정되지 않음');
});