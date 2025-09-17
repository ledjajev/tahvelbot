import { DB_FILENAME } from "../config.js";

import { Sequelize } from "sequelize";

import UserModel from "./user.js";
import InstitutionModel from "./institution.js";
import ClassifierModel from "./classifier.js";
import GroupModel from "./group.js";

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: `./data/${DB_FILENAME}`,
    logging: false,
});

const User = UserModel(sequelize);
const Institution = InstitutionModel(sequelize);
const Classifier = ClassifierModel(sequelize);
const Group = GroupModel(sequelize);

Institution.hasMany(Group, { foreignKey: "InstitutionId" });
Group.belongsTo(Institution, { foreignKey: "InstitutionId" });

await sequelize.sync();

export { sequelize, User, Institution, Classifier, Group };
