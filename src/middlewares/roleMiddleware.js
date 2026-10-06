const permissions = {
    admin: [
        'auth:getWaitingList',
        'auth:setUserActiveStatus',
        'fleet:read',
        'fleet:write',
        'trip:read',
        'trip:write',
    ],
    driver: [
        'trip:read',
    ],
};

function authorize(permission) {
    return (req, res, next) => {
        const role = req.user?.role;
        if (!role || !permissions[role]?.includes(permission)) {
            return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
        }
        next();
    };
}

module.exports = { authorize, permissions };
