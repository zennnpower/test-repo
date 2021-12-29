const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = req.header("x-auth-token");

    if (!token) return res.status(401).json({msg: "Access denied!"});

    // VERIFY TOKEN
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
        next()
    } catch (err) {
        return res.status(401).json({err});
    }
}