import { DataTypes } from "sequelize";

export default (sequelize) =>
  sequelize.define("Group", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    InstitutionId: {   // 👈 Explicit foreign key
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Institutions", // must match your Institution table name
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    nameEt: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nameEn: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nameRu: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    curriculum: DataTypes.INTEGER,
    merCode: DataTypes.STRING,
    curriculumVersion: DataTypes.INTEGER,
    studyForm: DataTypes.STRING,
    language: DataTypes.STRING,
    validFrom: DataTypes.DATE,
    validThru: DataTypes.DATE,
    isBasic: DataTypes.BOOLEAN,
    isSecondary: DataTypes.BOOLEAN,
    isVocational: DataTypes.BOOLEAN,
    isHigher: DataTypes.BOOLEAN,
    isOccupied: DataTypes.BOOLEAN,
    studentGroupUuid: DataTypes.STRING,
  });
