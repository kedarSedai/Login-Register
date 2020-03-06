module.exports = {
    ensureAuthenticated: function (req, res, next) {
        if(req.isAuthenticated()) {
            res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-chech=0');
            return next();
        }
        res.redirect('/login');
    } 
}