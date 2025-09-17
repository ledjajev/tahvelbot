import { DataTypes } from "sequelize";

export default (sequelize) =>
    sequelize.define("Institution", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        nameEt: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        nameEn: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isEmail: true,
            },
        },
        higher: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        vocational: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        doctoral: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        isNotPublic: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        isNotPublicTimetable: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        isNotPublicCurriculum: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        isNotPublicSubject: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    });
