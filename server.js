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
app.use(express.static(path.join(__dirname, 'public')));

// API 라우트
app.get('/api/test', (req, res) => {
    const publicPath = path.join(__dirname, 'public');
    const files = fs.readdirSync(publicPath);
    res.json({ 
        message: '서버가 정상적으로 동작 중입니다.',
        files: files,
        publicPath: publicPath
    });
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

// Catch-all 라우트 - 모든 요청을 index.html로 전달
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'), err => {
        if (err) {
            console.error('Send File Error:', err);
            res.status(500).send('Error loading index.html');
        }
    });
});

// 서버 시작
app.listen(port, () => {
    console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
    const publicPath = path.join(__dirname, 'public');
    console.log('정적 파일 경로:', publicPath);
    console.log('index.html 존재:', fs.existsSync(path.join(publicPath, 'index.html')));
    console.log('style.css 존재:', fs.existsSync(path.join(publicPath, 'style.css')));
    console.log('script.js 존재:', fs.existsSync(path.join(publicPath, 'script.js')));
});
    
    // 파일 존재 여부 확인
    const files = fs.readdirSync(publicPath);
    console.log('public 폴더 내용:', files);
});