const express = require('express');
const cors = require('cors');
const path = require('path');
const OpenAI = require('openai');
const fs = require('fs');
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

// 정적 파일 제공
app.use(express.static('public'));

// API 테스트
app.get('/api/test', (req, res) => {
    try {
        const publicFiles = fs.readdirSync('public');
        const srcFiles = fs.readdirSync('src');
        res.json({ 
            message: '서버가 정상적으로 동작 중입니다.',
            publicFiles,
            srcFiles,
            cwd: process.cwd(),
            publicExists: fs.existsSync('public'),
            srcExists: fs.existsSync('src')
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            stack: error.stack
        });
    }
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
    if (fs.existsSync(path.join(__dirname, 'public', 'index.html'))) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        res.status(404).send('index.html not found. Files in public: ' + 
            fs.readdirSync('public').join(', '));
    }
});

// 서버 시작
app.listen(port, () => {
    console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
    console.log('작업 디렉토리:', process.cwd());
    try {
        console.log('public 파일:', fs.readdirSync('public'));
        console.log('src 파일:', fs.readdirSync('src'));
    } catch (error) {
        console.error('파일 시스템 에러:', error);
    }
});