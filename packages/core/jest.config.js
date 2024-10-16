module.exports = {
  moduleFileExtensions: ["js", "ts"],
  moduleDirectories: ["node_modules", "src", "test"],
  moduleNameMapper: {
    "src/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "\\.ts$": "ts-jest",
    "\\.js$": "babel-jest",
  },
  transformIgnorePatterns: ["<rootDir>/node_modules/"],
  collectCoverage: false,
  testEnvironment: "jsdom",
  // https://jestjs.io/docs/configuration#globalsetup-string
  // globalSetup: "./test/config/setup.ts", // fn
  // https://jestjs.io/docs/configuration#setupfilesafterenv-array
  // setupFilesAfterEnv: ["./test/config/setup.ts"], // iife
  testMatch: ["<rootDir>/test/**/*.test.ts"],
};
