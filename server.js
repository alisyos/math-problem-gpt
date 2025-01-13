const express = require('express');
const cors = require('cors');
const path = require('path');
const OpenAI = require('openai');
const multer = require('multer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

// multer 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// uploads 폴더 생성
const fs = require('fs');
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// OpenAI 설정
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// API 테스트
app.get('/api/test', (req, res) => {
    res.json({ message: '서버가 정상적으로 동작 중입니다.' });
});

// 채팅 API
app.post('/api/chat', async (req, res) => {
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

// 파일 업로드 API
app.post('/api/analyze', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                response: '파일이 없습니다.'
            });
        }

        // 파일 정보 로깅
        console.log('업로드된 파일:', req.file);

        res.json({
            success: true,
            response: `파일 "${req.file.originalname}"이(가) 성공적으로 업로드되었습니다.`
        });
    } catch (error) {
        console.error('파일 업로드 에러:', error);
        res.status(500).json({
            success: false,
            response: '파일 업로드 중 오류가 발생했습니다.'
        });
    }
});

// 기본 라우트
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 서버 시작
app.listen(port, () => {
    console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});