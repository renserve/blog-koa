
'use strict'
const path = require('path')

function resolve (dir) {
    return path.join(__dirname, '.', dir)
}

module.exports = {
    context: path.resolve(__dirname, './'),
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            "@extension": path.resolve(__dirname, "app/extension"),
            "@middleware": path.resolve(__dirname,"app/middleware"),
            "@validator": path.resolve(__dirname,"app/validator"),
            "@model": path.resolve(__dirname,"app/model"),
            "@lib": path.resolve(__dirname,"app/lib"),
            "@config": path.resolve(__dirname,"app/config"),
            "@dao": path.resolve(__dirname,"app/dao")
        }
    }
}