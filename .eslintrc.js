module.exports = {
    "extends": "airbnb-base",
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true,
        "node": true
    },
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "sourceType": "module"
    },
    "rules": {
        "no-const-assign": "warn",
        "no-this-before-super": "warn",
        "no-undef": "warn",
        "no-unreachable": "warn",
        "no-unused-vars": "warn",
        "constructor-super": "warn",
        "valid-typeof": "warn",
        "import/no-unresolved": "off",
        "no-console": "off",
        "no-use-before-define": "off",
        "no-template-curly-in-string": "off",
        "no-case-declarations": "off",
        "global-require": "off",
        "no-constant-condition": "off",
        "function-paren-newline": "off",
        "no-restricted-properties": "off",
        "array-callback-return": "off",
        "no-new": "off",
        "prefer-template": "off",
        "no-bitwise": "off",
        "prefer-destructuring": "off",
        "new-cap": "off",
        "no-restricted-syntax": "off",
        "no-param-reassign": "off"
    }
};