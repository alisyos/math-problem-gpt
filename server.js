require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai");
const multer = require("multer");
const path = require('path');

const app = express();
const port = process.env.PORT || 10000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));  // 정적 파일 제공 경로 수정

// OpenAI 설정
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// 파일 업로드 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// uploads 폴더 생성
const fs = require('fs');
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// 라우트 설정
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/test', (req, res) => {
    res.json({ message: '서버가 정상적으로 동작 중입니다.' });
});

// API 엔드포인트
app.post('/api/chat', async (req, res) => {
    try {
        const message = req.body.message;
        // 테스트용 응답
        res.json({ success: true, response: "테스트 응답입니다." });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            throw new Error('파일이 업로드되지 않았습니다.');
        }
        res.json({ 
            success: true, 
            response: `파일 '${req.file.originalname}'이 성공적으로 업로드되었습니다.` 
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 서버 시작
app.listen(port, () => {
    console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
    console.log('정적 파일 경로:', path.join(__dirname));
    console.log('OpenAI API Key:', process.env.OPENAI_API_KEY ? '설정됨' : '설정되지 않음');
});