import { DataTypes } from "sequelize";

export default (sequelize) =>
    sequelize.define("User", {
        telegramId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        username: {
            type: DataTypes.STRING,
        },
        institutionId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
              model: "Institutions", // must match your Institution table name
              key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        groupId: {
            type: DataTypes.STRING
        },
    });
