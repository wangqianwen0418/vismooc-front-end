module.exports = {
    "root": true,
    "parser": "babel-eslint",
    "parserOptions": {
        "sourceType": "module"
    },
    "extends": "airbnb/base",
    "plugins": [
        "html"
    ],
    "rules": {
        "indent": [
            2,
            4,
            {
                "SwitchCase": 1
            }
        ],
        "no-param-reassign": [
            "error",
            {
                "props": false
            }
        ],
        "no-unused-vars": [
            "error",
            {
                "args": "none"
            }
        ],
        "no-console": [
            "error",
            {
                "allow": [
                    "warn",
                    "error"
                ]
            }
        ],
        // don't require .vue extension when importing
        "import/extensions": [
            "error",
            "always",
            {
                "js": "never",
                "vue": "never"
            }
        ],
        // allow debugger during development
        "no-debugger": process.env.NODE_ENV === "production" ? 2 : 0
    },
    "settings": {
        "import/resolver": {
            "webpack": {
                "config": "/build/webpack.base.conf.js"
            }
        }
    }
}
