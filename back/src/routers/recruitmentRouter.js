import is from '@sindresorhus/is';
import { Router } from 'express';
import { login_required } from '../middlewares/login_required';
import { updateMiddleware } from '../middlewares/updateMiddleware';
import { RecruitmentService } from '../services/RecruitmentService';

const recruitmentRouter = Router();

recruitmentRouter.put(
    '/recruit/:id',
    login_required,
    updateMiddleware,
    async function (req, res, next) {
        try {
            const recruitmentId = req.params.id;
            const user_id = req.currentUserId;
            const toUpdate = req.toUpdate;

            const updatedRecruitment = await RecruitmentService.setRecruitment({
                recruitmentId,
                user_id,
                toUpdate
            });

            res.status(200).json(updatedRecruitment);
        } catch (error) {
            next(error);
        }
    }
);

// 게시글 하나 보기, 로그인 안해도 볼수있게.
recruitmentRouter.get('/recruit/:id', async (req, res, next) => {
    try {
        const recruitmentId = req.params.id;
        const recruitments = await RecruitmentService.getRecruitment({
            recruitmentId
        });
        res.status(200).json(recruitments);
    } catch (error) {
        next(error);
    }
});

// 게시글 목록 보기
recruitmentRouter.get('/recruitlist', async (req, res, next) => {
    try {
        const recruitmentList = await RecruitmentService.getRecruitments();
        res.status(200).json(recruitmentList);
    } catch (error) {
        next(error);
    }
});

// 게시글 생성
recruitmentRouter.post(
    '/recruit/create',
    login_required,
    async (req, res, next) => {
        try {
            if (is.emptyObject(req.body)) {
                throw new Error(
                    'headers의 Content-Type을 application/json으로 설정해주세요'
                );
            }
            const { title, detail } = req.body;
            const user_id = req.currentUserId;

            const newRecruitment = await RecruitmentService.addRecruitment({
                user_id,
                title,
                detail
            });
            res.status(201).json(newRecruitment);
        } catch (error) {
            next(error);
        }
    }
);

// 게시글 모집마감 토글
recruitmentRouter.patch(
    '/recruit/toggle/:id',
    login_required,
    async (req, res, next) => {
        try {
            const recruitmentId = req.params.id;
            const userId = req.currentUserId;
            const { nowEnrolling, message } =
                await RecruitmentService.closeRecruitment({
                    recruitmentId,
                    userId
                });
            res.status(200).json({ nowEnrolling, message });
        } catch (error) {
            next(error);
        }
    }
);

// 모집글 지원하기
recruitmentRouter.patch(
    '/recruit/apply/:id',
    login_required,
    async (req, res, next) => {
        try {
            const recruitmentId = req.params.id;
            const applicantId = req.currentUserId;
            const updatedRecruitment = await RecruitmentService.addApplicant({
                recruitmentId,
                applicantId
            });
            res.status(200).json(updatedRecruitment);
        } catch (error) {
            next(error);
        }
    }
);

// 지원 취소하기
recruitmentRouter.patch(
    '/recruit/cancle/apply/:id',
    login_required,
    async (req, res, next) => {
        try {
            const recruitmentId = req.params.id;
            const applicantId = req.currentUserId;
            const updatedRecruitment = await RecruitmentService.cancleApplicant(
                {
                    recruitmentId,
                    applicantId
                }
            );
            res.status(200).json(updatedRecruitment);
        } catch (error) {
            next(error);
        }
    }
);

// 댓글 수정하기
recruitmentRouter.patch(
    '/recruit/comment/:id',
    login_required,
    updateMiddleware,
    async (req, res, next) => {
        try {
            const recruitmentId = req.params.id;
            const authorId = req.currentUserId;
            const toUpdate = req.toUpdate;
            const updatedRecruitment = await RecruitmentService.setComment({
                recruitmentId,
                authorId,
                toUpdate
            });
            res.status(200).json(updatedRecruitment);
        } catch (error) {
            next(error);
        }
    }
);

recruitmentRouter.put(
    '/recruit/comment/:id',
    login_required,
    async function (req, res, next) {
        try {
            const { content } = req.body;
            const recruitmentId = req.params.id;
            const user_id = req.currentUserId;

            const newComment = await RecruitmentService.addComment({
                content,
                recruitmentId,
                user_id
            });
            res.status(200).json(newComment);
        } catch (error) {
            next(error);
        }
    }
);

// 댓글 삭제하기
recruitmentRouter.patch(
    '/recruit/delete/comment/:id',
    login_required,
    async (req, res, next) => {
        try {
            const recruitmentId = req.params.id;
            const authorId = req.currentUserId;
            await RecruitmentService.deleteComment({
                recruitmentId,
                authorId
            });
            res.status(200).json('댓글이 삭제되었습니다.');
        } catch (error) {
            next(error);
        }
    }
);

recruitmentRouter.patch(
    '/likedRecruit/:id',
    login_required,
    async function (req, res, next) {
        try {
            const recruitmentId = req.params.id;
            const user_id = req.currentUserId;

            const updatedRecruitment = await RecruitmentService.likeRecruitment(
                {
                    recruitmentId,
                    user_id
                }
            );
            res.status(200).json(updatedRecruitment);
        } catch (error) {
            next(error);
        }
    }
);

recruitmentRouter.patch(
    '/unlikedRecruit/:id',
    login_required,
    async function (req, res, next) {
        try {
            const recruitmentId = req.params.id;
            const user_id = req.currentUserId;

            const updatedRecruitment =
                await RecruitmentService.unlikeRecruitment({
                    recruitmentId,
                    user_id
                });
            res.status(200).json(updatedRecruitment);
        } catch (error) {
            next(error);
        }
    }
);

recruitmentRouter.patch(
    '/recruit/approval/:id',
    login_required,
    async function (req, res, next) {
        try {
            const { applicantId } = req.body;
            const recruitmentId = req.params.id;
            const user_id = req.currentUserId;

            const updatedRecruitment = await RecruitmentService.setMember({
                recruitmentId,
                applicantId,
                user_id
            });
            res.status(200).json(updatedRecruitment);
        } catch (error) {
            next(error);
        }
    }
);

recruitmentRouter.delete(
    '/recruit/:id',
    login_required,
    async function (req, res, next) {
        try {
            const recruitmentId = req.params.id;
            const user_id = req.currentUserId;
            await RecruitmentService.deleteRecruitment({
                recruitmentId,
                user_id
            });
            res.status(200).json('삭제되었습니다.');
        } catch (error) {
            next(error);
        }
    }
);

export { recruitmentRouter };