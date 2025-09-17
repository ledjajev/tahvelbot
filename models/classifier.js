import { DataTypes } from "sequelize";

export default (sequelize) =>
  sequelize.define("Classifier", {
    code: {
      type: DataTypes.STRING,
      allowNull: false,
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
    valid: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    mainClassCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    secondary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    vocational: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    higher: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    value: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    value2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    validFrom: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    validThru: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    extraval1: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    extraval2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    parents: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  });
