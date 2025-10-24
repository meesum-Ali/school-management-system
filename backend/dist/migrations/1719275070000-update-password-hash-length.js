"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePasswordHashLength1719275070000 = void 0;
class UpdatePasswordHashLength1719275070000 {
    async up(queryRunner) {
        await queryRunner.query('ALTER TABLE users ALTER COLUMN password_hash TYPE varchar(255)');
    }
    async down(queryRunner) {
        await queryRunner.query('ALTER TABLE users ALTER COLUMN password_hash TYPE varchar(100)');
    }
}
exports.UpdatePasswordHashLength1719275070000 = UpdatePasswordHashLength1719275070000;
//# sourceMappingURL=1719275070000-update-password-hash-length.js.map