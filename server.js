require('dotenv').config();
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const multer = require("multer");
const fs = require("fs");
const path = require('path');

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // 현재 디렉토리의 정적 파일 제공

// OpenAI 설정
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Assistant ID 설정
const ASSISTANT_ID = "asst_vp61xb3vdDuMPOXnMi9UuAxH"; // 여기에 실제 Assistant ID를 입력했습니다

// 테스트 라우트 추가
app.get('/test', (req, res) => {
    console.log('테스트 요청 받음');
    res.json({ message: '테스트 성공!' });
});

// 파일 업로드 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// uploads 폴더가 없으면 생성
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// 루트 경로 처리
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 파일 업로드 라우트
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: '파일이 없습니다.'
            });
        }

        // 파일 내용 읽기
        const fileContent = fs.readFileSync(req.file.path, 'utf8');

        // 스레드 생성
        const thread = await openai.beta.threads.create();
        
        // 메시지 추가
        await openai.beta.threads.messages.create(thread.id, {
            role: "user",
            content: `다음 텍스트 파일을 분석해주세요: ${fileContent}`
        });

        // 실행 시작
        const run = await openai.beta.threads.runs.create(thread.id, {
            assistant_id: ASSISTANT_ID
        });

        // 실행 완료 대기
        let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        
        while (runStatus.status !== 'completed') {
            await new Promise(resolve => setTimeout(resolve, 1000));
            runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
            
            if (runStatus.status === 'failed') {
                throw new Error('Assistant 실행 실패');
            }
        }

        // 응답 메시지 가져오기
        const messages = await openai.beta.threads.messages.list(thread.id);
        const lastMessage = messages.data[0];

        res.json({
            success: true,
            response: lastMessage.content[0].text.value
        });

    } catch (error) {
        console.error('파일 업로드 에러:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 채팅 라우트
app.post('/api/chat', async (req, res) => {
    try {
        console.log('채팅 요청 받음:', req.body);
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({
                success: false,
                error: '메시지가 없습니다.'
            });
        }

        // 스레드 생성
        const thread = await openai.beta.threads.create();
        
        // 메시지 추가
        await openai.beta.threads.messages.create(thread.id, {
            role: "user",
            content: message
        });

        // 실행 시작
        const run = await openai.beta.threads.runs.create(thread.id, {
            assistant_id: ASSISTANT_ID
        });

        // 실행 완료 대기
        let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        
        while (runStatus.status !== 'completed') {
            await new Promise(resolve => setTimeout(resolve, 1000));
            runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
            
            if (runStatus.status === 'failed') {
                throw new Error('Assistant 실행 실패');
            }
        }

        // 응답 메시지 가져오기
        const messages = await openai.beta.threads.messages.list(thread.id);
        const lastMessage = messages.data[0];

        res.json({
            success: true,
            response: lastMessage.content[0].text.value
        });

    } catch (error) {
        console.error('채팅 에러:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log('OpenAI API Key:', process.env.OPENAI_API_KEY ? '설정됨' : '설정되지 않음');
});