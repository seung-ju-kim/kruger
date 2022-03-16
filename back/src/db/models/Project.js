import { ProjectModel } from '../schemas/project';

class Project {
    // 새로운 수상 요소 작성, 수상과 관련된 내용 필요
    static async create({ newProject }) {
        const createdNewProject = await ProjectModel.create(newProject);
        return createdNewProject;
    }
}

export { Project };