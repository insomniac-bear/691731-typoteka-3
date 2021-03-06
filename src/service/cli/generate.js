'use strict';

const fs = require(`fs`).promises;
const chalk = require(`chalk`);
const {nanoid} = require(`nanoid`);
const path = require(`path`);
const {
  getRandomInt,
  shuffle,
} = require(`../../utils.js`);
const {MAX_ID_LENGTH} = require(`../../constants`);

const DEFAULT_COUNT = 1;
const FILE_NAME = `./mocks.json`;

const FILE_CATEGORIES_PATH = `../../../data/categories.txt`;
const FILE_SENTENCES_PATH = `../../../data/sentences.txt`;
const FILE_TITLES_PATH = `../../../data/titles.txt`;
const FILE_COMMENTS_PATH = `../../../data/comments.txt`;

const MAX_COMMENTS = 5;

const DateRestrict = {
  MIN: 0,
  MAX: 1000 * 360 * 24 * 30 * 3,
};

const generateDate = () => {
  const timeInterval = getRandomInt(DateRestrict.MIN, DateRestrict.MAX);
  const time = new Date() - timeInterval;
  return new Date(time).toUTCString();
};

const generateCommments = (count, comments) => {
  return Array(count)
    .fill({})
    .map(() => ({
      id: nanoid(MAX_ID_LENGTH),
      text: shuffle(comments)
        .slice(0, getRandomInt(1, 3))
        .join(` `),
    }));
};

const generatePosts = (count, options) => {
  const {titles, sentences, categories, comments} = options;

  return Array(count)
    .fill({})
    .map(() => ({
      id: nanoid(MAX_ID_LENGTH),
      title: titles[getRandomInt(0, titles.length - 1)],
      createdDate: generateDate(),
      announce: shuffle(sentences).slice(1, 5).join(` `),
      fullText: shuffle(sentences).slice(1, 10).join(` `),
      category: [categories[getRandomInt(0, categories.length - 1)]],
      comments: generateCommments(getRandomInt(1, MAX_COMMENTS), comments)
    }));
};

const readContent = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, `utf-8`);
    return content.trim().split(`\n`).filter((it) => it.trim());
  } catch (err) {
    console.error(chalk.red(err));
    return [];
  }
};

module.exports = {
  name: `--generate`,
  async run(args) {
    const options = {
      titles: await readContent(path.resolve(__dirname, FILE_TITLES_PATH)),
      sentences: await readContent(path.resolve(__dirname, FILE_SENTENCES_PATH)),
      categories: await readContent(path.resolve(__dirname, FILE_CATEGORIES_PATH)),
      comments: await readContent(path.resolve(__dirname, FILE_COMMENTS_PATH)),
    };

    const [count] = args;
    const countPosts = Number.parseInt(count, 10) || DEFAULT_COUNT;
    const content = JSON.stringify(generatePosts(countPosts, options));

    try {
      await fs.writeFile(FILE_NAME, content);
      console.info(chalk.green(`Operation success. File created.`));
    } catch (err) {
      console.error(chalk.red(`Can't write data to file, ${err}`));
    }
  }
};
