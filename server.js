const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

// 기본 미들웨어
app.use(cors());
app.use(express.json());

// 정적 파일 제공
app.use(express.static(__dirname));

// 모든 요청을 index.html로 라우팅
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 서버 시작
app.listen(port, () => {
    console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
    console.log('현재 디렉토리:', __dirname);
    console.log('index.html 경로:', path.join(__dirname, 'index.html'));
});