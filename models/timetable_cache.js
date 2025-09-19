import { DataTypes } from "sequelize";

export default (sequelize) =>
    sequelize.define("TimetableCache", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        schoolId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        studentGroupId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        from: {
            type: DataTypes.STRING, // Store the date as ISO string
            allowNull: false,
        },
        thru: {
            type: DataTypes.STRING, // Store the date as ISO string
            allowNull: false,
        },
        cacheData: {
            type: DataTypes.JSONB, // Store the JSON response
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    }, {
        paranoid: true, // Soft delete
    });
