module.exports = {
    'env': {
        'node': true,
        'commonjs': true,
        'es6': true,
        'mocha': true,
        'browser': true
    },
    'extends': 'eslint:recommended',
    'globals': {
        'Atomics': 'readonly',
        'SharedArrayBuffer': 'readonly'
    },
    'parserOptions': {
        'ecmaVersion': 2018
    },
    'rules': {
        'indent': [
            'error',
            4
        ],
        'linebreak-style': [
            'error',
            'unix'
        ],
        'quotes': [
            'error',
            'single'
        ],
        'semi': [
            'error',
            'always'
        ],
        'eol-last': [
            'error',
            'always'
        ],
        'object-curly-spacing': [
            'error',
            'always'
        ]
    }
};