import mongoose from 'mongoose';
import { User } from './models/User';
import { Education } from './models/Education';
import { Award } from './models/Award';
import { Certificate } from './models/Certificate';
import { Project } from './models/Project';
import { TakenNote } from './models/TakenNote';
import { SentNote } from './models/SentNote';
import { Recruitment } from './models/Recruitment';

const DB_URL =
    process.env.MONGODB_URL ||
    'MongoDB 서버 주소가 설정되지 않았습니다.\n./db/index.ts 파일을 확인해 주세요.';

mongoose.connect(DB_URL);
const db = mongoose.connection;

db.on('connected', () =>
    console.log('정상적으로 MongoDB 서버에 연결되었습니다.  ' + DB_URL)
);
db.on('error', (error) =>
    console.error('MongoDB 연결에 실패하였습니다...\n' + DB_URL + '\n' + error)
);

export {
    User,
    Award,
    Certificate,
    Education,
    Project,
    TakenNote,
    SentNote,
    Recruitment
};
