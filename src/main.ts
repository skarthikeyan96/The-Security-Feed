import * as core from '@actions/core'
import Parser from 'rss-parser'
import dayjs from 'dayjs'
import axios from 'axios'

dayjs().format()
const parser = new Parser()

async function run(): Promise<void> {
  try {
    const showwcaseApiKey = core.getInput('SHOWWCASE_API_KEY')

    // Parse the the hacker news RSS feed
    const feedUrl = `https://feeds.feedburner.com/TheHackersNews`
    const feed = await parser.parseURL(feedUrl)

    const currentFeed = feed.items.filter((item: any) => {
      return (
        dayjs(item.isoDate).format('YYYY-MM-DD') ===
        dayjs().format('YYYY-MM-DD')
      )
    })

    if (!currentFeed) {
      core.info('No feeds for the day')
      return
    }

    const showwcasePostUrl = `https://cache.showwcase.com/threads`

    for (let i = 0; i < currentFeed.length; i++) {
      const content = currentFeed[i]?.content + '\n' + currentFeed[i]?.link

      await axios.post(
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

      // console.log(response.status)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
