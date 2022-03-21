import { User } from '../db'; // from을 폴더(db) 로 설정 시, 디폴트로 index.js 로부터 import함.
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { sendMail } from './MailService';

class UserService {
    static async addUser(userData) {
        // 이메일 중복 확인
        const email = userData.email;
        const user = await User.findByEmail({ email });
        if (user) {
            const errorMessage =
                '이 이메일은 현재 사용중입니다. 다른 이메일을 입력해 주세요.';
            throw new Error(errorMessage);
        }

        let newUser = '';
        if (userData.loginMethod === 'github') {
            console.log('깃허브 사용자생성');
            const {
                id,
                email,
                name,
                password,
                description,
                loginMethod,
                repositoryUrl
            } = userData;
            newUser = {
                id,
                email,
                name,
                password,
                description,
                loginMethod,
                repositoryUrl
            };
            console.log(newUser);
        } else {
            // id 는 유니크 값 부여
            const id = uuidv4();
            // 비밀번호 해쉬화
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            newUser = {
                id,
                email: userData.email,
                name: userData.name,
                password: hashedPassword,
                loginMethod: 'email'
            };
        }

        // db에 저장
        const createdNewUser = await User.create(newUser);

        // createdNewUser의 _doc안에 값들의 객체가 있음
        const createdUserKeys = Object.keys(createdNewUser._doc);
        if (createdUserKeys.indexOf('password') !== -1) {
            const { password, ...refinedNewUser } = createdNewUser._doc;
            createdNewUser._doc = refinedNewUser;
        }

        return createdNewUser;
    }
    static async checkUser(email) {
        const user = await User.findByEmail({ email });
        if (user) {
            return user;
        }
        return null;
    }

    static async getGithubUser(userId) {
        // 로그인 성공 -> JWT 웹 토큰 생성
        const secretKey = process.env.JWT_SECRET_KEY || 'jwt-secret-key';
        const token = jwt.sign({ user_id: userId }, secretKey);
        return token;
    }

    static async getUsers() {
        const users = await User.findAll();
        console.log(users.length);
        for (let i = 0; i < users.length; i++) {
            let userKeys = Object.keys(users[i]._doc);
            if (userKeys.indexOf('password') !== -1) {
                const { password, ...refinedUser } = users[i]._doc;
                users[i]._doc = refinedUser;
            }
        }
        return users;
    }

    static async getUser({ email, password }) {
        // 이메일 db에 존재 여부 확인
        const user = await User.findByEmail({ email });
        if (!user) {
            const errorMessage =
                '등록되지 않은 아이디이거나 아이디 또는 비밀번호를 잘못 입력했습니다.';
            throw new Error(errorMessage);
        }
        // 비밀번호 일치 여부 확인
        const correctPasswordHash = user.password;
        const isPasswordCorrect = await bcrypt.compare(
            password,
            correctPasswordHash
        );
        if (!isPasswordCorrect) {
            const errorMessage =
                '등록되지 않은 아이디이거나 아이디 또는 비밀번호를 잘못 입력했습니다.';
            throw new Error(errorMessage);
        }

        // 로그인 성공 -> JWT 웹 토큰 생성
        const secretKey = process.env.JWT_SECRET_KEY || 'jwt-secret-key';
        const token = jwt.sign({ user_id: user.id }, secretKey);

        const loginUserKeys = Object.keys(user._doc);
        if (loginUserKeys.indexOf('password') !== -1) {
            const { password, ...refinedUser } = user._doc;
            user._doc = { ...refinedUser, token };
            return user;
        }

        user._doc.token = token;

        return user;
    }

    static async getUserInfo({ user_id }) {
        const user = await User.findById({ user_id });

        // db에서 찾지 못한 경우, 에러 메시지 반환
        if (!user) {
            const errorMessage =
                '해당 이메일은 가입 내역이 없습니다. 다시 한 번 확인해 주세요.';
            throw new Error(errorMessage);
        }

        const userKeys = Object.keys(user._doc);
        if (userKeys.indexOf('password') !== -1) {
            const { password, ...refinedUser } = user._doc;
            user._doc = refinedUser;
        }

        return user;
    }

    static async setUser({ user_id, toUpdate }) {
        // 우선 해당 id 의 유저가 db에 존재하는지 여부 확인
        let user = await User.findById({ user_id });
        const keys = Object.keys(toUpdate);
        const values = Object.values(toUpdate);
        const filter = { id: user_id };
        console.log(filter);

        // db에서 찾지 못한 경우, 에러 메시지 반환
        if (!user) {
            const errorMessage =
                '가입 내역이 없습니다. 다시 한 번 확인해 주세요.';
            throw new Error(errorMessage);
        }

        if (keys.indexOf('password') !== -1) {
            const index = keys.indexOf('password');
            const hashedPassword = await bcrypt.hash(values[index], 10);
            values[index] = hashedPassword;
        }

        for (let i = 0; i < keys.length; i++) {
            user = await User.update(filter, keys[i], values[i]);
        }

        const updatedUserKeys = Object.keys(user._doc);
        if (updatedUserKeys.indexOf('password') !== -1) {
            const { password, ...refinedUser } = user._doc;
            user._doc = refinedUser;
        }

        return user;
    }

    static async resetPassword({ email }) {
        let user = await User.findByEmail({ email });
        console.log(email);
        const subject = '포트폴리오 공유 웹 서비스';
        // 등록되지 않은 회원일 경우 이메일 내용
        if (!user) {
            const text = `귀하의 이메일은 저희 서비스에 등록되어 있지 않습니다. 회원가입을 해주세요 :)`;
            await sendMail(email, subject, text);
            return;
        }

        // uuidv4로 랜덤한 문자열을 가져오고 너무 길지 않게 10글자로만 새로운 비밀번호를 보내줌
        const randomPassword = uuidv4();
        const newPassword = randomPassword.slice(0, 10);
        const newHashedPassword = await bcrypt.hash(newPassword, 10);
        const filter = { email: email };

        await User.update(filter, 'password', newHashedPassword);

        // 등록된 회원일 경우 이메일 내용
        const text = `귀하의 새로운 비밀번호는 ${newPassword} 입니다. 로그인 후 비밀번호를 변경해주세요.`;
        await sendMail(email, subject, text);
        return;
    }

    static async deleteUser({ user_id }) {
        await User.deleteById({ user_id });
        return;
    }
}

export { UserService };
