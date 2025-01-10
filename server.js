const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

// 미들웨어
app.use(cors());
app.use(express.json());

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

// API 라우트
app.get('/api/test', (req, res) => {
    res.json({ message: '서버가 정상적으로 동작 중입니다.' });
});

// 모든 요청을 index.html로 라우팅
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 서버 시작
app.listen(port, () => {
    console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
    console.log('정적 파일 경로:', path.join(__dirname, 'public'));
});