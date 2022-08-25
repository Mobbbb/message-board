module.exports = {
  	root: true,
  	env: {
    	node: true,
  	},
    extends: [
        'plugin:vue/vue3-essential',
        '@vue/standard',
    ],
    parserOptions: {
        parser: '@babel/eslint-parser',
    },
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		// 缩进4空格
        indent: ['error', 4, { "SwitchCase": 1 }],
		// 当最后一个元素或属性位于独立行时，需要逗号结尾
        'comma-dangle': ['error', 'always-multiline'],
		// 函数括号前不允许有空格
        'space-before-function-paren': ['error', 'never'],
        // 允许new以小写开头或大写开头的函数调用运算符
        // 允许在没有new运算符的情况下调用以大写开头的函数
        'new-cap': ['error', { newIsCap: false, capIsNew: false }],
        'max-len': ['error', { code: 120 }],
		// 花括号约定
        curly: 'off',
		// 对原生对象做扩展
		'no-extend-native': 'off',
        'space-before-function-paren': ['error', {
            'anonymous': 'never',
            'named': 'never',
            'asyncArrow': 'always',
        }],
    },
}
