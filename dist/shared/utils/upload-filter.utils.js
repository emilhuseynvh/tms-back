"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageFileFilter = void 0;
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const upload_constants_1 = require("../constants/upload.constants");
const imageFileFilter = (req, file, callback) => {
    const ext = (0, path_1.extname)(file.originalname).slice(1);
    const checkMimeType = upload_constants_1.UPLOAD_IMAGE_ALLOWED_MIME_TYPES.includes(file.mimetype);
    const checkFileType = upload_constants_1.UPLOAD_IMAGE_ALLOWED_TYPES.includes(ext);
    if (!checkMimeType || !checkFileType)
        return callback(new common_1.BadRequestException('Imge type is not correct'), false);
    callback(null, true);
};
exports.imageFileFilter = imageFileFilter;
//# sourceMappingURL=upload-filter.utils.js.map