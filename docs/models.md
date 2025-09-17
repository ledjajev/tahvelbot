# Database Models Documentation

This document describes the Sequelize models used in the project.

---

## **Classifier**

Represents a classification entity with multilingual names and validity periods.

| Field         | Type      | Required | Default   | Description                          |
|---------------|----------|----------|-----------|--------------------------------------|
| code          | STRING   | ✅ Yes   | —         | Unique classifier code.              |
| nameEt        | STRING   | ✅ Yes   | —         | Name in Estonian.                    |
| nameEn        | STRING   | ❌ No    | —         | Name in English.                     |
| nameRu        | STRING   | ❌ No    | —         | Name in Russian.                     |
| valid         | BOOLEAN  | ❌ No    | `true`    | Whether the classifier is valid.     |
| mainClassCode | STRING   | ❌ No    | —         | Reference to a parent classifier.    |
| secondary     | BOOLEAN  | ❌ No    | `false`   | Marks as secondary classifier.       |
| vocational    | BOOLEAN  | ❌ No    | `false`   | Marks as vocational classifier.      |
| higher        | BOOLEAN  | ❌ No    | `false`   | Marks as higher education.           |
| value         | STRING   | ❌ No    | —         | Extra value field.                   |
| value2        | STRING   | ❌ No    | —         | Secondary extra value field.         |
| validFrom     | DATE     | ❌ No    | —         | Date from which it is valid.         |
| validThru     | DATE     | ❌ No    | —         | Date until which it is valid.        |
| extraval1     | STRING   | ❌ No    | —         | Extra field 1.                       |
| extraval2     | STRING   | ❌ No    | —         | Extra field 2.                       |
| parents       | JSON     | ❌ No    | —         | JSON array of parent classifiers.    |

---

## **Institution**

Represents an educational institution.

| Field                  | Type     | Required | Default   | Description                          |
|------------------------|----------|----------|-----------|--------------------------------------|
| id                     | INTEGER  | ✅ Yes   | —         | Primary key.                         |
| code                   | STRING   | ✅ Yes   | Unique    | Institution code.                    |
| nameEt                 | STRING   | ✅ Yes   | —         | Name in Estonian.                    |
| nameEn                 | STRING   | ✅ Yes   | —         | Name in English.                     |
| email                  | STRING   | ❌ No    | —         | Institution contact email.           |
| higher                 | BOOLEAN  | ❌ No    | —         | Higher education institution.        |
| vocational             | BOOLEAN  | ❌ No    | —         | Vocational institution.              |
| doctoral               | BOOLEAN  | ❌ No    | —         | Doctoral institution.                |
| isNotPublic            | BOOLEAN  | ❌ No    | `false`   | Whether institution is hidden.       |
| isNotPublicTimetable   | BOOLEAN  | ❌ No    | `false`   | Hide timetable publicly.             |
| isNotPublicCurriculum  | BOOLEAN  | ❌ No    | `false`   | Hide curriculum publicly.            |
| isNotPublicSubject     | BOOLEAN  | ❌ No    | `false`   | Hide subjects publicly.              |

---

## **Group**

Represents a student group within an institution.

| Field              | Type     | Required | Default | Description                          |
|--------------------|----------|----------|---------|--------------------------------------|
| id                 | INTEGER  | ✅ Yes   | —       | Primary key.                         |
| InstitutionId      | INTEGER  | ✅ Yes   | —       | FK → Institution(`id`).              |
| nameEt             | STRING   | ✅ Yes   | —       | Group name in Estonian.              |
| nameEn             | STRING   | ❌ No    | —       | Group name in English.               |
| nameRu             | STRING   | ❌ No    | —       | Group name in Russian.               |
| curriculum         | INTEGER  | ❌ No    | —       | Curriculum ID.                       |
| merCode            | STRING   | ❌ No    | —       | MER code.                            |
| curriculumVersion  | INTEGER  | ❌ No    | —       | Curriculum version number.           |
| studyForm          | STRING   | ❌ No    | —       | Study form (e.g., full-time).        |
| language           | STRING   | ❌ No    | —       | Study language.                      |
| validFrom          | DATE     | ❌ No    | —       | Valid from date.                     |
| validThru          | DATE     | ❌ No    | —       | Valid until date.                    |
| isBasic            | BOOLEAN  | ❌ No    | —       | Marks as basic education group.      |
| isSecondary        | BOOLEAN  | ❌ No    | —       | Marks as secondary education group.  |
| isVocational       | BOOLEAN  | ❌ No    | —       | Marks as vocational group.           |
| isHigher           | BOOLEAN  | ❌ No    | —       | Marks as higher education group.     |
| isOccupied         | BOOLEAN  | ❌ No    | —       | Whether group is occupied.           |
| studentGroupUuid   | STRING   | ❌ No    | —       | UUID for group identification.       |

---

## **User**

Represents a Telegram user linked to institutions and groups.

| Field         | Type     | Required | Default | Description                          |
|---------------|----------|----------|---------|--------------------------------------|
| telegramId    | STRING   | ✅ Yes   | Unique  | Telegram user ID.                    |
| username      | STRING   | ❌ No    | —       | Telegram username.                   |
| institutionId | INTEGER  | ❌ No    | —       | FK → Institution(`id`).              |
| groupId       | STRING   | ❌ No    | —       | FK → Group(`studentGroupUuid`).      |

---

## **Relationships**

- **Institution → Group**
  - `Institution.hasMany(Group, { foreignKey: "InstitutionId" })`
  - `Group.belongsTo(Institution, { foreignKey: "InstitutionId" })`

- **Institution → User**
  - `Institution.hasMany(User, { foreignKey: "institutionId" })`
  - `User.belongsTo(Institution, { foreignKey: "institutionId" })`

- **Group → User**
  - `Group.hasMany(User, { foreignKey: "groupId", sourceKey: "studentGroupUuid" })`
  - `User.belongsTo(Group, { foreignKey: "groupId", targetKey: "studentGroupUuid" })`
