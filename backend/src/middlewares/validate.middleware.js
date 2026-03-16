export const validateSchema = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (error) {
        return res.status(400).json({ 
            error: "Error de validación", 
            details: error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message
            })) 
        });
    }
};
