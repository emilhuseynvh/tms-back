"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTaskListDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_tasklist_dto_1 = require("./create-tasklist.dto");
class UpdateTaskListDto extends (0, mapped_types_1.PartialType)(create_tasklist_dto_1.CreateTaskListDto) {
}
exports.UpdateTaskListDto = UpdateTaskListDto;
//# sourceMappingURL=update-tasklist.dto.js.map