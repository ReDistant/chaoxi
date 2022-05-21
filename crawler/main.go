package main

import (
	"encoding/json"
	"os"

	"github.com/go-rod/rod"
	"github.com/go-rod/rod/lib/cdp"
	"github.com/go-rod/rod/lib/launcher"
)

func launch() *rod.Browser {
	url := launcher.New().Bin(config.path).Headless(config.headless).Devtools(!config.headless).MustLaunch()
	client := cdp.New(url)
	// client.Logger(utils.Log(func(msg ...interface{}) { log.Println(msg...) }))
	return rod.New().Client(client).MustConnect().MustSetCookies(config.cookies...)
}

func main() {
	browser := launch()
	defer browser.Close()

	collector := NewCollector()

	crawler := NewCrawler(browser, config.limit)

	go collector.collect(browser)
	crawler.Allow(config.target.Host)
	crawler.Feed(NewRequest(config.target.String()))
	crawler.Wait()

	requests, _ := json.Marshal(collector.Finished)
	os.Stdout.Write(requests)
}
