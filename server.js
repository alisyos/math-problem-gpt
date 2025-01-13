const express = require('express');
const cors = require('cors');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();
const multer = require('multer');

const app = express();
const port = process.env.PORT || 10000;

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API 테스트
app.get('/api/test', (req, res) => {
    res.json({ message: '서버가 정상적으로 동작 중입니다.' });
});

// 채팅 API
app.post('/api/chat', async (req, res) => {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
    
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "당신은 수학 문제를 생성하고 해결하는 도우미입니다." },
                { role: "user", content: req.body.message }
            ]
        });
        res.json({ success: true, response: completion.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 파일 분석 API
app.post('/api/analyze', multer({ dest: 'uploads/' }).single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                error: '파일이 없습니다.' 
            });
        }

        // 파일 처리 로직
        res.json({ 
            success: true, 
            response: `파일 "${req.file.originalname}"이(가) 업로드되었습니다.` 
        });
    } catch (error) {
        console.error('File Analysis Error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// 기본 라우트
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});