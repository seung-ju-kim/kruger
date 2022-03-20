import { UserModel } from '../schemas/user';

class User {
    static async create(newUser) {
        const createdNewUser = await UserModel.create(newUser);
        return createdNewUser;
    }

    static async findAll() {
        const users = await UserModel.find({});
        return users;
    }

    static async findById({ user_id }) {
        const user = await UserModel.findOne({ id: user_id });
        return user;
    }

    static async findByEmail({ email }) {
        const user = await UserModel.findOne({ email });
        return user;
    }

    static async updateById({ user_id, key, value }) {
        const filter = { id: user_id };
        const update = { [key]: value };
        const option = { returnOriginal: false };

        const updatedUser = await UserModel.findOneAndUpdate(
            filter,
            update,
            option
        );
        return updatedUser;
    }

    static async updateByEmail({ email, fieldToUpdate, newValue }) {
        const filter = { email };
        const update = { [fieldToUpdate]: newValue };
        const option = { returnOriginal: false };

        const updatedUser = await UserModel.findOneAndUpdate(
            filter,
            update,
            option
        );
        return updatedUser;
    }

    static async deleteById({ user_id }) {
        await UserModel.deleteOne({ id: user_id });
        return;
    }
}

export { User };
