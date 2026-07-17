"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAvatarToUsers1731598320000 = void 0;
const typeorm_1 = require("typeorm");
class AddAvatarToUsers1731598320000 {
    name = 'AddAvatarToUsers1731598320000';
    async up(queryRunner) {
        await queryRunner.addColumn('users', new typeorm_1.TableColumn({
            name: 'avatar',
            type: 'varchar',
            length: '255',
            isNullable: true,
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropColumn('users', 'avatar');
    }
}
exports.AddAvatarToUsers1731598320000 = AddAvatarToUsers1731598320000;
//# sourceMappingURL=1731598320000-AddAvatarToUsers.js.map