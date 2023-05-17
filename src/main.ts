import * as core from '@actions/core'
import Parser from 'rss-parser'
import dayjs from 'dayjs'
import axios from 'axios'

dayjs().format()
const parser = new Parser()
const showwcasePostUrl = `https://cache.showwcase.com/threads`
const showwcaseApiKey = core.getInput('SHOWWCASE_API_KEY')
const feedUrl = `https://feeds.feedburner.com/TheHackersNews`

async function run(): Promise<void> {
  try {
    // Parse the the hacker news RSS feed
    const feed = await parser.parseURL(feedUrl)
    let currentFeed = feed.items.filter(item => {
      return (
        dayjs(item.isoDate).format('YYYY-MM-DD') ===
        dayjs().format('YYYY-MM-DD')
      )
    })

    if (currentFeed.length === 0) {
      core.info("No feeds for the day, ... fetching the previous day's feed")
      currentFeed = feed.items.filter(item => {
        return (
          dayjs(item.isoDate).format('YYYY-MM-DD') ===
          dayjs().add(-1, 'day').format('YYYY-MM-DD')
        )
      })
    }
    postFeedToThread(currentFeed)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

const postFeedToThread: (currentFeed: {
  [key: string]: any
}) => Promise<void> = async (currentFeed: {[key: string]: any}) => {
  for (let i = 0; i < currentFeed.length; i++) {
    const content = currentFeed[i]?.content + '\n' + currentFeed[i]?.link

    const response = await axios.post(
      showwcasePostUrl,
      {
        message: content
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-API-KEY': showwcaseApiKey
        }
      }
    )
    core.info(response.status.toString())
  }
}
run()
