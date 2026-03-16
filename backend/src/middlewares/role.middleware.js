// middlewares/role.middleware.js
export const requireRole = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: "No tienes permisos para realizar esta acción" });
    }
    next();
};

