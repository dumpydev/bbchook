const cheerio = require("cheerio");
const axios = require("axios");
const al = require("@dumpy/andylib");
const l = new al.logger();
const { WebhookClient } = require("discord.js");
require("dotenv").config();
const client = new WebhookClient({
  id: process.env.ID,
  token: process.env.TOKEN,
});
const link = "https://bbc.com/news";
async function fetch() {
  let titleURL = [];
  const response = await axios.get(link);
  // Use cheerio to parse the HTML page
  const $ = cheerio.load(response.data);
  // Extract the news articles from the page
  const articles = $(".gs-c-promo-heading");
  // Loop through the articles and send them to the webhook

  articles.each((i, el) => {
    const title = $(el).text();
    const url = $(el).attr("href");
    titleURL.push({
      title: title,
      url: `https://bbc.com${url}`,
    });
  });
  return titleURL.slice(0,10);
}
let oldLinks = [];
l.info("starting..");
fetch()
  .then((urls) => {
    console.log(urls)
    const links = urls.map((item) => item.url);
    console.log(links)
    // check if there are any new links
    const newLinks = links.filter((link) => !oldLinks.includes(link));
    if (newLinks.length > 0) {
      // send the new links
      client.send(`Latest News: ${newLinks.join(" ")}`);
      l.debug("Sent new links");
    } else {
      l.error("No new links");
      return;
    }
    // set the old links to the new links
    oldLinks = links;
  })
  .catch((err) => console.log(err));

setInterval(() => {
  l.info("Starting");
  fetch()
    .then((data) => {
      const links = data.map((item) => item.link);
      // check if there are any new links
      const newLinks = links.filter((link) => !oldLinks.includes(link));
      if (newLinks.length > 0) {
        // send the new links
        client.send(`Latest News: ${newLinks.join(" ")}`);
        l.debug("Sent new links");
      } else {
        l.error("No new links");
        return;
      }
      // set the old links to the new links
      oldLinks = links;
    })
    .catch((err) => console.log(err));
}, 900000);
