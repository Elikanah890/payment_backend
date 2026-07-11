"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
exports.getQuery = getQuery;
function validate(schemas) {
    return (req, _res, next) => {
        try {
            if (schemas.body)
                req.body = schemas.body.parse(req.body);
            if (schemas.params)
                req.params = schemas.params.parse(req.params);
            if (schemas.query) {
                const parsed = schemas.query.parse(req.query);
                Object.defineProperty(req, 'validatedQuery', { value: parsed, writable: true });
                req.validatedQuery = parsed;
            }
            next();
        }
        catch (e) {
            next(e);
        }
    };
}
function getQuery(req) {
    return (req.validatedQuery ?? req.query);
}
//# sourceMappingURL=validation.js.map