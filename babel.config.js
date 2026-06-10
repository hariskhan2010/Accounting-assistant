module.exports = function babelConfig(api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["."],
          alias: {
            "@": "."
          }
        }
      ],
      "@babel/plugin-transform-class-static-block",
      "react-native-reanimated/plugin"
    ]
  };
};
